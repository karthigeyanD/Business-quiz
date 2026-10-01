// Pre-packaged 12-Question Logo Identification Quiz with high-resolution SVG logos

const createLogoSvg = (bg, symbolSvg, brandName) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="${bg}" rx="16"/>
    <g transform="translate(300, 200)">
      ${symbolSvg}
    </g>
    <text x="300" y="360" fill="#94a3b8" font-family="'Outfit', sans-serif" font-size="16" font-weight="600" text-anchor="middle" letter-spacing="1">BRAND LOGO</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

// SVG Logo Library
const LOGO_APPLE = createLogoSvg('#000000', `
  <path d="M15,-40 C22,-50 35,-55 45,-55 C43,-38 32,-25 22,-15 C13,-28 12,-40 15,-40 Z M48,-10 C50,15 65,22 66,23 C65,24 57,50 40,50 C32,50 25,44 15,44 C5,44 -3,50 -12,50 C-27,50 -44,22 -44,-15 C-44,-50 -20,-65 5,-65 C17,-65 26,-58 35,-58 C42,-58 46,-65 48,-10 Z" fill="#ffffff"/>
`, 'APPLE');

const LOGO_GOOGLE = createLogoSvg('#0f172a', `
  <path d="M0,-45 C25,-45 42,-35 52,-25 L35,-8 C27,-15 16,-20 0,-20 C-22,-20 -40,-2 -40,20 C-40,42 -22,60 0,60 C20,60 35,47 38,30 L0,30 L0,5 L63,5 C64,10 65,18 65,26 C65,63 40,85 0,85 C-36,85 -65,56 -65,20 C-65,-16 -36,-45 0,-45 Z" fill="#4285f4"/>
  <circle cx="20" cy="-20" r="15" fill="#ea4335"/>
  <circle cx="45" cy="45" r="12" fill="#34a853"/>
  <circle cx="-35" cy="40" r="14" fill="#fbbc05"/>
`, 'GOOGLE');

const LOGO_TESLA = createLogoSvg('#1e1b4b', `
  <path d="M-60,-50 C-30,-60 30,-60 60,-50 L50,-35 C25,-42 -25,-42 -50,-35 Z M-5,-25 L5,-25 L10,60 L-10,60 Z M-35,-25 C-15,-32 15,-32 35,-25 L25,-10 C10,-15 -10,-15 -25,-10 Z" fill="#cc0000"/>
`, 'TESLA');

const LOGO_NIKE = createLogoSvg('#111827', `
  <path d="M-70,10 C-30,-20 20,-45 70,-60 C10,-20 -30,25 -50,45 C-60,55 -70,55 -75,45 C-80,35 -75,20 -70,10 Z" fill="#ffffff"/>
`, 'NIKE');

const LOGO_MICROSOFT = createLogoSvg('#0f172a', `
  <rect x="-55" y="-55" width="50" height="50" fill="#f25022"/>
  <rect x="5" y="-55" width="50" height="50" fill="#7fba00"/>
  <rect x="-55" y="5" width="50" height="50" fill="#00a4ef"/>
  <rect x="5" y="5" width="50" height="50" fill="#ffb900"/>
`, 'MICROSOFT');

const LOGO_AMAZON = createLogoSvg('#090d16', `
  <text x="0" y="0" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="72" font-weight="800" text-anchor="middle">amazon</text>
  <path d="M-60,25 C-20,45 20,45 60,25 L45,15 C15,32 -15,32 -45,18 Z" fill="#ff9900"/>
  <polygon points="60,25 50,40 68,38" fill="#ff9900"/>
`, 'AMAZON');

const LOGO_SPOTIFY = createLogoSvg('#052e16', `
  <circle cx="0" cy="0" r="65" fill="#1ed760"/>
  <path d="M-40,-20 C-10,-30 20,-20 40,-10" fill="none" stroke="#000000" stroke-width="12" stroke-linecap="round"/>
  <path d="M-35,0 C-10,-10 15,-5 35,5" fill="none" stroke="#000000" stroke-width="10" stroke-linecap="round"/>
  <path d="M-30,20 C-10,12 10,15 28,24" fill="none" stroke="#000000" stroke-width="8" stroke-linecap="round"/>
`, 'SPOTIFY');

const LOGO_NETFLIX = createLogoSvg('#000000', `
  <rect x="-50" y="-65" width="25" height="130" fill="#b81d24"/>
  <rect x="25" y="-65" width="25" height="130" fill="#b81d24"/>
  <polygon points="-50,-65 -25,-65 50,65 25,65" fill="#e50914"/>
`, 'NETFLIX');

const LOGO_STARBUCKS = createLogoSvg('#022c22', `
  <circle cx="0" cy="0" r="65" fill="#00704a"/>
  <circle cx="0" cy="0" r="50" fill="none" stroke="#ffffff" stroke-width="4"/>
  <polygon points="0,-35 8,-10 30,-10 12,5 18,30 0,15 -18,30 -12,5 -30,-10 -8,-10" fill="#ffffff"/>
`, 'STARBUCKS');

