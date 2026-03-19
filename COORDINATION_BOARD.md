## PolyBloom SWAT Coordination Board

**Mission:** Build PolyBloom neon Bloomberg terminal for Polymarket  
**Squad Status:** SPAWNED & ARMED  
**Current Strike:** First draggable neon panel prototype  
**Next Target:** MarketGhost live data feed  

**Owner:** ELITE_CHIEF_OF_STAFF  
**Repo:** `superpowerstudio/_EYES_ONLY_`  
**Branch policy:** feature branches only, PRs into `main`, never push directly to `main`.

---

### 1. High-Level Phases

- **Phase 0 – Bootstrap & Command Structure (NOW)**
  - Lock repo state, resolve git divergence (DONE).
  - Create `COORDINATION_BOARD.md` and `AGENTS.md` (IN PROGRESS).
  - Define specialist personas and prompts.
- **Phase 1 – Core Shell & Layout**
  - Turborepo skeleton, Next.js 15 App Router app, Expo 52 app.
  - Shared UI kit (Tailwind + shadcn/ui + neon PolyBloom theme).
  - Bloomberg-style multi-panel grid (drag, resize, save layouts).
- **Phase 2 – Live Data & Integrations**
  - CoinGecko + Binance websockets, DefiLlama, Polymarket (Gamma + CLOB).
  - Portfolio tracker, WalletConnect wiring, WebSockets infra.
- **Phase 3 – OpenClaw “Claw Control”**
  - OpenClaw integration in strict paper-trading mode by default.
  - Strategy library, safety rails, P&L and replay.
  - Native autonomous execution, survival mode, and RAG-driven strategy spawning.
- **Phase 4 – Intelligence, Replay, Studio Monitor**
  - Command bar (OpenBB-level polish), Grok-style insight chat, backtester, Studio Monitor, self-improving loops.
  - News Radar panel (polyfactual-style) auto-matching headlines to markets with sentiment/ROI.
- **Phase 5 – Polish, AR, Mobile Parity**
  - iOS/iPad parity, animations, AR preview, accessibility, security hardening.

---

### 2. Squad Status Overview

| Squad                 | Persona ID              | Owner (GitHub) | Branch Prefix          | Status       | Current Focus                              | Primary PR(s) |
| --------------------- | ----------------------- | -------------- | ---------------------- | ------------ | ------------------------------------------ | ------------- |
| UI Shell / Layout     | `UI_SWAT`              | TBA            | `feature/ui-`          | **UNASSIGNED** | Turborepo + Next15 shell, grid prototype   | -             |
| Data Integrations     | `DATA_INTEGRATOR`      | TBA            | `feature/data-`        | **UNASSIGNED** | CoinGecko, Binance WS, DefiLlama, wiring   | -             |
| Polymarket / OpenClaw | `OPENCLAW_COMMANDO`    | TBA            | `feature/claw-`        | **UNASSIGNED** | OpenClaw integration, paper-trading UI     | -             |
| iOS / iPad            | `IOS_MOBILE_COMMANDO`  | TBA            | `feature/mobile-`      | **UNASSIGNED** | Expo app shell, navigation, layout parity  | -             |
| Backtesting / Replay  | `BACKTESTER_NINJA`     | TBA            | `feature/backtest-`    | **UNASSIGNED** | Historical replay + backtester engine      | -             |
| Video / Demos         | `VIDEO_DEMO_PRODUCER`  | TBA            | `feature/demo-`        | **UNASSIGNED** | 4K demo scripts, recording automation      | -             |
| QA / Test Infra       | `QA_TEST_SQUAD`        | TBA            | `feature/qa-`          | **UNASSIGNED** | E2E tests, visual regression, smoke flows  | -             |
| Marketing / Launch    | `MARKETING_SQUAD`      | TBA            | `feature/marketing-`   | **UNASSIGNED** | Landing page, copy, assets, launch plan    | -             |

**Update rule:** Every PR must add a line under the relevant section(s) below with:

- **Squad**, **Owner**, **Branch**, **PR link**, **Scope**, **Status** (Draft / Ready / Merged), **Notes**.

---

### 3. Active Workstreams

#### 3.1 Repo & Tooling Spine

- **Tasks**
  - Initialize Turborepo with `apps/web` (Next.js 15) and `apps/mobile` (Expo 52).
  - Add `packages/ui` shared UI library (TypeScript, Tailwind, shadcn/ui).
  - Configure ESLint, Prettier, TypeScript strict mode, basic CI (lint/test).
