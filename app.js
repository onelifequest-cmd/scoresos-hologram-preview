/**
 * Score OS — The Wave
 * GPU particle tsunami + bloom + Runway cinematic handoff + GSAP/Lenis scroll
 * Preview only. Illustrative / CROA-safe.
 */
import * as THREE from 'three';
import { EffectComposer } from './vendor/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './vendor/postprocessing/UnrealBloomPass.js';
import { OutputPass } from './vendor/postprocessing/OutputPass.js';

const FEATURES = [
  { name: 'Credit Monitoring', desc: 'Real-time 3-bureau credit monitoring built in, so you and your clients always know the score.', num: 3, suffix: ' bureaus' },
  { name: 'Agency CRM', desc: 'Manage leads, clients, documents, and notes in one command center built for high-volume agencies.', num: 1, suffix: ' command center' },
  { name: 'Marketing', desc: 'Built-in marketing tools to capture leads and turn them into signed, paying clients.', num: 24, suffix: ' automations*' },
  { name: 'Free Website', desc: 'A professional, conversion-ready website included free — your agency online and taking leads in minutes.', num: 1, suffix: ' site included' },
  { name: '3-Bureau Tracking', desc: 'Track disputes across Equifax, Experian, and TransUnion on one live scoreboard — no more spreadsheets.', num: 3, suffix: ' bureaus live' },
  { name: 'AI Dispute Engine', desc: 'Maxine reads each credit report and drafts unique, non-templated letters the bureaus can\'t auto-reject.', num: 1, suffix: ' Maxine AI' },
  { name: 'White-Label Portal', desc: 'Your logo, your colors, your brand. Clients log into a premium portal that looks like you built it yourself.', num: 100, suffix: '% your brand' },
  { name: '2-Way Messaging', desc: 'Secure two-way chat keeps every client conversation inside the platform, off your personal phone.', num: 2, suffix: '-way chat' },
  { name: 'Booking Calendar', desc: 'Let clients book consultations around the clock with a built-in scheduling calendar.', num: 24, suffix: '/7 booking' },
  { name: 'Mentorship', desc: 'Learn from operators who\'ve scaled — ongoing mentorship to help you grow your agency faster.', num: 1, suffix: ' mentorship path' },
  { name: 'Community', desc: 'Join a private community of credit repair owners leveling up and sharing wins together.', num: 1, suffix: ' private community' },
  { name: 'Training Videos', desc: 'A full library of training videos to onboard fast and master every play in the platform.', num: 50, suffix: '+ lessons*' },
  { name: 'Support System', desc: 'A built-in support system so you\'re never stuck — real help exactly when you need it.', num: 1, suffix: ' support system' },
  { name: 'Tons of Automations', desc: 'Smart automations handle the busywork — follow-ups, progress updates, and reminders on autopilot.', num: 40, suffix: '+ flows*' },
];

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 720;
const COUNT = reduced ? 800 : (isMobile ? 14000 : 52000);

/* ---------- UI panels ---------- */
const grid = document.getElementById('panel-grid');
FEATURES.forEach((f, i) => {
  const el = document.createElement('article');
  el.className = 'glass-panel';
  el.dataset.idx = String(i);
  el.innerHTML = `
    <p class="panel-num" data-target="${f.num}">0${f.suffix}</p>
    <h3>${f.name}</h3>
    <p>${f.desc}</p>
    <span class="tag">Illustrative</span>`;
  grid.appendChild(el);
});