const LOGO_META = createLogoSvg('#0f172a', `
  <path d="M-60,0 C-60,-35 -30,-35 0,10 C30,55 60,55 60,0 C60,-55 30,-55 0,-10 C-30,35 -60,35 -60,0 Z" fill="none" stroke="#0081fb" stroke-width="20" stroke-linecap="round"/>
`, 'META');

const LOGO_SAMSUNG = createLogoSvg('#172554', `
  <ellipse cx="0" cy="0" rx="90" ry="50" fill="#034ea2" transform="rotate(-15)"/>
  <text x="0" y="15" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="36" font-weight="800" text-anchor="middle" letter-spacing="4">SAMSUNG</text>
`, 'SAMSUNG');

const LOGO_MCDONALDS = createLogoSvg('#450a0a', `
  <path d="M-45,40 L-45,-20 C-45,-45 -25,-45 -25,-20 L-25,20 L-25,-20 C-25,-45 -5,-45 -5,-20 L-5,40" fill="none" stroke="#ffbc0d" stroke-width="16" stroke-linecap="round"/>
  <path d="M5,40 L5,-20 C5,-45 25,-45 25,-20 L25,20 L25,-20 C25,-45 45,-45 45,-20 L45,40" fill="none" stroke="#ffbc0d" stroke-width="16" stroke-linecap="round"/>
`, 'MCDONALDS');

const LOGO_BMW = createLogoSvg('#0f172a', `
  <circle cx="0" cy="0" r="65" fill="#000000" stroke="#ffffff" stroke-width="4"/>
  <path d="M0,-45 A45,45 0 0,1 45,0 L0,0 Z" fill="#0066b1"/>
  <path d="M-45,0 A45,45 0 0,1 0,-45 L0,0 Z" fill="#ffffff"/>
  <path d="M0,45 A45,45 0 0,1 -45,0 L0,0 Z" fill="#0066b1"/>
  <path d="M45,0 A45,45 0 0,1 0,45 L0,0 Z" fill="#ffffff"/>
  <text x="0" y="-52" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="14" font-weight="800" text-anchor="middle">BMW</text>
`, 'BMW');

const LOGO_PEPSI = createLogoSvg('#0f172a', `
  <circle cx="0" cy="0" r="60" fill="#005cb4"/>
  <path d="M-60,0 C-20,30 20,-30 60,0 A60,60 0 0,0 -60,0 Z" fill="#c9002b"/>
  <path d="M-60,0 C-20,30 20,-30 60,0 A60,60 0 0,1 -60,0 Z" fill="#ffffff"/>
`, 'PEPSI');

const LOGO_RED_BULL = createLogoSvg('#1e1b4b', `
  <circle cx="0" cy="0" r="50" fill="#ffcc00"/>
  <polygon points="-50,10 -10,-20 -20,25" fill="#cc0000"/>
  <polygon points="50,10 10,-20 20,25" fill="#cc0000"/>
`, 'RED BULL');

const LOGO_SONY = createLogoSvg('#000000', `
  <text x="0" y="20" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="64" font-weight="900" text-anchor="middle" letter-spacing="8">SONY</text>
`, 'SONY');


