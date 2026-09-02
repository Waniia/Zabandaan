// Urdu alphabet data for the first 10 letters
// Each letter has multi-stroke data: main path + dot positions
// Reference paths are normalized coordinates (0-1) for the canvas
// Dots are separate strokes that the user must place after the main stroke

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

export const alphabets = [
  {
    id: 'alif',
    letter: 'ا',
    name: 'Alif',
    nameUrdu: 'الف',
    exampleWord: 'انار',
    exampleWordEnglish: 'Pomegranate',
    imagePath: '/images/alphabets/alif-anar.png',
    strokes: [
      {
        type: 'main',
        points: generateSmoothPath(
          { x: 0.50, y: 0.12 },
          { x: 0.50, y: 0.88 },
          [{ x: 0.52, y: 0.50 }],
          30
        )
      }
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
    strokes: [
      {
        type: 'main',
        points: generateSmoothPath(
          { x: 0.78, y: 0.35 },
          { x: 0.22, y: 0.55 },
          [{ x: 0.55, y: 0.65 }, { x: 0.38, y: 0.70 }],
          30
        )
      },
      {
        type: 'dot',
        points: [{ x: 0.50, y: 0.82 }]
      }
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
    strokes: [
      {
        type: 'main',
        points: generateSmoothPath(
          { x: 0.78, y: 0.35 },
          { x: 0.22, y: 0.55 },
          [{ x: 0.55, y: 0.65 }, { x: 0.38, y: 0.70 }],
          30
        )
      },
      {
        type: 'dot',
        points: [
          { x: 0.42, y: 0.82 },
          { x: 0.50, y: 0.87 },
          { x: 0.58, y: 0.82 }
        ]
      }
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
    strokes: [
      {
        type: 'main',
        points: generateSmoothPath(
          { x: 0.78, y: 0.40 },
          { x: 0.22, y: 0.58 },
          [{ x: 0.55, y: 0.68 }, { x: 0.38, y: 0.72 }],
          30
        )
      },
      {
        type: 'dot',
        points: [
          { x: 0.44, y: 0.25 },
          { x: 0.56, y: 0.25 }
        ]
      }
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
    strokes: [
      {
        type: 'main',
        points: generateSmoothPath(
          { x: 0.78, y: 0.40 },
          { x: 0.22, y: 0.58 },
          [{ x: 0.55, y: 0.68 }, { x: 0.38, y: 0.72 }],
          30
        )
      },
      {
        type: 'dot',
        points: [{ x: 0.50, y: 0.22 }]
      }
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
    strokes: [
      {
        type: 'main',
        points: generateSmoothPath(
          { x: 0.78, y: 0.40 },
          { x: 0.22, y: 0.58 },
          [{ x: 0.55, y: 0.68 }, { x: 0.38, y: 0.72 }],
          30
        )
      },
      {
        type: 'dot',
        points: [
          { x: 0.50, y: 0.18 },
          { x: 0.42, y: 0.26 },
          { x: 0.58, y: 0.26 }
        ]
      }
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
    strokes: [
      {
        type: 'main',
        points: generateSmoothPath(
          { x: 0.70, y: 0.15 },
          { x: 0.38, y: 0.82 },
          [{ x: 0.58, y: 0.45 }, { x: 0.45, y: 0.68 }],
          30
        )
      },
      {
        type: 'dot',
        points: [{ x: 0.52, y: 0.60 }]
      }
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
    strokes: [
      {
        type: 'main',
        points: generateSmoothPath(
          { x: 0.70, y: 0.15 },
          { x: 0.38, y: 0.82 },
          [{ x: 0.58, y: 0.45 }, { x: 0.45, y: 0.68 }],
          30
        )
      },
      {
        type: 'dot',
        points: [
          { x: 0.52, y: 0.54 },
          { x: 0.46, y: 0.62 },
          { x: 0.58, y: 0.62 }
        ]
      }
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
    strokes: [
      {
        type: 'main',
        points: generateSmoothPath(
          { x: 0.70, y: 0.15 },
          { x: 0.38, y: 0.82 },
          [{ x: 0.58, y: 0.45 }, { x: 0.45, y: 0.68 }],
          30
        )
      }
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
    strokes: [
      {
        type: 'main',
        points: generateSmoothPath(
          { x: 0.70, y: 0.15 },
          { x: 0.38, y: 0.82 },
          [{ x: 0.58, y: 0.45 }, { x: 0.45, y: 0.68 }],
          30
        )
      },
      {
        type: 'dot',
        points: [{ x: 0.56, y: 0.28 }]
      }
    ]
  }
];