/* ---------- Three.js wave ---------- */
const canvas = document.getElementById('wave-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.78;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 2.2, 14);

const mouse = new THREE.Vector2(0, 0);
const mouseSmooth = new THREE.Vector2(0, 0);
let pointerActive = false;

const uniforms = {
  uTime: { value: 0 },
  uPhase: { value: 0 },       // 0 spark → 1 rise → 2 crash → 3 morph → 4 calm
  uAmp: { value: 0 },
  uMouse: { value: new THREE.Vector2(0, 0) },
  uMouseForce: { value: 0 },
  uPixelRatio: { value: renderer.getPixelRatio() },
  uSize: { value: isMobile ? 28 : 36 },
  uCrash: { value: 0 },
};

const vertexShader = /* glsl */`
uniform float uTime;
uniform float uPhase;
uniform float uAmp;
uniform vec2 uMouse;
uniform float uMouseForce;
uniform float uPixelRatio;
uniform float uSize;
uniform float uCrash;
attribute float aSeed;
attribute float aKind; // 0 wave body, 1 crest foam, 2 spark core
attribute vec3 aMorph; // morph target (letters / pillars / core)
varying float vHeight;
varying float vSeed;
varying float vKind;
varying float vDist;

float hash(float n){ return fract(sin(n)*43758.5453123); }

void main(){
  vSeed = aSeed;
  vKind = aKind;
  vec3 p = position;

  // Gerstner-ish multi-wave field
  float t = uTime;
  float x = p.x;
  float z = p.z;

  float w1 = sin(x * 0.28 + t * 1.4) * cos(z * 0.18 + t * 0.9);
  float w2 = sin(x * 0.55 - t * 1.1 + z * 0.22) * 0.55;
  float w3 = cos(x * 0.12 + z * 0.35 + t * 0.7) * 0.35;
  float crest = exp(-pow((z + 1.5) * 0.22, 2.0)) * 1.4;
  float waveY = (w1 + w2 + w3) * uAmp * (1.2 + crest);

  // Tsunami curl: lift front, fold over as crash rises
  float front = smoothstep(-10.0, 6.0, z);
  waveY += front * uAmp * 1.8 * uCrash;
  float curl = uCrash * front * sin(x * 0.4 + t) * uAmp * 0.8;
  p.y = waveY;
  p.z += curl * 0.6;
  p.x += curl * 0.25 * sin(aSeed * 6.28);

  // Cursor push / ripple
  vec2 md = p.xz - uMouse;
  float d = length(md);
  float ripple = sin(d * 2.2 - t * 6.0) * exp(-d * 0.55) * uMouseForce * 1.6;
  p.y += ripple;
  p.xz += normalize(md + 0.0001) * uMouseForce * exp(-d * 0.8) * 0.55;
  vDist = d;
  vHeight = p.y;

  // Spark phase: collapse toward origin with gold core particles
  float sparkMix = 1.0 - smoothstep(0.0, 0.35, uPhase);
  vec3 sparkPos = vec3(
    (hash(aSeed)-0.5) * 0.15,
    (hash(aSeed+1.3)-0.5) * 0.15,
    (hash(aSeed+2.1)-0.5) * 0.15
  );
  if (aKind > 1.5) {
    sparkPos *= 0.4;
  }
  p = mix(sparkPos, p, 1.0 - sparkMix * (aKind < 1.5 ? 1.0 : 0.2));

  // Morph: light skyline hints only — keep living rolling surface
  float morphT = smoothstep(2.6, 3.6, uPhase) * 0.28;
  p = mix(p, aMorph * 0.85 + p * 0.15, morphT);
  // Post-crash settle: keep Gerstner roll, slightly lower amp feel via y scale
  float settle = smoothstep(2.8, 3.6, uPhase);
  p.y *= mix(1.0, 0.78, settle);
  p.y += sin(x * 0.35 + t * 1.1 + aSeed) * 0.15 * settle;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float sizeBoost = 1.0 + uCrash * 0.25 + (aKind > 0.5 ? 0.25 : 0.0) + sparkMix * 1.4;
  sizeBoost *= mix(1.0, 0.72, settle);
  gl_PointSize = uSize * uPixelRatio * sizeBoost * (1.15 / -mv.z);
}
`;

const fragmentShader = /* glsl */`
precision highp float;
uniform float uPhase;
uniform float uCrash;
varying float vHeight;
varying float vSeed;
varying float vKind;
varying float vDist;

void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float r = length(uv);
  if (r > 0.5) discard;
  float soft = smoothstep(0.5, 0.08, r);

  // Brand palette — never white
  vec3 deep = vec3(0.055, 0.176, 0.102);
  vec3 green = vec3(0.102, 0.420, 0.235);
  vec3 gold = vec3(0.831, 0.686, 0.216);
  vec3 bright = vec3(0.92, 0.78, 0.28);

  float h = clamp(vHeight * 0.16 + 0.3, 0.0, 1.0);
  vec3 col = mix(deep, green, clamp(h * 1.2, 0.0, 1.0));
  col = mix(col, gold, smoothstep(0.45, 0.9, h) * 0.7);
  col = mix(col, bright, smoothstep(0.75, 1.15, h) * 0.35 + uCrash * 0.08);
  // Emerald bias kills bloom bleach
  col = mix(col, green, 0.32);

  if (vKind > 0.5) col = mix(col, gold, 0.55);
  if (vKind > 1.5) col = mix(gold, bright, 0.45);

  float spark = 1.0 - smoothstep(0.0, 0.4, uPhase);
  col = mix(col, bright, spark * (vKind > 1.0 ? 0.7 : 0.12));

  // Hard luminance cap — stay green/gold, never white fog
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  if (lum > 0.72) col *= 0.72 / lum;
  col = min(col, vec3(0.95, 0.86, 0.42));

  // After crash / calm: pull brightness down further
  float settle = smoothstep(2.6, 3.4, uPhase);
  col = mix(col, mix(green, gold, 0.45), settle * 0.28);
  col *= 1.0 - settle * 0.12;

  float alpha = soft * (0.5 + h * 0.4);
  alpha *= 0.85 + 0.15 * sin(vSeed * 40.0);
  alpha *= 1.0 + exp(-vDist * 0.6) * 0.25;
  alpha *= 1.0 - settle * 0.08;

  gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.92));
}
`;

function buildParticles() {
  const pos = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT);
  const kind = new Float32Array(COUNT);
  const morph = new Float32Array(COUNT * 3);

  // Morph targets: dispute-letter rectangles, 3 score pillars, funding skyline, core sphere
  for (let i = 0; i < COUNT; i++) {
    const s = Math.random();
    seed[i] = s;
    // Spatial distribution: denser near crest band
    const x = (Math.random() - 0.5) * 28;
    // Bias toward a crest sheet so the wave reads as a coherent tsunami, not random dots
    const z = (Math.random() - 0.5) * 18 + (Math.random() < 0.55 ? (Math.random() - 0.5) * 4 : (Math.random() * 6 - 1));
    const y = 0;
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;

    // kind: 5% spark core, 18% crest foam, rest body
    if (s < 0.05) kind[i] = 2;
    else if (s < 0.23) kind[i] = 1;
    else kind[i] = 0;

    // Morph destinations
    let mx, my, mz;
    const bucket = s;
    if (bucket < 0.22) {
      // Flying dispute letters — flat stacks
      const li = Math.floor(s * 40) % 8;
      const lx = (li % 4) * 2.2 - 3.3;
      const ly = Math.floor(li / 4) * 1.4 + 2.5;
      mx = lx + (Math.random() - 0.5) * 1.4;
      my = ly + (Math.random() - 0.5) * 0.9;
      mz = -2 + (Math.random() - 0.5) * 0.3;
    } else if (bucket < 0.45) {
      // Three bureau score pillars
      const pillar = Math.floor(s * 30) % 3;
      const px = (pillar - 1) * 3.2;
      const h = 2 + Math.random() * 5;
      mx = px + (Math.random() - 0.5) * 0.7;
      my = Math.random() * h;
      mz = 2 + (Math.random() - 0.5) * 0.7;
    } else if (bucket < 0.72) {
      // Funding skyline columns
      const col = Math.floor(Math.random() * 7);
      const cx = (col - 3) * 1.6;
      const ch = 1.5 + (col === 3 ? 6 : Math.random() * 4.5);
      mx = cx + (Math.random() - 0.5) * 0.55;
      my = Math.random() * ch;
      mz = 5 + (Math.random() - 0.5) * 0.8;
    } else {
      // Core sphere
      const phi = Math.random() * Math.PI * 2;
      const cost = Math.random() * 2 - 1;
      const sint = Math.sqrt(1 - cost * cost);
      const rad = 1.6 + Math.random() * 0.8;
      mx = Math.cos(phi) * sint * rad;
      my = cost * rad + 2.2;
      mz = Math.sin(phi) * sint * rad;
    }
    morph[i * 3] = mx;
    morph[i * 3 + 1] = my;
    morph[i * 3 + 2] = mz;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  geo.setAttribute('aKind', new THREE.BufferAttribute(kind, 1));
  geo.setAttribute('aMorph', new THREE.BufferAttribute(morph, 3));

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geo, mat);
}

