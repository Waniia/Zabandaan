// Word search grid generation algorithm

// Urdu letters for filling random cells
const URDU_LETTERS = [
  'ا', 'ب', 'پ', 'ت', 'ٹ', 'ث', 'ج', 'چ', 'ح', 'خ',
  'د', 'ذ', 'ر', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض', 'ط',
  'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن',
  'و', 'ہ', 'ی', 'ے'
];

function randomUrduLetter() {
  return URDU_LETTERS[Math.floor(Math.random() * URDU_LETTERS.length)];
}

// Split Urdu word into individual characters (handles multi-byte)
function splitWord(word) {
  return Array.from(word);
}

export function generateGrid(words, gridSize = 10) {
  // Initialize empty grid
  const grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => null)
  );
  
  const placements = [];
  const directions = [
    { dr: 0, dc: 1, name: 'horizontal' },   // left to right
    { dr: 1, dc: 0, name: 'vertical' },      // top to bottom
  ];
  
  // Sort words by length (longest first for better placement)
  const sortedWords = [...words].sort((a, b) => {
    const aLen = splitWord(a.word_urdu).length;
    const bLen = splitWord(b.word_urdu).length;
    return bLen - aLen;
  });
  
  for (const wordObj of sortedWords) {
    const chars = splitWord(wordObj.word_urdu);
    const wordLen = chars.length;
    
    if (wordLen > gridSize) continue; // Skip words too long for grid
    
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!placed && attempts < maxAttempts) {
      attempts++;
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const maxRow = dir.dr === 0 ? gridSize : gridSize - wordLen;
      const maxCol = dir.dc === 0 ? gridSize : gridSize - wordLen;
      
      if (maxRow <= 0 || maxCol <= 0) continue;
      
      const startRow = Math.floor(Math.random() * maxRow);
      const startCol = Math.floor(Math.random() * maxCol);
      
      // Check if word fits
      let fits = true;
      for (let i = 0; i < wordLen; i++) {
        const r = startRow + i * dir.dr;
        const c = startCol + i * dir.dc;
        if (r >= gridSize || c >= gridSize) { fits = false; break; }
        if (grid[r][c] !== null && grid[r][c] !== chars[i]) { fits = false; break; }
      }
      
      if (fits) {
        const cells = [];
        for (let i = 0; i < wordLen; i++) {
          const r = startRow + i * dir.dr;
          const c = startCol + i * dir.dc;
          grid[r][c] = chars[i];
          cells.push({ row: r, col: c });
        }
        placements.push({
          word: wordObj.word_urdu,
          meaning: wordObj.word_meaning,
          audio_path: wordObj.audio_path,
          direction: dir.name,
          cells,
          startRow,
          startCol
        });
        placed = true;
      }
    }
  }
  
  // Fill remaining cells with random Urdu letters
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = randomUrduLetter();
      }
    }
  }
  
  return { grid, placements };
}

export function checkSelection(grid, startCell, endCell, placements) {
  // Determine direction from start to end
  const dr = Math.sign(endCell.row - startCell.row);
  const dc = Math.sign(endCell.col - startCell.col);
  
  // Build selected word
  let selectedCells = [];
  let r = startCell.row;
  let c = startCell.col;
  
  const maxSteps = Math.max(Math.abs(endCell.row - startCell.row), Math.abs(endCell.col - startCell.col)) + 1;
  
  for (let i = 0; i < maxSteps; i++) {
    selectedCells.push({ row: r, col: c });
    if (r === endCell.row && c === endCell.col) break;
    r += dr;
    c += dc;
  }
  
  const selectedWord = selectedCells.map(cell => grid[cell.row][cell.col]).join('');
  
  // Check if selected word matches any placement
  for (const placement of placements) {
    const placementWord = placement.cells.map(cell => grid[cell.row][cell.col]).join('');
    
    // Check forward match
    if (selectedWord === placementWord) {
      return { found: true, placement, cells: selectedCells };
    }
    
    // Check reverse match
    const reversedWord = selectedWord.split('').reverse().join('');
    if (reversedWord === placementWord) {
      return { found: true, placement, cells: selectedCells.reverse() };
    }
  }
  
  return { found: false };
}
