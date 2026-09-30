/**
 * PuzzleImageDisplay — Renders a personality clue image.
 *
 * Supports:
 *   1. Full image view
 *   2. Interactive 4-piece puzzle tile view (2x2 grid) for puzzle questions
 *      (Questions 2, 4, 6 - Colonel Sanders, Sundar Pichai, Bill Gates)
 */

import { useState } from 'react';

export default function PuzzleImageDisplay({
  src,
  alt = 'Personality clue',
  isPuzzle = false,
  puzzleMode = 'tiles', // 'tiles' | 'full'
  className = '',
}) {
  // Tile interaction state for 4-piece puzzle (indices 0, 1, 2, 3)
  const [tileOrder, setTileOrder] = useState([0, 1, 2, 3]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [previewFull, setPreviewFull] = useState(false);

  if (!src) {
    return (
      <div className="r4-puzzle-missing">
        <span style={{ fontSize: '2.5rem' }}>🖼️</span>
        <p>No clue image uploaded yet by host.</p>
      </div>
    );
  }

  // If not a puzzle question or puzzleMode is set to 'full', render direct image
  if (!isPuzzle || puzzleMode === 'full' || previewFull) {
    return (
      <div className={`r4-clue-image-container ${className}`}>
        <img src={src} alt={alt} className="r4-clue-img" />
        {isPuzzle && puzzleMode === 'tiles' && (
          <button
            className="btn small ghost r4-puzzle-toggle-btn"
            onClick={() => setPreviewFull(false)}
          >
            🧩 Switch to 4-Piece Puzzle View
          </button>
        )}
      </div>
    );
  }

  // Interactive 4-Piece Puzzle View (2x2 Grid)
  const tilePositions = [
    { bgPos: '0% 0%' },     // Top-Left (Piece 1)
    { bgPos: '100% 0%' },   // Top-Right (Piece 2)
    { bgPos: '0% 100%' },   // Bottom-Left (Piece 3)
    { bgPos: '100% 100%' }, // Bottom-Right (Piece 4)
  ];

  const handleTileClick = (index) => {
    if (selectedTile === null) {
      setSelectedTile(index);
    } else {
      // Swap tiles
      const next = [...tileOrder];
      const temp = next[selectedTile];
      next[selectedTile] = next[index];
      next[index] = temp;
      setTileOrder(next);
      setSelectedTile(null);
    }
  };

  const handleResetPuzzle = () => {
    setTileOrder([0, 1, 2, 3]);
    setSelectedTile(null);
  };

  return (
    <div className={`r4-puzzle-wrapper ${className}`}>
      <div className="r4-puzzle-header">
        <span className="r4-puzzle-badge">🧩 4-Piece Puzzle Clue</span>
        <div className="r4-puzzle-actions">
          <button
            className="btn small ghost"
            onClick={() => setPreviewFull(true)}
            title="View complete image"
          >
            🔍 Full Image
          </button>
          <button
            className="btn small ghost"
            onClick={handleResetPuzzle}
            title="Reset tile positions"
          >
            ↺ Reset Tiles
          </button>
        </div>
      </div>

      <div className="r4-puzzle-grid">
        {tileOrder.map((pieceIdx, displayPos) => {
          const pos = tilePositions[pieceIdx];
          const isSelected = selectedTile === displayPos;

          return (
            <div
              key={displayPos}
              className={`r4-puzzle-tile ${isSelected ? 'selected' : ''}`}
              onClick={() => handleTileClick(displayPos)}
              title={`Tile ${displayPos + 1} — Click to select and swap`}
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: '200% 200%',
                backgroundPosition: pos.bgPos,
              }}
            >
              <span className="r4-tile-number">{displayPos + 1}</span>
            </div>
          );
        })}
      </div>
      <p className="r4-puzzle-hint">
        Tap or click any two tiles to swap their positions and reconstruct the clue!
      </p>
    </div>
  );
}
