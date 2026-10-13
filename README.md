# Movie Night Engine

Movie Night Engine is a React + TypeScript + Vite prototype with the M1 picker and M2A optional Google accounts/private diary. Every film, hook, metadata field and provider example is **synthetic**. It makes no real streaming claims.

## Run locally

Use a Node release satisfying the locked Vite/toolchain engines (the implementation environment uses Node 26). From this folder:

```powershell
npm ci
npm run dev
```

Open the localhost URL Vite prints. Guests need no accounts, keys or database. Guest recommendations make no external requests. Installation downloads open-source development packages; fonts and artwork are bundled locally.

For optional accounts, copy `.env.example` to `.env.local` and enter this project's **publishable** key from Supabase Settings → API Keys. Keep this file ignored. Restart Vite after configuration. Never put a privileged key or Google client secret in a `VITE_` variable. Without public configuration, sign-in stays disabled and the guest picker works. See [M2A setup](docs/M2A_SETUP.md).

```powershell
npm run validate:catalog
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
```

Browser installation is free. `test:e2e` builds an isolated test bundle with a deliberately invalid public fixture key and mocks all account requests. It needs no credentials or live Supabase writes. Tests run at `http://127.0.0.1:4173`. Run `npm run build` afterward before previewing real accounts. There is no service worker: guest recommendations work after external connectivity is lost, but first loading needs the local server. Account operations need network access.

## What M1 contains

Six input screens, zero to three ranked distinct picks, evidence-based reasons, runtime and content boundaries, explicit availability modes, choose/seen/replace actions, versioned device history, and English/Arabic RTL layouts. A replacement is allowed once per slot and keeps other picks. A seen title is removed if watched exclusion is enabled; that action does not auto-fill its slot.

Guest preferences/history use `movie-night-engine:local`, schema v2. The explicit v1 migration preserves legacy history and leaves unknown dates unknown. Clear history resets guest movie history while retaining preferences. Unavailable storage falls back to session-only operation; future versions are left untouched.

## Optional private diary

Google sign-in restores sessions; guests can continue using the picker. “Choose this” records Chosen with a timestamp, without marking Watched. My Movie Nights supports a separate viewing date, undo, delete and clear. Repeated choices/imports are duplicate-safe. Watched titles are excluded by default; Allow rewatches explicitly permits a new Chosen night while keeping the old Watched record.

Guest history imports only after confirmation. Signing out or switching accounts clears the in-memory private diary. The SDK stores only its session under `movie-night-engine:auth`; private diary rows are never cached in localStorage. Owner-only RLS protects every database operation. Deleting/clearing diary entries is permanent; the UI asks first. Guest and account history stay separate.

Synthetic evidence uses fixed dates: fresh records expire on **20 October 2026 at 00:00 UTC**; an intentionally expired record tests rejection. After expiry, strict demo filters may yield no results. Nothing renews evidence automatically. Tests inject a fixed clock.

## Boundaries and next milestone

Actual cash spending: **0 QAR**, with **92 QAR** preserved. Optional accounts use the existing free Supabase project. Code is in the private [GitHub repository](https://github.com/Emrankh2018/movie-night-engine). Supabase links to that repository with automatic production deployment and branching disabled. No public deployment, analytics, payments, AI, external catalog adapters, posters or client infrastructure are included. Couple/friend mode uses shared preferences on one device.

The real-catalog alpha still requires founder-approved editorial records, documented rights, reviewed Qatar availability and fluent Arabic review. Accounts were brought forward by the explicit M2A request. Real data and public deployment remain gated. See [M2A verification](docs/M2A_RECEIPT.md), `docs/PRODUCT_PLAN.md`, `docs/DECISIONS.md`, `docs/DATA_RIGHTS.md` and `docs/RELEASE_CHECKLIST.md`.

The visual redesign uses original geometric covers and self-hosted open-license English/Arabic fonts. Reference notes and font provenance are in `docs/UI_DIRECTION.md`. With the dev server running, `npx tsx scripts/visual-review.ts` captures desktop, mobile, 320px and Arabic screenshots under `.tmp/ui-review`.

## Daily upgrades and project navigation

See [the daily roadmap](docs/UPGRADE_ROADMAP.md) for the next sessions, acceptance criteria and release/data/payment gates. Say “Implement Day 01 only” to begin a bounded slice. The roadmap does not start an automation or authorize all future features.

[PROJECT_MAP.md](docs/PROJECT_MAP.md) connects product decisions to code/tests. Optional local Graphify tooling uses existing Python/uv/Graphify, with no API calls: `npm run graph:build`, `npm run graph:status`, then `npm run graph:query -- "AccountController" --budget 800`. It indexes code and native Markdown structure and keeps generated graphs ignored. It is development tooling; the app does not depend on Python or Graphify.
