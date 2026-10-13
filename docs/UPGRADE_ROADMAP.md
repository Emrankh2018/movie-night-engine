# Movie Night Engine — daily upgrade roadmap

Prepared 13 October 2026. This is the working backlog for future sessions, not authorization to execute every row or launch the app. Start at the first ready row; say **“Implement Day 01 only”** (or its ID) to begin. Days are work sessions, not fixed calendar promises. Assume 60–120 minutes per session; split a larger item rather than weakening its acceptance. External review/recruitment waits do not count as development days. No daily automation or unattended coding job is enabled.

Cash ceiling remains **0 QAR**; preserve the **92 QAR** reserve. Use existing Codex, the private GitHub repo and the existing free Supabase project only. No client infrastructure, Top Vision data or synced reference files. Planned gated features require their evidence and fresh authorization; future pricing/free-tier terms must be checked when a service is actually selected.

## Where we are

| Area | Current evidence | What remains |
| --- | --- | --- |
| M1 picker/design | Six screens, separate pure engine stages, 24 fictional titles, honest availability, English/Arabic and local art/fonts | Real customers, real catalog and provider evidence |
| M2A accounts/diary | Real Google sign-in/cancellation, two-user isolation, switching, import, CRUD/clear and independent browser-storage persistence | Physical second device and refresh-token renewal at expiry |
| Regression baseline | 96 unit tests, 42 browser checks, typecheck/lint/catalog/build passed at M2A | New behavior needs affected checks; don't repeatedly run cloud writes for docs |
| GitHub/Supabase | Private Emrankh2018/movie-night-engine, migration 20261013182848; production deploy and branching off | Deliberate release process, gated pilot hosting |
| Product evidence | Synthetic demonstration only; interviews/pilot gates have not been established | Founder-approved content/rights/availability and observed customer value |

M2A brought optional auth forward by explicit request. **M2B below completes the report's real-catalog/bilingual-alpha milestone.** The original [PRODUCT_PLAN.md](PRODUCT_PLAN.md) stays unchanged. Scope overrides live in [DECISIONS.md](DECISIONS.md); [M2A_RECEIPT.md](M2A_RECEIPT.md) records actual verified/pending checks.

## First ten sessions — finish trust and usability

| Day / ID | Upgrade and concrete output | Acceptance | Dependency / gate |
| --- | --- | --- | --- |
| 01 / AUTH-01 | Complete the remaining account proof: second physical device and a naturally expired/refreshed session | Same owned entry across devices; session renews without signing in again; logout/switch reveals no previous user's rows; sanitized receipt | Owner supplies a consenting device and an explicitly approved reachable test origin. Do not open the server to a network or publish silently; do not change project-wide token expiry just to accelerate a test |
| 02 / TRUST-01 | Improve guest/account, synthetic and availability-expiry messages; brand the Google consent experience | Review every screen in EN/AR; no fictional title appears real; strict coverage stays unknown/empty after fixture evidence expires on 20 October; consent requests basic identity only | Owner changes Google branding/privacy URLs where needed; no invented legal policy or silently refreshed synthetic evidence |
| 03 / DIARY-01 | Add diary status filters and title search with a useful empty state | Search/filter owned rows only; newest known dates and unknown-date labels remain correct; deleting one night preserves others | AUTH-01; keep original theme and no new cloud services |
| 04 / DIARY-02 | Make diary dates and rewatch history easier to understand; review actual date-picker behavior on phones | Past date, today, empty/future date and undo conflict behave clearly; choosing never marks watched; rewatch retains the old record | DIARY-01; fix observed issues, not an unproven rewrite |
| 05 / PRIVACY-01 | Add explicit download/export of guest and private diary data, plus a concise privacy/data page | Export only current owner's rows, preserve null dates and synthetic provenance, include no session tokens; logout leaves no private export cached in the app | Define export fields; download happens only after user action. Account deletion stays a separately gated backlog item |
| 06 / A11Y-01 | Accessibility pass: focus order, labels, contrast, touch targets, reduced motion and date/modal controls | Keyboard completes six steps/diary; focus returns after dialogs; no color-only status; EN/AR labels and mobile targets reviewed against WCAG 2.2 criteria | Existing design retained; fixes backed by manual checks and focused browser cases |
| 07 / UI-01 | Observed mobile usability pass with 3–5 consenting people; then one bounded polish pass | Record time/friction through all six screens; long titles wrap at 320/390px; no horizontal overflow; implement only the top demonstrated issue | Founder recruits participants. Recording/messaging needs explicit consent/authorization; this row does not send invitations |
| 08 / RELIABILITY-01 | Exercise network interruption, cancelled login, failed diary reads/writes and repeated taps | Guest picker still works; failed account load does not fake empty history; stale responses never expose another owner; retry does not duplicate writes | Use mocked contracts for regression and consenting live test data only |
| 09 / QA-01 | Add Firefox/WebKit coverage and review fluent Arabic copy | Critical flow/diary pass on supported browsers; Arabic reviewer approves labels, dates, mixed direction and reasons; actual unsupported combinations documented | Browser binaries are local/free. Native Safari/iOS checks need a real device; WebKit automation alone is not that proof |
| 10 / DELIVERY-01 | Add a minimal GitHub PR validation workflow and a daily handoff template | Clean install, catalog/type/lint/unit/build checks; browser job uses invalid fixture auth key; no deployment/database mutations, secrets or user artifacts | Recheck private-repo included runner quota and keep billing disabled; do not buy capacity. Graph artifacts remain ignored |

