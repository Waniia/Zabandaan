// Urdu numeral data for 1-10 (۱ through ۱۰)
// Each number has a single traceable main stroke, mirroring the structure of
// the alphabet entries so the shared TracingCanvas can consume them.
// Reference paths are normalized coordinates (0-1) for the canvas. Numerals
// follow the natural writing direction of each digit shape; "۱۰" is traced as
// one combined stroke (the ۱, a short connector, then the ۰ ring).
// The helpers below are copied from alphabets.js to keep this module
// self-contained (no cross-module dependency).

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
// Numeral stroke shapes (normalized 0-1).
// ---------------------------------------------------------------------------

// ۱ (Ek/One): a near-vertical downward stroke with a slight lean —
// close cousin of Alif, drawn top to bottom.
const EK_SEGMENTS = [
  // Slight curve at the top
  { start: { x: 0.52, y: 0.15 }, end: { x: 0.49, y: 0.48 }, controls: [{ x: 0.53, y: 0.30 }] },
  // Straighter bottom portion
  { start: { x: 0.49, y: 0.48 }, end: { x: 0.44, y: 0.85 }, controls: [{ x: 0.46, y: 0.66 }] }
];

// ۲ (Do/Two): a reversed "2" — starts at the top right, arcs left over the
// head, sweeps diagonally down to the right, then runs left along the base.
const DO_SEGMENTS = [
  // Rounded head: over the top and down the left side
  { start: { x: 0.64, y: 0.18 }, end: { x: 0.36, y: 0.38 }, controls: [{ x: 0.48, y: 0.10 }, { x: 0.33, y: 0.20 }] },
  // Diagonal down toward the bottom right
  { start: { x: 0.36, y: 0.38 }, end: { x: 0.64, y: 0.64 }, controls: [{ x: 0.44, y: 0.52 }, { x: 0.54, y: 0.60 }] },
  // Base sweeping left along the bottom
  { start: { x: 0.64, y: 0.64 }, end: { x: 0.30, y: 0.76 }, controls: [{ x: 0.52, y: 0.73 }, { x: 0.40, y: 0.76 }] }
];

// ۳ (Teen/Three): a "3" — two stacked bowls. Starts at the upper left, arcs
// over the top and into the middle pinch, then around the lower bowl.
const TEEN_SEGMENTS = [
  // Upper bowl: over the top, down the right side, into the middle
  { start: { x: 0.33, y: 0.20 }, end: { x: 0.48, y: 0.50 }, controls: [{ x: 0.44, y: 0.10 }, { x: 0.64, y: 0.28 }] },
  // Lower bowl: around the right and bottom, ending at the lower left
  { start: { x: 0.48, y: 0.50 }, end: { x: 0.34, y: 0.80 }, controls: [{ x: 0.64, y: 0.68 }, { x: 0.46, y: 0.88 }] }
];

// ۴ (Chaar/Four): an angular reversed "4" written in one stroke — the spine
// descends to the right, the crossbar sweeps left, then a short leg drops down.
const CHAAR_SEGMENTS = [
  // Spine: diagonal from the top down to the right
  { start: { x: 0.38, y: 0.16 }, end: { x: 0.68, y: 0.50 }, controls: [{ x: 0.48, y: 0.26 }, { x: 0.60, y: 0.40 }] },
  // Crossbar sweeping left
  { start: { x: 0.68, y: 0.50 }, end: { x: 0.28, y: 0.58 }, controls: [{ x: 0.54, y: 0.55 }, { x: 0.40, y: 0.58 }] },
  // Short leg dropping down at the left end
  { start: { x: 0.28, y: 0.58 }, end: { x: 0.24, y: 0.74 }, controls: [{ x: 0.25, y: 0.64 }] }
];