- **Assigned Squad:** `UI_SWAT` + `IOS_MOBILE_COMMANDO`
- **Branches**
  - `feature/turbo-skeleton` – TBA – **NOT STARTED**
- **Notes**
  - Keep initial commit scope tight; no fake data yet, just shell.

#### 3.2 Bloomberg-Style Layout Grid

- **Tasks**
  - Evaluate `golden-layout` vs `@dnd-kit` for multi-panel grid.
  - Implement dockable, draggable, resizable panels with persistence (localStorage first).
  - Neon dark theme (`#0a0a0a` background, `#00ff9f` accents, Inter + monospace).
  - Study OpenBB terminal for command bar polish and interaction patterns.
- **Assigned Squad:** `UI_SWAT`
- **Branches**
  - `feature/ui-grid` – TBA – **NOT STARTED**

#### 3.3 Live Market Data Spine

- **Tasks**
  - Set up data gateway service layer (server-side in Next, shared client hooks).
  - Integrate CoinGecko REST for top 100 assets snapshot.
  - Integrate Binance WebSocket for live ticker stream.
  - Provide typed hooks for grid panels (price tape, mini-charts, order book).
  - Expose composable data APIs for News Radar (headlines, sentiment, market mappings).
- **Assigned Squad:** `DATA_INTEGRATOR`
- **Branches**
  - `feature/data-spine` – TBA – **NOT STARTED**

#### 3.4 Polymarket + OpenClaw “Claw Control”

- **Tasks**
  - Wire Gamma public API + CLOB endpoints.
  - Build Polymarket market grid + detail panel (odds, order book, chart).
  - Merge official Polymarket/agents repo (Gamma + CLOB client + RAG).
  - Integrate OpenClaw in paper-trading-only mode with safety toggles and survival mode toggle.
  - Add native autonomous execution and news/RAG-driven strategy spawning.
- **Assigned Squad:** `OPENCLAW_COMMANDO`
- **Branches**
  - `feature/claw-control-v1` – TBA – **NOT STARTED**

#### 3.5 News Radar & Market-Matched Intel

- **Tasks**
  - Build a “News Radar” panel (polyfactual-style) that ingests news headlines.
  - Auto-match headlines to Polymarket/crypto markets and tag with sentiment + expected ROI.
  - Integrate with RAG layer from the Polymarket/agents repo for enriched context.
- **Assigned Squad:** `DATA_INTEGRATOR` + `OPENCLAW_COMMANDO` (joint)
- **Branches**
  - `feature/news-radar-panel` – TBA – **NOT STARTED**

#### 3.6 Advanced Arb Engine – Adaptive Frank-Wolfe + Bregman

- **Tasks**
  - Design and implement an Adaptive Frank-Wolfe + Bregman divergence arbitrage engine.
  - Integrate engine into backtester pipeline for safe simulation.
  - Expose configuration and telemetry to Claw bots and backtest UI.
- **Assigned Squad:** `BACKTESTER_NINJA` + `OPENCLAW_COMMANDO`
- **Branches**
  - `feature/backtest-adaptive-fw-bregman` – TBA – **NOT STARTED**

#### 3.7 Studio Monitor & Research Swarm

- **Tasks**
  - Extend Studio Monitor panel to show multi-agent research swarm status (Dexter-style validation).
  - Visualize agent assignments, progress, and validation status for intel and strategies.
  - Hook into News Radar and Claw/Backtester pipelines for end-to-end observability.
- **Assigned Squad:** `BACKTESTER_NINJA` + `QA_TEST_SQUAD`
- **Branches**
  - `feature/studio-monitor-swarm` – TBA – **NOT STARTED**

---

### 4. PR Log (To Be Filled By Agents)

- **Template**
  - **[Squad]** – **Owner:** `<github>` – **Branch:** `<branch-name>` – **PR:** `<link>` – **Status:** Draft / Ready / Merged  
    **Scope:** Short summary (1 line).  
    **Notes:** Risks, follow-ups, or cross-squad impacts.

---

### 5. Blockers & Decisions

- **Current Blockers**
  - None – repo now rebased on `origin/main`, working tree clean.

- **Key Decisions**
  - **Git policy:** Do **not** touch git config. Use `git pull --rebase origin main` when needed, resolving conflicts manually.
  - **Protection:** No direct pushes to `main`. All work via feature branches + PR review.
  - **Safety:** Any integration that could touch real funds must default to paper/simulated mode and surface an explicit “unsafe mode” confirmation gate.

