// Default pre-built demo questions for "Brand in Image" quiz

const createBrandImageSVG = (brandName, mainColor, accentColor, shapeType) => {
  let graphicElement = '';

  if (shapeType === 'coffee') {
    // Coffee cup with Siren logo motif
    graphicElement = `
      <rect x="250" y="160" width="300" height="400" rx="30" fill="#f8fafc" />
      <path d="M 230 160 L 570 160 L 540 520 C 540 550 510 570 470 570 L 330 570 C 290 570 260 550 260 520 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="4"/>
      <rect x="220" y="130" width="360" height="45" rx="10" fill="#00704A" />
      <rect x="270" y="300" width="260" height="150" fill="#e2e8f0" rx="10"/>
      <circle cx="400" cy="375" r="55" fill="#00704A" />
      <path d="M 400 340 L 415 370 L 445 370 L 420 390 L 430 420 L 400 400 L 370 420 L 380 390 L 355 370 L 385 370 Z" fill="#ffffff"/>
      <text x="400" y="475" font-family="sans-serif" font-size="20" font-weight="bold" fill="#00704A" text-anchor="middle">STARBUCKS</text>
    `;
  } else if (shapeType === 'sneaker') {
    // Sneaker with Nike Swoosh motif
    graphicElement = `
      <path d="M 150 420 Q 200 240 380 250 L 500 270 Q 620 280 660 380 L 670 440 L 150 440 Z" fill="#1e293b"/>
      <path d="M 140 440 L 680 440 C 700 440 700 470 680 470 L 140 470 C 120 470 120 440 140 440 Z" fill="#f8fafc"/>
      <path d="M 260 380 Q 420 430 620 280 Q 440 330 310 330 Z" fill="#f59e0b" />
    `;
  } else if (shapeType === 'laptop') {
    // Laptop lid with Apple logo motif
    graphicElement = `
      <rect x="180" y="140" width="440" height="300" rx="20" fill="#94a3b8" stroke="#64748b" stroke-width="4"/>
      <path d="M 120 440 L 680 440 L 650 460 L 150 460 Z" fill="#cbd5e1"/>
      <circle cx="400" cy="285" r="42" fill="#ffffff"/>
      <circle cx="430" cy="270" r="30" fill="#94a3b8"/>
      <path d="M 405 230 C 415 220 425 225 425 225 C 425 225 420 238 410 242 C 400 246 395 240 395 240 C 395 240 400 232 405 230 Z" fill="#ffffff"/>
    `;
  } else if (shapeType === 'car') {
    // Electric Car front grill with Tesla T logo motif
    graphicElement = `
      <path d="M 150 300 Q 400 220 650 300 L 680 420 L 120 420 Z" fill="#0f172a" stroke="#334155" stroke-width="6"/>
      <path d="M 320 280 L 480 280 C 480 280 440 300 400 300 C 360 300 320 280 320 280 Z" fill="#cc0000"/>
      <path d="M 400 305 L 400 380 M 350 315 C 380 325 420 325 450 315" stroke="#cc0000" stroke-width="12" stroke-linecap="round" fill="none"/>
    `;
  } else if (shapeType === 'fastfood') {
    // Golden Arches Storefront
    graphicElement = `
      <rect x="150" y="150" width="500" height="320" fill="#1e1b4b" rx="16"/>
      <rect x="180" y="170" width="440" height="70" fill="#dc2626" rx="10"/>
      <path d="M 330 230 Q 360 140 390 230 Q 420 140 450 230" stroke="#fbbf24" stroke-width="26" fill="none" stroke-linecap="round"/>
      <rect x="250" y="270" width="300" height="180" fill="#334155" rx="8"/>
    `;
  } else if (shapeType === 'watch') {
    // Watch Dial with Rolex Crown logo
    graphicElement = `
      <circle cx="400" cy="300" r="170" fill="#090d16" stroke="#e2e8f0" stroke-width="14"/>
      <circle cx="400" cy="300" r="145" fill="#0f172a" stroke="#cbd5e1" stroke-width="3"/>
      <!-- Crown -->
      <path d="M 360 210 L 370 170 L 388 200 L 400 160 L 412 200 L 430 170 L 440 210 Z" fill="#fbbf24"/>
      <circle cx="370" cy="165" r="4" fill="#fbbf24"/>
      <circle cx="400" cy="155" r="5" fill="#fbbf24"/>
      <circle cx="430" cy="165" r="4" fill="#fbbf24"/>
      <!-- Hands -->
      <line x1="400" y1="300" x2="400" y2="210" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
      <line x1="400" y1="300" x2="470" y2="300" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
    `;
  } else if (shapeType === 'can') {
    // Energy Drink Can with Charging Bulls
    graphicElement = `
      <rect x="280" y="140" width="240" height="380" rx="30" fill="#64748b"/>
      <rect x="290" y="180" width="220" height="310" fill="#1e3a8a"/>
      <polygon points="290,180 510,490 290,490" fill="#cbd5e1"/>
      <circle cx="400" cy="330" r="50" fill="#f59e0b"/>
      <path d="M 340 330 Q 370 310 395 330 M 460 330 Q 430 310 405 330" stroke="#dc2626" stroke-width="14" stroke-linecap="round" fill="none"/>
    `;
  } else {
    // Three Stripes Track Jacket
    graphicElement = `
      <path d="M 200 160 L 600 160 L 680 480 L 560 500 L 520 280 L 280 280 L 240 500 L 120 480 Z" fill="#0f172a"/>
      <line x1="160" y1="200" x2="230" y2="440" stroke="#ffffff" stroke-width="12"/>
      <line x1="180" y1="200" x2="250" y2="440" stroke="#ffffff" stroke-width="12"/>
      <line x1="200" y1="200" x2="270" y2="440" stroke="#ffffff" stroke-width="12"/>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
      <defs>
        <linearGradient id="bgGrad_${shapeType}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${mainColor}" />
          <stop offset="100%" stop-color="${accentColor}" />
        </linearGradient>
        <filter id="shadow_${shapeType}">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity="0.5"/>
        </filter>
      </defs>
      <rect width="800" height="600" fill="url(#bgGrad_${shapeType})" />
      <g filter="url(#shadow_${shapeType})">
        ${graphicElement}
      </g>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const DEFAULT_BRAND_IN_IMAGE_QUESTIONS = [
  {
    id: 'bii-q-1',
    questionNumber: 1,
    title: 'Question 1: Identify the coffee brand featured on this cup',
    image: createBrandImageSVG('Starbucks', '#064e3b', '#022c22', 'coffee'),
    options: ['Starbucks', "Dunkin'", 'Costa Coffee', 'Tim Hortons'],
    correctOption: 'A',
    brandName: 'Starbucks',
    explanation: 'Starbucks is an American multinational chain of coffeehouses founded in Seattle, Washington in 1971.'
  },
  {
    id: 'bii-q-2',
    questionNumber: 2,
    title: 'Question 2: Which sportswear giant uses this trademark Swoosh logo on footwear?',
    image: createBrandImageSVG('Nike', '#1e1b4b', '#0f172a', 'sneaker'),
    options: ['Adidas', 'Puma', 'Nike', 'Reebok'],
    correctOption: 'C',
    brandName: 'Nike',
    explanation: 'Nike is the world\'s largest supplier of athletic shoes and apparel, famous for its iconic "Swoosh" emblem.'
  },
  {
    id: 'bii-q-3',
    questionNumber: 3,
    title: 'Question 3: Identify the tech company whose emblem is illuminated on this laptop lid',
    image: createBrandImageSVG('Apple', '#334155', '#0f172a', 'laptop'),
    options: ['Dell', 'Apple', 'HP', 'Lenovo'],
    correctOption: 'B',
    brandName: 'Apple',
    explanation: 'Apple Inc. is known for iconic hardware like MacBooks, iPhones, and iPads, bearing the signature bitten apple logo.'
  },
  {
    id: 'bii-q-4',
    questionNumber: 4,
    title: 'Question 4: Which electric vehicle maker features this "T" logo on its front grille?',
    image: createBrandImageSVG('Tesla', '#450a0a', '#0f172a', 'car'),
    options: ['Porsche', 'BMW', 'Audi', 'Tesla'],
    correctOption: 'D',
    brandName: 'Tesla',
    explanation: 'Tesla, Inc. designs electric cars and clean energy solutions, featuring a stylised cross-section of an electric motor as its T logo.'
  },
  {
    id: 'bii-q-5',
    questionNumber: 5,
    title: 'Question 5: Identify the fast food restaurant chain with the famous Golden Arches',
    image: createBrandImageSVG('McDonalds', '#7f1d1d', '#450a0a', 'fastfood'),
    options: ['Burger King', "McDonald's", "Wendy's", 'Subway'],
    correctOption: 'B',
    brandName: "McDonald's",
    explanation: "McDonald's is the world's largest restaurant chain by revenue, serving over 69 million customers daily."
  },
  {
    id: 'bii-q-6',
    questionNumber: 6,
    title: 'Question 6: Which luxury watch manufacturer displays a 5-pointed crown above its name?',
    image: createBrandImageSVG('Rolex', '#14532d', '#052e16', 'watch'),
    options: ['Omega', 'Rolex', 'TAG Heuer', 'Seiko'],
    correctOption: 'B',
    brandName: 'Rolex',
    explanation: 'Rolex is a Swiss luxury watchmaker headquartered in Geneva, recognized globally by its golden crown insignia.'
  },
  {
    id: 'bii-q-7',
    questionNumber: 7,
    title: 'Question 7: Identify the energy drink brand depicting two charging bulls on a yellow sun',
    image: createBrandImageSVG('RedBull', '#1e3a8a', '#172554', 'can'),
    options: ['Monster', 'Red Bull', 'Rockstar', 'Gatorade'],
    correctOption: 'B',
    brandName: 'Red Bull',
    explanation: 'Red Bull is an Austrian energy drink company created in 1987, known for extreme sports sponsorships.'
  },
  {
    id: 'bii-q-8',
    questionNumber: 8,
    title: 'Question 8: Which athletic brand is identified by 3 parallel stripes on sports apparel?',
    image: createBrandImageSVG('Adidas', '#1e293b', '#0f172a', 'stripes'),
    options: ['Adidas', 'Under Armour', 'New Balance', 'Champion'],
    correctOption: 'A',
    brandName: 'Adidas',
    explanation: 'Adidas is a German multinational sportswear brand founded by Adolf Dassler, famous for its 3-stripes mark.'
  }
];
