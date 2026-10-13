# M1 acceptance receipt

This is the historical M1 receipt. M2A adds optional accounts/diary and supersedes the local-only/auth-deferred limitations below; see [M2A acceptance receipt](M2A_RECEIPT.md).

Status: **M1 verified locally** on 13 October 2026. No public deployment or real catalog release.

- [x] Source report copied unchanged and original preserved. Both SHA-256 hashes: `260ab61efdf1984ea9305a5f76ac64b1d48772641884a2ea1fed373da8368640`.
- [x] `npm run validate:catalog`: 24 fictional movies; 14 simulated availability records.
- [x] `npm run typecheck` and `npm run lint`: passed.
- [x] `npm test`: **76 tests passed**, including **45 named eligibility scenarios**, ranking, evidence, replacement and storage regressions. Also exercised 36 combinations of mood/context/adventure within evidence coverage.
- [x] `npm run build`: passed, with a locked dependency graph. Following the visual redesign, JavaScript approximately 357 kB / 110 kB gzip; CSS approximately 18 kB / 5 kB gzip. Self-hosted font binaries add approximately 956 kB before HTTP compression.
- [x] Initial M1 `npm run test:e2e`: **26 checks passed**, 13 scenarios each on Pixel 7 Chromium and desktop Chromium. Redesign regression receipt is recorded below.
- [x] Arabic RTL, keyboard/modal focus, preserved back-navigation inputs, empty/fewer results, unsupported services, selection/seen distinction, one-slot replacement, replacement exhaustion, clear history, corruption, blocked writes and future storage preservation.
- [x] Strict simulated evidence expires while a page remains open, with filters retained.
- [x] All non-local browser requests blocked; the complete flow observed zero external requests. A separate test disables all networking after page load and still completes recommendations.
- [x] English and Arabic result screenshots reviewed at both widths; long Arabic titles wrap without horizontal overflow. Year formatting corrected; Arabic numerals are localized.
- [x] `npm run dev -- --port 5173 --strictPort`: actual mobile browser smoke test completed six screens and three cards with **zero console/page errors**, including working Vite development styles.
- [x] Source inspection found no external-request APIs, browser secret variables or credential patterns in app/fixture source. Dependency installation audit reported zero vulnerabilities.

Release remains local and synthetic. Planned spending is 0 QAR. No client systems, reference files, purchases, accounts, data API keys, auth, payments, AI or deployment are included.

## Visual redesign receipt

- Original vector cover art, a new type/color system, featured-first results and a responsive input flow replace the rejected presentation. Synthetic labels, reasons, trade-offs and strict availability rules remain visible.
- Outfit and Noto Sans Arabic are local OFL fonts with included licenses and source provenance. Reference websites contributed no images, content or code.
- Dev-server visual review: desktop 1440px, phone 390px, narrow 320px and Arabic phone 390px; all six screens, landing and results have zero horizontal overflow and zero console/page errors. A decorative-ring overflow at 320px was fixed and covered by a browser regression.
- Final redesign checks: typecheck/build, lint, 76 unit tests and 28 production browser checks. Screenshots of landing, inputs and results were visually reviewed in `.tmp/ui-review`; source report remains untouched.

## Practical limitations and next gate

- Every title and provider record is fictional. Fixture audit/template tests are not real editorial approval or availability verification.
- Date-bounded synthetic subscription coverage expires on 20 October 2026 at 00:00 UTC. Strict filters may then return zero picks, by design.
- Only Chromium was automated; Safari/Firefox and fluent-reader editorial review remain unverified.
- The page works without networking once loaded; there is no installed offline app/service worker. First load needs the local server.
- Couple/friends use shared preferences on one phone. History does not sync, and unsupported/newer storage is session-only.
- M2: document real-data rights, approve 30 editorial titles, review Arabic copy and collect permitted Qatar availability evidence before a real-catalog alpha. Deployment requires a separate approved account connection. Payments, auth, group rooms and AI remain gated by the product report.
