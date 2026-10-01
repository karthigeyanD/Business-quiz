/**
 * Round 2 — Identify the Logos & Rearrange the Business Tagline
 *
 * 12 pre-loaded question sets.
 * Each set contains:
 *   1. A logo-identification MCQ (4 images → 4 answer options)
 *   2. A tagline-rearrangement challenge (scrambled words → correct sentence)
 *
 * IMPORTANT: Source answer-key discrepancies are preserved verbatim.
 * The administrator MUST verify flagged questions before publishing.
 */

export const ROUND2_QUESTION_SETS = [
  // ─── Set 1 ──────────────────────────────────────────────────────────────────
  {
    setId: 1,
    label: 'Team 1',
    logoQuestion: {
      options: [
        'A. Apple, Reebok, NVIDIA, Airbus',
        'B. Apple, AT&T, Airbus, Reebok',
        'C. Apple, Airbus, Reebok, Comcast',
        'D. Apple, Reebok, Airbus, AT&T',
      ],
      sourceAnswerKey: 'A',
      sourceAnswerText: 'Apple, Airbus, Reebok, Comcast',
      warning:
        'The source answer text matches option C, not option A. Require the host to verify the correct option before publishing.',
    },
    taglineQuestion: {
      words: ['IMPORTANT', 'ARE', 'YOU', 'WHEN', 'VERY'],
      correctTagline: 'WHEN YOU ARE VERY IMPORTANT',
    },
  },

  // ─── Set 2 ──────────────────────────────────────────────────────────────────
  {
    setId: 2,
    label: 'Team 2',
    logoQuestion: {
      options: [
        'A. Nike, Lacoste, Chanel, Tesla',
        'B. Nike, NVIDIA, Tesla, Lacoste',
        'C. Nike, Gucci, Tesla, Lacoste',
        'D. Nike, Lacoste, Tesla, NVIDIA',
      ],
      sourceAnswerKey: 'A',
      sourceAnswerText: 'Nike, Lacoste, Tesla, NVIDIA',
      warning:
        'The source answer text matches option D, not option A. Require host verification.',
    },
    taglineQuestion: {
      words: ['LOT', 'COFFEE', 'OVER', 'CAN', 'HAPPEN', 'A'],
      correctTagline: 'A LOT CAN HAPPEN OVER COFFEE',
    },
  },

  // ─── Set 3 ──────────────────────────────────────────────────────────────────
  {
    setId: 3,
    label: 'Team 3',
    logoQuestion: {
      options: [
        'A. NVIDIA, Amazon, AT&T, Gucci',
        'B. NVIDIA, Amazon, Gucci, Mastercard',
        'C. Gucci, Amazon, Mastercard, AT&T',
        'D. NVIDIA, Amazon, AT&T, Mastercard',
      ],
      sourceAnswerKey: 'A',
      sourceAnswerText: 'Amazon, Gucci, Mastercard, AT&T',
      warning:
        'The source answer text matches option C, not option A. Require host verification.',
    },
    taglineQuestion: {
      words: ['TANK', 'LIKE', 'MADE', 'A', 'A', 'LIKE', 'BUILT', 'GUN,'],
      correctTagline: 'MADE LIKE A GUN, BUILT LIKE A TANK',
    },
  },

  // ─── Set 4 ──────────────────────────────────────────────────────────────────
  {
    setId: 4,
    label: 'Team 4',
    logoQuestion: {
      options: [
        'A. Adidas, Gucci, Burberry, PlayStation',
        'B. Adidas, Gucci, PlayStation, Pothys',
        'C. Adidas, Burberry, Chanel, PlayStation',
        'D. Adidas, Burberry, Chanel, Pothys',
      ],
      sourceAnswerKey: 'A',
      sourceAnswerText: 'Adidas, Chanel, Burberry, PlayStation',
      warning:
        'The source answer text does not exactly match any listed option. Require the host to verify the intended correct option before publishing.',
    },
    taglineQuestion: {
      words: ['EAT', 'ONE', 'JUST', "CAN'T", 'BETCHA'],
      correctTagline: "BETCHA CAN'T EAT JUST ONE",
    },
  },

  // ─── Set 5 ──────────────────────────────────────────────────────────────────
  {
    setId: 5,
    label: 'Team 5',
    logoQuestion: {
      options: [
        'A. Shell, Versace, Omega, Toyota',
        'B. Shell, Versace, Hom, Toyota',
        'C. Beta, Toyota, Shell, Toyota',
        'D. Shell, Versace, Beta, Toyota',
      ],
      sourceAnswerKey: 'A',
      sourceAnswerText: 'Shell, Versace, Omega, Toyota',
      warning: null, // No discrepancy — source matches option A
    },
    taglineQuestion: {
      words: ['HAVE', 'BAD', 'A', 'MEAL', 'NEVER'],
      correctTagline: 'NEVER HAVE A BAD MEAL',
    },
  },

  // ─── Set 6 ──────────────────────────────────────────────────────────────────
  {
    setId: 6,
    label: 'Team 6',
    logoQuestion: {
      options: [
        'A. LG, Polo, Hollister, Puma',
        'B. LG, Target, Nestlé, Puma',
        'C. LG, Target, Dove, Jaguar',
        'D. LG, Polo, Hollister, Jaguar',
      ],
      sourceAnswerKey: 'A',
      sourceAnswerText: 'LG, Polo, Hollister, Puma',
      warning: null, // No discrepancy — source matches option A
    },
    taglineQuestion: {
      words: ['FALLING', 'LEARNING', 'IN', 'WITH', 'LOVE'],
      correctTagline: 'FALLING IN LOVE WITH LEARNING',
    },
  },

  // ─── Set 7 ──────────────────────────────────────────────────────────────────
  {
    setId: 7,
    label: 'Team 7',
    logoQuestion: {
      options: [
        'A. Volkswagen, Walmart, Hallmark, Firefox',
        'B. Volkswagen, Walmart, Rolex, Firefox',
        'C. Rolex, Firefox, Volkswagen, Walmart',
        'D. Volkswagen, Walmart, Corona Extra, Firefox',
      ],
      sourceAnswerKey: 'A',
      sourceAnswerText: 'Volkswagen, Walmart, Rolex, Firefox',
      warning:
        'The source answer text matches option B, not option A. Require host verification.',
    },
    taglineQuestion: {
      words: ['CAPTURE', 'THE', "WORLD'S", 'SHARE', 'AND', 'MOMENTS'],
      correctTagline: "CAPTURE AND SHARE THE WORLD'S MOMENTS",
    },
  },

  // ─── Set 8 ──────────────────────────────────────────────────────────────────
  {
    setId: 8,
    label: 'Team 8',
    logoQuestion: {
      options: [
        'A. Nestlé, Louis Vuitton, Vodafone, Star Health',
        'B. Nestlé, Lousy Vuitton, Vodafone, Star Health',
        'C. Nestlé, Lousy Vuitton, Vodafone, Converse',
        'D. Nestlé, Louis Vuitton, Vodafone, Converse',
      ],
      sourceAnswerKey: 'A',
      sourceAnswerText: 'Nestlé, Louis Vuitton, Vodafone, Converse',
      warning:
        'The source answer text matches option D, not option A. Require host verification.',
    },
    taglineQuestion: {
      words: ['IN', 'AND', 'EVERYONE', "THERE'S", 'HALF', 'GLASS', 'A', 'A'],
      correctTagline: "THERE'S A GLASS AND A HALF IN EVERYONE",
    },
  },

  // ─── Set 9 ──────────────────────────────────────────────────────────────────
  {
    setId: 9,
    label: 'Team 9',
    logoQuestion: {
      options: [
        'A. Pepsodent, Dabur Red, Bank of America, Levi\'s',
        'B. Colgate, Dabur Red, Bank of America, Levi\'s',
        'C. Colgate, Bank of America, Lacoste, Britannia',
        'D. Amazon, Dabur Red, Bank of Canada, Britannia',
      ],
      sourceAnswerKey: null,
      sourceAnswerText: 'Unilever, Tommy Hilfiger, Levi\'s, Rolls-Royce',
      warning:
        'The source answer key does not match any of the displayed choices. Require the host to verify the logos and correct option using the supplied images and original slide.',
    },
    taglineQuestion: {
      words: ['COOK,', 'TO', 'EAT', 'FAST', 'GOOD', 'TO'],
      correctTagline: 'FAST TO COOK, GOOD TO EAT',
    },
  },

  // ─── Set 10 ─────────────────────────────────────────────────────────────────
  {
    setId: 10,
    label: 'Team 10',
    logoQuestion: {
      options: [
        'A. Pinterest, Focus, Red Bull, Jawa',
        'B. Pinterest, Target, Red Bull, Jawa',
        'C. Pinterest, Focus, Abercrombie & Fitch, Target',
        'D. Pinterest, Target, Abercrombie & Fitch, Jawa',
      ],
      sourceAnswerKey: null,
      sourceAnswerText: 'L\'Oréal, Target, Abercrombie & Fitch, Jaguar',
      warning:
        'The source answer key does not match any displayed option. Require host verification using the supplied logo images and original slide.',
    },
    taglineQuestion: {
      words: ['ACHIEVEMENT', 'FOR', 'CROWN', 'EVERY', 'A'],
      correctTagline: 'A CROWN FOR EVERY ACHIEVEMENT',
    },
  },

  // ─── Set 11 ─────────────────────────────────────────────────────────────────
  {
    setId: 11,
    label: 'Team 11',
    logoQuestion: {
      options: [
        'A. KFC, Anchor, Under Armour, Castrol',
        'B. KFC, Breitling, Unilever, Castrol',
        'C. KFC, Anchor, Unilever, Castrol',
        'D. KFC, Breitling, Under Armour, Castrol',
      ],
      sourceAnswerKey: 'A',
      sourceAnswerText: 'KFC, Breitling, Under Armour, Castrol',
      warning:
        'The source answer text matches option D, not option A. Require host verification.',
    },
    taglineQuestion: {
      words: ['TO', 'POWER', 'MORE', 'DO', 'THE'],
      correctTagline: 'THE POWER TO DO MORE',
    },
  },

  // ─── Set 12 ─────────────────────────────────────────────────────────────────
  {
    setId: 12,
    label: 'Team 12',
    logoQuestion: {
      options: [
        'A. Levi\'s, Hollister, McDonald\'s, Play-Doh',
        'B. Britannia, Dove, Magnum, Play-Doh',
        'C. Levi\'s, Dove, McDonald\'s, Play-Doh',
        'D. Britannia, Hollister, Magnum, Play-Doh',
      ],
      sourceAnswerKey: 'A',
      sourceAnswerText: 'KFC, Breitling, Under Armour, Castrol',
      warning:
        'The source answer key appears to repeat Team 11\'s answer and does not match Team 12\'s options. Require host verification using the supplied images and original slide.',
    },
    taglineQuestion: {
      words: ['SAFER,', 'TO', 'WAY', 'PAY', 'THE', 'EASIER'],
      correctTagline: 'THE SAFER, EASIER WAY TO PAY',
    },
  },
];

export const ROUND2_META = {
  title: 'Round 2 — Identify the Logos & Rearrange the Business Tagline',
  shortTitle: 'Round 2',
  totalSets: 12,
  marksPerLogo: 1,
  marksPerTagline: 1,
  maxMarksPerTeam: 2,
  maxTotalMarks: 24, // 12 sets × 2 marks
  defaultTimerSeconds: 120,
};
