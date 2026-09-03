// Trace accuracy scoring with multi-stroke and dot support
// Compares user's drawn strokes to reference strokes

/**
 * Resample a path to have exactly N evenly-spaced points
 */
function resamplePath(points, numSamples) {
  if (points.length < 2) return points;
  
  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i-1].x;
    const dy = points[i].y - points[i-1].y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }
  
  if (totalLength === 0) return points;
  
  const interval = totalLength / (numSamples - 1);
  const resampled = [points[0]];
  let distCovered = 0;
  
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i-1].x;
    const dy = points[i].y - points[i-1].y;
    const segLen = Math.sqrt(dx * dx + dy * dy);
    
    while (distCovered + segLen >= interval * resampled.length && resampled.length < numSamples) {
      const t = (interval * resampled.length - distCovered) / segLen;
      resampled.push({
        x: points[i-1].x + t * dx,
        y: points[i-1].y + t * dy
      });
    }
    distCovered += segLen;
  }
  
  while (resampled.length < numSamples) {
    resampled.push(points[points.length - 1]);
  }
  
  return resampled.slice(0, numSamples);
}

/**
 * Score a single main stroke using ordered point-to-point distance
 * (point N matches point N, not nearest-neighbor)
 */
function scoreMainStroke(userPoints, referencePoints, canvasSize) {
  if (!userPoints || userPoints.length < 3 || !referencePoints || referencePoints.length < 2) {
    return 0;
  }
  
  const numSamples = 30;
  const rUser = resamplePath(userPoints, numSamples);
  const rRef = resamplePath(referencePoints, numSamples);
  
  // Ordered distance: match point i to point i
  const maxDist = Math.sqrt(2) * canvasSize; // diagonal
  const tolerance = maxDist * 0.10; // 10% of diagonal (tighter than before)
  
  let totalDist = 0;
  for (let i = 0; i < numSamples; i++) {
    const dx = rUser[i].x - rRef[i].x;
    const dy = rUser[i].y - rRef[i].y;
    totalDist += Math.sqrt(dx * dx + dy * dy);
  }
  
  const avgDist = totalDist / numSamples;
  const score = Math.max(0, Math.min(100, (1 - avgDist / tolerance) * 100));
  return Math.round(score);
}

/**
 * Score dots: check if user placed a dot near each expected dot position
 * Returns percentage of dots correctly placed
 */
function scoreDots(userDots, expectedDots, canvasSize) {
  if (!expectedDots || expectedDots.length === 0) return 100; // no dots required = perfect
  if (!userDots || userDots.length === 0) return 0; // dots required but none placed
  
  const tolerance = canvasSize * 0.15; // generous radius for dot placement
  let matched = 0;
  
  for (const expected of expectedDots) {
    let closestDist = Infinity;
    for (const user of userDots) {
      const dx = user.x - expected.x;
      const dy = user.y - expected.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      closestDist = Math.min(closestDist, dist);
    }
    if (closestDist <= tolerance) matched++;
  }
  
  return Math.round((matched / expectedDots.length) * 100);
}

/**
 * Score a complete trace with multi-stroke support
 * When no user dot strokes are provided (dots pre-rendered as reference
 * marks), the total is simply the main stroke score (100% weight).
 * @param {Array} userStrokes - Array of {type: 'main'|'dot', points: [{x,y}]}
 * @param {Array} referenceStrokes - Array of {type: 'main'|'dot', points: [{x,y}]}
 * @param {number} canvasSize - Canvas size in pixels
 * @returns {{ total: number, mainScore: number, dotScore: number }}
 */
