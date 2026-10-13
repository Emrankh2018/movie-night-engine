# Movie Night Engine
## Product, launch and Codex implementation report

**Prepared for Emran Khammash | Road to Million | 13 October 2026**  
**Available cash: 92 QAR. Existing tool: ChatGPT Plus.**  
**Decision: build a zero-cash prototype; earn evidence before buying services.**

## 1. Executive decision

Build a mobile-first web app that helps a person or couple choose a movie for tonight through a short flow and three ranked recommendations. The result must explain the fit, respect explicit limits and help the user commit to one choice.

The original Notion idea remains the source: mood, time, genres, available streaming services, watching company, safe pick versus surprise, watched films and deal-breakers; then three picks with reasons. [N1]

**Recommended first audience:** adults choosing with a partner or friend, recruited through Emran's existing network in Qatar. English and Arabic interface; Qatar is the initial availability test market. This is a proposed starting segment, not a finding that Qatar is the largest market. Expand only after observing use.

**First promise to test:** “Three picks for tonight. Less scrolling, faster choosing.” A 90-second decision is a measurement target, not a claim to publish before testing.

**Technical starting point:** React, TypeScript, Vite, an independently curated catalog, deterministic recommendations and local device storage. No paid AI calls, database, login, app stores or checkout in the prototype.

**Commercial starting point:** free testing, then a small paid pack or time-limited premium offer once repeat use, data rights, merchant approval and delivery are demonstrated. Do not promise lifetime access.

**Budget decision:** spend 0 QAR now; preserve all 92 QAR. That cash cannot responsibly fund a recurring commercial movie-data service. Current provider pricing and unknown merchant or licensing costs mean that a complete paid, live-catalog launch is not guaranteed within this budget.

This product can become a useful business, but it is not proven tuition income. Do not stop faster service work while testing it. Limit the initial product experiment to about 6 hours weekly until it earns stronger evidence.

### What success actually means

A working interface is only engineering success. Product success means people choose, watch and return. Business success means some pay enough to cover fees, data maintenance, hosting and support.

## 2. Market position and differentiation

Free substitutes include streaming-service browsing, asking ChatGPT, personal watchlists and asking a friend. These are the real comparison.

Existing specialist products also cover the idea. VoteFlix advertises link-based rooms, group voting and streaming filters; WatchChoice advertises filters, random choice and party voting. These are their product claims, not independently measured quality or adoption. [S1, S2]

Therefore, “AI movie recommendations” and “group voting” are not adequate differentiation by themselves.

| Opportunity | Why it may matter | How to test it |
| --- | --- | --- |
| Three purposeful choices | Reduces the work of comparing an endless list | Observe choices against the user's usual process |
| Arabic and English tonight-fit reasons | More usable for Emran's first audience | Test both flows with fluent readers |
| Transparent trade-offs | Users understand why a film fits and what might not | Ask whether the reason improved confidence |
| Curated emotional fit | Genre alone is a weak proxy for the desired experience | Compare mood tags with actual viewer reactions |
| Couple compromise | Two people need a shared decision | Start on one phone; measure joint acceptance |
| Honest regional availability | Incorrect provider claims destroy trust | Audit Qatar availability; measure failed checks |

These are hypotheses, not a moat. The eventual asset would be a well-reviewed catalog and evidence about successful decisions, acquired with permission.

### Interview first

Recruit 10–12 adults who watched films recently; include at least five pairs. Ask about their last real movie night: time spent deciding, rejected options, what finally got played and what would have made choosing easier. Do not ask only “would you use my app?”

Run five observed sessions with a rough prototype. Record time to a decision, rejection reasons and whether they actually watched the selected film. A couple is one decision-making unit, not two independent success observations.

## 3. MVP scope and user experience

### The complete first flow

1. Open a short landing page; no account or installation needed.
2. Pick language and confirm country. Country affects availability, not UI language.
3. Choose who is watching: solo, couple or friends on one device.
4. Select tonight's mood and up to three desired genres.
5. Choose maximum runtime and whether to allow a 10-minute overrun. Overrun defaults off.
6. Select streaming services or “I will check myself.” Unsupported services are clearly identified.
7. Choose familiar versus adventurous; optionally exclude watched titles and deal-breakers.
8. See up to three valid, distinct picks; one is the recommended starting point.
9. Choose one, replace one, mark seen, or change an input. Offer one small controlled refresh, not an infinite discovery feed.
10. Follow a verified provider link when available, or receive a clearly labelled “check availability” action.
11. Optional feedback: “Did you watch it?” and “Did it fit tonight?” No feedback is required to use the app.

