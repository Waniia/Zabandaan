import { useState, useCallback, useRef, useMemo } from 'react';

export default function WordSearchGrid({ grid, placements, foundWords, onSelect }) {
  const [selecting, setSelecting] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [endCell, setEndCell] = useState(null);
  const gridRef = useRef(null);

  const gridSize = grid ? grid.length : 0;

  // Build a set of found cell keys for quick lookup
  const foundCellSet = useMemo(() => {
    const s = new Set();
    (foundWords || []).forEach(pw => {
      (pw.cells || []).forEach(c => {
        s.add(`${c.row}-${c.col}`);
      });
    });
    return s;
  }, [foundWords]);

  // Build selected cell set for highlighting during drag
  const selectedCells = useMemo(() => {
    if (!startCell || !endCell) return new Set();
    const s = new Set();
    const dr = Math.sign(endCell.row - startCell.row);
    const dc = Math.sign(endCell.col - startCell.col);
    const maxSteps = Math.max(
      Math.abs(endCell.row - startCell.row),
      Math.abs(endCell.col - startCell.col)
    ) + 1;
    let r = startCell.row;
    let c = startCell.col;
    for (let i = 0; i < maxSteps; i++) {
      s.add(`${r}-${c}`);
      if (r === endCell.row && c === endCell.col) break;
      r += dr;
      c += dc;
    }
    return s;
  }, [startCell, endCell]);

  const getCellFromEvent = useCallback((e) => {
    if (!gridRef.current) return null;
    const touch = e.touches ? e.touches[0] : e;
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return null;
    const cell = el.closest('[data-cell]');
    if (!cell) return null;
    const row = parseInt(cell.dataset.row, 10);
    const col = parseInt(cell.dataset.col, 10);
    if (isNaN(row) || isNaN(col)) return null;
    return { row, col };
  }, []);

  const handlePointerDown = useCallback((row, col, e) => {
    e.preventDefault();
    setSelecting(true);
    setStartCell({ row, col });
    setEndCell({ row, col });
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!selecting) return;
    const cell = getCellFromEvent(e);
    if (cell) {
      setEndCell(cell);
    }
  }, [selecting, getCellFromEvent]);

  const handlePointerUp = useCallback(() => {
    if (!selecting) return;
    setSelecting(false);
    if (startCell && endCell && onSelect) {
      onSelect(startCell, endCell);
    }
    // Clear selection highlight after a brief moment
    setTimeout(() => {
      setStartCell(null);
      setEndCell(null);
    }, 200);
  }, [selecting, startCell, endCell, onSelect]);

  if (!grid || gridSize === 0) return null;

  const cellSize = gridSize > 10 ? 40 : 48;
  const fontSize = gridSize > 10 ? 18 : 22;

  return (
    <div
      style={styles.wrapper}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      <div
        ref={gridRef}
        style={{
          ...styles.grid,
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
        }}
      >
        {grid.map((row, ri) =>
          row.map((letter, ci) => {
            const key = `${ri}-${ci}`;
            const isFound = foundCellSet.has(key);
            const isSelected = selectedCells.has(key);

            let bg = '#FFFEF7';
            let color = '#333';
            let border = '#D7CEB8';
            let shadow = 'none';

            if (isFound) {
              bg = '#C8E6C9';
              color = '#1B5E20';
              border = '#81C784';
              shadow = 'inset 0 0 4px rgba(46,125,50,0.2)';
            } else if (isSelected) {
              bg = '#BBDEFB';
              color = '#0D47A1';
              border = '#64B5F6';
              shadow = 'inset 0 0 4px rgba(33,150,243,0.2)';
            }

            return (
              <div
                key={key}
                data-cell="true"
                data-row={ri}
                data-col={ci}
                style={{
                  ...styles.cell,
                  width: cellSize,
                  height: cellSize,
                  fontSize,
                  background: bg,
                  color,
                  borderColor: border,
                  boxShadow: shadow,
                  cursor: isFound ? 'default' : 'pointer',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
                onMouseDown={(e) => !isFound && handlePointerDown(ri, ci, e)}
                onTouchStart={(e) => !isFound && handlePointerDown(ri, ci, e)}
              >
                {letter}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    touchAction: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  grid: {
    display: 'grid',
    gap: 2,
    padding: 8,
    background: '#E8E0C8',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    border: '1px solid',
    fontFamily: "'Noto Nastaliq Urdu', serif",
    fontWeight: 600,
    transition: 'background 0.15s, color 0.15s',
    lineHeight: 1,
  },
};