// ۵ (Paanch/Five): a heart/circle-like closed shape — starts near the top,
// travels down the left side, around the bottom, and back up to close.
const PAANCH_SEGMENTS = [
  // Down the left side from the top
  { start: { x: 0.44, y: 0.26 }, end: { x: 0.30, y: 0.52 }, controls: [{ x: 0.30, y: 0.32 }, { x: 0.22, y: 0.40 }] },
  // Around the bottom to the right side
  { start: { x: 0.30, y: 0.52 }, end: { x: 0.62, y: 0.58 }, controls: [{ x: 0.30, y: 0.78 }, { x: 0.50, y: 0.80 }] },
  // Up the right side, closing back near the top
  { start: { x: 0.62, y: 0.58 }, end: { x: 0.46, y: 0.28 }, controls: [{ x: 0.76, y: 0.50 }, { x: 0.68, y: 0.28 }] }
];

// ۶ (Chhay/Six): a "7" — the top bar travels right, then the stroke descends
// diagonally to the lower left.
const CHHAY_SEGMENTS = [
  // Top bar arcing gently to the right
  { start: { x: 0.30, y: 0.24 }, end: { x: 0.68, y: 0.28 }, controls: [{ x: 0.44, y: 0.18 }, { x: 0.58, y: 0.22 }] },
  // Diagonal descending to the lower left
  { start: { x: 0.68, y: 0.28 }, end: { x: 0.38, y: 0.78 }, controls: [{ x: 0.58, y: 0.44 }, { x: 0.48, y: 0.62 }] }
];

// ۷ (Saat/Seven): a "V" — down from the upper left to the point, then back up
// to the upper right.
const SAAT_SEGMENTS = [
  // Down stroke to the vertex
  { start: { x: 0.32, y: 0.24 }, end: { x: 0.50, y: 0.72 }, controls: [{ x: 0.38, y: 0.42 }, { x: 0.44, y: 0.58 }] },
  // Up stroke to the right
  { start: { x: 0.50, y: 0.72 }, end: { x: 0.70, y: 0.26 }, controls: [{ x: 0.57, y: 0.56 }, { x: 0.64, y: 0.40 }] }
];

// ۸ (Aath/Eight): an inverted "V" (tent shape) — rises from the lower left to
// the peak, then falls to the lower right.
const AATH_SEGMENTS = [
  // Up stroke to the peak
  { start: { x: 0.34, y: 0.74 }, end: { x: 0.52, y: 0.24 }, controls: [{ x: 0.40, y: 0.56 }, { x: 0.46, y: 0.38 }] },
  // Down stroke to the right
  { start: { x: 0.52, y: 0.24 }, end: { x: 0.70, y: 0.74 }, controls: [{ x: 0.58, y: 0.38 }, { x: 0.64, y: 0.56 }] }
];

// ۹ (Nau/Nine): a "9" — the loop starts at the upper right, curls
// counterclockwise around, then the tail sweeps down and to the left.
const NAU_SEGMENTS = [
  // Loop: over the top and down the left side
  { start: { x: 0.58, y: 0.24 }, end: { x: 0.36, y: 0.38 }, controls: [{ x: 0.48, y: 0.12 }, { x: 0.30, y: 0.22 }] },
  // Loop: around the bottom and up the right side (nearly closed)
  { start: { x: 0.36, y: 0.38 }, end: { x: 0.60, y: 0.34 }, controls: [{ x: 0.36, y: 0.54 }, { x: 0.56, y: 0.50 }] },
  // Tail curving down and left
  { start: { x: 0.60, y: 0.34 }, end: { x: 0.34, y: 0.78 }, controls: [{ x: 0.66, y: 0.48 }, { x: 0.58, y: 0.66 }] }
];

// ۱۰ (Das/Ten): traced as one combined stroke — down the ۱, a short connector
// flowing right, then around the ۰ ring (top half, then bottom half).
const DAS_SEGMENTS = [
  // The ۱: vertical stroke with a slight lean
  { start: { x: 0.30, y: 0.18 }, end: { x: 0.34, y: 0.76 }, controls: [{ x: 0.30, y: 0.40 }] },
  // Connector flowing right into the ring
  { start: { x: 0.34, y: 0.76 }, end: { x: 0.58, y: 0.68 }, controls: [{ x: 0.45, y: 0.76 }] },
  // Top half of the ۰ ring
  { start: { x: 0.58, y: 0.68 }, end: { x: 0.78, y: 0.68 }, controls: [{ x: 0.58, y: 0.52 }, { x: 0.78, y: 0.52 }] },
  // Bottom half of the ring, closing back near its start
  { start: { x: 0.78, y: 0.68 }, end: { x: 0.59, y: 0.70 }, controls: [{ x: 0.78, y: 0.84 }, { x: 0.59, y: 0.84 }] }
];

