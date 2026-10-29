# Score OS — live site feature inventory

**Source:** Public pages on https://scoresos.com fetched/rendered 2026-10-29 (America/New_York).  
**Method:** Playwright-rendered HTML for `/`, `/diy`, `/for-clients`, `/maxine`, `/login`; WebFetch for the same; marketing strings cross-checked in the public JS bundle `assets/index-C1Qwb0nq.js`.  
**Rule for the hologram preview:** Use only names and wording below. Do not invent features, prices, or outcome claims. Keep CROA-safe (no guaranteed results, scores, or deletions).

---

## Pages read

| Path | Status | Notes |
|------|--------|-------|
| `/` (home / Agency OS marketing) | Read | Full Arsenal, Scoreboard, Maxine section, pricing, CTAs, legal disclaimer |
| `/diy` | Read | DIY toolkit, Maxine bullets, Wall of Wins, $49.99 CTA |
| `/for-clients` | Read | Consumer credit-repair + mentorship services page |
| `/maxine` | Read (chat shell only) | Maxine chat UI; no additional public feature list beyond home |
| `/login` | Read | “Your Credit Repair Command Center” — no feature inventory |
| Privacy / Terms links | Linked from footer | Not fully scraped this pass (URLs: `/privacy`, `/terms`) |
| `#pricing` / `#about` | Anchors on home | Content lives on `/` |

### Could not fully read / not on public marketing

- **Logged-in product nav only** (visible in bundle nav config, not marketed on the public homepage): Score Command, Score Amplify, Score Capital, Score Connect, Score Marketplace, MARKETING OS (product module), Funding Application (`/funding-mortgage`), Lenders / Deals (marked `comingSoon`), Level Up Bookings, Phone / Email modules, HighLevel sync, SmartCredit API credential screens. These are **not** listed as homepage Arsenal cards — do not present them as public homepage features unless/until the live marketing site lists them.
- **Maxine chat** answers are dynamic; no static feature dump beyond the greeting.
- **SPA shell:** bare `curl` of HTML returns only the Vite shell (~1.4 KB). Content requires JS render (Playwright / WebFetch).

---

## Brand / positioning (home)

- Tagline shown: **CREDIT · MONITOR · WIN**
- Hero eyebrow: **THE OPERATING SYSTEM FOR CREDIT REPAIR AGENCIES**
- Headline (home): **The most powerful Credit Repair CRM you'll ever experience.**
- Subcopy: Everything a credit repair agency needs to launch, run, and scale — in one platform. Stop duct-taping ten different subscriptions together. Score OS runs your entire operation, all under your brand.
- DIY banner: **Introducing DIY OS** — Repair your own credit with the same AI tools the pros use — no agency needed. **$49.99/mo**

---

## THE ARSENAL (home) — canonical public feature set

Section kicker: **THE ARSENAL**  
Section title: **Everything you need to scale, in one playbook.**  
Lead: Every tool you need to run offense, defense, and special teams — no duct-taped subscriptions, no missing plays.

Also appears as the scrolling chip row under the hero (same names; last chip reads **Automations** on the chip row and **Tons of Automations** in the Arsenal cards).

| # | Feature name (exact) | Live description (exact) |
|---|----------------------|--------------------------|
| 1 | **Credit Monitoring** | Real-time 3-bureau credit monitoring built in, so you and your clients always know the score. |
| 2 | **Agency CRM** | Manage leads, clients, documents, and notes in one command center built for high-volume agencies. |
| 3 | **Marketing** | Built-in marketing tools to capture leads and turn them into signed, paying clients. |
| 4 | **Free Website** | A professional, conversion-ready website included free — your agency online and taking leads in minutes. |
| 5 | **3-Bureau Tracking** | Track disputes across Equifax, Experian, and TransUnion on one live scoreboard — no more spreadsheets. |
| 6 | **AI Dispute Engine** | Maxine reads each credit report and drafts unique, non-templated letters the bureaus can't auto-reject. |
| 7 | **White-Label Portal** | Your logo, your colors, your brand. Clients log into a premium portal that looks like you built it yourself. |
| 8 | **2-Way Messaging** | Secure two-way chat keeps every client conversation inside the platform, off your personal phone. |
| 9 | **Booking Calendar** | Let clients book consultations around the clock with a built-in scheduling calendar. |
| 10 | **Mentorship** | Learn from operators who've scaled — ongoing mentorship to help you grow your agency faster. |
| 11 | **Community** | Join a private community of credit repair owners leveling up and sharing wins together. |
| 12 | **Training Videos** | A full library of training videos to onboard fast and master every play in the platform. |
| 13 | **Support System** | A built-in support system so you're never stuck — real help exactly when you need it. |
| 14 | **Tons of Automations** | Smart automations handle the busywork — follow-ups, progress updates, and reminders on autopilot. |

---

## THE SCOREBOARD (home)

- Kicker: **THE SCOREBOARD**
- Title: **Watch every score climb in real time.**
- Lead: Three bureaus. One live scoreboard. Your clients see the wins rack up — and so do you.
- Bureaus named: **Equifax**, **Experian**, **TransUnion** (demo scores shown on live page are illustrative UI, not promises).

