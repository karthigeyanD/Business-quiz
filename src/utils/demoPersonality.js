// Default pre-built demo questions for "Personality Identification" quiz

const createClueSVG = (personKey) => {
  let graphicElement = '';

  if (personKey === 'ratan_tata') {
    // Clue: Taj Mahal Hotel & Tata Logo motif
    graphicElement = `
      <rect x="0" y="0" width="800" height="600" fill="#0f172a"/>
      <!-- Dome Silhouette -->
      <path d="M 250 450 L 250 320 Q 250 220 400 200 Q 550 220 550 320 L 550 450 Z" fill="#1e293b" stroke="#334155" stroke-width="4"/>
      <circle cx="400" cy="180" r="30" fill="#38bdf8"/>
      <path d="M 320 450 L 320 360 L 480 360 L 480 450 Z" fill="#0f172a"/>
      <!-- Tata T Emblem Motif -->
      <path d="M 330 270 L 470 270 M 400 270 L 400 340 M 360 290 Q 400 350 440 290" stroke="#38bdf8" stroke-width="12" fill="none" stroke-linecap="round"/>
      <text x="400" y="520" font-family="sans-serif" font-size="22" font-weight="bold" fill="#94a3b8" text-anchor="middle">CLUE: Iconic Indian Conglomerate &amp; Philanthropist Leader</text>
    `;
  } else if (personKey === 'elon_musk') {
    // Clue: Rocket Launch & Electric Car silhouette
    graphicElement = `
      <rect x="0" y="0" width="800" height="600" fill="#0b0f19"/>
      <!-- Rocket -->
      <path d="M 380 450 L 380 220 Q 400 120 420 220 L 420 450 Z" fill="#e2e8f0"/>
      <polygon points="380,220 400,120 420,220" fill="#dc2626"/>
      <polygon points="350,450 380,380 380,450" fill="#94a3b8"/>
      <polygon points="450,450 420,380 420,450" fill="#94a3b8"/>
      <!-- Fire flame -->
      <polygon points="385,450 400,530 415,450" fill="#f59e0b"/>
      <polygon points="392,450 400,500 408,450" fill="#ef4444"/>
      <text x="400" y="560" font-family="sans-serif" font-size="20" font-weight="bold" fill="#38bdf8" text-anchor="middle">CLUE: Commercial Spaceflight &amp; EV Pioneer</text>
    `;
  } else if (personKey === 'steve_jobs') {
    // Clue: Original Macintosh 1984 Computer
    graphicElement = `
      <rect x="0" y="0" width="800" height="600" fill="#18181b"/>
      <rect x="260" y="140" width="280" height="340" rx="20" fill="#e4e4e7"/>
      <rect x="290" y="170" width="220" height="170" rx="10" fill="#090d16"/>
      <text x="400" y="260" font-family="monospace" font-size="24" fill="#4ade80" text-anchor="middle">hello.</text>
      <rect x="290" y="370" width="120" height="15" rx="4" fill="#a1a1aa"/>
      <text x="400" y="540" font-family="sans-serif" font-size="20" font-weight="bold" fill="#a1a1aa" text-anchor="middle">CLUE: "Think Different" Personal Computer Visionary</text>
    `;
  } else if (personKey === 'sundar_pichai') {
    // Clue: Google Search Bar & Colors
    graphicElement = `
      <rect x="0" y="0" width="800" height="600" fill="#0f172a"/>
      <rect x="180" y="240" width="440" height="70" rx="35" fill="#1e293b" stroke="#334155" stroke-width="4"/>
      <circle cx="230" cy="275" r="16" fill="none" stroke="#60a5fa" stroke-width="5"/>
      <line x1="242" y1="287" x2="255" y2="300" stroke="#60a5fa" stroke-width="5" stroke-linecap="round"/>
      <text x="440" y="283" font-family="sans-serif" font-size="22" font-weight="600" fill="#94a3b8">Search the world...</text>
      <!-- 4 Google Dots -->
      <circle cx="340" cy="180" r="14" fill="#4285F4"/>
      <circle cx="380" cy="180" r="14" fill="#EA4335"/>
      <circle cx="420" cy="180" r="14" fill="#FBBC05"/>
      <circle cx="460" cy="180" r="14" fill="#34A853"/>
      <text x="400" y="440" font-family="sans-serif" font-size="20" font-weight="bold" fill="#38bdf8" text-anchor="middle">CLUE: Tech Giant CEO from IIT Kharagpur</text>
    `;
  } else if (personKey === 'narayana_murthy') {
    // Clue: Indian IT Campus & Glass Building
    graphicElement = `
      <rect x="0" y="0" width="800" height="600" fill="#06121e"/>
      <rect x="220" y="160" width="360" height="300" rx="10" fill="#1e293b" stroke="#38bdf8" stroke-width="4"/>
      <!-- Grid Windows -->
      <line x1="310" y1="160" x2="310" y2="460" stroke="#38bdf8" stroke-width="2"/>
      <line x1="400" y1="160" x2="400" y2="460" stroke="#38bdf8" stroke-width="2"/>
      <line x1="490" y1="160" x2="490" y2="460" stroke="#38bdf8" stroke-width="2"/>
      <line x1="220" y1="260" x2="580" y2="260" stroke="#38bdf8" stroke-width="2"/>
      <line x1="220" y1="360" x2="580" y2="360" stroke="#38bdf8" stroke-width="2"/>
      <text x="400" y="520" font-family="sans-serif" font-size="20" font-weight="bold" fill="#94a3b8" text-anchor="middle">CLUE: Co-founder of Indian Software Consulting Empire</text>
    `;
  } else if (personKey === 'mukesh_ambani') {
    // Clue: Antilia Architectural Silhouette & Jio Tower
    graphicElement = `
      <rect x="0" y="0" width="800" height="600" fill="#1e1b4b"/>
      <!-- Antilia offset blocks -->
      <rect x="320" y="140" width="160" height="50" fill="#4338ca"/>
      <rect x="300" y="200" width="200" height="60" fill="#3730a3"/>
      <rect x="330" y="270" width="140" height="50" fill="#4338ca"/>
      <rect x="280" y="330" width="240" height="70" fill="#3730a3"/>
      <rect x="260" y="410" width="280" height="60" fill="#312e81"/>
      <text x="400" y="530" font-family="sans-serif" font-size="20" font-weight="bold" fill="#a5b4fc" text-anchor="middle">CLUE: Asia's Richest Energy &amp; Telecom Tycoon</text>
    `;
  } else if (personKey === 'satya_nadella') {
    // Clue: Windows / Azure Cloud Motif
    graphicElement = `
      <rect x="0" y="0" width="800" height="600" fill="#090d16"/>
      <!-- 4 Windows Squares -->
      <rect x="280" y="180" width="115" height="115" fill="#f25022"/>
      <rect x="405" y="180" width="115" height="115" fill="#7fba00"/>
      <rect x="280" y="305" width="115" height="115" fill="#00a4ef"/>
      <rect x="405" y="305" width="115" height="115" fill="#ffb900"/>
      <text x="400" y="480" font-family="sans-serif" font-size="20" font-weight="bold" fill="#38bdf8" text-anchor="middle">CLUE: Hyderabad-born Cloud Transformation CEO</text>
    `;
  } else {
    // Clue: PepsiCo Bottle Silhouette
    graphicElement = `
      <rect x="0" y="0" width="800" height="600" fill="#020617"/>
      <path d="M 370 140 L 430 140 L 440 220 Q 500 280 470 420 L 330 420 Q 300 280 360 220 Z" fill="#1e3a8a"/>
      <circle cx="400" cy="330" r="45" fill="#dc2626"/>
      <path d="M 355 330 Q 400 290 445 330" stroke="#ffffff" stroke-width="12" fill="none"/>
      <text x="400" y="500" font-family="sans-serif" font-size="20" font-weight="bold" fill="#94a3b8" text-anchor="middle">CLUE: Pioneering Female CEO of Global Beverage Giant</text>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">${graphicElement}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const createAnswerPortraitSVG = (name, role, accentColor) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
      <defs>
        <linearGradient id="pGrad_${name.replace(/\s+/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="${accentColor}" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#pGrad_${name.replace(/\s+/g, '')})" />
      <circle cx="400" cy="240" r="100" fill="#334155" stroke="#64748b" stroke-width="6"/>
      <circle cx="400" cy="210" r="42" fill="#94a3b8"/>
      <path d="M 310 320 Q 400 260 490 320 C 490 320 460 380 400 380 C 340 380 310 320 310 320 Z" fill="#94a3b8"/>
      
      <!-- Name Badge Plate -->
      <rect x="150" y="420" width="500" height="110" rx="16" fill="rgba(15, 23, 42, 0.85)" stroke="${accentColor}" stroke-width="3"/>
      <text x="400" y="470" font-family="sans-serif" font-size="34" font-weight="800" fill="#ffffff" text-anchor="middle">${name}</text>
      <text x="400" y="505" font-family="sans-serif" font-size="18" font-weight="600" fill="#38bdf8" text-anchor="middle">${role}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const DEFAULT_PERSONALITY_QUESTIONS = [
  {
    id: 'pers-q-1',
    questionNumber: 1,
    title: 'Question 1: Identify this revered Indian industrialist & philanthropist',
    clueImage: createClueSVG('ratan_tata'),
    answerImage: createAnswerPortraitSVG('Ratan Tata', 'Former Chairman, Tata Group', '#38bdf8'),
    name: 'Ratan Tata',
    explanation: 'Ratan Tata was the Chairman of Tata Group (1990–2012) who led acquisitions of Jaguar Land Rover, Tetley, and Corus.'
  },
  {
    id: 'pers-q-2',
    questionNumber: 2,
    title: 'Question 2: Who is the CEO of Tesla and founder of SpaceX?',
    clueImage: createClueSVG('elon_musk'),
    answerImage: createAnswerPortraitSVG('Elon Musk', 'CEO of Tesla & SpaceX', '#f59e0b'),
    name: 'Elon Musk',
    explanation: 'Elon Musk revolutionized electric transport with Tesla and commercial space travel with SpaceX.'
  },
  {
    id: 'pers-q-3',
    questionNumber: 3,
    title: 'Question 3: Identify the iconic co-founder of Apple Inc.',
    clueImage: createClueSVG('steve_jobs'),
    answerImage: createAnswerPortraitSVG('Steve Jobs', 'Co-Founder, Apple Inc.', '#a1a1aa'),
    name: 'Steve Jobs',
    explanation: 'Steve Jobs co-founded Apple in 1976 and launched groundbreaking devices including the Macintosh, iPod, iPhone, and iPad.'
  },
  {
    id: 'pers-q-4',
    questionNumber: 4,
    title: 'Question 4: Identify the Indian-born Chief Executive Officer of Alphabet & Google',
    clueImage: createClueSVG('sundar_pichai'),
    answerImage: createAnswerPortraitSVG('Sundar Pichai', 'CEO, Alphabet & Google', '#4285F4'),
    name: 'Sundar Pichai',
    explanation: 'Sundar Pichai joined Google in 2004, led Chrome browser development, and became CEO of Google in 2015 and Alphabet in 2019.'
  },
  {
    id: 'pers-q-5',
    questionNumber: 5,
    title: 'Question 5: Who is the legendary co-founder of Infosys?',
    clueImage: createClueSVG('narayana_murthy'),
    answerImage: createAnswerPortraitSVG('N. R. Narayana Murthy', 'Co-Founder, Infosys', '#38bdf8'),
    name: 'N. R. Narayana Murthy',
    explanation: 'Narayana Murthy co-founded Infosys in 1981 with 6 engineers and a seed capital of $250, pioneering Indian IT exports.'
  },
  {
    id: 'pers-q-6',
    questionNumber: 6,
    title: 'Question 6: Identify Asia\'s leading business tycoon and Chairman of Reliance Industries',
    clueImage: createClueSVG('mukesh_ambani'),
    answerImage: createAnswerPortraitSVG('Mukesh Ambani', 'Chairman, Reliance Industries', '#818cf8'),
    name: 'Mukesh Ambani',
    explanation: 'Mukesh Ambani leads Reliance Industries, spanning petrochemicals, refining, retail, and 4G/5G telecom with Jio.'
  },
  {
    id: 'pers-q-7',
    questionNumber: 7,
    title: 'Question 7: Who is the Chief Executive Officer of Microsoft?',
    clueImage: createClueSVG('satya_nadella'),
    answerImage: createAnswerPortraitSVG('Satya Nadella', 'CEO, Microsoft', '#00a4ef'),
    name: 'Satya Nadella',
    explanation: 'Satya Nadella took over as CEO of Microsoft in 2014, orchestrating a massive cloud transformation with Azure.'
  },
  {
    id: 'pers-q-8',
    questionNumber: 8,
    title: 'Question 8: Identify the trailblazing former Chairperson and CEO of PepsiCo',
    clueImage: createClueSVG('indra_nooyi'),
    answerImage: createAnswerPortraitSVG('Indra Nooyi', 'Former CEO, PepsiCo', '#3b82f6'),
    name: 'Indra Nooyi',
    explanation: 'Indra Nooyi served as CEO of PepsiCo from 2006 to 2018, consistently ranked among the world\'s 100 most powerful women.'
  }
];
