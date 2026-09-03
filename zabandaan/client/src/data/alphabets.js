// Urdu alphabet data for all 39 Urdu letters
// Each letter has multi-stroke data: a main traceable path plus dot positions.
// Reference paths are normalized coordinates (0-1) for the canvas and flow
// RIGHT to LEFT, the direction Urdu is written.
// Dots are pre-rendered reference marks shown on the canvas as part of the
// letter; the user only traces (and is scored on) the main stroke.

/**
 * Internal helper: sample a single Bezier segment between two endpoints.
 * `controlOffsets` holds 0 (linear), 1 (quadratic) or 2 (cubic) control points.
 */
function generateSmoothPath(startPoint, endPoint, controlOffsets, numPoints = 30) {
  // Generate a smooth curve using quadratic bezier-like interpolation
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    let x, y;
    if (controlOffsets.length === 1) {
      // Single control point (quadratic)
      const cx = controlOffsets[0].x;
      const cy = controlOffsets[0].y;
      x = (1 - t) * (1 - t) * startPoint.x + 2 * (1 - t) * t * cx + t * t * endPoint.x;
      y = (1 - t) * (1 - t) * startPoint.y + 2 * (1 - t) * t * cy + t * t * endPoint.y;
    } else if (controlOffsets.length === 2) {
      // Two control points (cubic)
      const c1x = controlOffsets[0].x, c1y = controlOffsets[0].y;
      const c2x = controlOffsets[1].x, c2y = controlOffsets[1].y;
      const u = 1 - t;
      x = u*u*u*startPoint.x + 3*u*u*t*c1x + 3*u*t*t*c2x + t*t*t*endPoint.x;
      y = u*u*u*startPoint.y + 3*u*u*t*c1y + 3*u*t*t*c2y + t*t*t*endPoint.y;
    } else {
      // Linear
      x = startPoint.x + t * (endPoint.x - startPoint.x);
      y = startPoint.y + t * (endPoint.y - startPoint.y);
    }
    points.push({ x: Math.round(x * 1000) / 1000, y: Math.round(y * 1000) / 1000 });
  }
  return points;
}

/**
 * Build a multi-segment stroke by concatenating several Bezier segments into
 * one continuous path. Each segment starts where the previous one ends (no
 * duplicated joint points), and points are distributed evenly across the
 * segments so the joined path totals roughly `numPoints` points.
 *
 * @param {Array} segments - [{ start: {x,y}, end: {x,y}, controls: [{x,y}, ...] }]
 * @param {number} numPoints - approximate total number of points for the whole path
 * @returns {Array<{x: number, y: number}>}
 */
function generateMultiSegmentPath(segments, numPoints = 48) {
  if (!segments || segments.length === 0) return [];

  if (segments.length === 1) {
    const { start, end, controls } = segments[0];
    return generateSmoothPath(start, end, controls || [], numPoints);
  }

  // Segments share their joint points (each start == previous end), so nudge
  // the per-segment count up to keep the concatenated total near numPoints.
  const perSegment = Math.max(4, Math.ceil((numPoints + segments.length - 1) / segments.length));

  const points = [];
  segments.forEach((segment, index) => {
    const segPoints = generateSmoothPath(
      segment.start,
      segment.end,
      segment.controls || [],
      perSegment
    );
    // Skip the first point of later segments: it duplicates the previous end.
    points.push(...(index === 0 ? segPoints : segPoints.slice(1)));
  });
  return points;
}

// ---------------------------------------------------------------------------
// Shared stroke shapes (normalized 0-1, flowing right-to-left like Urdu).
// Letters that share a base shape reuse the same segment definitions; they
// differ only in dot count/position.
// ---------------------------------------------------------------------------

// Alif (ا): a near-vertical downward stroke with a slight rightward lean —
// a gentle curve at the top that straightens toward the bottom.
const ALIF_SEGMENTS = [
  // Slight curve at the top
  { start: { x: 0.55, y: 0.15 }, end: { x: 0.51, y: 0.48 }, controls: [{ x: 0.57, y: 0.30 }] },
  // Straighter bottom portion
  { start: { x: 0.51, y: 0.48 }, end: { x: 0.45, y: 0.85 }, controls: [{ x: 0.48, y: 0.66 }] }
];

// Boat/tray stroke shared by Bay (ب), Pay (پ), Tay (ت), Ttay (ٹ), Say (ث):
// starts at the upper right, curves down into the hull, runs left along the
// flat-ish bottom, then rises into a slight upward hook at the left end.
const BOAT_SEGMENTS = [
  // Initial downward curve from the right
  { start: { x: 0.85, y: 0.35 }, end: { x: 0.62, y: 0.58 }, controls: [{ x: 0.81, y: 0.52 }, { x: 0.71, y: 0.60 }] },
  // Flat-ish bottom moving left
  { start: { x: 0.62, y: 0.58 }, end: { x: 0.38, y: 0.62 }, controls: [{ x: 0.55, y: 0.63 }, { x: 0.45, y: 0.63 }] },
  // Slight upward hook at the left
  { start: { x: 0.38, y: 0.62 }, end: { x: 0.15, y: 0.40 }, controls: [{ x: 0.28, y: 0.61 }, { x: 0.19, y: 0.50 }] }
];

