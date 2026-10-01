import React from 'react';
import { Home, Sparkles, UserCheck, Layers } from 'lucide-react';

export default function RoundNavigationCards({
  currentMode,
  onSelectMode,
  onGoToOpeningPage
}) {
  const rounds = [
    {
      id: 'opening',
      badge: 'WELCOME',
      title: 'Opening Page',
      desc: 'College Presentation & Welcome Screen',
      icon: Home,
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.1)',
      border: 'rgba(6, 182, 212, 0.3)',
      onClick: onGoToOpeningPage
    },
    {
      id: 'quiz',
      badge: 'ROUND 2',
      title: 'Logo Identification',
      desc: 'Identify brand logos from options',
      icon: Sparkles,
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.1)',
      border: 'rgba(56, 189, 248, 0.3)',
      onClick: () => onSelectMode('quiz')
    },
    {
      id: 'personality',
      badge: 'ROUND 4',
      title: 'Personality Identification',
      desc: 'Clue image & blurred personality reveal',
      icon: UserCheck,
      color: '#818cf8',
      bg: 'rgba(129, 140, 248, 0.1)',
      border: 'rgba(129, 140, 248, 0.3)',
      onClick: () => onSelectMode('personality')
    },
    {
      id: 'brandInImage',
      badge: 'ROUND 5',
      title: 'Brand in Image',
      desc: 'Find embedded brand logos in scene',
      icon: Layers,
      color: '#c084fc',
      bg: 'rgba(192, 132, 252, 0.1)',
      border: 'rgba(192, 132, 252, 0.3)',
      onClick: () => onSelectMode('brandInImage')
    }
  ];

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
        BUSINESS QUIZ ROUND NAVIGATION
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {rounds.map((r) => {
          const IconComp = r.icon;
          const isActive = currentMode === r.id;

          return (
            <button
              key={r.id}
              onClick={r.onClick}
              style={{
                background: isActive ? r.bg : 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(12px)',
                border: `2px solid ${isActive ? r.color : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '14px',
                padding: '16px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: isActive ? `0 0 20px ${r.bg}` : 'none',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = r.border;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    letterSpacing: '1px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: r.bg,
                    color: r.color,
                    border: `1px solid ${r.border}`
                  }}
                >
                  {r.badge}
                </span>
                <IconComp size={20} style={{ color: r.color }} />
              </div>

              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '2px' }}>
                  {r.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {r.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