## M2B — real catalog and reviewed Qatar availability

Do not populate real records until their rights and review gates are met. A local schema/editor can be built first; it must not turn synthetic metadata into real facts.

| Day / ID | Upgrade and concrete output | Acceptance | Dependency / gate |
| --- | --- | --- | --- |
| 11 / RIGHTS-01 | Prepare a field-by-field data-rights/source register and a candidate list for 30 real titles | Each field/source has allowed use, attribution, retention and retrieval/review details; image rights are separate; no undocumented API integration | Founder decides permissible sources/rights. Research may be read-only; no provider contact unless explicitly authorized |
| 12 / CATALOG-01 | Design and implement separate synthetic/real curated catalog contracts | Typed stable IDs, provenance/review states, field-level unknowns and real approval prerequisites; invalid/unreviewed/unreleased/missing-runtime rows fail eligibility | RIGHTS-01 structure agreed; no actual unapproved records. Existing fictional diary entries stay fictional and retain their IDs |
| 13 / CATALOG-02 | Build a local review/import tool for curated records and evidence | Preview before applying; clear field validation; stable IDs; no scraping or privileged browser key; reports reject/missing-field reasons | CATALOG-01. Local tool first; public/admin UI and real uploads need separate authorization |
| 14 / EDITORIAL-01 | Review real catalog batch 1: ten titles covering easy/light evenings | EN/AR titles, year/runtime/release, original hook, mood/context/content tags and trade-offs have sources and explicit founder approval | Permitted data + founder and Arabic reviewer time; unknown content stays unknown |
| 15 / EDITORIAL-02 | Review batch 2: ten thoughtful/romance/drama titles | Same checks; runtime/genre/context coverage matrix identifies holes instead of inventing fit scores | Batch 1 accepted; fill demonstrated coverage gaps |
| 16 / EDITORIAL-03 | Review batch 3: ten tense/wonder/adventure titles | Thirty approved records total; distinct IDs/franchises; real explanation templates reviewed; unreviewed drafts never enter alpha picks | Founder/rights review complete; keep two supported reasons and one honest trade-off fallback |
| 17 / AVAILABILITY-01 | Collect a limited, permitted Qatar availability subset | Exact title/country/service/subscription access/source/date/reviewer; clear verified versus self-check states; evidence expires within seven days | Founder/consenting tester checks official pages or their own service. No borrowed credentials, streaming-account automation or undocumented APIs |
| 18 / COVERAGE-01 | Test the real catalog against the full input matrix | Runtime/overrun/veto/history/availability boundaries still hold; zero/one/two/three honest outcomes; reasons cite supported reviewed evidence; no fake provider claims | At least 30 founder-approved records, rights documented, reviewed Qatar subset and Arabic sign-off |
| 19 / RELEASE-01 | Prepare a versioned curated-catalog release with rollback | Previous catalog can be restored; corrupt/newer history isn't overwritten; synthetic and real modes visibly distinct; selected snapshots preserve original provenance | COVERAGE-01. A real-catalog release is owner-approved, not an automatic consequence of a merge |
| 20 / HEALTH-01 | Add coverage and freshness reporting for the curator | Counts of eligible/expired/missing coverage by filter; stale verified labels disappear; maintenance checklist distinguishes records to recheck from failures | Read only approved catalog data; no automatic evidence renewal or hidden external requests |

## M3 — controlled pilot, learning and one focused iteration