// Bowl/hook stroke shared by Jeem (ج), Chay (چ), Hay (ح), Khay (خ):
// a descender head from the upper right curls left, sweeps around into a deep
// bowl, and finishes with a slight upward hook at the left end.
const BOWL_SEGMENTS = [
  // Initial descender from the right (the head)
  { start: { x: 0.75, y: 0.25 }, end: { x: 0.64, y: 0.47 }, controls: [{ x: 0.74, y: 0.36 }, { x: 0.69, y: 0.44 }] },
  // Curve around to the left, forming the bowl
  { start: { x: 0.64, y: 0.47 }, end: { x: 0.46, y: 0.68 }, controls: [{ x: 0.57, y: 0.65 }, { x: 0.51, y: 0.70 }] },
  // Bottom of the bowl moving left
  { start: { x: 0.46, y: 0.68 }, end: { x: 0.36, y: 0.69 }, controls: [{ x: 0.42, y: 0.70 }, { x: 0.39, y: 0.70 }] },
  // Slight upward hook at the end
  { start: { x: 0.36, y: 0.69 }, end: { x: 0.30, y: 0.55 }, controls: [{ x: 0.31, y: 0.68 }, { x: 0.29, y: 0.62 }] }
];

// Precomputed main-stroke paths for each shared shape
const ALIF_MAIN_POINTS = generateMultiSegmentPath(ALIF_SEGMENTS);
const BOAT_MAIN_POINTS = generateMultiSegmentPath(BOAT_SEGMENTS);
const BOWL_MAIN_POINTS = generateMultiSegmentPath(BOWL_SEGMENTS);

// Daal (د) family — shared by Daal, Ddaal, Zaal: a diagonal head from the
// upper right that dips into a small bowl opening to the upper left.
const DAAL_SEGMENTS = [
  // Diagonal head coming down from the right
  { start: { x: 0.70, y: 0.28 }, end: { x: 0.52, y: 0.60 }, controls: [{ x: 0.66, y: 0.46 }, { x: 0.58, y: 0.56 }] },
  // Bowl dipping down, then rising into the left tip
  { start: { x: 0.52, y: 0.60 }, end: { x: 0.28, y: 0.46 }, controls: [{ x: 0.50, y: 0.74 }, { x: 0.34, y: 0.68 }] }
];

// Ray (ر) family — shared by Ray, Rray, Zay, Zhay: a small head arcing left
// at the top, then a swooping tail descending to the lower left.
const RAY_SEGMENTS = [
  // Head arc moving left
  { start: { x: 0.72, y: 0.32 }, end: { x: 0.50, y: 0.40 }, controls: [{ x: 0.62, y: 0.30 }, { x: 0.54, y: 0.33 }] },
  // Descending tail sweeping down-left
  { start: { x: 0.50, y: 0.40 }, end: { x: 0.32, y: 0.88 }, controls: [{ x: 0.42, y: 0.54 }, { x: 0.38, y: 0.72 }] }
];

// Seen (س) family — shared by Seen, Sheen: three rounded teeth along the top,
// then a tail that sweeps down and left, curling up at the tip.
const SEEN_SEGMENTS = [
  // Tooth 1 (rightmost — written first)
  { start: { x: 0.84, y: 0.52 }, end: { x: 0.70, y: 0.52 }, controls: [{ x: 0.77, y: 0.30 }] },
  // Tooth 2
  { start: { x: 0.70, y: 0.52 }, end: { x: 0.56, y: 0.52 }, controls: [{ x: 0.63, y: 0.30 }] },
  // Tooth 3
  { start: { x: 0.56, y: 0.52 }, end: { x: 0.43, y: 0.52 }, controls: [{ x: 0.49, y: 0.30 }] },
  // Tail sweeping down and to the left
  { start: { x: 0.43, y: 0.52 }, end: { x: 0.24, y: 0.68 }, controls: [{ x: 0.36, y: 0.60 }, { x: 0.28, y: 0.68 }] },
  // Upward curl at the tail tip
  { start: { x: 0.24, y: 0.68 }, end: { x: 0.12, y: 0.54 }, controls: [{ x: 0.18, y: 0.69 }, { x: 0.13, y: 0.62 }] }
];

