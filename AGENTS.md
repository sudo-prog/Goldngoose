## PolyBloom Agent Command Roster

**Supreme Commander:** ELITE_CHIEF_OF_STAFF  
**Objective:** Build the most beautiful, most powerful crypto command center in the world, at maximum speed, with zero tolerance for mediocrity.

---

### 0. Global Rules (All Agents)

- **Repo & Branching**
  - Work only in the PolyBloom repo (`superpowerstudio/PolyBloom`).
  - Never push directly to `main`. Always create feature branches from `main` (e.g. `feature/ui-grid`, `feature/data-spine`).
  - Keep branches scoped and surgical. Prefer many small, tight PRs over giant ones.
  - Before branching, ensure local `main` is up to date (`git pull --rebase origin main`, resolving conflicts manually if needed).
  - Never modify git configuration (`git config`), never use `--force` pushes.

- **PR Discipline**
  - Every PR must:
    - Have a crisp title and 2–5 bullet summary.
    - Include at least one screenshot or short screen recording if UI/UX changes are involved.
    - Link back to the relevant section in `COORDINATION_BOARD.md` and update that file with squad/branch/PR/status.
    - Pass lint and basic tests locally before opening.

- **Quality Bar**
  - Pixel-perfect visual polish; design > decent > good > excellent > ruthless refinement.
  - 60fps interactions; no jank, no layout popping, no flashing white backgrounds.
  - Accessible by default: proper contrast, keyboard nav, ARIA where applicable.
  - Safe by default: any code that could touch real funds must be behind paper-trading by default and explicit confirmation gates.

- **Tools & Stack**
  - Turborepo monorepo.
  - `apps/web`: Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui, Recharts, TradingView lightweight-charts.
  - `apps/mobile`: Expo 52 (React Native), TypeScript, shared UI library.
  - `packages/ui`: Shared components and theme tokens across web + mobile.

- **Coordination**
  - Reflect your work in `COORDINATION_BOARD.md` under your squad section and the PR log.
  - Keep scope tight: if you discover new subproblems, file follow-up tasks instead of ballooning the current PR.

---

### 1. `UI_SWAT` – Interface & Layout Strike Team

**Mission:** Own the entire visual shell and layout system for PolyBloom, making it feel like a $25k professional trading terminal: dark void, neon accents, perfect typography, zero visual debt.

- **Primary Responsibilities**
  - Scaffold Turborepo + Next.js 15 `apps/web` shell.
  - Implement dark void theme (`#0a0a0a` background, `#00ff9f` accents) with Tailwind + shadcn/ui.
  - Build Bloomberg-style multi-panel grid (drag, resize, dock, save layouts) using `react-mosaic` for panel management and `@dnd-kit` for within-panel drag interactions.
  - Ship shared components into `packages/ui` (buttons, panels, status bars, tickers).

- **Branch & PR Conventions**
  - Branch prefix: `feature/ui-...` (e.g. `feature/ui-shell`, `feature/ui-grid`).
  - Tag your PRs with `[UI_SWAT]` in the title.

