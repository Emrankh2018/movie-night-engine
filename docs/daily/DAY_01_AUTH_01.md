# Day 01 / AUTH-01 — 14 October 2026

Status: **IN PROGRESS — physical Android test and natural live token-renewal proof pending.** This receipt must not be read as completed acceptance. Today is limited to the roadmap's Day 01 account proof. Spending: 0 QAR; 92 QAR reserve preserved.

## Authorization and setup

- The owner started Day 01 and selected their Android phone on the same trusted Wi-Fi.
- The owner explicitly approved a temporary private LAN HTTPS origin, its exact Supabase callback and a public test CA to be personally installed/trusted on Android, then removed after testing.
- The existing Supabase project `vvwzqehzamkflrokrcqs` was freshly verified ACTIVE_HEALTHY. No database schema, project-wide JWT lifetime, Site URL, production deployment or branching setting was changed.
- Only the temporary exact HTTPS callback was added to the existing two loopback redirects. No wildcard was added. The actual private address, CA fingerprint, screenshots and keys stay in ignored `.tmp/`; they are not user-data artifacts committed to Git.
- A short-lived CA (two days) and server certificate (one day) were generated with already-installed OpenSSL. Private-key directory access is restricted to the current Windows user and SYSTEM. No certificate was installed into Windows system trust. Android certificate installation is an owner handoff, not an automated phone operation.
- `scripts/day01-lan-preview.mjs` binds only the supplied private IPv4, serves production `dist` over HTTPS, offers only the public CA on its HTTP bootstrap port, and stops after two hours. It does not proxy auth, log request URLs/bodies, expose source/private files or start a public tunnel. No firewall rule was changed.

## Checks passed so far

| Check | Evidence |
| --- | --- |
| HTTPS preflight | A client using the generated CA verified the certificate chain/IP; app and OAuth callback returned 200 |
| Preview boundaries | Environment/private-key/source/traversal probes returned 404; POST returned 405; HTTP bootstrap served only its public setup page/CA |
| Production build | Typecheck and Vite build passed; app source/design/dictionaries unchanged |
| Regression | 44 Chromium phone/desktop checks passed, including a new expired-session SDK contract for both synthetic owners; typecheck and lint passed |
| Test isolation | E2E bundles now build under `.tmp/e2e-dist`; tests leave the live production `dist` and public configuration untouched |
| Session restoration observation | A fresh same-origin app tab restored a saved session with successful auth-user and diary-read responses, without new Google sign-in. Only sanitized method/path/status metadata was retained; no tokens, headers, request bodies or full query URLs were saved |

The expired-session browser contract uses deliberately invalid synthetic tokens and a mocked API. It exercises the real SDK's refresh path, confirms the same owner after renewal/reload, and confirms removal of local auth after sign-out. It is not proof of a naturally expired live session or a physical device. The fresh live tab restored a different profile from the intended previous owner test; selection/consent for today's exact account remains pending, so no private diary mutation was performed by the agent for that profile.

## Physical-device acceptance — pending

The owner reported `ERR_ADDRESS_UNREACHABLE` on Android. A fresh computer check confirmed both temporary listeners are running, the approved Wi-Fi address is unchanged and the network is Private. Local firewall configuration contains enabled inbound Private-network rules for the actual Node executable. CIM application-filter inspection required unavailable administrator access; subsequent read-only `netsh` inspection confirmed the enabled TCP allow rule and found no matching enabled inbound block rule for this preview. A separate Codex offline-sandbox block applies to another Windows account, not the preview's owner; it was preserved. No firewall or router configuration was changed. The owner confirmed VPN is off and supplied a phone IPv4 in the computer's configured /24 subnet. The computer's neighbor table reported that address Reachable; two ICMP probes received no reply. Neither observation proves phone-to-server HTTP access or uniquely identifies the phone. A screenshot first showed HTTPS on the HTTP bootstrap port, but the correct HTTP retry also failed, and the owner reported another installed browser could not reach it. The computer's own bootstrap request returned HTTP 200. Exact Wi-Fi-name confirmation and a read-only phone-to-router reachability check remain pending. Chromium defines this error as an unreachable address, usually with no route to the host/network ([source](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/net/base/net_error_list.h)).

The owner subsequently confirmed that the router page opens on the phone. The preview was restarted with temporary remote TCP-arrival counters to distinguish accepted server connections from failures before Node accepts a socket. These log only aggregate counts, protocol labels and event times, never peer identifiers, URLs, headers or bodies. The restart retained the original automatic shutdown deadline, rather than granting another two-hour window. CA-verified HTTPS/file-boundary preflight and lint passed after this helper change. The owner retried the HTTP bootstrap while the counter was active and reported the same error; no remote TCP arrival was logged before or after that report. This locates the failure before Node accepts a connection, but does not distinguish Wi-Fi isolation, routing or an earlier host filter. Exact phone Wi-Fi-name confirmation and router model are pending for a targeted read-only isolation check. No firewall/router change or network-security bypass was made.

Use the owner-confirmed Google account on both devices. Work with one clearly identified fictional Day 01 test night; preserve pre-existing guest/account records.

1. Owner installs the approved public CA on Android and confirms the HTTPS app opens without a warning. Do not bypass a certificate warning.
2. Sign in on Android with the confirmed account. Choose one fictional pick; record its title and chosen timestamp without marking it watched.
3. On the computer, refresh My Movie Nights and verify the same title/status/date. Reload both devices and confirm persistence.
4. Change that test night's viewing status/date on one device; refresh the other and verify it. Undo and verify the reverse direction. Chosen and Watched dates remain separate.
5. Sign out on the phone: private rows disappear and reload stays signed out; the computer's separate session/diary stays available. If a second already-consenting personal account is used, its diary must not expose the first owner's rows.
6. Observe a natural live SDK renewal and successful owned diary access without Google reauthentication. Keep only sanitized endpoint/status/event times; do not change global expiry, forge a token or print session credentials.
7. With action-time approval for that specific disposable night, remove it and verify the other device sees the deletion. Do not clear unrelated history.

Record physical results as owner-reported where the agent cannot observe the phone; server evidence and the computer browser can corroborate them. Do not mark physical acceptance from browser device emulation alone.

## Cleanup / next handoff — pending until testing ends

- Stop the two LAN listeners (or verify their two-hour automatic shutdown).
- Remove only the temporary callback, retaining both original loopback redirects and the unchanged Site URL. Verify the resulting list.
- Owner removes only the Day 01 CA from Android's user-installed trusted certificates. Preserve other certificates/credentials.
- Dispose of only the generated private test keys after the preview has stopped; preserve app/environment/history and sanitized receipts.
- Update this receipt with actual live outcomes, cleanup proof, any unresolved gap and the verified GitHub commit. Day 02 remains prepared-only until Day 01 acceptance is complete or the owner explicitly chooses to defer its remaining tests.

References: [Supabase sessions](https://supabase.com/docs/guides/auth/sessions), [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), [secure UUID contexts](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID), [Android certificate settings](https://support.google.com/pixelphone/answer/2844832). Phone menus vary; use the CA-certificate option for this local HTTPS test rather than guessing from a different manufacturer's menu.