// Suad (ص) family — shared by Suad, Zuad: a knotted oval head at the upper
// right with a long tail sweeping left and curling up at the tip.
const SUAD_SEGMENTS = [
  // Entry stroke descending from the top right
  { start: { x: 0.70, y: 0.22 }, end: { x: 0.63, y: 0.42 }, controls: [{ x: 0.70, y: 0.30 }, { x: 0.67, y: 0.36 }] },
  // Knot: swings far left, curls down and closes back near its start
  { start: { x: 0.63, y: 0.42 }, end: { x: 0.66, y: 0.44 }, controls: [{ x: 0.48, y: 0.42 }, { x: 0.50, y: 0.58 }] },
  // Long tail sweeping left beneath the knot
  { start: { x: 0.66, y: 0.44 }, end: { x: 0.22, y: 0.68 }, controls: [{ x: 0.50, y: 0.62 }, { x: 0.34, y: 0.65 }] },
  // Upward curl at the tail tip
  { start: { x: 0.22, y: 0.68 }, end: { x: 0.11, y: 0.56 }, controls: [{ x: 0.16, y: 0.69 }, { x: 0.12, y: 0.62 }] }
];

// Toe (ط) family — shared by Toe, Zoe: a tall vertical stroke that curves at
// the base into a bowl finishing with an upward hook to the left.
const TOE_SEGMENTS = [
  // Tall vertical stroke
  { start: { x: 0.63, y: 0.16 }, end: { x: 0.61, y: 0.50 }, controls: [{ x: 0.62, y: 0.28 }] },
  // Curve from the base into the bowl
  { start: { x: 0.61, y: 0.50 }, end: { x: 0.44, y: 0.66 }, controls: [{ x: 0.61, y: 0.61 }, { x: 0.53, y: 0.67 }] },
  // Bowl bottom rising into the left tip
  { start: { x: 0.44, y: 0.66 }, end: { x: 0.24, y: 0.50 }, controls: [{ x: 0.34, y: 0.66 }, { x: 0.25, y: 0.59 }] }
];

// Ain (ع) family — shared by Ain, Ghain: an open hook head narrowing to a
// point, then a tail sweeping down and to the left.
const AIN_SEGMENTS = [
  // Upper arm of the head curving down-left
  { start: { x: 0.68, y: 0.25 }, end: { x: 0.57, y: 0.36 }, controls: [{ x: 0.59, y: 0.25 }, { x: 0.55, y: 0.29 }] },
  // Lower arm curving back to the narrow point
  { start: { x: 0.57, y: 0.36 }, end: { x: 0.64, y: 0.46 }, controls: [{ x: 0.59, y: 0.42 }, { x: 0.62, y: 0.44 }] },
  // Tail sweeping out down-left from the point
  { start: { x: 0.64, y: 0.46 }, end: { x: 0.42, y: 0.63 }, controls: [{ x: 0.58, y: 0.57 }, { x: 0.50, y: 0.63 }] },
  // Tail finish with a slight downward drift to the left
  { start: { x: 0.42, y: 0.63 }, end: { x: 0.20, y: 0.73 }, controls: [{ x: 0.34, y: 0.67 }, { x: 0.26, y: 0.71 }] }
];

// Fay (ف): a small loop head at the top right with the tail crossing down
// through it and sweeping left.
const FAY_SEGMENTS = [
  // Loop head: top-left arc (counterclockwise)
  { start: { x: 0.67, y: 0.26 }, end: { x: 0.55, y: 0.35 }, controls: [{ x: 0.58, y: 0.24 }, { x: 0.51, y: 0.28 }] },
  // Loop head: bottom arc closing back to the right
  { start: { x: 0.55, y: 0.35 }, end: { x: 0.66, y: 0.31 }, controls: [{ x: 0.55, y: 0.43 }, { x: 0.63, y: 0.42 }] },
  // Tail crossing down through the loop
  { start: { x: 0.66, y: 0.31 }, end: { x: 0.52, y: 0.54 }, controls: [{ x: 0.66, y: 0.43 }, { x: 0.59, y: 0.49 }] },
  // Tail sweeping left
  { start: { x: 0.52, y: 0.54 }, end: { x: 0.26, y: 0.74 }, controls: [{ x: 0.45, y: 0.62 }, { x: 0.34, y: 0.70 }] }
];

// Qaaf (ق): like Fay's loop, but with a deeper descending tail.
const QAAF_SEGMENTS = [
  // Loop head: top-left arc (counterclockwise)
  { start: { x: 0.67, y: 0.26 }, end: { x: 0.55, y: 0.35 }, controls: [{ x: 0.58, y: 0.24 }, { x: 0.51, y: 0.28 }] },
  // Loop head: bottom arc closing back to the right
  { start: { x: 0.55, y: 0.35 }, end: { x: 0.66, y: 0.31 }, controls: [{ x: 0.55, y: 0.43 }, { x: 0.63, y: 0.42 }] },
  // Tail crossing down through the loop
  { start: { x: 0.66, y: 0.31 }, end: { x: 0.54, y: 0.56 }, controls: [{ x: 0.67, y: 0.44 }, { x: 0.61, y: 0.52 }] },
  // Deeper descending tail
  { start: { x: 0.54, y: 0.56 }, end: { x: 0.28, y: 0.86 }, controls: [{ x: 0.47, y: 0.66 }, { x: 0.37, y: 0.79 }] }
];

