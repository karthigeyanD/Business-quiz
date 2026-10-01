import React from 'react';
import { Clock, Sparkles, UserCheck, Layers, ChevronRight } from 'lucide-react';

export default function OpeningScreen({ onSelectRound }) {
  const rounds = [
    {
      id: 'quiz',
      roundNum: 'ROUND 2',
      title: 'LOGO IDENTIFICATION',
      icon: Sparkles,
      gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%)',
      borderColor: 'rgba(6, 182, 212, 0.6)',
      hoverGlow: 'rgba(6, 182, 212, 0.45)',
      accentColor: '#06b6d4'
    },
    {
      id: 'personality',
      roundNum: 'ROUND 4',
      title: 'PERSONALITY IDENTIFICATION',
      icon: UserCheck,
      gradient: 'linear-gradient(135deg, rgba(129, 140, 248, 0.25) 0%, rgba(79, 70, 229, 0.25) 100%)',
      borderColor: 'rgba(129, 140, 248, 0.6)',
      hoverGlow: 'rgba(129, 140, 248, 0.45)',
      accentColor: '#818cf8'
    },
    {
      id: 'brandInImage',
      roundNum: 'ROUND 5',
      title: 'BRAND IN IMAGE',
      icon: Layers,
      gradient: 'linear-gradient(135deg, rgba(192, 132, 252, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
      borderColor: 'rgba(192, 132, 252, 0.6)',
      hoverGlow: 'rgba(192, 132, 252, 0.45)',
      accentColor: '#c084fc'
    }
  ];

  return (
    <div className="opening-screen-container">
      {/* Background Decorative Ambient Glows */}
      <div className="ambient-glow glow-1" />
      <div className="ambient-glow glow-2" />

      {/* Main Center Content (Centered Horizontally & Vertically) */}
      <div className="opening-main-content">
        {/* College Name Header */}
        <div className="opening-college-badge">
          <Sparkles size={18} className="text-cyan-400" />
          <span>ANNAI MIRA COLLEGE OF ENGINEERING AND TECHNOLOGY</span>
        </div>

        {/* Main Quiz Heading */}
        <h1 className="opening-main-title">
          BUSINESS QUIZ
        </h1>

        {/* Timing Card */}
        <div className="opening-timing-card">
          <Clock size={20} className="timing-icon" />
          <span>TIMING : 11:00 AM to 1:00 PM</span>
        </div>

        {/* Round Selection Cards Grid */}
        <div className="opening-rounds-grid">
          {rounds.map((round) => {
            const IconComponent = round.icon;
            return (
              <button
                key={round.id}
                className="opening-round-card"
                onClick={() => onSelectRound(round.id)}
                style={{
                  background: round.gradient,
                  borderColor: round.borderColor,
                  '--hover-glow': round.hoverGlow,
                  '--accent-color': round.accentColor
                }}
              >
                <div className="round-card-header">
                  <span className="round-badge">{round.roundNum}</span>
                  <div className="round-icon-circle">
                    <IconComponent size={24} style={{ color: round.accentColor }} />
                  </div>
                </div>

                <div className="round-card-title">
                  {round.title}
                </div>

                <div className="round-card-start-action">
                  <span>START ROUND</span>
                  <ChevronRight size={18} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Technical Team Section (Anchored to Bottom-Right Corner) */}
      <div className="opening-tech-team">
        <div className="tech-team-title">TECHNICAL TEAM</div>
        <div className="tech-team-names">
          <div className="tech-member">KARTHIGEYAN D</div>
          <div className="tech-member">KEERTHIVASAN K</div>
        </div>
      </div>
    </div>
  );
}
