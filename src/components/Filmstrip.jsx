import React from 'react';

export default function Filmstrip({ slides, currentIndex, onSelectSlide, isVisible }) {
  if (!isVisible || slides.length === 0) return null;

  return (
    <div className="filmstrip-drawer">
      {slides.map((slide, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={slide.id || idx}
            className={`film-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectSlide(idx)}
            title={slide.title || slide.name}
          >
            <img
              src={slide.url}
              alt={slide.name}
              style={{ transform: slide.rotation ? `rotate(${slide.rotation}deg)` : undefined }}
            />
            <div className="film-num">#{idx + 1}</div>
          </div>
        );
      })}
    </div>
  );
}