const points = buildParticles();
scene.add(points);

// Soft ambient fill
scene.add(new THREE.AmbientLight(0x1a6b3c, 0.4));
const key = new THREE.PointLight(0xf4d96b, 2.5, 40);
key.position.set(0, 6, 4);
scene.add(key);

/* Bloom */
let composer;
let useComposer = true;
function buildComposer() {
  try {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      isMobile ? 0.22 : 0.32,
      0.28,
      0.9
    );
    bloom.threshold = 0.9;
    bloom.strength = isMobile ? 0.22 : 0.32;
    bloom.radius = 0.28;
    composer.addPass(bloom);
    window.__bloom = bloom;
    composer.addPass(new OutputPass());
  } catch (e) {
    console.warn('Bloom composer unavailable, falling back', e);
    useComposer = false;
  }
}
buildComposer();

/* Opening timeline */
const clock = new THREE.Clock();
let introDone = false;
const cinematic = document.getElementById('cinematic');

function runIntro() {
  if (reduced) {
    uniforms.uPhase.value = 4;
    uniforms.uAmp.value = 0.6;
    slamHeadline();
    return;
  }

  // Play Runway cinematic under / blended with live particles
  const tryPlay = () => {
    cinematic.classList.add('playing');
    const p = cinematic.play();
    if (p && p.catch) p.catch(() => {});
  };
  if (cinematic.readyState >= 2) tryPlay();
  else cinematic.addEventListener('canplay', tryPlay, { once: true });

  // Phase 0: dark spark (0–0.6s)
  // Phase 1: wave rises (0.6–1.8s)
  // Phase 2: crash (1.8–3.2s) + headline slam
  // Phase 3: morph (3.2–5s)
  // then handoff: fade cinematic, keep live wave calm-ish for scroll
  const tl = { t: 0 };
  const start = performance.now();

  function tickIntro() {
    const elapsed = (performance.now() - start) / 1000;
    if (elapsed < 0.5) {
      uniforms.uPhase.value = 0;
      uniforms.uAmp.value = 0.05;
      uniforms.uCrash.value = 0;
    } else if (elapsed < 1.6) {
      const k = (elapsed - 0.5) / 1.1;
      uniforms.uPhase.value = k;
      uniforms.uAmp.value = 0.2 + k * 2.4;
      uniforms.uCrash.value = k * 0.35;
    } else if (elapsed < 3.0) {
      const k = (elapsed - 1.6) / 1.4;
      uniforms.uPhase.value = 1 + k;
      uniforms.uAmp.value = 2.6 + k * 0.8;
      uniforms.uCrash.value = 0.35 + k * 0.9;
      if (elapsed > 2.2 && !introDone) {
        introDone = true;
        slamHeadline();
      }
    } else if (elapsed < 4.5) {
      const k = (elapsed - 3.0) / 1.5;
      // Soften crash into living crest — phase stays ~2.1–2.6 (pre-fog)
      uniforms.uPhase.value = 2.0 + k * 0.55;
      uniforms.uAmp.value = 2.8 - k * 0.35;
      uniforms.uCrash.value = 1.0 - k * 0.7;
      if (window.__bloom) {
        window.__bloom.strength = (isMobile ? 0.22 : 0.32) * (1 - k * 0.45);
      }
      cinematic.classList.add('fade-out');
      cinematic.classList.remove('playing');
    } else {
      uniforms.uPhase.value = 2.55;
      uniforms.uAmp.value = 2.35;
      uniforms.uCrash.value = 0.22;
      if (window.__bloom) window.__bloom.strength = isMobile ? 0.18 : 0.24;
      cinematic.pause();
      return;
    }
    requestAnimationFrame(tickIntro);
  }
  requestAnimationFrame(tickIntro);

  // Safety slam
  setTimeout(() => { if (!introDone) { introDone = true; slamHeadline(); } }, 2800);
}

