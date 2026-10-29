# Score OS homepage — hologram / Hellon-style 3D preview

Static preview only. **Do not deploy to or change live scoresos.com.**

- Local path: `/workspace/projects/scoresos-homepage/hologram-preview/`
- noindex + `robots.txt` Disallow
- Brand: deep green `#0E2D1A` / `#050a07`, green `#1A6B3C`, gold `#D4AF37` / `#F4D96B`, mint `#E8F4ED`, Inter, logo text "Score OS"
- Copy and pricing pulled from `/workspace/projects/scoresos-homepage/content.md` (live-site facts, CROA-safe)

## What's interactive

1. **Three.js particle vortex** — green/gold particles form a holographic credit-score gauge ring; swirls on its own
2. **Cursor parallax + tilt** — perspective shifts with the pointer (Hellon-like)
3. **Drag to spin** — drag near the gauge to rotate the neon rings
4. **Gyro / auto-motion** — on touch devices that keep WebGL, device orientation or gentle idle sway
5. **Scroll** — frosted-glass feature cards fade/slide in; sample score climbs; neon ornament rotates
6. **Video fallback** — phones / low-power / `prefers-reduced-motion` / Save-Data swap in `media/hero.{webm,mp4}` (lazy-injected, not on first desktop load)

## Links (confirmed live)

| Label | URL |
|-------|-----|
| Login | https://scoresos.com/login |
| Pricing | https://scoresos.com/#pricing |
| Info | https://scoresos.com/#about |
| Agency checkout | Square Agency OS $199/mo |
| DIY checkout | Square DIY OS $49.99/mo |
| Maxine | https://scoresos.com/maxine |

## Hosting

Public GitHub repo + Render static site (`onrender.com`), free, noindex. Sibling to `scoresos-video-hero-preview` and `scoresos-interactive-ai-preview`.

Does not touch scoresos.com DNS or the Replit production app.

## Live preview URL

- https://scoresos-hologram-preview.onrender.com
- GitHub: https://github.com/onelifequest-cmd/scoresos-hologram-preview