export function scoreTrace(userStrokes, referenceStrokes, canvasSize) {
  if (!userStrokes || userStrokes.length === 0 || !referenceStrokes || referenceStrokes.length === 0) {
    return { total: 0, mainScore: 0, dotScore: 0 };
  }
  
  // Separate main strokes and dot strokes
  const refMainStrokes = referenceStrokes.filter(s => s.type === 'main');
  const refDotStrokes = referenceStrokes.filter(s => s.type === 'dot');
  const userMainStrokes = userStrokes.filter(s => s.type === 'main');
  const userDotStrokes = userStrokes.filter(s => s.type === 'dot');
  
  // Collect all expected dot positions
  const expectedDotPositions = refDotStrokes.flatMap(s => 
    s.points.map(p => ({ x: p.x * canvasSize, y: p.y * canvasSize }))
  );
  
  // Collect all user dot positions
  const userDotPositions = userDotStrokes.flatMap(s => s.points);
  
  // Score main stroke (use first/main stroke)
  let mainScore = 0;
  if (refMainStrokes.length > 0 && userMainStrokes.length > 0) {
    const refMain = refMainStrokes[0].points.map(p => ({ x: p.x * canvasSize, y: p.y * canvasSize }));
    const userMain = userMainStrokes[0].points;
    mainScore = scoreMainStroke(userMain, refMain, canvasSize);
  }
  
  // Score dots
  const dotScore = scoreDots(userDotPositions, expectedDotPositions, canvasSize);

  // Combined: 70% main + 30% dots — but only when the user actually placed
  // dots. When dots are pre-rendered (no user dot strokes provided), the
  // trace is scored 100% on the main stroke.
  const total = userDotPositions.length > 0
    ? Math.round(mainScore * 0.7 + dotScore * 0.3)
    : mainScore;

  return { total, mainScore, dotScore };
}

// Keep backward-compatible simple scoring
export function scoreSimpleTrace(userPath, referencePath, canvasWidth, canvasHeight) {
  const result = scoreTrace(
    [{ type: 'main', points: userPath }],
    [{ type: 'main', points: referencePath }],
    canvasWidth
  );
  return result.total;
}

/**
 * Score a trace against the actual rendered glyph.
 *
 * The alphabet guide is rendered by the browser's Urdu font, so using the
 * same glyph as the scoring mask keeps the visible target and validation in
 * sync even when the font changes.
 */
export function scoreGlyphTrace(userStrokes, letter, canvasSize, font, verticalOffset = 0) {
  const points = (userStrokes || [])
    .filter(stroke => stroke.type === 'main')
    .flatMap(stroke => stroke.points || []);

  if (points.length < 4) return { total: 0, mainScore: 0, dotScore: 0 };

  const mask = document.createElement('canvas');
  mask.width = canvasSize;
  mask.height = canvasSize;
  const ctx = mask.getContext('2d', { willReadFrequently: true });
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000';
  ctx.fillText(letter, canvasSize / 2, canvasSize / 2 + verticalOffset);

  const pixels = ctx.getImageData(0, 0, canvasSize, canvasSize).data;
  // Keep the hit area close to the glyph so drawing beside the letter does
  // not receive a passing score.
  const radius = Math.max(3, canvasSize * 0.012);
  let matched = 0;
  const glyphPoints = [];

  for (let y = 0; y < canvasSize; y += 3) {
    for (let x = 0; x < canvasSize; x += 3) {
      if (pixels[(y * canvasSize + x) * 4 + 3] > 20) {
        glyphPoints.push({ x, y });
      }
    }
  }

  for (const point of points) {
    const left = Math.max(0, Math.floor(point.x - radius));
    const right = Math.min(canvasSize - 1, Math.ceil(point.x + radius));
    const top = Math.max(0, Math.floor(point.y - radius));
    const bottom = Math.min(canvasSize - 1, Math.ceil(point.y + radius));
    let onGlyph = false;

    for (let y = top; y <= bottom && !onGlyph; y++) {
      for (let x = left; x <= right; x++) {
        if (pixels[(y * canvasSize + x) * 4 + 3] > 0) {
          onGlyph = true;
          break;
        }
      }
    }
    if (onGlyph) matched++;
  }

  const userAlignment = matched / points.length;
  const glyphCoverage = glyphPoints.length === 0
    ? 0
    : glyphPoints.filter(glyphPoint => points.some(point => {
      const dx = point.x - glyphPoint.x;
      const dy = point.y - glyphPoint.y;
      return Math.sqrt(dx * dx + dy * dy) <= radius * 2.5;
    })).length / glyphPoints.length;
  const mainScore = Math.round(Math.min(userAlignment, glyphCoverage) * 100);

  return { total: mainScore, mainScore, dotScore: 100 };
}