function slamHeadline() {
  document.querySelector('.headline')?.classList.add('slam');
  document.querySelectorAll('.reveal-hero').forEach((el, i) => {
    setTimeout(() => el.classList.add('show'), 120 + i * 90);
  });
}

/* Pointer */
window.addEventListener('pointermove', (e) => {
  pointerActive = true;
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}, { passive: true });
window.addEventListener('pointerleave', () => { pointerActive = false; });

/* Resize */
window.addEventListener('resize', () => {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  if (composer) composer.setSize(w, h);
  uniforms.uPixelRatio.value = renderer.getPixelRatio();
});


function updateWaveDim() {
  const root = document.getElementById('wave-root');
  if (!root || !introDone) return;
  const y = window.scrollY || 0;
  const vh = window.innerHeight || 1;
  if (y > vh * 3.2) root.classList.add('calmed');
  else root.classList.remove('calmed');
  if (y > vh * 0.85) root.classList.add('dimmed');
  else root.classList.remove('dimmed');
}

/* Scroll: Lenis + IntersectionObserver (stable; avoids GSAP/Lenis parent bugs) */
let scrollPhase = 0;

function animateCount(num) {
  if (!num || num.dataset.done) return;
  num.dataset.done = '1';
  const target = parseFloat(num.dataset.target || '0');
  const suffix = (num.textContent.match(/[^\d.]+$/) || [''])[0];
  const start = performance.now();
  const dur = 1200;
  function tick(now) {
    const k = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - k, 3);
    const v = target * eased;
    num.textContent = (Number.isInteger(target) ? Math.round(v) : Math.round(v)) + suffix;
    if (k < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function drawEnergyLines() {
  const svg = document.getElementById('energy-lines');
  if (!svg || !grid) return;
  const panels = [...grid.querySelectorAll('.glass-panel.in')];
  const gr = grid.getBoundingClientRect();
  if (gr.width < 10 || panels.length < 2) return;
  // Position SVG over the arsenal section (not just grid box) for full coverage
  const arsenal = document.getElementById('arsenal');
  const ar = arsenal.getBoundingClientRect();
  const w = ar.width;
  const h = Math.max(gr.height + 80, ar.height);
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.style.position = 'absolute';
  svg.style.width = w + 'px';
  svg.style.height = h + 'px';
  svg.style.left = '0';
  svg.style.top = '0';
  svg.style.zIndex = '3';
  svg.style.pointerEvents = 'none';
  let html = '';
  for (let i = 0; i < panels.length - 1; i++) {
    const a = panels[i].getBoundingClientRect();
    const b = panels[i + 1].getBoundingClientRect();
    const x1 = a.left + a.width / 2 - ar.left;
    const y1 = a.top + a.height / 2 - ar.top;
    const x2 = b.left + b.width / 2 - ar.left;
    const y2 = b.top + b.height / 2 - ar.top;
    const mx = (x1 + x2) / 2 + ((i % 2) ? 40 : -40);
    const my = (y1 + y2) / 2;
    html += `<path d="M${x1},${y1} Q${mx},${my} ${x2},${y2}" fill="none" stroke="url(#eg)" stroke-width="3" opacity="1"/>`;
    html += `<circle cx="${x1}" cy="${y1}" r="4.5" fill="#F4D96B" opacity="0.9"><animate attributeName="opacity" values="0.45;1;0.45" dur="1.6s" repeatCount="indefinite"/></circle>`;
  }
  const last = panels[panels.length - 1].getBoundingClientRect();
  const lx = last.left + last.width / 2 - ar.left;
  const ly = last.top + last.height / 2 - ar.top;
  html += `<circle cx="${lx}" cy="${ly}" r="4.5" fill="#F4D96B" opacity="0.9"/>`;
  svg.innerHTML = `<defs><linearGradient id="eg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#1A6B3C"/><stop offset="50%" stop-color="#F4D96B"/><stop offset="100%" stop-color="#D4AF37"/></linearGradient></defs>${html}`;
}

const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target;
    if (el.classList.contains('glass-panel')) {
      el.classList.add('in');
      animateCount(el.querySelector('.panel-num'));
      drawEnergyLines();
    }
    if (el.id === 'funding') {
      document.querySelectorAll('.sky-col').forEach((c, i) => setTimeout(() => c.classList.add('in'), i * 80));
    }
    if (el.id === 'finale' || el.id === 'finale-core') {
      document.getElementById('finale-core')?.classList.add('in');
    }
  });
}, { threshold: 0.05, rootMargin: '20% 0px 10% 0px' });