| Day / ID | Upgrade and concrete output | Acceptance | Dependency / gate |
| --- | --- | --- | --- |
| 21 / RESEARCH-01 | Complete ten problem interviews and evaluate Gate A | At least 6/10 describe a recent meaningful choosing problem and 5/10 agree to test; report denominators and contrary evidence | Founder recruits/consents people. These are experiment thresholds, not market statistics. No automatic outreach |
| 22 / PILOT-01 | Define a private 20-decision-unit pilot and consented feedback sheet | Success/zero-match/watch/return definitions, friends versus new users, test-traffic exclusions, bounded fields and retention decisions | Gate A + real-catalog gate; manual tracking first. No covert analytics or raw viewing-preference collection |
| 23 / HOSTING-01 | Prepare an owner-approved free pilot release: host, allowed origins, OAuth URLs and rollback | Verify current free limits; no billing/paid domain; HTTPS/CSP/session flow; record deployed commit/catalog version; no auto migrations | Separate explicit public/private deployment authorization. Supabase/GitHub automatic production deploy remains off unless separately authorized |
| 24 / PILOT-QA-01 | Run the pilot release acceptance on actual phones and real accounts | Two-user isolation, expiry/offline/error cases, manual AR checks and provider-link accuracy; test entries clearly disposable; secrets absent from assets/logs | HOSTING-01; never call a local build proof of deployed state |
| 25 / PILOT-START-01 | Begin observed pilot, initial cohort first, expand after early fixes | Capture the first completed sessions and truthful no-match reasons; participants know catalog/provider coverage limits | Founder-authorized invitations only; don't interpret this roadmap as permission to contact anyone |
| 26 / FEEDBACK-01 | Improve only the most common measured friction/coverage issue | Before/after scenario and affected regression pass; no extra feature bundle; preserve exclusion/availability honesty | Actual pilot observations, not a guessed problem |
| 27 / PWA-01 | Assess/add guest-only install/offline support if pilot users need it | Local artwork/fonts/catalog/app shell only; private rows/responses/session tokens never enter service-worker cache; updates don't mix stale catalog versions | Demonstrated need. Account diary remains network-dependent; rollout needs release approval |
| 28 / SPEED-01 | Measure and improve the slowest observed mobile path | Record baseline and resulting bundle/load/interaction measures; retain lazy auth SDK and all boundaries; no promised arbitrary speed percentage | Actual measurements. Avoid optimizing a guessed bottleneck |
| 29 / QUALITY-01 | Add regression cases from actual pilot failures and document recovery | Reproduce the failure; smallest fix; clear offline/storage/sign-out/import recovery; release/cost/rights checks still pass | Pilot feedback and only app-owned systems |
| 30 / OPERATIONS-01 | Rehearse weekly evidence review, backup/recovery and quota checks | Expiry cannot silently keep verified labels; approved diary backup/restore proof is isolated and owner scoped; cost limits visible | Agree data retention/backup destination first. No paid backup system or unapproved copy of private diaries |
| 31 / VALUE-01 | Evaluate Gate B after the full 14-day observation window | At least 20 first sessions; 12 select, 8 report watching, 5 decision units return; counts/denominators/response rate and friends/new users reported | Wait 14 days from the initial cohort; this may require additional calendar days beyond the table |
| 32 / ITERATION-01 | Decide: one focused iteration, expand cautiously, or pause | If Gate B fails, address the observed cause and remeasure. If two focused iterations and roughly 40–50 product hours remain weak, pause expansion and preserve cash | Evidence review with founder; no growth/paid feature push to conceal weak value |

## Later upgrades — ordered candidates, not current implementation

Schedule these as new daily slices only when pilot demand supports them. A candidate can be declined; there is no obligation to add every feature.

