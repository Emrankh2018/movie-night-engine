# Visual redesign

The initial navy interface was rejected by the owner. This redesign replaces that direction with a cinema/editorial identity rather than expanding product scope.

## References and original interpretation

- [Aesthetica Film Festival design by Zlata Savina](https://www.behance.net/gallery/189737261/Aesthetica-Film-Festival-Website): studied the confidence and scale of the typography.
- [MUBI Notebook](https://mubi.com/en/notebook): editorial cinema context and a curated shortlist presentation.
- [Criterion](https://www.criterion.com/): cinema collection context and treating cover design as an important visual object.

These are visual/context references only. No site code, photos, covers, posters, metadata or catalog content were copied or integrated.

## Design system

- Midnight violet `#151125`, deeper panel `#211a34`, paper `#f8f5f0`, lavender `#ccb9ff`, peach `#ffbc9f`, muted text `#b9b0c9`.
- Outfit variable font for Latin; Noto Sans Arabic for Arabic. Both are served locally. OFL license files accompany the binaries under `public/fonts`.
- Bold, compact landing typography and a gallery of three original vector covers from the fictional catalog. Geometric art families correspond to genre; each cover uses its actual fictional title and year.
- Six-step flow with a desktop progress rail and a focused light input surface. Selected controls use restrained violet, distinct from the peach action colour.
- A featured first recommendation, then two smaller alternatives. Mobile keeps cards in ranked order. Reasons, trade-offs and availability states remain visible.
- A compact, always-visible synthetic-data notice with expandable detail. Honest labels are retained without dominating the opening screen.
- Logical properties, Arabic fonts/numerals, visible keyboard focus and reduced-motion support remain part of the design.

## Font provenance

Downloaded from Google's open-source fonts repository, with the accompanying SIL Open Font License 1.1. No paid assets or remote runtime font services are used.

- Outfit: `https://github.com/google/fonts/tree/main/ofl/outfit`
- Noto Sans Arabic: `https://github.com/google/fonts/tree/main/ofl/notosansarabic`

## Review

`npx tsx scripts/visual-review.ts` captures landing, inputs and results from the local dev server at desktop, mobile, 320px and Arabic mobile widths, records console/page errors and checks horizontal overflow on every step. Screenshots are in `.tmp/ui-review` and are deliberately excluded from source control.

The engine, data rights gates, seven-day synthetic evidence policy, history semantics, zero-cash budget and deployment boundary are unchanged. Visual quality does not establish market demand; real catalog and tester review remain next-stage gates.
