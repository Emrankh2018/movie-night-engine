# M2A setup and migration handoff

Only the existing Movie Night Supabase project `vvwzqehzamkflrokrcqs` is authorized. Its URL is `https://vvwzqehzamkflrokrcqs.supabase.co`. The organization/project were verified through authenticated Supabase MCP and remain on the free plan. GitHub CLI/connector identified owner `Emrankh2018`; there was no existing local Git repository or intended remote, so a private `movie-night-engine` repository was created. No purchases or deployment were made.

## Local app

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Before starting accounts, edit `.env.local` with the **publishable** key from the exact project's Settings → API Keys. The implementation machine already has this ignored file configured. Neither the real public key nor local environment file is committed. Keys beginning `sb_secret_`, service-role keys, database passwords and Google client secrets must never enter browser variables. The app rejects other project URLs and non-publishable key formats. Guest recommendations remain local without this file.

Google OAuth must be configured in the owner's Google Auth Platform and Supabase Dashboard. The owner has enabled and saved the provider; real sign-in was tested:

- Web OAuth client; origin `http://localhost:5173` (also add `http://127.0.0.1:5173` when needed).
- Google redirect URI `https://vvwzqehzamkflrokrcqs.supabase.co/auth/v1/callback`.
- Basic identity scopes only: openid/email/profile. No Gmail, Drive or other account permissions.
- Keep the client secret in Supabase Authentication → Sign In / Providers → Google. Enable Google and Save there; URL Configuration alone does not enable it.
- Supabase Site URL `http://localhost:5173`; allow `http://localhost:5173/auth/callback` and `http://127.0.0.1:5173/auth/callback`. Both local origins were exercised successfully.
- If the Google audience is Testing, add the consenting test accounts. A different preview port needs its own explicit Supabase redirect allowlist entry before live sign-in there.

The app checks the public auth settings before enabling sign-in. A false response disables it; a failed check offers retry. OAuth uses PKCE. Private rows are loaded only after account identity is restored; load failure blocks history-dependent recommendations/saves until refresh or sign-out.

## Database change

Applied migration: `supabase/migrations/20261013182848_private_movie_diary.sql`, name `private_movie_diary`.

The CLI generated the draft migration. After verifying the target project and confirming an empty public schema/migration history, authenticated MCP `apply_migration` applied the exact SQL to this project. The server assigned version `20261013182848`; the single local filename was aligned to that version, without replaying the migration. `list_migrations` confirms that version/name. Future schema changes require new migration files; do not edit or reapply this file to the existing project.

The table uses owner-only select/insert/update/delete policies. UPDATE requires both USING and WITH CHECK and only grants status/date columns. RPCs are security invoker, with an empty search path, and executable only by authenticated users. They use owner/movie transaction locks and unique constraints for retry safety. No privileged key is required by the app.

`supabase/tests/diary_rls.sql` was run through project-scoped MCP `execute_sql`. It creates two temporary test identities inside one transaction, verifies owner isolation and history actions, then rolls back. It does not create permanent test accounts or diary records. The test is for this app's schema in an isolated transaction; do not adapt it to client infrastructure.

MCP access was already authenticated; no database password was needed or requested. If a future direct CLI connection requires one, use its interactive password prompt in a local terminal. Do not put the password in chat, a shell command, browser variables, or committed configuration. Alternatively use an approved local secret setting consumed only by the database tool.

## GitHub and manual releases

Repository: `https://github.com/Emrankh2018/movie-night-engine` (private), remote `origin`, branch `main`. Code, lockfile, fonts/licenses, documentation, migrations and tests are included. `.env.local`, dependencies, build output, browser session data and screenshots/user data remain excluded. The source report is preserved locally; its unchanged copy is tracked as `docs/PRODUCT_PLAN.md`.

Supabase Settings → Integrations connects this same repository, working directory `.`. **Deploy to production is off. Automatic branching is off and unavailable on the free plan.** No Vercel integration or production app deployment was configured. A Git push does not apply future database migrations. Apply reviewed migrations deliberately through project-scoped MCP or the securely authorized CLI, verify migration history and policies, and record the receipt.

## Verification commands

```powershell
npm run validate:catalog
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

Browser tests compile in `e2e` mode under `.tmp/e2e-dist` with an invalid fixture public key, intercept account calls and block other external requests. They do not test live Google credentials and leave production `dist` untouched. Build normally after app changes to update the real preview. Verification layers and remaining live checks are listed in `M2A_RECEIPT.md`.