---

## Maxine / AI Dispute Engine (home “PROPRIETARY TECH”)

- Headline pair: **Templates get rejected. Maxine gets results.**
- Copy references bureaus’ **e-OSCAR** auto-rejection of generic templates; Maxine drafts unique letters.
- Bullet claims on live site:
  - Analyzes the specific negative item and account history
  - Drafts 100% unique, tailored dispute letters
  - Cites exact FCRA violations based on the finding
  - Forces manual review by human bureau agents
- **CROA note for preview:** Keep Maxine capability wording (unique letters, FCRA citations, analysis). Do **not** imply guaranteed deletions, approvals, score gains, or that letters will always force a human review or bypass systems. Prefer “built to…” / “designed to…” when paraphrasing outcome-heavy lines.

---

## CLIENT EXPERIENCE (home)

- **Your Brand. Not Ours.**
- When your clients log in to check their scores or read messages, they see your logo, your colors, and your agency's name. You own the relationship; we just power it.

---

## Pricing (home) — exact

Section: **Simple pricing. Infinite scale.**  
Lead: No hidden fees, no per-client charges. Run an agency — or repair your own credit.

### Agency OS — **$199/mo**
Cancel anytime. No long-term contracts.

- Unlimited Active Clients
- Unlimited AI Dispute Letters (Maxine)
- All 3 Bureaus Tracked
- Fully White-Labeled Client Portal
- Built-in Client Messaging
- Automated Monthly Progress Reports

CTA: **Subscribe Now — $199/mo** (Square checkout on live site)

### DIY OS — **$49.99/mo**
For individuals repairing their own credit — no agency needed.

- Your Own Secure Credit Portal
- AI Credit Audit & Action Plan
- Unlimited AI Dispute Letters (Maxine)
- All 3 Bureaus Tracked
- Secure ID & Document Uploads
- Score Progress Tracking

CTA: **Start DIY — $49.99/mo**  
Also: **Already paid? Sign up with your access code**

Closing CTA: **Ready to build a championship agency?** / Get Started Risk-Free / Do It Yourself — $49.99/mo

---

## DIY OS page (`/diy`) — THE TOOLKIT

- Headline: **Repair your credit. Own your future.**
- Sub: The same AI engine and live tracking used by elite credit repair agencies—now in your hands. Dispute errors, track all 3 bureaus, and watch your score climb.
- Toolkit cards:
  1. **Maxine AI Auditor** — Our AI scans your credit report line by line, finding every error, inconsistency, and violation to attack.
  2. **Unlimited Disputes** — Generate custom, non-templated dispute letters that bypass the bureaus' auto-rejection systems.
  3. **Live 3-Bureau Tracking** — Watch your Equifax, Experian, and TransUnion scores update in real time on one beautiful dashboard.
  4. **Secure Portal** — Upload your ID, proof of address, and documents directly to your encrypted personal vault.
- Extra Maxine bullets: Finds hidden errors in account history; Cites exact FCRA laws based on your situation; Generates unlimited customized letters; Tracks response deadlines automatically.
- Trust chips: Cancel anytime · No hidden fees

---

## For-clients page (`/for-clients`) — consumer services

Services:

1. **Credit Analysis** — A full review of your reports across all three bureaus to pinpoint every negative item holding you back.
2. **Dispute Management** — We challenge inaccurate, outdated, and unverifiable items — and track every dispute to resolution.
3. **Score Building** — Strategies to rebuild your profile with positive history, smart utilization, and lasting habits.
4. **Financial Mentorship** — 1-on-1 guidance so you understand your credit and keep it strong long after we're done.

Path: Enroll & Onboard → We Analyze → We Dispute → You Grow.

Trust chips: Secure & Confidential · All 3 Bureaus Tracked · Personal Mentorship · Proven Results  

**CROA note:** Page shows marketing stats (e.g. “500+ Clients Helped”, “120+ Avg. Point Gain”, “98% Satisfaction”) and testimonials with point gains. Treat as live-site marketing copy only — **do not** reuse as guaranteed results on the hologram preview. Prefer capability language over outcome guarantees.

Contact shown: (302) 273-0607 · admin@scoresos.com · 1309 Coffeen Avenue STE 1200, Sheridan, WY 82801

---

## Legal disclaimer (home footer — keep spirit on preview)

Educational / informational only; not legal advice; no attorney-client relationship; Score OS does not provide legal representation. Users must comply with applicable law. (Full text on live site under **Legal Disclaimer**.)

---

## Hologram preview mapping

- **Frosted cards:** All 14 Arsenal features (exact names + descriptions), plus optional DIY Toolkit / for-clients service cards clearly labeled by page source if shown.
- **Pricing block:** Agency OS $199/mo and DIY OS $49.99/mo with exact included bullets.
- **3D centerpiece:** Rising particle charts (sample Equifax / Experian / TransUnion lines + bars), upward arrows, capital-growth columns — **demo / sample numbers only**, labeled illustrative. Not a live bureau feed. Not a promise of funding approval.
- **Out of scope for cards:** Invented “funding guarantee”, product-nav-only Score Capital items, e-OSCAR “bypass” framed as a guarantee, testimonial point gains as promises.