Keep these as six short screens with combined controls rather than eight lengthy forms. Preserve answers when moving back. The advanced exclusions can be collapsed.

### Each result card needs

Title, year, runtime, original short hook, two concrete fit reasons, one relevant trade-off, availability status with country and check date, and a primary “Choose this” button. Visual design can use original typographic artwork and gradients; movie posters are not necessary for proving value.

Example reason: “Fits your 110-minute limit and your request for something light.” Use this only when both facts are known. Example trade-off: “More dialogue than action.” That requires a reviewed editorial tag.

### Requirement priorities

| ID | Requirement | Release condition |
| --- | --- | --- |
| R1 | Six-screen input flow and preserved answers | Prototype |
| R2 | Three ranked, non-duplicate picks where three eligible films exist | Prototype |
| R3 | Runtime, watched-list and explicit exclusions respected | Prototype |
| R4 | Evidence-based fit reasons and trade-offs | Prototype |
| R5 | English and Arabic UI with correct RTL layout | Alpha |
| R6 | Country/service input and honest availability states | Alpha |
| R7 | Choose, replace, seen and clear-history actions | Alpha |
| R8 | Anonymous or consented measurement and feedback | Beta |
| R9 | Simple couple input on one phone | Beta, if initial tests support it |
| R10 | Paid delivery and server-verified entitlements | Paid release only |

If only one or two valid titles remain, show those and explain why. If none remain, suggest one explicit filter adjustment. Never silently relax a runtime limit, content exclusion or service requirement.

### Deliberately deferred

Cross-device voting rooms, accounts, social network, full TV-series support, native apps, AI chat, voice, calendar planning, family-safety guarantees, scraped streaming catalogs, affiliate integrations and automatic subscriptions. A polished poster catalog is also deferred until image rights are settled.

Family mode is not part of the first public promise. A certification is not a guarantee that a film matches a family's cultural or personal standards. Later family features require reviewed content notes and clear unknown states.

## 4. Data strategy: resolve this before scale

### Recommended route within this budget

Use a small owned editorial catalog: selected factual metadata from Wikidata structured data, original hooks and mood tags reviewed by Emran, and original artwork. Wikidata's structured data is CC0; other page text and linked media have separate rules. Its CC0 status does not grant permission to reuse movie posters or copy another site's summaries. [S3]

Import a limited set during development, then store a reviewed version in the repository. Do not call a public Wikidata service on every recommendation. Follow its access guidance and identify automated requests appropriately. Missing or conflicting facts require review. [S4]

Start with 30 fully reviewed real titles for an alpha; expand to 60–100 only after seeing which moods and constraints cause coverage failures. These are coverage targets, not a substitute for checking actual eligible pools.

Codex may create synthetic fixtures immediately. They must be labelled as development data and must not appear as real movies in public results.

### Streaming availability is the expensive, changing part

For a tiny Qatar pilot, manually verify a limited subset through official provider pages or a consenting tester's own service account. Record service, country, subscription versus rent/buy, source link, date and reviewer. Do not borrow client credentials or automate extraction from streaming accounts.

A proposal for the pilot is to recheck availability weekly and hide the “verified” label after seven days. This expiry is a product policy, not a provider guarantee. Recheck before paid campaigns.

A service selection operates as a strict filter only when current reviewed data supports it. If there is no supported coverage, offer “continue without availability filtering” as a separate explicit choice. Show unknown availability as unknown; never default Qatar to US data.

**Important scope change:** this preserves the original service input but limits the first build to reviewed coverage. A fully automatic worldwide live catalog is outside the initial budget.

### API route only after permission and pricing are clear

TMDB says a project is commercial when its primary purpose is owner revenue; its developer API is free for non-commercial use with attribution. Our stated goal is selling this product, so a free beta does not automatically settle eligibility. Request written clarification or commercial terms before integrating its data into this business. [S5]

Its watch-provider endpoint gives country-level availability and a TMDB link rather than full direct streaming links; use requires JustWatch attribution. Check coverage and the precise allowed use before implementation. [S6]

Watchmode's published free tier is non-commercial. Its published Startup tier is USD 349/month, far beyond 92 QAR. Do not choose it for this launch. [S7]

Do not assume OMDb, IMDb, JustWatch unofficial endpoints or scraping are free commercial alternatives. An adapter can be coded against fixtures without authorizing real data use.

### Required provenance

Every catalog record has source URLs, retrieved dates, license category, editorial reviewer and review state. Images have their own separate license record. Data imported under a restricted API remains isolated; it is not made unrestricted by export into JSON.

Emran approves original editorial descriptions and mood labels. Codex can draft them, but cannot turn an unverified guess into a published fact.

### Provider clarification draft for Emran to send