// Kaaf (ک) family — shared by Kaaf, Gaaf: an angular diagonal from the upper
// right down to a vertex at the lower left, then a base running right with an
// upward flick. (Kaaf's small hamza mark is part of the glyph itself, not a
// distinguishing dot stroke.)
const KAAF_SEGMENTS = [
  // Diagonal descending to the lower-left vertex
  { start: { x: 0.76, y: 0.18 }, end: { x: 0.40, y: 0.60 }, controls: [{ x: 0.72, y: 0.32 }, { x: 0.55, y: 0.50 }] },
  // Sharp turn: base running right along the bottom
  { start: { x: 0.40, y: 0.60 }, end: { x: 0.70, y: 0.66 }, controls: [{ x: 0.50, y: 0.65 }, { x: 0.62, y: 0.68 }] },
  // Upward flick at the right end
  { start: { x: 0.70, y: 0.66 }, end: { x: 0.77, y: 0.58 }, controls: [{ x: 0.74, y: 0.65 }, { x: 0.76, y: 0.62 }] }
];

// Laam (ل): a tall vertical stroke hooking left into a wide upturned bowl.
const LAAM_SEGMENTS = [
  // Tall vertical stroke
  { start: { x: 0.66, y: 0.12 }, end: { x: 0.64, y: 0.52 }, controls: [{ x: 0.65, y: 0.26 }] },
  // Curve down into the hook
  { start: { x: 0.64, y: 0.52 }, end: { x: 0.44, y: 0.72 }, controls: [{ x: 0.64, y: 0.66 }, { x: 0.53, y: 0.74 }] },
  // Hook running left and up
  { start: { x: 0.44, y: 0.72 }, end: { x: 0.26, y: 0.58 }, controls: [{ x: 0.35, y: 0.71 }, { x: 0.28, y: 0.66 }] }
];

// Meem (م): a small round loop head with a tail descending to the lower left.
const MEEM_SEGMENTS = [
  // Loop head: top arc (counterclockwise)
  { start: { x: 0.64, y: 0.28 }, end: { x: 0.52, y: 0.38 }, controls: [{ x: 0.55, y: 0.25 }, { x: 0.48, y: 0.30 }] },
  // Loop head: bottom arc closing back to the right
  { start: { x: 0.52, y: 0.38 }, end: { x: 0.63, y: 0.36 }, controls: [{ x: 0.52, y: 0.46 }, { x: 0.60, y: 0.45 }] },
  // Descending tail
  { start: { x: 0.63, y: 0.36 }, end: { x: 0.47, y: 0.78 }, controls: [{ x: 0.65, y: 0.50 }, { x: 0.56, y: 0.66 }] }
];

// Wao (و): a round loop head like the numeral 9 with a tail descending and
// sweeping left.
const WAO_SEGMENTS = [
  // Loop head: top arc (counterclockwise)
  { start: { x: 0.68, y: 0.20 }, end: { x: 0.56, y: 0.30 }, controls: [{ x: 0.59, y: 0.17 }, { x: 0.52, y: 0.22 }] },
  // Loop head: bottom arc closing back to the right
  { start: { x: 0.56, y: 0.30 }, end: { x: 0.67, y: 0.27 }, controls: [{ x: 0.56, y: 0.38 }, { x: 0.64, y: 0.37 }] },
  // Tail descending down and sweeping left
  { start: { x: 0.67, y: 0.27 }, end: { x: 0.40, y: 0.74 }, controls: [{ x: 0.69, y: 0.44 }, { x: 0.58, y: 0.62 }] }
];

// Choti Hay (ہ): a round eye-shaped loop with a short tail flicking left.
const CHOTI_HAY_SEGMENTS = [
  // Eye: upper arc from the left over the top to the right side
  { start: { x: 0.56, y: 0.38 }, end: { x: 0.72, y: 0.44 }, controls: [{ x: 0.58, y: 0.26 }, { x: 0.78, y: 0.32 }] },
  // Eye: lower arc back to the left, closing near the start
  { start: { x: 0.72, y: 0.44 }, end: { x: 0.54, y: 0.42 }, controls: [{ x: 0.72, y: 0.56 }, { x: 0.58, y: 0.52 }] },
  // Short tail flicking left
  { start: { x: 0.54, y: 0.42 }, end: { x: 0.34, y: 0.52 }, controls: [{ x: 0.46, y: 0.50 }, { x: 0.39, y: 0.54 }] }
];

