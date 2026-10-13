# Movie Night Engine — small project map

Start with [DECISIONS.md](DECISIONS.md), the latest [M2A receipt](M2A_RECEIPT.md) and the selected [daily upgrade](UPGRADE_ROADMAP.md). This map is navigation, not proof of correctness or permission to execute gated work. Current source/tests and live receipts remain authoritative.

| Question | Source to inspect | Verification |
| --- | --- | --- |
| Six steps, result sessions, account/guest separation | [App](../src/app/App.tsx), [inputs](../src/components/InputScreens.tsx) | [picker flow](../tests/flows/app.spec.ts), [diary flow](../tests/flows/diary.spec.ts) |
| Hard exclusions and honest availability | [eligibility](../src/engine/eligibility.ts), [catalog contracts](../src/catalog/schema.ts) | [engine cases](../tests/engine/engine.test.ts) |
| Weighted scoring, distinct picks, replacement | [ranking](../src/engine/ranking.ts), [diversification](../src/engine/diversification.ts), [orchestration](../src/engine/index.ts) | Engine cases and browser replacement scenarios |
| Two supported reasons and trade-off | [explanation](../src/engine/explanation.ts), [dictionary](../src/i18n/index.ts) | Evidence prerequisites in engine cases |
| Google, Supabase calls, private cache/owner switching | [gateway](../src/diary/supabase.ts), [controller](../src/diary/controller.ts), [contracts](../src/diary/types.ts) | [controller tests](../tests/diary.test.ts); real account evidence in M2A receipt |
| Diary date/actions and EN/AR copy | [panel](../src/components/DiaryPanel.tsx), [diary dictionary](../src/diary/i18n.ts), [styles](../src/app/styles.css) | Diary browser flow and fluent/manual review |
| Legacy/guest dates and storage | [storage](../src/storage/index.ts), [import adapter](../src/diary/guest.ts) | [storage tests](../tests/storage.test.ts), controller/import cases |
| Owner-only RLS and duplicate safety | [applied migration](../supabase/migrations/20261013182848_private_movie_diary.sql) | [rollback SQL proof](../supabase/tests/diary_rls.sql); no graph query proves RLS |
| Fictional titles and rights gates | [fixtures](../data/fixtures/catalog.ts), [rights](DATA_RIGHTS.md) | [catalog validator](../scripts/validate-catalog.ts); founder evidence required for real data |
| Design/fonts/artwork | [UI direction](UI_DIRECTION.md), [artwork](../src/components/MovieArtwork.tsx), styles | Browser widths/RTL/keyboard; no unlicensed posters |
| Build/runtime/optional account setup | [README](../README.md), [setup](M2A_SETUP.md), [Vite config](../vite.config.ts) | Type/lint/build; invalid fixture auth key for browser contracts |

## Small graph workflow

```text
rtk proxy npm run graph:status
rtk proxy npm run graph:build
rtk proxy npm run graph:query -- "AccountController" --budget 800
rtk proxy graphify explain "public.choose_movie()"
```

`graph:build` uses already-installed local Graphify/Python/uv: code AST plus native Markdown heading/link extraction, then clustering with LLM labels disabled. No provider key, API request, live database introspection or cross-project merge. `.graphifyignore` excludes secret/user/generated files; all `graphify-out/` artifacts stay local and ignored. It writes:

- `graph.json`: queryable clustered graph; do not dump it into chat.
- `graph.raw.json`: original relationships before clustering can collapse same-endpoint edges.
- `graph.html` and `GRAPH_REPORT.md`: local navigation views; reports may contain generated suggestions, which are not this roadmap or authorization.
- `project-snapshot.json`: content-hash freshness receipt, source commit and counts. Dirty changes invalidate freshness even when HEAD stays the same.

Graphify may miss dynamic calls, RPC names stored in strings, React hook wiring, CSS details and SQL policy semantics. Markdown indexing captures structure/links, not editorial meaning or gate completion. A qualified SQL name can tokenize poorly in `query`; use its exact `explain` label and read the migration. No-symbol/partial files still require direct inspection. Graph budgets are approximate; truncated results are explicitly incomplete. No fixed token-saving percentage is claimed.