Describe the Qatar-based commercial-intent project, expected pilot size, planned fields and images, countries, paid features, caching and attribution. Ask whether the free testing stage is permitted, what commercial terms apply, whether provider availability is included and how long data may be stored. Do not accept an unaffordable minimum commitment. No email has been sent as part of this report.

## 5. Recommendation engine specification

Use transparent rules first. A language model is unnecessary to filter and rank a reviewed catalog, and the app must work without an API key.

### Two-stage engine

**Stage A: eligibility.** Reject unreviewed records, unreleased titles, missing runtime when a cap is set, excluded IDs and verified excluded content. A strict service filter rejects unknown, expired or mismatched country/service records. When a requested content constraint is unknown, exclude that record rather than claiming it passes.

**Stage B: fit.** Normalize each available scoring component to 0–1 and compute a proposed initial score:

- Mood match: 35%.
- Desired genre match: 20%.
- Watching-context match: 20%.
- Familiar/adventurous preference: 15%.
- Reviewed editorial confidence: 10%.

These weights are starting hypotheses. Do not display them as a scientific probability of enjoyment. Externally copied aggregate ratings are not required.

Use a seeded tie-breaker so tests are repeatable. Apply a modest diversity penalty for three picks with identical genres or the same franchise; it can never override eligibility. “Surprise” chooses among eligible fits rather than random bad matches.

Generate reasons from matched evidence fields and reviewed templates. No spoilers, fabricated award claims or unsupported “on Netflix” assertions. Keep result history locally so repeated refreshes avoid already rejected choices when possible.

### Couple mode on one device

Each person supplies mood, genres and vetoes. Hard vetoes combine. Rank using the lower of the two fit scores, with average fit as a tie-breaker. This is a proposed compromise rule to test, not a claim of uniquely optimal social choice.

### Coverage test

Create at least 40 representative input cases: short comedy, long thriller, date night, solo surprise, conflicting tastes, many watched films, unsupported service, unknown runtime, expired availability and impossible constraints.

For each case inspect eligible count, reasons and diversity. Human review must confirm plausible matches; automated tests alone cannot prove good taste.

## 6. Architecture and services Codex needs

### Architecture by stage

| Stage | Runtime and storage | Reason |
| --- | --- | --- |
| Local prototype | Browser, checked-in catalog, localStorage | No signup, secrets or cash needed |
| Public alpha | Same static app on Cloudflare Workers Static Assets | Shareable HTTPS URL with a small deployment |
| Measured beta | Small Worker API and D1 only if shared events are needed | Controlled feedback and aggregate reporting |
| Paid web offer | Worker, D1, hosted checkout, license activation | Server-side access and refund handling |
| Later expansion | Licensed catalog provider and optional AI | Only if evidence and margins support them |

Cloudflare documentation currently lists static-asset requests as free and unlimited; requests running Worker code use the Worker allowance. Workers Free lists 100,000 requests daily and 10 milliseconds CPU per invocation. That is a service limit, not a recommendation to do large catalog ranking at the edge. [S8, S9]

Keep prototype ranking in the browser. Use a free workers.dev URL initially. Do not create a second deployment platform just for preview URLs.

| Service/tool | Needed now? | Initial cash | Owner action |
| --- | --- | --- | --- |
| Existing ChatGPT Plus / available Codex | Yes | Existing subscription | Use current access and limits; buy no additional AI plan |
| Local Node.js LTS, Git, editor | Yes | 0 QAR | Install only if missing |
| GitHub private repository | At project creation | Free account route | Create/connect under Emran's ownership |
| Cloudflare account | At public alpha | Free tier | Sign in and approve connection |
| Movie API key | No, with curated catalog | 0 QAR | Obtain written commercial permission before any future API use |
| Database | No for prototype | 0 QAR | Add D1 only when shared server data is justified |
| Analytics | Manual first | 0 QAR | Use a small consented test log; later aggregate events |
| Email platform | No | 0 QAR | Use a support address; avoid bulk outreach systems initially |
| Domain | Deferred | Unquoted | Buy only after evidence and renewal price fit |
| Payment provider | Paid release | Fees per sale, conditional approval | Complete own KYC, product review and payout setup |
| AI API | No | 0 QAR | Re-evaluate only after identifying a measurable benefit |
| VPS, n8n, Redis, vector DB | No | 0 QAR | Do not reuse Top Vision infrastructure |

ChatGPT and the API platform have separate billing. Plus does not provide a free production OpenAI API backend. This plan uses it for development and writing, within the user's existing limits. [S10]

### Why not a heavier stack

A full backend, account system or AI agent would increase setup, security work and recurring dependencies before demand is known. The first product is a decision tool. A static app is sufficient to test that experience.