// Precomputed main-stroke paths for each numeral
const EK_MAIN_POINTS = generateMultiSegmentPath(EK_SEGMENTS);
const DO_MAIN_POINTS = generateMultiSegmentPath(DO_SEGMENTS);
const TEEN_MAIN_POINTS = generateMultiSegmentPath(TEEN_SEGMENTS);
const CHAAR_MAIN_POINTS = generateMultiSegmentPath(CHAAR_SEGMENTS);
const PAANCH_MAIN_POINTS = generateMultiSegmentPath(PAANCH_SEGMENTS);
const CHHAY_MAIN_POINTS = generateMultiSegmentPath(CHHAY_SEGMENTS);
const SAAT_MAIN_POINTS = generateMultiSegmentPath(SAAT_SEGMENTS);
const AATH_MAIN_POINTS = generateMultiSegmentPath(AATH_SEGMENTS);
const NAU_MAIN_POINTS = generateMultiSegmentPath(NAU_SEGMENTS);
const DAS_MAIN_POINTS = generateMultiSegmentPath(DAS_SEGMENTS);

export const numbers = [
  {
    id: 'one',
    letter: '۱',
    name: 'One',
    nameUrdu: 'ایک',
    exampleWord: '۱ کتاب',
    exampleWordEnglish: '1 Book',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: EK_MAIN_POINTS }
    ]
  },
  {
    id: 'two',
    letter: '۲',
    name: 'Two',
    nameUrdu: 'دو',
    exampleWord: '۲ سیب',
    exampleWordEnglish: '2 Apples',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: DO_MAIN_POINTS }
    ]
  },
  {
    id: 'three',
    letter: '۳',
    name: 'Three',
    nameUrdu: 'تین',
    exampleWord: '۳ گیندیں',
    exampleWordEnglish: '3 Balls',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: TEEN_MAIN_POINTS }
    ]
  },
  {
    id: 'four',
    letter: '۴',
    name: 'Four',
    nameUrdu: 'چار',
    exampleWord: '۴ کمرے',
    exampleWordEnglish: '4 Rooms',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: CHAAR_MAIN_POINTS }
    ]
  },
  {
    id: 'five',
    letter: '۵',
    name: 'Five',
    nameUrdu: 'پانچ',
    exampleWord: '۵ پھول',
    exampleWordEnglish: '5 Flowers',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: PAANCH_MAIN_POINTS }
    ]
  },
  {
    id: 'six',
    letter: '۶',
    name: 'Six',
    nameUrdu: 'چھ',
    exampleWord: '۶ گھنٹے',
    exampleWordEnglish: '6 Hours',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: CHHAY_MAIN_POINTS }
    ]
  },
  {
    id: 'seven',
    letter: '۷',
    name: 'Seven',
    nameUrdu: 'سات',
    exampleWord: '۷ دن',
    exampleWordEnglish: '7 Days',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: SAAT_MAIN_POINTS }
    ]
  },
  {
    id: 'eight',
    letter: '۸',
    name: 'Eight',
    nameUrdu: 'آٹھ',
    exampleWord: '۸ آنکھیں',
    exampleWordEnglish: '8 Eyes',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: AATH_MAIN_POINTS }
    ]
  },
  {
    id: 'nine',
    letter: '۹',
    name: 'Nine',
    nameUrdu: 'نو',
    exampleWord: '۹ ستارے',
    exampleWordEnglish: '9 Stars',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: NAU_MAIN_POINTS }
    ]
  },
  {
    id: 'ten',
    letter: '۱۰',
    name: 'Ten',
    nameUrdu: 'دس',
    exampleWord: '۱۰ انگلیاں',
    exampleWordEnglish: '10 Fingers',
    imagePath: null,
    audioPath: null,
    wordAudioPath: null,
    strokes: [
      { type: 'main', points: DAS_MAIN_POINTS }
    ]
  }
];