document.querySelectorAll('#panel-grid .glass-panel, #funding, #finale, #finale-core').forEach((el) => io.observe(el));

// Pre-arm first 4 panels so the arsenal never opens empty
[...grid.querySelectorAll('.glass-panel')].slice(0, 4).forEach((el, i) => {
  setTimeout(() => {
    el.classList.add('in');
    animateCount(el.querySelector('.panel-num'));
    drawEnergyLines();
  }, 400 + i * 120);
});

document.querySelectorAll('.diy .glass-panel, .pricing .glass-panel').forEach((el) => el.classList.add('in'));

window.addEventListener('scroll', () => { if (grid) drawEnergyLines(); }, { passive: true });
window.addEventListener('resize', () => { if (grid) drawEnergyLines(); }, { passive: true });

if (!reduced && window.Lenis) {
  try {
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    function lenisRaf(time) { lenis.raf(time); requestAnimationFrame(lenisRaf); }
    requestAnimationFrame(lenisRaf);
    lenis.on('scroll', ({ progress }) => {
      updateWaveDim();
      // Map page scroll into wave morph once intro is done
      if (!introDone) return;
      const arsenal = document.getElementById('arsenal');
      if (!arsenal) return;
      const rect = arsenal.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = 1 - Math.min(1, Math.max(0, rect.bottom / (rect.height + vh)));
      scrollPhase = p;
    });
  } catch (e) {
    console.warn('Lenis init skipped', e);
  }
}