## 7. Codex implementation handoff

### Suggested repository layout

```text
src/
  app/                 routes and page composition
  components/          input controls, progress, movie cards
  engine/              eligibility, ranking, diversification, reasons
  catalog/             schemas, validators and adapters
  i18n/                English and Arabic message dictionaries
  storage/             versioned local history and preferences
  analytics/           optional event interface; disabled by default
data/
  fixtures/            synthetic development records
  catalog.json         approved real records only
  provenance.json      sources, review dates and license notes
scripts/
  validate-catalog.ts
tests/
  engine/
  flows/
docs/
  PRODUCT_PLAN.md
  DATA_RIGHTS.md
  DECISIONS.md
  RELEASE_CHECKLIST.md
worker/                created later when justified
```

Do not scaffold every deferred directory with unused code. Put this report at docs/PRODUCT_PLAN.md when Emran creates the new project.

### Core data contracts

**Movie:** id; optional wikidataId; titles by locale; year; runtimeMinutes or null; genres; originalLanguage; originalHooks by locale; mood scores; context scores; adventure score; reviewed content flags using yes/no/unknown; editorialConfidence; reviewState; source references; optional image with independent rights.

**Availability:** movieId; countryCode; providerId; accessType; verifiedAt; expiresAt; sourceUrl; reviewer; optional permitted destinationUrl. A title/service/country combination is distinct from a global provider list.

**Input:** locale; countryCode; watchingMode; mood; preferredGenres; maxRuntimeMinutes; allowOverrun; providerIds; availabilityMode; adventurousness; excludedMovieIds; excludedContentFlags.

**Result:** movieId; rank; fitComponents; reasonKeys and evidence; tradeOffKey; availabilityState; catalogVersion; engineVersion. Do not send raw personal preferences in share URLs.

### Storage and privacy

Keep watched IDs, rejected IDs and settings on the device. Make “Clear my history” obvious. Explain that local history will not follow to another device. Use a schema version, migrations and graceful recovery from corrupted storage.

No phone number, date of birth, exact location or streaming login is required. Country is selected manually. Optional feedback contact details require consent and can be stored in Notion for the small private pilot.

### Configuration

Prototype needs no production secret. Keep only public options such as catalog mode, enabled locales and analytics enabled/disabled in front-end configuration. Never put a secret in a VITE_ variable.

If a backend is added, bind D1 to the Worker and keep provider tokens and webhook secrets in server secrets. Maintain a checked-in example with placeholders only. Do not request or print credentials in chat.

### Later API boundaries

- POST /api/events: allowlisted event name, version and anonymous session identifiers; reject arbitrary payloads.
- POST /api/feedback: bounded rating and optional short note; sanitize output.
- POST /api/license/activate: verify purchased license server-side and issue a bounded signed session.
- POST /api/webhooks/payment: verify signature over raw body, validate event and merchant/product, process idempotently.
- GET /api/entitlement: authoritative server check for paid features.

These routes are deferred design boundaries, not tasks for the initial prototype. Never unlock paid access through a client-side flag or a success-page URL.

### Tooling and test strategy

Use TypeScript strict mode; React and Vite; a small schema validator; Vitest for meaningful engine cases and Playwright for user flows. Resolve compatible current versions at setup and commit the lockfile.

Run type checking, lint, engine tests and a production build. Browser checks cover mobile widths, desktop, keyboard, Arabic RTL, long titles, empty results, offline catalog use and cleared/corrupted storage.

No runtime dependency on public movie APIs is allowed in curated mode. Network failure must not prevent local recommendations.

### Security and deployment

Use HTTPS; content security policy suitable for the chosen assets; safe external-link handling; escaped user content; no arbitrary URL fetch/proxy routes. Keep API inputs bounded and add rate limiting if public write endpoints exist.

Do not rely on local in-memory counters for global enforcement across edge instances. Use an appropriate shared mechanism when rate limiting becomes necessary. Turnstile is an optional abuse control for write endpoints, not a default obstacle to choosing a film.

Keep staging/test checkout separate from live checkout. Tag releases and record the deployed commit. A previous static build must be easy to redeploy. Do not connect to or modify any client database or live client system.

## 8. Build milestones and acceptance gates

Estimates below are working-session estimates, not delivery commitments. Assume one focused developer with Codex assistance; content review and recruitment are real work. If spending only six hours weekly, several milestones take more than a week.