export const DEFAULT_QUIZ_QUESTIONS = [
  {
    id: 'q-1',
    questionNumber: 1,
    title: 'Which tech giant features the 4-color grid logo (Top Right)?',
    logos: [LOGO_APPLE, LOGO_MICROSOFT, LOGO_TESLA, LOGO_AMAZON],
    options: ['A) Apple', 'B) Microsoft', 'C) Tesla', 'D) Amazon'],
    correctOption: 'B',
    explanation: 'Microsoft introduced its famous 4-color window tile logo in 2012 representing Windows, Office, Xbox & Bing.'
  },
  {
    id: 'q-2',
    questionNumber: 2,
    title: 'Identify the EV automaker represented by the stylized "T" logo:',
    logos: [LOGO_TESLA, LOGO_BMW, LOGO_NIKE, LOGO_META],
    options: ['A) Tesla', 'B) BMW', 'C) Ford', 'D) Hyundai'],
    correctOption: 'A',
    explanation: 'Tesla’s "T" logo symbolizes a cross-section of an electric motor rotor and stator.'
  },
  {
    id: 'q-3',
    questionNumber: 3,
    title: 'Which streaming audio platform is identified by the green wave icon?',
    logos: [LOGO_NETFLIX, LOGO_SPOTIFY, LOGO_SONY, LOGO_GOOGLE],
    options: ['A) Apple Music', 'B) Spotify', 'C) Soundcloud', 'D) Pandora'],
    correctOption: 'B',
    explanation: 'Spotify was founded in Sweden in 2006 and uses three soundwaves inside a vibrant green circle.'
  },
  {
    id: 'q-4',
    questionNumber: 4,
    title: 'Which global sports apparel brand uses the famous "Swoosh" logo?',
    logos: [LOGO_RED_BULL, LOGO_NIKE, LOGO_STARBUCKS, LOGO_AMAZON],
    options: ['A) Adidas', 'B) Puma', 'C) Nike', 'D) Under Armour'],
    correctOption: 'C',
    explanation: 'The Nike Swoosh was designed in 1971 by Carolyn Davidson for just $35!'
  },
  {
    id: 'q-5',
    questionNumber: 5,
    title: 'Identify the company behind the Infinity / Ribbon logo:',
    logos: [LOGO_META, LOGO_GOOGLE, LOGO_MICROSOFT, LOGO_SAMSUNG],
    options: ['A) Google', 'B) Meta', 'C) Infinity Retail', 'D) Microsoft'],
    correctOption: 'B',
    explanation: 'Facebook rebranded to Meta in 2021, adopting an infinity loop emblem representing 3D metaverse connection.'
  },
  {
    id: 'q-6',
    questionNumber: 6,
    title: 'Which coffeehouse chain is recognized by the Twin-Tailed Siren logo?',
    logos: [LOGO_STARBUCKS, LOGO_MCDONALDS, LOGO_PEPSI, LOGO_SPOTIFY],
    options: ['A) Dunkin', 'B) Starbucks', 'C) Costa Coffee', 'D) Tim Hortons'],
    correctOption: 'B',
    explanation: 'Starbucks mermaid siren logo was inspired by a 16th-century Norse woodcut.'
  },
  {
    id: 'q-7',
    questionNumber: 7,
    title: 'Which entertainment giant features the bold red ribbon "N" emblem?',
    logos: [LOGO_SONY, LOGO_NETFLIX, LOGO_APPLE, LOGO_AMAZON],
    options: ['A) HBO Max', 'B) Netflix', 'C) Hulu', 'D) Disney+'],
    correctOption: 'B',
    explanation: 'Netflix introduced the iconic folded red ribbon "N" mark in 2016 for vertical screen presentation.'
  },
  {
    id: 'q-8',
    questionNumber: 8,
    title: 'Identify the iconic fast-food brand with the Golden Arches:',
    logos: [LOGO_PEPSI, LOGO_MCDONALDS, LOGO_STARBUCKS, LOGO_RED_BULL],
    options: ['A) Burger King', 'B) McDonald’s', 'C) Wendy’s', 'D) KFC'],
    correctOption: 'B',
    explanation: 'The Golden Arches of McDonald’s were originally architectural elements on their 1953 franchise buildings.'
  },
  {
    id: 'q-9',
    questionNumber: 9,
    title: 'Which e-commerce giant features a smile arrow pointing from A to Z?',
    logos: [LOGO_AMAZON, LOGO_APPLE, LOGO_GOOGLE, LOGO_MICROSOFT],
    options: ['A) Alibaba', 'B) eBay', 'C) Amazon', 'D) Walmart'],
    correctOption: 'C',
    explanation: 'Amazon’s arrow connects "a" to "z", symbolizing that they deliver everything from A to Z with a smile!'
  },
  {
    id: 'q-10',
    questionNumber: 10,
    title: 'Which German automotive brand features the blue and white roundel logo?',
    logos: [LOGO_TESLA, LOGO_BMW, LOGO_SAMSUNG, LOGO_META],
    options: ['A) Audi', 'B) Mercedes-Benz', 'C) BMW', 'D) Porsche'],
    correctOption: 'C',
    explanation: 'BMW’s logo colors honor the Bavarian state flag and its origins as Rapp Motorenwerke aircraft engine builders.'
  },
  {
    id: 'q-11',
    questionNumber: 11,
    title: 'Identify the energy drink company represented by the Sun and Bulls:',
    logos: [LOGO_RED_BULL, LOGO_PEPSI, LOGO_NIKE, LOGO_STARBUCKS],
    options: ['A) Monster Energy', 'B) Red Bull', 'C) Rockstar', 'D) Gatorade'],
    correctOption: 'B',
    explanation: 'Red Bull was created in Austria in 1987, based on a Thai energy drink called Krating Daeng.'
  },
  {
    id: 'q-12',
    questionNumber: 12,
    title: 'Which consumer electronics giant uses the blue oval enclosure emblem?',
    logos: [LOGO_SAMSUNG, LOGO_SONY, LOGO_GOOGLE, LOGO_APPLE],
    options: ['A) Sony', 'B) Samsung', 'C) LG Electronics', 'D) Panasonic'],
    correctOption: 'B',
    explanation: 'Samsung means "Three Stars" in Korean; the tilted blue oval logo represents innovation through space.'
  }
];
