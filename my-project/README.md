# Business Quiz

A polished, responsive web application for running live quiz competitions. Built with **React 19** + **Vite 8** and designed for deployment on **Vercel**.

## Features

| Area | What you get |
|---|---|
| **Dashboard** | Stat cards (teams, players, rounds, questions), leaderboard, quick-nav to every section |
| **Team Registration** | Add up to 20 teams (2 members each), edit or remove teams, field validation |
| **Rounds & Questions** | 5 rounds with editable names & timer durations, add/edit/remove questions and answers |
| **Scoring** | Award or deduct points per round, quick +10/+5/−5 buttons plus custom entry, auto-updated leaderboard |
| **Live Display** | Projector-friendly: large question text, animated SVG timer ring, answer reveal, round switching, live standings strip |

## Quick Start

```bash
# 1. Install dependencies
cd my-project
npm install

# 2. Start the dev server
npm run dev
# → opens at http://localhost:5173 (or next available port)

# 3. Lint
npm run lint

# 4. Production build
npm run build
npm run preview   # serves the built bundle locally
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repository on [vercel.com/new](https://vercel.com/new).
3. Set the **Root Directory** to `my-project`.
4. Vercel auto-detects Vite — the build command (`npm run build`) and output directory (`dist`) are configured automatically.
5. Click **Deploy**. The included `vercel.json` handles SPA routing.

## Project Structure

```
my-project/
├── index.html                 # HTML entry point
├── vercel.json                # Vercel SPA rewrite config
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx               # React root
    ├── App.jsx                # Router setup
    ├── index.css              # Full design system
    ├── data/
    │   └── storage.js         # Data layer (localStorage, swap-ready)
    ├── context/
    │   └── QuizContext.jsx    # React context + actions
    ├── components/
    │   └── Layout.jsx         # Sidebar layout shell
    └── pages/
        ├── Dashboard.jsx
        ├── Teams.jsx
        ├── Rounds.jsx
        ├── Scoring.jsx
        └── LiveDisplay.jsx
```

### Data Layer

All data lives in `src/data/storage.js` using `localStorage`. Every function is a simple read/write — no async, no framework coupling. To add a database later:

1. Replace the `read()`/`write()` helpers with API calls.
2. Make the exported functions `async`.
3. Update `QuizContext.jsx` to `await` them.

No other files need to change.

## Competition Setup

| Setting | Default |
|---|---|
| Max teams | 20 |
| Members per team | 2 |
| Rounds | 5 (editable names & timers) |
| Timer per question | 15–45 s (editable) |

The app ships with **empty rounds** (no sample questions). Round names and timers are pre-filled but fully editable.

## Tech Stack

- **React 19** — UI framework
- **React Router 7** — client-side routing
- **Vite 8** — build tool & dev server
- **Vanilla CSS** — custom dark design system
- **localStorage** — browser persistence (no backend required)

## License

MIT