| Milestone | Approximate effort | Deliverable and gate |
| --- | --- | --- |
| M0: Problem test and project setup | 4–6 hours | Interviews started; repository and plan ready; no purchase |
| M1: Vertical slice | 8–12 hours | Fixtures to inputs to three picks; no key required |
| M2: Real catalog and bilingual alpha | 10–16 hours | 30 reviewed titles; provenance, honest availability and RTL checks |
| M3: Observed pilot and fixes | 8–12 hours plus 14 days of observation | 20 decision units invited; failure reasons and returns recorded |
| M4: Paid offer preparation | 8–14 hours, only after gates | Approved offer, payment route, protected delivery and refund process |
| M5: Organic launch and operation | 3–5 hours weekly | Content, conversations, weekly metrics and support |

Total initial preparation and pilot effort is roughly 30–46 hours before paid-product work, plus observation time. Provider approval or catalog review can extend this.

### Go/no-go gates

**Gate A — problem:** at least six of ten interviews describe a recent meaningful choosing problem and at least five agree to test. These thresholds are experiment decisions, not market statistics.

**Gate B — value:** among at least 20 completed first sessions, at least 12 select a film; at least eight report actually watching it; at least five decision units return for another session within 14 days. Record both counts and denominators, and separate friends from new users.

**Gate C — paid demand:** after a useful beta, show a specific proposed offer to at least ten activated users. Seek at least three explicit commitments at the stated price before building substantial premium features. Commitments are not revenue.

**Gate D — paid release:** catalog rights documented, own seller route verified, checkout approved, actual premium deliverable ready, one sandbox purchase/refund/replay test passing and production instructions reviewed.

If Gate B fails, run one focused iteration addressing the observed cause. If two iterations and up to roughly 40–50 product-work hours still show weak value, pause expansion. Save learning and preserve cash.

## 9. Budget and spending rules

### Today's cash allocation

| Item | Authorized plan allocation now |
| --- | --- |
| Prototype and curated-data route | 0 QAR |
| Free hosting and repository | 0 QAR |
| Extra AI subscriptions or credits | 0 QAR |
| Ads and influencer payments | 0 QAR |
| Domain and paid email | 0 QAR |
| Cash reserve | **92 QAR** |

This is an allocation plan, not proof that all future costs are zero. Local hardware, existing internet and the already-paid subscription are assumed available.

Do not deposit the 92 QAR into another service simply to test it. Do not fund Claude Pro, an AI API or a recurring movie-data subscription for this experiment.

A future discretionary purchase has a hard combined ceiling of 30 QAR from the current cash, leaving at least 62 QAR reserved, and requires a demonstrated need plus Emran's explicit spending decision. This ceiling is not a claim that a suitable domain will cost 30 QAR.

Avoid enabling a paid tier with automatic overages. Set quota alerts where supported, and prefer a graceful unavailable state over an uncontrolled bill. Recheck plan limits before deployment.

### When revenue arrives

Keep reserves for refunds and fees; maintain a ledger. Reinvest only cash actually paid out, not dashboard sales awaiting release. Buy licensed data only when recurring gross margin covers it with room for failure.

## 10. Selling model and price experiments

Keep basic choosing useful for free. People already have free alternatives, so payment needs additional value beyond three recommendations.

### Offer order

| Option | Proposed test price | Assessment |
| --- | --- | --- |
| Original themed movie-night pack | 29 QAR one-off | First candidate if users like editorial curation |
| Premium couple experience, fixed 90-day access | 39 QAR | Candidate only after repeated couple use and working delivery |
| Ongoing subscription | 9–15 QAR/month hypothesis | Defer: recurring benefit and fees are unproven |
| White-label version for a business | Quote after discovery | Later route; different buyer and support burden |

A themed pack could provide six original themed nights, each with three film options, spoiler-free reasons, simple snack suggestions, conversation prompts and access to a lightweight picker. It does not include film files, pirated links or a promise of current streaming availability. The pack is optional validation of paying for curation; it does not replace testing the engine.

A paid 90-day couple offer should have a defined catalog, saved pair preferences, compromise mode and clear support/delivery terms. Cross-device profiles require actual server storage and recovery; do not advertise them before they exist.

No unlimited lifetime deal. No ad-supported business in the first release. Advertising revenue requires traffic, and sponsored picks could undermine trust.

### Proposed payment route

Lemon Squeezy lists Qatar among supported bank-payout countries. It is a candidate, not confirmation that Emran or this product will be approved. Complete identity, product and payout review. Confirm the legal seller and applicable Qatar requirements before taking payments; platform acceptance alone does not resolve them. [S11, S12, S13]

Do not assume a Rizon virtual card is a merchant payout account. Do not use Code Alarab's company, bank account or merchant identity without a separate explicit agreement about ownership, revenue, taxes and responsibilities.

