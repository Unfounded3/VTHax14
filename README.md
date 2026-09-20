# HokieLens — Frontend

HokieLens is a responsive web app (currently the Phase 1 shell) that helps Virginia Tech
students search course sections, assemble a candidate schedule, visualize meetings and walking
gaps, and understand the academic and logistical risk of a week — before registration.

## Stack

- Vite + React 18 + TypeScript (strict)
- Tailwind CSS (brand tokens as CSS custom properties in `src/styles/globals.css`)
- TanStack Query, React Router, Vitest + React Testing Library + MSW, Playwright (later phases)

## Prerequisites

- Node.js 18 or newer and npm.

## Setup

```powershell
npm install
cp .env.example .env.local   # optional; the default already points at the local API
```

Environment:

```text
VITE_API_BASE_URL=http://localhost:8000/api
```

The value already includes the `/api` prefix. API hosts must never be hardcoded in components.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server (default <http://localhost:5173>) |
| `npm run build` | Type-check (`tsc --noEmit`) and produce a production build in `dist/` |
| `npm run lint` | ESLint (flat config) across the frontend |
| `npm test` | Vitest (unit/component tests; no tests exist yet) |
| `npm run test:e2e` | Playwright smoke test (arrives in a later phase) |
| `npm run preview` | Preview the production build |

## Backend

The HokieLens backend lives in `backend/` (see `backend/README.md` for setup flags and the API
route table). The frontend expects the eight documented endpoints under `/api` (health, course
search, buildings matrix, analyze, swap, stress, professor vibes, demo schedules). The backend is
a separate project owned elsewhere: **do not modify anything under `backend/`**.

Phase 1 makes no API calls — the shell, layout, and styling only. Phases 2+ wire the catalog,
URL-backed schedule state, calendar, map, and insights.

## Disclaimer

HokieLens is a student-built planning tool and is not an official Virginia Tech registration
service.
