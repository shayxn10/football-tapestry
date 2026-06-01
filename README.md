# ⚽ FIFA World Cup 2026 — Analytics Platform & Interactive Simulator

> A production-grade React + TypeScript platform combining nine decades of World Cup data analytics with a fully interactive 2026 tournament simulator — built with a custom deterministic state engine.

**[Live Demo](https://football-tapestry.lovable.app)** · **[LinkedIn Post](#)**

---

![Platform Preview](public/assets/preview.png)

---

## Overview

This project is two things in one:

**A historical analytics dashboard** covering every FIFA World Cup from 1930 to 2022 — goals, scorers, tactical correlations, player performance metrics, and xG analysis from Qatar 2022.

**A fully interactive 2026 tournament simulator** where users control every match result from Group Stage Matchday 1 all the way through to the Final — powered by a custom-built deterministic tournament engine.

The simulator is not a prediction model. There is no machine learning, no Monte Carlo simulation, no probabilistic forecasting. Every outcome is either chosen by the user or weighted by FIFA ranking tiers. The engine enforces FIFA rules exactly — group stage tiebreakers, best third-place qualification, pre-defined knockout bracket pathways — and the bracket fills deterministically based on those results.

---

## The Engineering Challenge

The hardest problem this project solves is one that sounds simple on the surface:

> *FIFA World Cup brackets are not fully dynamic. They are partially fixed before the tournament starts and partially dependent on group outcomes.*

A Round of 32 slot like "best third-place team from Groups B, C, D, E" cannot be determined until all four of those groups complete their six matches each. This means the bracket has a dependency graph — some slots can only resolve after others resolve — and any attempt to advance the tournament before those dependencies are satisfied produces the broken "TBD" states common in naive implementations.

The engine handles this through a layered slot resolution system with a correctness-first assignment algorithm that processes the most constrained slots before the least constrained ones, preventing the greedy assignment conflicts that cause permanent null slots.

---

## Architecture

### The Tournament Engine (`tournamentEngine.ts`)

The core of the project. A pure TypeScript class with no external dependencies, no randomness, and no UI coupling.

```
TournamentEngine
├── setMatchResult(matchId, result)  ← single write entry point
├── getState()                       ← single read entry point
├── clearMatchResult(matchId)        ← undo support
└── reset()                          ← full tournament reset

Internal pipeline (runs on every setMatchResult call):
  1. calculateAllGroupStandings()    ← derived fresh every time
  2. resolveGroupQualifiers()        ← fills W_A, R_A slots
  3. resolveBestThirdPlaces()        ← ranks 12 thirds, picks best 8
  4. fillKnockoutBracket()           ← maps qualifiers to R32 slots
  5. resolveKnockoutWinners()        ← propagates W_73, W_74 etc.
  6. buildResolvedMatches()          ← final view layer
```

**Key design decisions:**

- **Never store derived state.** Group standings, bracket slots, and match readiness are all computed fresh on every state change. This means reset is trivial (clear results, re-derive everything) and there is no stale data problem.

- **Immutable fixtures.** The original fixture data is stored separately from the working copy. Reset restores from originals, preventing stale team names from persisting across simulations.

- **Slot resolution correctness.** The `resolveBestThirdPlaces()` method sorts T3 slot assignments by restrictiveness — slots with fewer eligible groups are assigned first. This prevents the greedy conflict where a team gets claimed by an earlier slot, leaving a later slot with no eligible candidates.

- **Bracket template is data.** The entire bracket pathway (which R32 winner feeds which R16 match, which R16 winner feeds which QF, and so on) is encoded as a static record of slot dependencies. Changing the tournament format means changing this record — nothing else.

### State Architecture

Three layers, strict separation:

```typescript
type TournamentState = {
  results:          Record<string, MatchResult>      // raw user input only
  groups:           Record<string, GroupTable>        // derived, never cached
  bracket:          Record<string, string | null>     // slot registry
  resolvedMatches:  Record<string, ResolvedMatch>     // final view layer
}
```

The UI reads exclusively from `resolvedMatches` and `bracket`. It never calculates football logic. Every user interaction calls `setMatchResult()` and re-reads `getState()` synchronously.

### Simulation Modes

**Full Tournament Mode**
User simulates every one of the 104 matches — all 72 group stage games and all 32 knockout games — using the full match card UI with goal steppers.

**Team Journey Mode**
User picks one national team. The engine auto-simulates all 69 non-team group stage matches in a single synchronous batch before presenting the first team match card. After the user simulates their team's 3 group games, the full knockout bracket loads. The user then picks the winner of every knockout match — including their own team's — using a streamlined winner-picker card. If their team is eliminated, an elimination screen appears with the option to continue as a neutral observer.

### Weighted Auto-Simulation

Non-team matches in Journey mode are auto-simulated using an Elo-style probability formula rather than pure randomness:

```typescript
// Win probability based on FIFA tier ratings
const team1WinProb = 1 / (1 + Math.pow(10, -diff / 12));

// Draw probability decreases as tier gap increases
const drawProb = Math.max(0.04, 0.20 - Math.abs(diff) * 0.004);
```

Teams are assigned strength ratings from 25 (Curaçao) to 100 (Argentina) across five tiers. At a rating difference of 35 points — Argentina vs Jordan for example — the stronger team wins approximately 90% of simulated matches. Upsets are possible but statistically rare, which keeps auto-simmed results realistic without being deterministic.

---

## Features

### Analytics Dashboard

| Section | Data Source | Coverage |
|---|---|---|
| Historical Goals Analysis | Kaggle FIFA dataset | 1930–2022, 964 matches |
| Top Scorers Leaderboard | Kaggle FIFA dataset | All-time, 20 players |
| Tactical Analysis | Qatar 2022 advanced dataset | Possession, shots, passes, xG |
| Player Performance | Qatar 2022 advanced dataset | xG vs goals, finishing delta |
| Insights | Derived from above | 9 correlation findings |

### Simulator

- **104 matches** — 72 group stage + 32 knockout
- **48 teams** across 12 groups (A–L)
- **FIFA tiebreaker rules** — points → goal difference → goals scored → head-to-head
- **Best third-place qualification** — 8 of 12 third-place teams advance via ranked selection
- **Pre-defined bracket pathways** — encoded from official FIFA 2026 bracket structure
- **Live countdown** to June 11 opening match with broadcast-style UI
- **Champion reveal** — cinematic sequence with confetti, trophy animation, and shareable card
- **Session persistence** — full tournament state saved to localStorage, restored on reload
- **Reset** — complete tournament reset with clean state restoration

### Live Data Integration

- **API-Football** integration for live World Cup scores once the tournament begins June 11
- Smart polling with rate-limit awareness (free tier: 100 requests/day)
- Three-phase landing page: countdown → live scores → champion display
- Automatic phase switching based on tournament dates

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| State | Custom engine + React useState |
| Charts | Recharts |
| Styling | Tailwind CSS |
| Fonts | Bebas Neue, DM Sans, JetBrains Mono |
| Persistence | localStorage |
| Live Data | API-Football (api-sports.io) |
| Confetti | canvas-confetti |
| Deployment | Lovable / Vercel |

---

## Project Structure

```
src/
├── engine/
│   ├── tournamentEngine.ts     ← core state machine
│   └── fixtureLoader.ts        ← JSON → Match[] adapter
│
├── data/
│   └── fixtures.json           ← all 104 match fixtures
│
├── store/
│   ├── useTournament.ts        ← engine hook + localStorage
│   └── useSimulatorFlow.ts     ← match progression logic
│
├── utils/
│   ├── teamWeights.ts          ← tier ratings + weighted sim
│   ├── autoSimulate.ts         ← re-exports weightedAutoSimulate
│   └── teamCodes.ts            ← flag emojis + 3-letter codes
│
├── components/
│   ├── LiveScoreBar/           ← API-powered ticker
│   ├── TournamentStatus/       ← countdown / live / champion
│   ├── GroupStage/             ← match card + score input
│   ├── KnockoutBracket/        ← interactive bracket tree
│   ├── ChampionReveal/         ← cinematic finale
│   └── layout/                 ← navbar + mobile drawer
│
└── pages/
    └── SimulatorPage.tsx       ← phase router
```

---

## Key Engineering Decisions

### Why a Custom Engine Instead of UI State?

The bracket has non-trivial dependency logic — a match cannot become playable until its two input slots are resolved, and some slots depend on up to 24 other matches completing first. Encoding this in React component state would scatter the logic across the component tree and make it untestable. A pure TypeScript class with a single write method and a single read method makes the logic testable in isolation and keeps the UI as a thin rendering layer.

### Why Synchronous State?

The engine's pipeline is fully synchronous — no async operations, no side effects, no network calls. This means `setMatchResult()` followed immediately by `getState()` always returns the fully propagated new state in the same call stack. No useEffect chains, no deferred updates, no stale closure problems. The UI updates atomically.

### Why Not Redux or Zustand?

The engine already IS the state store. Adding a separate state management library would mean maintaining two sources of truth — the engine's internal state and the store's state — and keeping them in sync. The `useTournament` hook wraps the engine singleton directly, providing the same interface a store would (state + actions) without the duplication.

### The T3 Slot Assignment Problem

FIFA's 48-team format includes a "best third-place" qualification mechanic where 8 of 12 third-place teams advance, and each qualifies into a pre-defined R32 slot based on which group they came from. The slot assignment is not arbitrary — FIFA publishes a fixed lookup table mapping group combinations to slots.

The naive implementation assigns slots in iteration order. This fails when the best third-place team from Group B gets assigned to slot `T3_ABCD` first, leaving slot `T3_BCDE` with no remaining eligible team from Group B.

The fix: sort slots by the number of eligible groups (ascending) before assignment. Slots with fewer eligible groups — more constrained — are assigned first, guaranteeing they get a valid team before less constrained slots consume the available candidates.

---

## Data Sources

| Data | Source |
|---|---|
| Historical World Cup results (1930–2022) | Kaggle FIFA World Cup Dataset |
| Qatar 2022 advanced match stats | Kaggle Qatar 2022 Dataset |
| 2026 fixture schedule | FIFA.com official schedule |
| Live match scores | API-Football (api-sports.io) |

**Note on analytical framing:** All correlation coefficients presented in the dashboard describe relationships observed in the specific datasets referenced. Sample sizes are small (Qatar 2022: 64 matches, 32 teams) and coefficients should be interpreted as descriptive trends, not causal claims or predictive models. This is stated explicitly throughout the dashboard.

---

## Running Locally

```bash
# Clone the repository
git clone https://github.com/[your-username]/fifa-wc-2026-simulator

# Install dependencies
npm install

# Add your API key (optional — for live scores after June 11)
echo "VITE_FOOTBALL_API_KEY=your_key_here" > .env

# Start development server
npm run dev
```

No backend required. Everything runs in the browser.

---

## What I Learned

**Deterministic state machines are underused in frontend.** Most complex UI state problems — wizards, multi-step flows, games, simulations — are much cleaner when modelled as an explicit state machine rather than a tangle of useState/useEffect calls. The engine pattern here (pure class, single write method, single read method, derive everything) is something I'll reach for again.

**The hardest bugs are data structure bugs, not logic bugs.** Every "TBD" cascade in this project traced back to a structural mismatch — a slot key that didn't exist, a bracket template referencing a non-existent group, a greedy algorithm that didn't account for constraint ordering. The logic was correct; the data it was operating on was wrong. Auditing data contracts as carefully as logic is a habit this project reinforced.

**Separation of concerns pays off when debugging.** Because the engine has no UI coupling, every bug could be diagnosed by reading `engine.getState()` in the browser console and checking which slots were null and why — without touching any component code. This made a genuinely complex domain tractable.

---

## License

MIT — feel free to fork, extend, or use the engine architecture in your own projects.

---

*Built in the lead-up to FIFA World Cup 2026 — Canada, Mexico, USA · June 11 – July 19, 2026*