If merchant or seller approval is blocked, continue a free beta and record purchase interest without charging. Do not take deceptive preorders.

### Illustrative economics, not revenue forecasts

For planning arithmetic only, use USD 1 = 3.64 QAR. Check actual settlement FX. A 29 QAR sale is about USD 7.97.

Lemon Squeezy's published fee example uses 5% + USD 0.50; international transactions add 1.5%, subscription payments add 0.5% and payout fees can apply. Tax treatment and other fees affect the result. [S14]

For a hypothetical 29 QAR card sale with no added tax, applying 6.5% plus 1.82 QAR yields about **25.30 QAR before payout fees, refunds, licensing, hosting and labor**.

| Sales of a 29 QAR offer | Gross | Illustrative subtotal after the above transaction fees |
| --- | --- | --- |
| 3 | 87 QAR | about 76 QAR |
| 10 | 290 QAR | about 253 QAR |
| 50 | 1,450 QAR | about 1,265 QAR |
| 200 | 5,800 QAR | about 5,059 QAR |

The final row is not 5,000 QAR of profit or a forecast. At 2% visitor-to-purchase conversion, 200 purchases require 10,000 relevant visitors; at 5%, 4,000. Those conversion rates are hypothetical, not expected benchmarks.

Published payouts have a USD 50 minimum and a delay/schedule. A few sales may not produce immediately spendable cash. [S15] This is another reason to protect the 92 QAR.

## 11. Advertising and customer acquisition

### Positioning to test

English: “Still deciding what to watch? Get three picks that fit tonight.”  
Arabic: “محتار شو تحضر الليلة؟ اختار جوّك ووقتك، وخذ ٣ اقتراحات تناسب سهرتك.”

Do not promise a 90-second decision until observations support it. Do not call the app an AI assistant when its released engine uses reviewed rules.

### First 20 testers

Invite five pairs and ten other adults through existing personal contacts; obtain feedback voluntarily. These are testers, not automatic customers. Use a short invitation that shows the use case and asks them to try it on a real movie night.

Ask community moderators before promotion. Do not mass-message scraped contacts. No outreach has been sent during this planning task.

### Four-week organic experiment after alpha

| Week | Action | Measurement |
| --- | --- | --- |
| 1 | Observed sessions and 2 short screen recordings | Started flows, decisions, actual viewing |
| 2 | 3 short videos: choosing friction, couple trade-off, Arabic demo | Tagged visits and completed sessions per video |
| 3 | Share in 2 relevant communities with permission; approach 5 small film creators personally | Qualified use and voluntary returns |
| 4 | Publish one honest case study; show a price offer to activated users | Paid interest, checkout starts and completed purchases if enabled |

Use original interface footage, spoken commentary and original graphics. Avoid copyrighted movie clips, unlicensed posters or borrowed music. A video can show the decision flow without displaying film footage.

Each video needs a single pain, a visible result and one call to action. Start with 15–30-second clips, but choose length based on clear demonstration rather than a claimed platform algorithm advantage.

Sample angles: “We spent longer choosing than watching”; “You want comedy; your partner wants suspense”; “Three choices for a short evening”; “Pick tonight's mood in Arabic.”

Use one landing page with the product promise, a short demo, actual limits, a prominent try button and feedback. Collect email only when there is a concrete reason and consent.

### Paid ads only later

No paid ads from the current 92 QAR. Once the product earns revenue and conversion is observed, test one creative, one audience and one small capped campaign funded by settled proceeds.

At the 29 QAR offer, an initial conservative acquisition-cost ceiling would be around 6 QAR per customer, a proposed internal target based on the illustrative margin. Paid traffic must earn its cost; views and likes are not sales.

Do not run affiliate payouts or buy influencer posts before tracking purchases and calculating margin. If tracking cannot attribute results reliably, do not scale spend.

## 12. Metrics, learning and measurement

Define the funnel consistently: visitor -> flow started -> results shown -> film selected -> viewing self-reported -> another session -> offer viewed -> checkout started -> verified paid order.

“Choose this” is not proof the film was watched. “Join waitlist” is not proof someone will pay.

| Metric | Definition | Action if weak |
| --- | --- | --- |
| Flow completion | Results shown / unique flow starts | Reduce friction or confusing inputs |
| Decision rate | Selected film / completed result sessions | Improve fit, trust and coverage |
| Decision time | Flow start to confirmed selection | Shorten controls and improve recommendation clarity |
| Viewing rate | Reported watched / completed sessions, with response rate also shown | Investigate why selection did not turn into use |
| 14-day repeat | Decision units with another session / eligible first-session cohort | Assess whether value recurs |
| Offer conversion | Verified buyers / activated users shown a defined offer | Review offer value, price and checkout |
| Availability failure | Incorrect or unusable verified claims / checked claims | Fix catalog and suspend affected filters |