// Do Chashmi Hay (ھ): two connected eye shapes drawn as a figure-eight —
// start at the middle, loop the right eye, return to the middle, then loop
// the left eye.
const DO_CHASHMI_HAY_SEGMENTS = [
  // Right eye: over the top and down the right side
  { start: { x: 0.53, y: 0.38 }, end: { x: 0.73, y: 0.42 }, controls: [{ x: 0.55, y: 0.22 }, { x: 0.81, y: 0.28 }] },
  // Right eye: under the bottom back to the middle
  { start: { x: 0.73, y: 0.42 }, end: { x: 0.53, y: 0.38 }, controls: [{ x: 0.63, y: 0.56 }] },
  // Left eye: over the top and down the left side
  { start: { x: 0.53, y: 0.38 }, end: { x: 0.33, y: 0.42 }, controls: [{ x: 0.51, y: 0.22 }, { x: 0.25, y: 0.28 }] },
  // Left eye: under the bottom back toward the middle
  { start: { x: 0.33, y: 0.42 }, end: { x: 0.52, y: 0.40 }, controls: [{ x: 0.41, y: 0.56 }] }
];

// Hamza (ء): a small zigzag — a curved top stroke down to a point, then a
// short flick down and to the right.
const HAMZA_SEGMENTS = [
  // Curved top stroke down to the point
  { start: { x: 0.60, y: 0.30 }, end: { x: 0.47, y: 0.44 }, controls: [{ x: 0.52, y: 0.30 }, { x: 0.45, y: 0.37 }] },
  // Flick down and to the right
  { start: { x: 0.47, y: 0.44 }, end: { x: 0.60, y: 0.60 }, controls: [{ x: 0.51, y: 0.52 }, { x: 0.56, y: 0.57 }] }
];

// Bari Ye (ے): an extended boat — a small head at the right, a long flat
// base, and a deeper upturned bowl at the left end.
const BARI_YE_SEGMENTS = [
  // Small head curving down at the right
  { start: { x: 0.88, y: 0.38 }, end: { x: 0.80, y: 0.48 }, controls: [{ x: 0.87, y: 0.44 }, { x: 0.84, y: 0.49 }] },
  // Long flat base running left
  { start: { x: 0.80, y: 0.48 }, end: { x: 0.38, y: 0.54 }, controls: [{ x: 0.66, y: 0.53 }, { x: 0.50, y: 0.57 }] },
  // Deep bowl dipping down and curling up at the left end
  { start: { x: 0.38, y: 0.54 }, end: { x: 0.13, y: 0.58 }, controls: [{ x: 0.25, y: 0.66 }, { x: 0.15, y: 0.74 }] }
];

// Precomputed main-stroke paths for each shared shape
const DAAL_MAIN_POINTS = generateMultiSegmentPath(DAAL_SEGMENTS);
const RAY_MAIN_POINTS = generateMultiSegmentPath(RAY_SEGMENTS);
const SEEN_MAIN_POINTS = generateMultiSegmentPath(SEEN_SEGMENTS);
const SUAD_MAIN_POINTS = generateMultiSegmentPath(SUAD_SEGMENTS);
const TOE_MAIN_POINTS = generateMultiSegmentPath(TOE_SEGMENTS);
const AIN_MAIN_POINTS = generateMultiSegmentPath(AIN_SEGMENTS);
const FAY_MAIN_POINTS = generateMultiSegmentPath(FAY_SEGMENTS);
const QAAF_MAIN_POINTS = generateMultiSegmentPath(QAAF_SEGMENTS);
const KAAF_MAIN_POINTS = generateMultiSegmentPath(KAAF_SEGMENTS);
const LAAM_MAIN_POINTS = generateMultiSegmentPath(LAAM_SEGMENTS);
const MEEM_MAIN_POINTS = generateMultiSegmentPath(MEEM_SEGMENTS);
const WAO_MAIN_POINTS = generateMultiSegmentPath(WAO_SEGMENTS);
const CHOTI_HAY_MAIN_POINTS = generateMultiSegmentPath(CHOTI_HAY_SEGMENTS);
const DO_CHASHMI_HAY_MAIN_POINTS = generateMultiSegmentPath(DO_CHASHMI_HAY_SEGMENTS);
const HAMZA_MAIN_POINTS = generateMultiSegmentPath(HAMZA_SEGMENTS);
const BARI_YE_MAIN_POINTS = generateMultiSegmentPath(BARI_YE_SEGMENTS);

