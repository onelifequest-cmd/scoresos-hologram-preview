# Score OS — The Wave (hologram preview)

**Preview only** · noindex · not live scoresos.com · CROA-safe illustrative demo.

Live URL: https://scoresos-hologram-preview.onrender.com

## Concept
Patrick-approved **"The Wave"**: dark quiet → Maxine gold spark → green/gold GPU particle tsunami (Three.js shaders + UnrealBloomPass, cursor ripple) → morph into letters / scores / capital skyline → CROA-safe headline slam. Runway cinematic intro (nano-banana → gen-4-turbo) blends then hands off to live particles. Scroll: Arsenal glass panels from FEATURES.md, funding skyline ("Built for the road to funding"), finale Score OS gold core → Agency $199 / DIY $49.99.

## Stack
- Vanilla Vite-static (no build required for static host)
- Three.js r170 + EffectComposer / UnrealBloomPass (vendored)
- Lenis smooth scroll + IntersectionObserver panel reveals
- GSAP/ScrollTrigger vendored (optional; panels use IO for stability)
- Runway intro: `media/wave-intro.{mp4,webm}` + poster

## Deploy
Static site on Render service `scoresos-hologram-preview` (srv-dbhdspo473hc739ngg6g). Push to `main` auto-deploys. Do **not** touch production scoresos.com DNS.

## Credits
See `credit-log.txt`. Opening 1032 → closing 974 (58 used, under 150 cap).

## Captures
`screenshots/wave-d-*.png`, `wave-m-*.png`, `wave-recording.mp4`