Initially use a small Notion test log with consent: tester alias, segment, session date, chosen title, duration, watched response, availability failure and key note. No public names or screenshots.

If instrumenting, collect only bounded event properties, no raw viewing preferences or full URLs containing secrets. Deduplicate sessions and test traffic. Without consent for persistent identifiers, restrict analytics to aggregate counts and use consenting research cohorts for repeat measurement.

Record weekly decisions: what happened, what it means, what changes next. Do not inflate percentages from a tiny sample. These thresholds guide experiments; they do not establish statistical market proof.

## 13. Paid delivery and customer support

For a downloadable pack, hosted checkout can deliver the file after payment; no custom auth system is required. For a premium app, server-verified entitlements are mandatory.

A later app purchase flow can use a provider-generated license key from the receipt. Activation checks validity server-side and creates a secure, expiring session. Device limits, recovery, refund revocation and subscription expiry must be implemented according to provider capabilities. Never build your own password system for the first paid test.

Make the purchase page state price, currency, included features, duration, supported catalog/countries, delivery method and refund terms. Do not label unreleased features as included.

Choose a proposed seven-day satisfaction policy for the first digital offer, subject to the provider's process and applicable requirements. Record refunds, revoke access where appropriate and protect customer data. Publish a realistic support response commitment based on Emran's schedule; do not advertise 24/7 support.

Daily during launch: check broken links, failed activation and customer questions. Weekly: review availability, catalog gaps, fees and conversion. Keep a small incident log and disable a broken paid purchase button until delivery works.

## 14. Risks and responses

| Risk | Early signal | Response |
| --- | --- | --- |
| People like the idea but do not use it | Compliments with no real movie-night sessions | Observe behavior before expanding |
| Free substitutes are sufficient | One-off use and no repeat | Improve a specific problem or pause |
| Data rights exceed cash | Commercial quote or restricted free tier | Continue curated route; do not scrape around restrictions |
| Qatar availability coverage is poor | Frequent empty/incorrect service results | Narrow supported subset or require explicit no-filter mode |
| Mood tags feel generic | Picks pass genre checks but disappoint | Human curation and reviewed viewer feedback |
| Catalog too small | Repeated familiar titles or frequent fewer-than-three results | Add titles to measured gaps |
| Unknown content mislabeled | Vetoed material suggested | Unknown states; no family-safety claims |
| Subscription has weak recurrence | Users need it only occasionally | Test one-off offers first |
| Merchant/payout blocked | KYC, product rejection or no valid receiving account | Keep free beta; choose only verified seller route |
| Support consumes evenings | Repeated activation problems | Simplify delivery and cap experimental scope |
| Scope expands into “Jarvis” | Agent/chat/integration backlog grows | Keep the AI Operating System separate |
| Tuition pressure drives premature spending | Domain/ads/services before demand | Maintain reserve and service-income work |
| Free tier changes or exhausts | Quota warnings or request failures | Export owned data, cap writes, graceful degradation |

The highest risks are repeat use, paying demand and trustworthy catalog coverage. A model choice is not the highest-risk decision.

## 15. Founder and Codex responsibilities

**Emran:** select direction, recruit users, observe real sessions, review editorial content, confirm Qatar availability, own accounts, handle KYC and seller decisions, approve purchases and public marketing claims.

**Codex:** implement the agreed scope, generate draft content for review, validate data, automate meaningful tests, document decisions, prepare previews, diagnose failures and prepare deployment instructions.

**Together:** inspect the same outcome metrics, choose one next experiment and maintain a single canonical plan.

This report does not create a new Codex project, purchase anything, obtain credentials, contact providers, advertise the product or implement the app. Those steps begin in the project Emran will create.

## 16. First seven working sessions

1. Create the Codex project, attach this report and connect a new private repository. Implement synthetic fixtures and the smallest end-to-end flow.
2. Test eligibility, ranking and reasons. Confirm zero external keys are needed.
3. Add polished mobile controls, result actions and persistent local history.
4. Add English/Arabic UI; review RTL, text and keyboard behavior.
5. Prepare and review the first 30 real catalog records and availability subset.
6. Deploy an alpha on a free URL; run five observed sessions and repair major failures.
7. Review evidence; choose one improvement and recruit the remaining pilot cohort.

Interview recruitment starts alongside session one. A session is a block of work, not a promise that each deliverable fits one evening.

## 17. Copy-paste brief for the new Codex project

