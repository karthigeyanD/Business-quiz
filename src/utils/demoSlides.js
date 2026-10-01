// Pre-generated SVG Data URIs for instant demo testing (Business Quiz & College Event themes)

const createSvgDataUrl = (bgGradient, icon, title, subtitle, tag) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        ${bgGradient}
      </linearGradient>
      <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.07"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="20" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    <!-- Background -->
    <rect width="1920" height="1080" fill="url(#bg)"/>
    
    <!-- Subtle Grid Overlay -->
    <path d="M0,135 H1920 M0,270 H1920 M0,405 H1920 M0,540 H1920 M0,675 H1920 M0,810 H1920 M0,945 H1920" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"/>
    <path d="M240,0 V1080 M480,0 V1080 M720,0 V1080 M960,0 V1080 M1200,0 V1080 M1440,0 V1080 M1680,0 V1080" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"/>
    
    <!-- Decorative Ambient Orbs -->
    <circle cx="250" cy="200" r="300" fill="#ffffff" fill-opacity="0.03" filter="url(#glow)"/>
    <circle cx="1700" cy="850" r="350" fill="#ffffff" fill-opacity="0.04" filter="url(#glow)"/>
    
    <!-- Main Center Glass Card -->
    <rect x="260" y="180" width="1400" height="720" rx="32" fill="url(#cardBg)" stroke="#ffffff" stroke-opacity="0.15" stroke-width="2"/>
    
    <!-- Tag / Badge -->
    <rect x="340" y="260" width="220" height="48" rx="24" fill="#ffffff" fill-opacity="0.12"/>
    <text x="450" y="291" fill="#67e8f9" font-family="'Outfit', sans-serif" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="2">${tag.toUpperCase()}</text>

    <!-- Icon Graphic -->
    <g transform="translate(960, 420)">
      ${icon}
    </g>
    
    <!-- Title -->
    <text x="960" y="630" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="64" font-weight="800" text-anchor="middle" letter-spacing="-1">${title}</text>
    
    <!-- Subtitle -->
    <text x="960" y="700" fill="#94a3b8" font-family="'Inter', sans-serif" font-size="28" font-weight="400" text-anchor="middle">${subtitle}</text>

    <!-- Footer Note -->
    <text x="960" y="830" fill="#64748b" font-family="'Inter', sans-serif" font-size="20" font-weight="500" text-anchor="middle">PROSHOW PRESENTATION PLATFORM • COLLEGE &amp; CORPORATE QUIZ SUITE</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const DEMO_SLIDES = [
  {
    id: 'demo-1',
    name: '01_Welcome_Banner.png',
    title: 'Annual Business & Tech Quiz 2026',
    caption: 'Welcome participants and guests to the Grand Finale event!',
    rotation: 0,
    url: createSvgDataUrl(
      '<stop offset="0%" stop-color="#0f172a"/><stop offset="50%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#311042"/>',
      `<circle cx="0" cy="0" r="70" fill="#8b5cf6" fill-opacity="0.2"/>
       <path d="M-30,-30 L30,-30 L30,30 L-30,30 Z" fill="none" stroke="#a855f7" stroke-width="8" stroke-linejoin="round"/>
       <path d="M-15,-15 L15,-15 L15,15 L-15,15 Z" fill="#6366f1"/>`,
      'Grand Finale Business Quiz 2026',
      'National Inter-College Championship Stage',
      'Round 1'
    )
  },
  {
    id: 'demo-2',
    name: '02_Round1_Questions.png',
    title: 'Question 1: Global Brand Origins',
    caption: 'Name the founding year and parent company of this iconic tech brand.',
    rotation: 0,
    url: createSvgDataUrl(
      '<stop offset="0%" stop-color="#022c22"/><stop offset="50%" stop-color="#064e3b"/><stop offset="100%" stop-color="#0f172a"/>',
      `<circle cx="0" cy="0" r="75" fill="#10b981" fill-opacity="0.2"/>
       <text x="0" y="25" fill="#34d399" font-family="'Outfit', sans-serif" font-size="90" font-weight="900" text-anchor="middle">?</text>`,
      'Question 01: Tech Pioneers',
      'Which tech giant was originally named "BackRub" in 1996?',
      'Visual Round'
    )
  },
  {
    id: 'demo-3',
    name: '03_College_Fest.png',
    title: 'Campus Innovation Showcase',
    caption: 'Displaying student startups and prototype exhibitions.',
    rotation: 0,
    url: createSvgDataUrl(
      '<stop offset="0%" stop-color="#1e293b"/><stop offset="50%" stop-color="#0369a1"/><stop offset="100%" stop-color="#0f172a"/>',
      `<circle cx="0" cy="0" r="70" fill="#0284c7" fill-opacity="0.25"/>
       <polygon points="0,-45 40,30 -40,30" fill="none" stroke="#38bdf8" stroke-width="8"/>
       <circle cx="0" cy="5" r="12" fill="#0ea5e9"/>`,
      'Campus Innovation Showcase',
      'Top 10 High-Tech Student Startup Projects',
      'Exhibition'
    )
  },
  {
    id: 'demo-4',
    name: '04_Leaderboard.png',
    title: 'Round 2 Score Board',
    caption: 'Current team standings after the Rapid Fire buzzer round.',
    rotation: 0,
    url: createSvgDataUrl(
      '<stop offset="0%" stop-color="#451a03"/><stop offset="50%" stop-color="#78350f"/><stop offset="100%" stop-color="#0f172a"/>',
      `<path d="M-40,30 L-40,-10 L-15,-10 L-15,30 Z M-10,30 L-10,-40 L15,-40 L15,30 Z M15,30 L15,0 L40,0 L40,30 Z" fill="#fbbf24"/>`,
      'Team Leaderboard Standings',
      '1st: CyberDynamos (450 pts) • 2nd: AlgoRhythms (410 pts)',
      'Scores'
    )
  },
  {
    id: 'demo-5',
    name: '05_Grand_Trophy.png',
    title: 'Valedictory & Awards Ceremony',
    caption: 'Presenting trophy and certificates to winners!',
    rotation: 0,
    url: createSvgDataUrl(
      '<stop offset="0%" stop-color="#312e81"/><stop offset="50%" stop-color="#4c1d95"/><stop offset="100%" stop-color="#581c87"/>',
      `<path d="M-30,-40 L30,-40 L25,10 C25,30 0,35 0,35 C0,35 -25,30 -25,10 Z" fill="none" stroke="#e879f9" stroke-width="8"/>
       <rect x="-15" y="35" width="30" height="10" fill="#c084fc"/>
       <rect x="-25" y="45" width="50" height="15" fill="#a855f7" rx="4"/>`,
      'Valedictory & Awards Ceremony',
      'Congratulations to all winners and participating college teams!',
      'Finale'
    )
  }
];