| Priority / ID | Candidate | What would justify it | Gate / acceptance |
| --- | --- | --- | --- |
| L1 / DIARY-03 | Diary pagination/calendar and editing viewing dates | People have long histories and ask for retrieval/date correction | Preserve owner isolation/unknown dates; date edits don't overwrite distinct nights or create same-day duplicates |
| L1 / PRIVACY-02 | Account deletion and stronger recovery controls | Users need full account removal/export and supported recovery | Explicit deletion consent, reviewed retention policy and owner-verified backend endpoint; no admin/service-role key in browser |
| L1 / CATALOG-03 | Expand to 60–100 approved titles; additional moods/runtime ranges | Coverage matrix and zero-match feedback show gaps | Same rights/editorial/Arabic/availability checks for every new record; no quantity target overriding evidence |
| L2 / PROVIDERS-01 | Licensed catalog/availability adapter | Manual curation is insufficient and a documented affordable rights route exists | Written permitted use, fields/caching/attribution/country coverage; zero-cost fit or separate spending approval. TMDB/another API stays disconnected until then |
| L2 / WATCHLIST-01 | Private watchlist, distinct from Chosen | Activated users request save-for-later and confuse it with a nightly decision | New owner-only schema/migration; no silently converted diary entries. Currently deferred |
| L2 / RATINGS-01 | Private “worked for me” feedback or ratings | Measured need to improve personal picks beyond watched exclusion | Explicit purpose/consent, explainable scoring and regression baseline; no copied external ratings. Currently deferred |
| L2 / GROUP-01 | Separate couple tastes, then group-room voting | Pilot groups cannot decide with one shared preference set | Start with one-device comparison; real rooms need authorized scope, participant privacy, expiry and abuse controls. Currently deferred |
| L3 / PERSONALIZATION-01 | Deterministic learning from explicit feedback | Enough consented feedback to compare against the current weights | Opt-in, reset/disable, explainability and an observed improvement; no hidden behavioral profiling |
| L3 / REGION-01 | UAE/UK or more language/provider coverage | Consenting demand plus reviewed data in those regions | Country-specific rights/availability and fluent copy; never copy Qatar evidence to another country |
| L3 / INTEGRATIONS-01 | Calendar reminders or sharing | Repeated explicit user need | Opt-in and user-triggered actions; never transmit private history by default; source/user authorization before messages |
| G1 / OFFER-01 | Test a concrete paid offer on paper | Useful beta and at least ten activated users willing to review a specific offer | Gate C: at least three explicit commitments at the stated price; commitments are not revenue; no money collected now |
| G2 / PAYMENTS-01 | Checkout/protected delivery/refunds | Gate C passes and the deliverable exists | Gate D: rights, owner seller eligibility/route, separately approved checkout, sandbox purchase/refund/replay proof and production review; new spending decision required. Currently deferred |
| G3 / LAUNCH-01 | Organic launch, support and weekly metrics | Approved useful product with a support/availability maintenance plan | No false claims about coverage/results; owner-approved publishing/outreach; no paid ads or domain purchase under current budget |
| G4 / AI-01 | Optional AI assistance for an observed editorial/UX task | A measured gap remains after deterministic solutions | Separate approval, documented rights/privacy, evaluation and zero-cost feasibility; no paid API calls or new subscriptions. Keep deterministic eligibility authoritative; no invented facts/availability |

## Daily execution and handoff

1. Read the chosen row, the latest receipt/decisions and [PROJECT_MAP.md](PROJECT_MAP.md). Check Git/graph freshness; run one bounded query for the affected module.
2. Verify prerequisites. If founder content, rights, a device or deployment permission is missing, do independent preparation for that slice and record the exact dependency; do not call it complete.
3. Implement one reviewable change, preserving the design/EN/AR, guest mode, strict filters, separate choice/viewing, owner policies and 0-QAR boundary.
4. Run affected meaningful tests and relevant type/lint/catalog/build checks. For account/schema changes add actual isolated RLS proof; for UI changes include keyboard/mobile/Arabic. Broaden tests only for changed behavior/failures.
5. Commit/push approved source and a sanitized receipt; apply migrations deliberately only when the slice authorizes them. Verify GitHub/deployed SHA separately. Refresh the local graph once if indexed inputs changed.
6. Handoff: day/ID, what changed, exact checks and evidence layer, commit, migrations applied, spending, remaining gaps, and the next ready row. No secret/session/user-data artifacts in Git.

For each day, append a receipt to a future `docs/daily/` only when that day is actually executed. Mark roadmap status with evidence, not optimistic percentages. The current app is still synthetic; a completed account feature is not real-catalog or commercial-release readiness.

## Reference points

- Product gates/thresholds: [source report](PRODUCT_PLAN.md), sections 8–10; direct user scope takes precedence.
- Accessibility criteria: [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/).
- Session behavior: [Supabase sessions](https://supabase.com/docs/guides/auth/sessions).
- Browser verification: [Playwright projects](https://playwright.dev/docs/test-projects).
- Local graph tooling: [Graphify upstream](https://github.com/Graphify-Labs/graphify). Future service/rights decisions require fresh official-source checks.