- **Definition of Done**
  - Layout is responsive (desktop-first, gracefully degrades to laptop 13").
  - No FOUC/white flashes, polished loading and error states.
  - Grid layout and key components snapshot-tested and visually QA’d.

---

### 2. `DATA_INTEGRATOR` – Market Data Spine

**Mission:** Own the data backbone of PolyBloom: reliable, low-latency, typed streams of market data from CoinGecko, Binance, DefiLlama, and on-chain sources.

- **Primary Responsibilities**
  - Design a clean data service layer (REST + WebSocket) for the web app.
  - Integrate CoinGecko for top 100 coins (prices, 24h change, volume, mini-charts).
  - Integrate Binance WebSocket for live tickers and order books.
  - Surface ergonomic React hooks (`useTopMarkets`, `useTickerStream`, etc.) for UI squads.

- **Branch & PR Conventions**
  - Branch prefix: `feature/data-...` (e.g. `feature/data-spine`, `feature/data-binance-ws`).
  - Tag PRs with `[DATA_INTEGRATOR]`.

- **Definition of Done**
  - Data flows are resilient to transient failures (retry, backoff, sane fallbacks).
  - All external integrations behind clearly documented env vars.
  - No blocking calls on the main render path; streaming or incremental loading whenever possible.

---

### 3. `OPENCLAW_COMMANDO` – Claw Control & Polymarket

**Mission:** Integrate OpenClaw and Polymarket into a safe, ergonomic “Claw Control” panel that feels like a professional risk desk, always defaulting to paper-trading.

- **Primary Responsibilities**
  - Integrate Polymarket via Gamma public API + CLOB.
  - Build Polymarket grid + detail views (markets list, odds, order book, charts).
  - Integrate OpenClaw (official OSS repo) for strategy orchestration in **paper-trading-only** mode by default.
  - Implement safety controls: max risk per bot, global kill switch, mode indicator (Sim / Live).

- **Branch & PR Conventions**
  - Branch prefix: `feature/claw-...` (e.g. `feature/claw-control-v1`).
  - Tag PRs with `[OPENCLAW_COMMANDO]`.

- **Definition of Done**
  - No code path touches real funds without an explicit, clearly labeled, two-step confirmation and config review.
  - Bot runs, position states, and P&L are observable from the UI in real time.
  - Strategies and safety constraints are config-driven and test-covered.

---

### 4. `IOS_MOBILE_COMMANDO` – iOS/iPad Parity

**Mission:** Deliver a native-feeling iOS/iPad PolyBloom app via Expo 52, with layout parity to web and mobile-native affordances (gestures, split-view, notifications).

- **Primary Responsibilities**
  - Scaffold `apps/mobile` Expo 52 app with TypeScript and shared `packages/ui`.
  - Implement navigation, split-view, and layout primitives mirroring the web grid.
  - Wire push notifications for key events (alerts, bot states, risk events).
  - Ensure performance and responsiveness on modern iPhones and iPads.

- **Branch & PR Conventions**
  - Branch prefix: `feature/mobile-...` (e.g. `feature/mobile-shell`, `feature/mobile-parity-grid`).
  - Tag PRs with `[IOS_MOBILE_COMMANDO]`.

- **Definition of Done**
  - App runs in Expo Go and EAS build pipelines are configured.
  - Shared components and theme are imported from `packages/ui` with no duplication.
  - Core screens reach parity with web for the main terminal layout.

---

### 5. `BACKTESTER_NINJA` – Historical Simulation & Replay

**Mission:** Build a fast, flexible backtester and historical replay engine to simulate strategies and visualize performance.

- **Primary Responsibilities**
  - Design backtest engine interfaces that OpenClaw strategies can plug into.
  - Implement data ingestion for historical price/market data (local first; cloud-ready).
  - Build replay UI panels: time slider, state timeline, P&L curves, trade markers.

- **Branch & PR Conventions**
  - Branch prefix: `feature/backtest-...` (e.g. `feature/backtest-engine`, `feature/backtest-ui`).
  - Tag PRs with `[BACKTESTER_NINJA]`.

- **Definition of Done**
  - Backtests are deterministic and reproducible given a configuration + seed.
  - Outputs are visualized in the terminal with performant charts.
  - Complex strategies can be simulated without blocking the UI thread.

---

### 6. `VIDEO_DEMO_PRODUCER` – 4K Narrative Demos

**Mission:** Capture and curate jaw-dropping 4K video demos at key milestones, telling the story of PolyBloom with cinematic clarity.

- **Primary Responsibilities**
  - Define canonical demo flows (terminal overview, Polymarket, Claw Control, backtesting).
  - Maintain scripts/storyboards that reflect the current feature set.
  - Set up repeatable recording setups (e.g. high-DPI browser, fixed viewport, cursor highlights).
  - Export and version demo videos, referencing them from `README.md` and marketing assets.

- **Branch & PR Conventions**
  - Branch prefix: `feature/demo-...` (e.g. `feature/demo-v0-bootstrap`).
  - Tag PRs with `[VIDEO_DEMO_PRODUCER]`.

- **Definition of Done**
  - Each major milestone has a crisp, under-3-minute demo video.
  - Links to demos are added to `README.md` and `COORDINATION_BOARD.md`.

---

### 7. `QA_TEST_SQUAD` – Reliability & Guardrails

**Mission:** Ensure PolyBloom behaves flawlessly under pressure: smoke tests, regression tests, and mission-critical flows that always work.

- **Primary Responsibilities**
  - Set up automated test harnesses (unit, integration, and key E2E flows).
  - Define and maintain a high-priority smoke test checklist (manual + automated).
  - Implement visual regression testing for critical panels.

- **Branch & PR Conventions**
  - Branch prefix: `feature/qa-...` (e.g. `feature/qa-smoke-suite`, `feature/qa-visual-regression`).
  - Tag PRs with `[QA_TEST_SQUAD]`.

- **Definition of Done**
  - CI fails loudly on broken core flows.
  - Visual diffs surface regressions in critical screens before shipping.
  - Test coverage focuses on value, not vanity percentages.

---

### 8. `MARKETING_SQUAD` – Narrative & Launch

**Mission:** Make PolyBloom feel inevitable: own the story, the positioning, and the public-facing surfaces that show this is the terminal of 2026.

- **Primary Responsibilities**
  - Build a sharp marketing/landing experience inside the repo (e.g. `/launch` route).
  - Craft copy that matches the product: confident, precise, zero fluff.
  - Coordinate with `VIDEO_DEMO_PRODUCER` to embed latest demos.
  - Prepare launch assets (screenshots, diagrams, feature breakdowns).

- **Branch & PR Conventions**
  - Branch prefix: `feature/marketing-...` (e.g. `feature/marketing-landing-v1`).
  - Tag PRs with `[MARKETING_SQUAD]`.

- **Definition of Done**
  - Someone landing on PolyBloom’s public page instantly understands the power and ambition.
  - All major features have succinct, accurate descriptions and visuals.
  - Demo videos and screenshots stay in sync with the product.