```text
Build Movie Night Engine using the attached report as docs/PRODUCT_PLAN.md.

Budget: 92 QAR available, with 0 QAR planned spending for the prototype.
Use existing Codex access. No purchases, paid API calls or extra subscriptions.
Do not touch any client infrastructure, Top Vision data or existing synced reference files.

First deliverable: a mobile-first React + TypeScript + Vite app that runs locally
without accounts, API keys, a database or any external movie-data request.
Use clearly marked synthetic fixtures until approved catalog data is available.

Implement six short input screens and up to three ranked distinct picks.
Respect runtime limits, explicit exclusions, watched history and verified
availability requirements. Handle fewer-than-three and zero matches honestly.
Use reviewed evidence templates for reasons. No invented metadata or availability.
Use original typographic artwork rather than unlicensed posters.

Separate eligibility, ranking, diversification and explanation code.
Create versioned local storage, clear-history, seen and replace actions.
Include English/Arabic dictionaries and correct RTL behavior.
Add meaningful engine tests, one complete browser flow, type checks and build checks.

Read repository instructions first. Record scope decisions and assumptions.
Keep secrets out of browser variables and committed files.
Do not integrate TMDB or another movie API until usage rights are documented.
Default to curated catalog mode; an adapter may use fixtures only.

Implement M1 as a working vertical slice, verify it, then report:
what works, how to run it, checks passed, gaps, and the next milestone.
Continue within the agreed scope; ask only for information or access truly required.
Defer payments, auth, group rooms and AI until their gates in this report are met.
```

## 18. Research notes and sources

External service facts were checked on 13 October 2026. Prices and terms can change; recheck before connecting or spending. Product strategy, weights, thresholds, prices and time estimates in this report are proposals and assumptions rather than market evidence.

**[N1] Original Notion idea:** [Movie Night Engine](https://app.notion.com/p/3f88a97009f081628e5fdfe1f19db5fc). Source of the original problem, inputs, three-pick output and deferred features.

**[S1] VoteFlix:** https://www.voteflix.net/ — competitor's stated workflow and features.  
**[S2] WatchChoice:** https://watchchoice.app/ — competitor's stated filtering, random-choice and party-voting features; search-retrieved product page.  
**[S3] Wikidata licensing:** https://www.wikidata.org/wiki/Wikidata:Licensing — structured-data licensing and separation from other text.  
**[S4] Wikidata data access:** https://www.wikidata.org/wiki/Wikidata:Data_access — access routes and responsible usage.  
**[S5] TMDB FAQ:** https://developer.themoviedb.org/docs/faq — commercial definition, developer use and attribution.  
**[S6] TMDB watch providers:** https://developer.themoviedb.org/reference/movie-watch-providers — country availability, destination links and JustWatch attribution.  
**[S7] Watchmode API pricing:** https://api.watchmode.com/ — current free/commercial distinctions and Startup price.  
**[S8] Cloudflare static asset billing:** https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/ — asset versus Worker requests.  
**[S9] Cloudflare Workers pricing:** https://developers.cloudflare.com/workers/platform/pricing/ — Free request and CPU allowances.  
**[S10] ChatGPT/API billing:** https://help.openai.com/en/articles/9039756-managing-billing-for-chatgpt-and-the-api-platform — separate billing systems.  
**[S11] Lemon Squeezy supported countries:** https://docs.lemonsqueezy.com/help/getting-started/supported-countries — Qatar bank-payout listing.  
**[S12] Lemon Squeezy activation:** https://docs.lemonsqueezy.com/help/getting-started/activate-your-store — merchant activation process.  
**[S13] Qatar MOCI business services:** https://www.moci.gov.qa/en/business-services — official starting point for seller and activity-specific requirements; this report does not establish Emran's eligibility.  
**[S14] Lemon Squeezy fees:** https://docs.lemonsqueezy.com/help/getting-started/fees — transaction, international, subscription and payout fee details.  
**[S15] Lemon Squeezy payouts:** https://docs.lemonsqueezy.com/help/getting-started/getting-paid — threshold and schedule.  
**[S16] Cloudflare D1 limits:** https://developers.cloudflare.com/d1/platform/limits/ — constraints for the optional later database.  
**[S17] Cloudflare Turnstile:** https://developers.cloudflare.com/turnstile/plans/ — optional later abuse-control plans.

### Decisions still needed, without blocking the prototype

- Whether Emran prefers the initial couples/friends segment after interviews.
- Which 30 titles and moods receive editorial approval.
- Which Qatar services can be honestly supported by the reviewed subset.
- Whether users value a one-off pack or a premium couple experience.
- Whether an approved seller, data and payout route can support the eventual offer.

**Current status: planning complete; implementation, validation and sales have not started.**

