# RSPCB JalRakshak — ETP

### Smart Textile Wastewater Monitoring & Compliance Platform — Individual ETP

> An initiative by the **Rajasthan State Pollution Control Board (RSPCB) – Balotra**.
> A presentation‑grade, **frontend‑only** prototype that feels like a national environmental command center — monitoring **individual Effluent Treatment Plant (ETP)** textile units across the Balotra cluster.

This is the **ETP** half of JalRakshak (the CETP platform lives in a separate project/repository). It is a demo — there is **no backend**; all data is mock JSON hydrated into persisted client state.

---

## ✨ Highlights

- **Cinematic GLSL landing** — a custom WebGL shader river with GPU particles, with a GSAP "reduce pollution" transformation. Falls back to a static scene when WebGL is unavailable or `prefers-reduced-motion` is set. (Identical look & feel to the CETP platform.)
- **Light marketing home** — hero with animated counters, **individual ETP overview cards**, About and Contact.
- **Role‑based demo login** — two roles: **Monitoring Body** (RSPCB authority) and **ETP** (an industry running its own Effluent Treatment Plant). No real auth.
- **Dark monitoring dashboard** — command‑center shell with collapsible sidebar, live metrics and route transitions.
  - **ETP module** with an **animated treatment pipeline** (Max Effluent → ETP → RO I–IV → MEE) and per‑unit water balance.
  - **ETP Data Entry** — daily water‑balance (fresh water, ETP inlet/outlet/reuse, RO inlet/reject/permeate, sludge → TSDF). Submissions create approvals + alerts and **persist across refresh**.
  - **Industries** (registry + detail dialog) + **ETP unit registration** (validated form, success animation).
  - **Approvals** (workflow timeline), **Alert Center**, **Compliance** (animated gauges), **Reports** (real CSV export), **Settings** (reset demo data).

## 🧱 Tech Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · GSAP · Framer Motion · Three.js + React Three Fiber + drei · Recharts · Zustand (persisted) · TanStack Table · React Hook Form + Zod · Lucide.

## 🚀 Run

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # production build
```

## 🎬 Demo flow

1. Open the site → explore the cinematic landing and the **ETP overview**.
2. **Enter Platform** → sign in with a demo account:
   - `admin@rspcb.in` / `rspcb123` — Monitoring Body (sees every ETP unit)
   - `etp@demo.in` / `demo123` — an individual ETP operator
3. As an ETP operator, open **ETP Data Entry**, submit a water balance → see it in **Approvals**, raise **Alerts**, update the dashboard, and survive a page refresh.
4. As the Monitoring Body, review **Industries → ETP units**, **Compliance**, **Alerts** and **Reports** (export any report as a real CSV). **Settings → Reset demo data** to restore the seed.

## 🗂 Architecture

```
app/                      routes (landing, login, register, dashboard/*)
components/
  landing/                cinematic experience + home sections
  three/                  WaterPlane, scene environment, GLSL shaders
  dashboard/              shell, sidebar, topbar, pipeline, data-table, metric-card
  charts/                 Recharts wrappers
  shared/                 logo, icon, animated-counter, status-badge, reveal
lib/
  store/                  zustand stores (auth, ui, data, accounts) — persisted to localStorage (jalrakshak-etp-*)
  data/seed.ts            deterministic mock-data generator
  data/etp-flow.ts        ETP treatment-pipeline builders
  types.ts  constants.ts  utils.ts
data/                     industries.json   (individual ETP units)
```

All derived data (readings, ETP entries, approvals, alerts, compliance) is generated deterministically from the static JSON so server and client renders stay in sync.

---

_Demonstration prototype — mock data only, no real submissions._