window.addEventListener('scroll', () => {
  updateWaveDim();
  if (!introDone) return;
  const arsenal = document.getElementById('arsenal');
  if (!arsenal) return;
  const rect = arsenal.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  scrollPhase = 1 - Math.min(1, Math.max(0, rect.bottom / (rect.height + vh)));
}, { passive: true });

/* Main loop */
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  uniforms.uTime.value = t;

  mouseSmooth.lerp(mouse, 0.08);
  // Project NDC mouse into wave XZ roughly
  uniforms.uMouse.value.set(mouseSmooth.x * 10, mouseSmooth.y * 6);
  uniforms.uMouseForce.value = THREE.MathUtils.lerp(
    uniforms.uMouseForce.value,
    pointerActive ? 1.0 : 0.15,
    0.06
  );

  // Scroll-driven morph deepen
  if (introDone) {
    // Stay in living-crest band (≈2.4–2.9); never fog/white morph
    const targetPhase = 2.45 + scrollPhase * 0.4;
    uniforms.uPhase.value += (targetPhase - uniforms.uPhase.value) * 0.035;
    const targetAmp = 2.35 - scrollPhase * 0.35;
    uniforms.uAmp.value += (targetAmp - uniforms.uAmp.value) * 0.035;
    uniforms.uCrash.value += (0.18 - uniforms.uCrash.value) * 0.03;
  }

  camera.position.x = mouseSmooth.x * 0.6;
  camera.position.y = 2.2 + mouseSmooth.y * 0.3;
  camera.lookAt(0, 1.2, 0);

  key.intensity = 1.1 + Math.sin(t * 1.5) * 0.2 + uniforms.uCrash.value * 0.45;

  if (useComposer && composer) composer.render(); else renderer.render(scene, camera);
}
animate();
runIntro();

// Lazy: if cinematic sources 404, ignore
cinematic.addEventListener('error', () => {
  cinematic.classList.remove('playing');
});
