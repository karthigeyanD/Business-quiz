/**
 * Round 4 — Personality Identification
 * Data definitions and default preconfigured questions.
 *
 * CRITICAL REQUIREMENT:
 * Each of the 6 questions has TWO completely independent image-upload slots:
 *   1. Clue Image (shown to participants during active question)
 *   2. Answer / Preview Image (shown during host preview & answer reveal)
 * Total of 12 independent image slots.
 */

export const ROUND4_QUESTIONS = [
  {
    id: 1,
    personality: 'Steve Jobs',
    clueType: 'Eyes and glasses',
    isPuzzle: false,
    defaultAliases: ['Steve Jobs', 'SteveJobs', 'Jobs', 'Steven Jobs', 'Steven Paul Jobs'],
    description: 'Co-founder of Apple. Led the iMac, iPod and iPhone, and also built Pixar.',
  },
  {
    id: 2,
    personality: 'Colonel Harland Sanders',
    clueType: 'Four-piece puzzle',
    isPuzzle: true,
    defaultAliases: ['Colonel Harland Sanders', 'Colonel Sanders', 'Harland Sanders', 'Sanders', 'KFC Sanders', 'Col Sanders'],
    description: 'Founder of KFC. Turned a secret-recipe fried chicken into a global franchise, starting in his 60s.',
  },
  {
    id: 3,
    personality: 'Mukesh Ambani',
    clueType: 'Signature and eyes',
    isPuzzle: false,
    defaultAliases: ['Mukesh Ambani', 'MukeshAmbani', 'Ambani', 'Mukesh Dhirubhai Ambani'],
    description: 'Chairman and Managing Director of Reliance Industries: energy, retail and telecom (Jio).',
  },
  {
    id: 4,
    personality: 'Sundar Pichai',
    clueType: 'Four-piece puzzle',
    isPuzzle: true,
    defaultAliases: ['Sundar Pichai', 'SundarPichai', 'Pichai', 'Pichai Sundararajan'],
    description: 'CEO of Google and Alphabet. Born in Tamil Nadu and an IIT Kharagpur alumnus.',
  },
  {
    id: 5,
    personality: 'Ratan Tata',
    clueType: 'Only the eyes',
    isPuzzle: false,
    defaultAliases: ['Ratan Tata', 'RatanTata', 'Tata', 'Ratan Naval Tata'],
    description: 'Former Chairman of the Tata Group. Led its global expansion, including the acquisitions of Tetley, Corus and Jaguar Land Rover.',
  },
  {
    id: 6,
    personality: 'Bill Gates',
    clueType: 'Four-piece puzzle',
    isPuzzle: true,
    defaultAliases: ['Bill Gates', 'BillGates', 'Gates', 'William Henry Gates', 'William Gates'],
    description: 'Co-founder of Microsoft. Now focuses on global health and development through the Gates Foundation.',
  },
];

export const ROUND4_META = {
  title: 'Round 4 — Personality Identification',
  shortTitle: 'Round 4',
  totalQuestions: 6,
  totalImageSlots: 12, // 6 Clue Images + 6 Answer / Preview Images
  marksPerQuestion: 1,
  maxMarksPerTeam: 6,
  defaultTimerSeconds: 60,
};