export const alphabets = [
  {
    id: 'alif',
    letter: 'ا',
    name: 'Alif',
    nameUrdu: 'الف',
    exampleWord: 'انار',
    exampleWordEnglish: 'Pomegranate',
    imagePath: '/images/alphabets/alif-anar.png',
    audioPath: '/audio/alphabets/alif-name.mp3',
    wordAudioPath: '/audio/alphabets/alif-word.mp3',
    strokes: [
      { type: 'main', points: ALIF_MAIN_POINTS }
    ]
  },
  {
    id: 'bay',
    letter: 'ب',
    name: 'Bay',
    nameUrdu: 'بے',
    exampleWord: 'بلی',
    exampleWordEnglish: 'Cat',
    imagePath: '/images/alphabets/bay-billi.png',
    audioPath: '/audio/alphabets/bay-name.mp3',
    wordAudioPath: '/audio/alphabets/bay-word.mp3',
    strokes: [
      { type: 'main', points: BOAT_MAIN_POINTS },
      { type: 'dot', points: [{ x: 0.50, y: 0.75 }] }
    ]
  },
  {
    id: 'pay',
    letter: 'پ',
    name: 'Pay',
    nameUrdu: 'پے',
    exampleWord: 'پتنگ',
    exampleWordEnglish: 'Kite',
    imagePath: '/images/alphabets/pay-patang.png',
    audioPath: '/audio/alphabets/pay-name.mp3',
    wordAudioPath: '/audio/alphabets/pay-word.mp3',
    strokes: [
      { type: 'main', points: BOAT_MAIN_POINTS },
      { type: 'dot', points: [
        { x: 0.42, y: 0.75 },
        { x: 0.50, y: 0.81 },
        { x: 0.58, y: 0.75 }
      ] }
    ]
  },
  {
    id: 'tay',
    letter: 'ت',
    name: 'Tay',
    nameUrdu: 'تے',
    exampleWord: 'تالا',
    exampleWordEnglish: 'Lock',
    imagePath: '/images/alphabets/tay-taala.png',
    audioPath: '/audio/alphabets/tay-name.mp3',
    wordAudioPath: '/audio/alphabets/tay-word.mp3',
    strokes: [
      { type: 'main', points: BOAT_MAIN_POINTS },
      { type: 'dot', points: [
        { x: 0.44, y: 0.25 },
        { x: 0.56, y: 0.25 }
      ] }
    ]
  },
  {
    id: 'ttay',
    letter: 'ٹ',
    name: 'Ttay',
    nameUrdu: 'ٹے',
    exampleWord: 'ٹوپی',
    exampleWordEnglish: 'Cap',
    imagePath: '/images/alphabets/ttay-topi.png',
    audioPath: '/audio/alphabets/ttay-name.mp3',
    wordAudioPath: '/audio/alphabets/ttay-word.mp3',
    strokes: [
      { type: 'main', points: BOAT_MAIN_POINTS },
      { type: 'dot', points: [{ x: 0.50, y: 0.22 }] }
    ]
  },
  {
    id: 'say',
    letter: 'ث',
    name: 'Se',
    nameUrdu: 'ثے',
    exampleWord: 'ثمر',
    exampleWordEnglish: 'Fruit',
    imagePath: '/images/alphabets/say-samar.png',
    audioPath: '/audio/alphabets/say-name.mp3',
    wordAudioPath: '/audio/alphabets/say-word.mp3',
    strokes: [
      { type: 'main', points: BOAT_MAIN_POINTS },
      { type: 'dot', points: [
        { x: 0.50, y: 0.18 },
        { x: 0.42, y: 0.26 },
        { x: 0.58, y: 0.26 }
      ] }
    ]
  },
  {
    id: 'jeem',
    letter: 'ج',
    name: 'Jeem',
    nameUrdu: 'جیم',
    exampleWord: 'جہاز',
    exampleWordEnglish: 'Ship',
    imagePath: '/images/alphabets/jeem-jahaz.png',
    audioPath: '/audio/alphabets/jeem-name.mp3',
    wordAudioPath: '/audio/alphabets/jeem-word.mp3',
    strokes: [
      { type: 'main', points: BOWL_MAIN_POINTS },
      { type: 'dot', points: [{ x: 0.52, y: 0.60 }] }
    ]
  },
  {
    id: 'chay',
    letter: 'چ',
    name: 'Che',
    nameUrdu: 'چے',
    exampleWord: 'چاند',
    exampleWordEnglish: 'Moon',
    imagePath: '/images/alphabets/chay-chand.png',
    audioPath: '/audio/alphabets/chay-name.mp3',
    wordAudioPath: '/audio/alphabets/chay-word.mp3',
    strokes: [
      { type: 'main', points: BOWL_MAIN_POINTS },
      { type: 'dot', points: [
        { x: 0.50, y: 0.51 },
        { x: 0.44, y: 0.59 },
        { x: 0.55, y: 0.57 }
      ] }
    ]
  },
  {
    id: 'hay',
    letter: 'ح',
    name: 'Hay',
    nameUrdu: 'حے',
    exampleWord: 'حلقہ',
    exampleWordEnglish: 'Ring / Circle',
    imagePath: '/images/alphabets/hay-halqa.png',
    audioPath: '/audio/alphabets/hay-name.mp3',
    wordAudioPath: '/audio/alphabets/hay-word.mp3',
    strokes: [
      { type: 'main', points: BOWL_MAIN_POINTS }
    ]
  },
  {
    id: 'khay',
    letter: 'خ',
    name: 'Khay',
    nameUrdu: 'خے',
    exampleWord: 'خط',
    exampleWordEnglish: 'Letter',
    imagePath: '/images/alphabets/khay-khat.png',
    audioPath: '/audio/alphabets/khay-name.mp3',
    wordAudioPath: '/audio/alphabets/khay-word.mp3',
    strokes: [
      { type: 'main', points: BOWL_MAIN_POINTS },
      { type: 'dot', points: [{ x: 0.56, y: 0.28 }] }
    ]
  },
  {
    id: 'daal',
    letter: 'د',
    name: 'Daal',
    nameUrdu: 'دال',
    exampleWord: 'دروازہ',
    exampleWordEnglish: 'Door',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: DAAL_MAIN_POINTS }
    ]
  },
  {
    id: 'ddaal',
    letter: 'ڈ',
    name: 'Ddaal',
    nameUrdu: 'ڈال',
    exampleWord: 'ڈھول',
    exampleWordEnglish: 'Drum',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: DAAL_MAIN_POINTS },
      { type: 'dot', points: [{ x: 0.63, y: 0.16 }] }
    ]
  },
  {
    id: 'zaal',
    letter: 'ذ',
    name: 'Zaal',
    nameUrdu: 'ذال',
    exampleWord: 'ذوق',
    exampleWordEnglish: 'Interest',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: DAAL_MAIN_POINTS },
      { type: 'dot', points: [{ x: 0.63, y: 0.16 }] }
    ]
  },
  {
    id: 'ray',
    letter: 'ر',
    name: 'Ray',
    nameUrdu: 'رے',
    exampleWord: 'روٹی',
    exampleWordEnglish: 'Bread',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: RAY_MAIN_POINTS }
    ]
  },
  {
    id: 'rray',
    letter: 'ڑ',
    name: 'Rray',
    nameUrdu: 'ڑے',
    exampleWord: 'پہاڑ',
    exampleWordEnglish: 'Mountain',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: RAY_MAIN_POINTS },
      { type: 'dot', points: [{ x: 0.61, y: 0.17 }] }
    ]
  },
  {
    id: 'zay',
    letter: 'ز',
    name: 'Zay',
    nameUrdu: 'زے',
    exampleWord: 'زمین',
    exampleWordEnglish: 'Earth',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: RAY_MAIN_POINTS },
      { type: 'dot', points: [{ x: 0.61, y: 0.17 }] }
    ]
  },
  {
    id: 'zhay',
    letter: 'ژ',
    name: 'Zhay',
    nameUrdu: 'ژے',
    exampleWord: 'ژالہ',
    exampleWordEnglish: 'Hailstone',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: RAY_MAIN_POINTS },
      { type: 'dot', points: [
        { x: 0.61, y: 0.15 },
        { x: 0.53, y: 0.23 },
        { x: 0.69, y: 0.23 }
      ] }
    ]
  },
  {
    id: 'seen',
    letter: 'س',
    name: 'Seen',
    nameUrdu: 'سین',
    exampleWord: 'سیب',
    exampleWordEnglish: 'Apple',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: SEEN_MAIN_POINTS }
    ]
  },
  {
    id: 'sheen',
    letter: 'ش',
    name: 'Sheen',
    nameUrdu: 'شین',
    exampleWord: 'شیر',
    exampleWordEnglish: 'Lion',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: SEEN_MAIN_POINTS },
      { type: 'dot', points: [
        { x: 0.63, y: 0.24 },
        { x: 0.55, y: 0.32 },
        { x: 0.71, y: 0.32 }
      ] }
    ]
  },
  {
    id: 'suad',
    letter: 'ص',
    name: 'Suad',
    nameUrdu: 'صاد',
    exampleWord: 'صابن',
    exampleWordEnglish: 'Soap',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: SUAD_MAIN_POINTS }
    ]
  },
  {
    id: 'zuad',
    letter: 'ض',
    name: 'Zuad',
    nameUrdu: 'ضاد',
    exampleWord: 'ضرب',
    exampleWordEnglish: 'Multiplication',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: SUAD_MAIN_POINTS },
      { type: 'dot', points: [{ x: 0.60, y: 0.14 }] }
    ]
  },
  {
    id: 'toe',
    letter: 'ط',
    name: 'Toe',
    nameUrdu: 'طوئے',
    exampleWord: 'طوطا',
    exampleWordEnglish: 'Parrot',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: TOE_MAIN_POINTS }
    ]
  },
  {
    id: 'zoe',
    letter: 'ظ',
    name: 'Zoe',
    nameUrdu: 'ظوئے',
    exampleWord: 'ظالم',
    exampleWordEnglish: 'Tyrant',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: TOE_MAIN_POINTS },
      { type: 'dot', points: [{ x: 0.44, y: 0.24 }] }
    ]
  },
  {
    id: 'ain',
    letter: 'ع',
    name: 'Ain',
    nameUrdu: 'عین',
    exampleWord: 'عینک',
    exampleWordEnglish: 'Glasses',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: AIN_MAIN_POINTS }
    ]
  },
  {
    id: 'ghain',
    letter: 'غ',
    name: 'Ghain',
    nameUrdu: 'غین',
    exampleWord: 'غبارہ',
    exampleWordEnglish: 'Balloon',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: AIN_MAIN_POINTS },
      { type: 'dot', points: [{ x: 0.61, y: 0.15 }] }
    ]
  },
  {
    id: 'fay',
    letter: 'ف',
    name: 'Fay',
    nameUrdu: 'فے',
    exampleWord: 'فیل',
    exampleWordEnglish: 'Elephant',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: FAY_MAIN_POINTS },
      { type: 'dot', points: [{ x: 0.60, y: 0.16 }] }
    ]
  },
  {
    id: 'qaaf',
    letter: 'ق',
    name: 'Qaaf',
    nameUrdu: 'قاف',
    exampleWord: 'قلم',
    exampleWordEnglish: 'Pen',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: QAAF_MAIN_POINTS },
      { type: 'dot', points: [
        { x: 0.55, y: 0.14 },
        { x: 0.65, y: 0.14 }
      ] }
    ]
  },
  {
    id: 'kaaf',
    letter: 'ک',
    name: 'Kaaf',
    nameUrdu: 'کاف',
    exampleWord: 'کھلونا',
    exampleWordEnglish: 'Toy',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: KAAF_MAIN_POINTS }
    ]
  },
  {
    id: 'gaaf',
    letter: 'گ',
    name: 'Gaaf',
    nameUrdu: 'گاف',
    exampleWord: 'گاڑی',
    exampleWordEnglish: 'Car',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: KAAF_MAIN_POINTS },
      { type: 'dot', points: [{ x: 0.54, y: 0.22 }] }
    ]
  },
  {
    id: 'laam',
    letter: 'ل',
    name: 'Laam',
    nameUrdu: 'لام',
    exampleWord: 'لیموں',
    exampleWordEnglish: 'Lemon',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: LAAM_MAIN_POINTS }
    ]
  },
  {
    id: 'meem',
    letter: 'م',
    name: 'Meem',
    nameUrdu: 'میم',
    exampleWord: 'مچھلی',
    exampleWordEnglish: 'Fish',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: MEEM_MAIN_POINTS }
    ]
  },
  {
    id: 'noon',
    letter: 'ن',
    name: 'Noon',
    nameUrdu: 'نون',
    exampleWord: 'نارنگی',
    exampleWordEnglish: 'Orange',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: BOAT_MAIN_POINTS },
      { type: 'dot', points: [{ x: 0.50, y: 0.22 }] }
    ]
  },
  {
    id: 'noon-ghunna',
    letter: 'ں',
    name: 'Noon Ghunna',
    nameUrdu: 'نون غنہ',
    exampleWord: 'ماں',
    exampleWordEnglish: 'Mother',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: BOAT_MAIN_POINTS }
    ]
  },
  {
    id: 'wao',
    letter: 'و',
    name: 'Wao',
    nameUrdu: 'واؤ',
    exampleWord: 'وزیر',
    exampleWordEnglish: 'Minister',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: WAO_MAIN_POINTS }
    ]
  },
  {
    id: 'choti-hay',
    letter: 'ہ',
    name: 'Choti Hay',
    nameUrdu: 'ہے',
    exampleWord: 'ہاتھی',
    exampleWordEnglish: 'Elephant',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: CHOTI_HAY_MAIN_POINTS }
    ]
  },
  {
    id: 'do-chashmi-hay',
    letter: 'ھ',
    name: 'Do Chashmi Hay',
    nameUrdu: 'دو چشمی ہے',
    exampleWord: 'پھول',
    exampleWordEnglish: 'Flower',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: DO_CHASHMI_HAY_MAIN_POINTS }
    ]
  },
  {
    id: 'hamza',
    letter: 'ء',
    name: 'Hamza',
    nameUrdu: 'ہمزہ',
    exampleWord: 'سوئی',
    exampleWordEnglish: 'Needle',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: HAMZA_MAIN_POINTS }
    ]
  },
  {
    id: 'chhoti-ye',
    letter: 'ی',
    name: 'Chhoti Ye',
    nameUrdu: 'یے',
    exampleWord: 'یاد',
    exampleWordEnglish: 'Memory',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: BOAT_MAIN_POINTS },
      { type: 'dot', points: [
        { x: 0.44, y: 0.77 },
        { x: 0.56, y: 0.77 }
      ] }
    ]
  },
  {
    id: 'bari-ye',
    letter: 'ے',
    name: 'Bari Ye',
    nameUrdu: 'بڑی یے',
    exampleWord: 'چائے',
    exampleWordEnglish: 'Tea',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: BARI_YE_MAIN_POINTS }
    ]
  }
];
