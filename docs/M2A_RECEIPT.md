# M2A acceptance receipt — 13 October 2026

Status: **implemented and pushed; automated, database and core live account checks passed.** Physical-device and token-expiry checks remain unverified. No public release. Spending: **0 QAR**, with the **92 QAR** reserve preserved.

## Implemented

- Optional real Google OAuth, PKCE, verified session restoration, local sign-out and honestly disabled/unavailable states. Guests retain the complete synthetic picker without requests to movie providers or Supabase.
- Duplicate-safe Chosen entries with selection timestamps; a separate viewing date, undo, delete and clear in My Movie Nights. Newest known selection dates first, unknown dates last and visibly unknown.
- Watched exclusion defaults on for each account session. An explicit rewatch permits a new Chosen night while retaining the old Watched record. One active Chosen per movie and one Watched per movie/calendar date; no automatic Watched on choice. An existing active Chosen prevents conflicting undo.
- Explicit guest-history import with stable device/movie identifiers, batching, preserved unknown dates, no rejected-title import and no overwrite of known history. Guest schema v1 migrates to v2 without fabricating old dates.
- Owner-scoped database policies and security-invoker RPCs. Abort/generation guards discard stale requests on owner change. Private entries live in memory only; sign-out/account changes clear them and transient private picker state. Guest history remains separate.
- English/Arabic diary UI, mixed-direction account labels, local fonts, original artwork and the existing violet/peach layout.
- Private GitHub repository and saved Supabase GitHub link, with automatic production deployment and automatic branching off. Reproducible SQL migration version `20261013182848`; see M2A_SETUP.md for how it was applied.

## Actual checks passed

| Layer | Evidence |
| --- | --- |
| Catalog | 24 synthetic movies, 14 simulated availability records validated |
| Static/build | Clean `npm ci` with zero audit vulnerabilities, strict typecheck, ESLint and normal Vite production build |
| Unit | 96 tests: engine/evidence/storage plus diary cache isolation, late responses, duplicate choice, failed loads/writes, guest-date migration and public configuration guards |
| Browser contracts | 42 checks on Pixel 7 Chromium and desktop Chromium: original picker regressions plus synthetic auth cancellation, diary actions, import/clear, independent contexts, two-owner isolation, Arabic and explicit rewatch/history preservation |
| Actual PostgreSQL | Rollback-only test verified two-owner read/write/delete isolation, forged owner denial, anonymous denial, duplicate choice/watch/import, separate dates, rewatch and undo/clear operations |
| Supabase | Exact project/organization and free plan verified; migration history verified; security advisor returned no lints |
| Real Google/browser/API | Two consenting Google accounts signed in and showed separate diaries; switching accounts cleared the old rows; real consent cancellation returned to guest mode. Chosen save, Watched status, undo and session/diary reload worked. The same owner's entry loaded from independently stored localhost sessions; sign-out cleared that session and stayed signed out after reload |
| Live guest import | A fresh localhost guest session created two fictional test titles. Explicit import saved both; repeat import reported zero inserted/two skipped. A Watched title with no selection date retained Date unknown. Reload and an account round trip preserved the records |
| Live bilingual UI | Arabic diary labels, dates, mixed-direction identity and RTL rendered with no horizontal overflow; automated mobile/desktop checks also passed |
| Live deletion/clear | After explicit approval for three fictional test entries, Delete removed one second-account entry and Clear removed its remaining entry. The first account's entry stayed intact, proving account scope. Its approved test entry was then deleted. Empty diary persisted on reload; existing guest history remained intact |
| GitHub link | Saved same private repository connection; production deploy and branching switches off after Dashboard reload |
| Source hygiene | Staged credentials/artifact scan clean; the report's local and Git-index bytes match the original SHA-256; existing report/license whitespace preserved |

The browser contract suite uses deliberately invalid synthetic tokens and an in-memory API fixture. Actual database isolation and two real Google accounts were also tested separately. The independent live app sessions used localhost and 127.0.0.1 origins on this machine; this proves server persistence across independent app storage, not a physical second-device test.

## Live checks still pending

- A physical second device and refresh-token renewal at expiry. Reload restoration and real cancellation passed; token-expiry renewal was not forced.
- Safari/Firefox and fluent Arabic editorial review remain unverified. Automated Chromium/mobile layout checks passed.

All three fictional account test entries were removed with the owner's explicit approval. A project-scoped database count confirmed zero remaining diary rows; migration history still contains only version `20261013182848`. The owner's pre-existing guest history was not imported or cleared. The fresh localhost test guest history is separate and retained; the secondary account was signed out. Live browser screenshots and session data are not committed.

## Next gate

Finish the physical-device and token-expiry checks before broader account alpha use. Before a real-catalog alpha, document rights, obtain founder approval of editorial records and review Qatar availability/Arabic content. Watchlists, ratings, social/group features, payments, AI and public deployment remain deferred. No paid API or additional subscription was used.
