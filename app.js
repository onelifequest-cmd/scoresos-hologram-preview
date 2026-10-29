/**
 * Score OS hologram preview
 * Three.js particle rising credit-score charts + funding columns
 * Cursor parallax / drag-to-rotate / gyro or auto-motion fallback
 * Mobile / low-power / reduced-motion → looping hero video
 */
import * as THREE from './vendor/three.module.min.js';

(function () {
  'use strict';

  const GOLD = new THREE.Color(0xf4d96b);
  const GREEN = new THREE.Color(0x1a6b3c);
  const MINT = new THREE.Color(0x8fd9a8);
  const DEEP = 0x050a07;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const narrow = matchMedia('(max-width: 760px)').matches;
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = !!(conn && conn.saveData);
  const lowMem = navigator.deviceMemory && navigator.deviceMemory <= 4;
  const prefersVideo = reduceMotion || saveData || (coarse && narrow) || lowMem ||
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && matchMedia('(max-width: 900px)').matches;

  if (reduceMotion) document.body.classList.add('reduce-fx');

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('primaryNav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Open menu');
    }));
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Sample scoreboard HUD (illustrative) ---------- */
  const baseScores = { eq: 620, ex: 635, tu: 608 };
  const peakScores = { eq: 745, ex: 752, tu: 729 };
  function setBureauScores(t) {
    const clamp = Math.min(1, Math.max(0, t));
    ['eq', 'ex', 'tu'].forEach((k) => {
      const v = Math.round(baseScores[k] + (peakScores[k] - baseScores[k]) * clamp);
      const delta = v - baseScores[k];
      const el = document.querySelector(`[data-bureau="${k}"]`);
      const dEl = document.querySelector(`[data-delta="${k}"]`);
      if (el) el.textContent = String(v);
      if (dEl) dEl.textContent = (delta >= 0 ? '+' : '') + delta;
    });
  }
  setBureauScores(0);

  /* ---------- Scroll ornament + score climb ---------- */
  const scrollHolo = document.getElementById('scrollHolo');
  const scrollHoloCore = document.getElementById('scrollHoloCore');
  function onScrollFx() {
    const y = window.scrollY || 0;
    const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const t = y / max;
    if (scrollHolo) {
      scrollHolo.style.transform = `translateY(${t * -60}px)`;
      scrollHolo.style.opacity = String(0.35 + Math.sin(t * Math.PI) * 0.4);
    }
    if (scrollHoloCore) {
      scrollHoloCore.style.transform = `scale(${0.85 + t * 0.35})`;
    }
    const arsenal = document.getElementById('arsenal');
    if (arsenal) {
      const r = arsenal.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      if (r.top < vh * 0.92 && r.bottom > 0) {
        const prog = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.85 + r.height * 0.35)));
        setBureauScores(prog);
      }
    }
  }
  window.addEventListener('scroll', onScrollFx, { passive: true });
  onScrollFx();

  /* ---------- Video fallback path ---------- */
  function enableVideoFallback() {
    document.body.classList.add('use-video');
    const wrap = document.getElementById('videoFallback');
    if (!wrap) return;
    wrap.hidden = false;
    if (wrap.querySelector('video')) return;
    const v = document.createElement('video');
    v.autoplay = true;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.preload = 'metadata';
    v.setAttribute('aria-hidden', 'true');
    const s1 = document.createElement('source');
    s1.src = 'media/hero.webm';
    s1.type = 'video/webm';
    const s2 = document.createElement('source');
    s2.src = 'media/hero.mp4';
    s2.type = 'video/mp4';
    v.appendChild(s1);
    v.appendChild(s2);
    wrap.insertBefore(v, wrap.firstChild);
    const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    if (v.readyState >= 2) play();
    else v.addEventListener('loadeddata', play, { once: true });
  }

  if (prefersVideo) {
    enableVideoFallback();
    return;
  }

  /* ---------- WebGL rising particle charts ---------- */
  const canvas = document.getElementById('holoCanvas');
  if (!canvas) { enableVideoFallback(); return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (e) {
    enableVideoFallback();
    return;
  }
  if (!renderer.getContext()) { enableVideoFallback(); return; }

  renderer.setClearColor(DEEP, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0.4, 0.55, 7.2);

  const root = new THREE.Group();
  scene.add(root);

  // Sample climb curves for three bureau lines (normalized 0..1 over x)
  function sampleLine(kind, x) {
    // x in [0,1]; returns height 0..1 that climbs
    const waves = {
      eq: (t) => 0.18 + 0.72 * Math.pow(t, 0.85) + 0.04 * Math.sin(t * 9),
      ex: (t) => 0.22 + 0.70 * Math.pow(t, 0.9) + 0.05 * Math.sin(t * 7 + 1),
      tu: (t) => 0.15 + 0.68 * Math.pow(t, 0.8) + 0.045 * Math.sin(t * 8 + 2),
    };
    return Math.min(1, Math.max(0, waves[kind](x)));
  }

  const LINE_COLORS = { eq: GOLD, ex: MINT, tu: GREEN };
  const lineKinds = ['eq', 'ex', 'tu'];
  const PARTICLE_BUDGET = coarse ? 5200 : 9800;

  // Allocate particles across: 3 line charts, bar columns, arrows, ambient mist
  const linePts = Math.floor(PARTICLE_BUDGET * 0.42);
  const barPts = Math.floor(PARTICLE_BUDGET * 0.28);
  const arrowPts = Math.floor(PARTICLE_BUDGET * 0.12);
  const mistPts = PARTICLE_BUDGET - linePts - barPts - arrowPts;

  const COUNT = PARTICLE_BUDGET;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT * 4); // role params
  // seeds: [kind, paramA, paramB, speed] — kind encoded as 0=line,1=bar,2=arrow,3=mist

  let idx = 0;
  function pushParticle(x, y, z, color, kind, a, b, spd) {
    positions[idx * 3] = x;
    positions[idx * 3 + 1] = y;
    positions[idx * 3 + 2] = z;
    colors[idx * 3] = color.r;
    colors[idx * 3 + 1] = color.g;
    colors[idx * 3 + 2] = color.b;
    seeds[idx * 4] = kind;
    seeds[idx * 4 + 1] = a;
    seeds[idx * 4 + 2] = b;
    seeds[idx * 4 + 3] = spd;
    idx++;
  }

  // --- Rising line charts (3 staggered Z lanes) ---
  const perLine = Math.floor(linePts / 3);
  for (let li = 0; li < 3; li++) {
    const kind = lineKinds[li];
    const col = LINE_COLORS[kind];
    const zLane = -0.55 + li * 0.55;
    for (let i = 0; i < perLine; i++) {
      const t = i / (perLine - 1);
      const x = -2.2 + t * 4.4;
      const h = sampleLine(kind, t) * 2.6 - 0.6;
      const jitter = (Math.random() - 0.5) * 0.06;
      const c = col.clone().lerp(GOLD, Math.random() * 0.25);
      pushParticle(x, h + jitter, zLane + (Math.random() - 0.5) * 0.08, c, 0, t, li, 0.4 + Math.random() * 0.6);
    }
  }
  // fill remainder line budget
  while (idx < linePts) {
    const li = idx % 3;
    const t = Math.random();
    const kind = lineKinds[li];
    const x = -2.2 + t * 4.4;
    const h = sampleLine(kind, t) * 2.6 - 0.6;
    pushParticle(x, h, -0.55 + li * 0.55, LINE_COLORS[kind], 0, t, li, 0.5);
  }

  // --- Rising bar / funding columns ---
  const barCount = coarse ? 7 : 9;
  const perBar = Math.floor(barPts / barCount);
  for (let b = 0; b < barCount; b++) {
    const bx = -2.0 + (b / (barCount - 1)) * 4.0;
    const targetH = 0.5 + Math.pow((b + 1) / barCount, 1.15) * 2.4;
    const isGold = b % 3 === 2;
    const baseCol = isGold ? GOLD : GREEN.clone().lerp(MINT, 0.45);
    for (let i = 0; i < perBar; i++) {
      const u = Math.random();
      const y = -0.7 + u * targetH;
      const spread = 0.12 + (1 - u) * 0.04;
      const x = bx + (Math.random() - 0.5) * spread;
      const z = 1.15 + (Math.random() - 0.5) * 0.35;
      const c = baseCol.clone().lerp(GOLD, Math.random() * 0.35);
      pushParticle(x, y, z, c, 1, bx, targetH, 0.35 + Math.random() * 0.8);
    }
  }
  while (idx < linePts + barPts) {
    pushParticle((Math.random() - 0.5) * 4, Math.random() * 2 - 0.5, 1.1, GOLD, 1, 0, 1.5, 0.5);
  }

  // --- Upward arrows / approval sparks (particle chevrons) ---
  const arrowSlots = coarse ? 5 : 7;
  const perArrow = Math.floor(arrowPts / arrowSlots);
  for (let a = 0; a < arrowSlots; a++) {
    const ax = -1.8 + (a / (arrowSlots - 1)) * 3.6;
    const az = -1.35 + (a % 2) * 0.25;
    for (let i = 0; i < perArrow; i++) {
      const u = i / perArrow;
      // chevron: two diagonals meeting at tip
      const side = i % 2 === 0 ? -1 : 1;
      const tipY = 0.2 + u * 2.0;
      const x = ax + side * (1 - u) * 0.28;
      const y = tipY;
      const z = az + (Math.random() - 0.5) * 0.05;
      const c = GOLD.clone().lerp(MINT, Math.random() * 0.4);
      pushParticle(x, y, z, c, 2, ax, u, 0.5 + Math.random() * 0.7);
    }
  }
  while (idx < linePts + barPts + arrowPts) {
    pushParticle((Math.random() - 0.5) * 3, Math.random() * 2, -1.2, GOLD, 2, 0, 0.5, 0.5);
  }

  // --- Ambient mist ----------
  while (idx < COUNT) {
    const x = (Math.random() - 0.5) * 6.5;
    const y = (Math.random() - 0.5) * 3.5;
    const z = (Math.random() - 0.5) * 4.5;
    const c = GREEN.clone().lerp(GOLD, Math.random());
    pushParticle(x, y, z, c, 3, Math.random() * Math.PI * 2, 0.3 + Math.random() * 1.2, 0.2 + Math.random() * 0.5);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: coarse ? 0.038 : 0.03,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  root.add(points);

  // Soft grid floor (particle plane) for hologram stage feel
  const gridN = coarse ? 180 : 320;
  const gPos = new Float32Array(gridN * 3);
  const gCol = new Float32Array(gridN * 3);
  for (let i = 0; i < gridN; i++) {
    const gx = (Math.random() - 0.5) * 5.5;
    const gz = (Math.random() - 0.5) * 4.2;
    gPos[i * 3] = gx;
    gPos[i * 3 + 1] = -0.85;
    gPos[i * 3 + 2] = gz;
    const c = GOLD.clone().lerp(GREEN, Math.random());
    gCol[i * 3] = c.r; gCol[i * 3 + 1] = c.g; gCol[i * 3 + 2] = c.b;
  }
  const gGeo = new THREE.BufferGeometry();
  gGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
  gGeo.setAttribute('color', new THREE.BufferAttribute(gCol, 3));
  const grid = new THREE.Points(gGeo, new THREE.PointsMaterial({
    size: 0.025, vertexColors: true, transparent: true, opacity: 0.35,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  root.add(grid);

  /* Pointer / drag / gyro */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const drag = { active: false, lx: 0, ly: 0, yaw: 0, pitch: 0, tyaw: 0, tpitch: 0 };

  function onPointerMove(e) {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    const cx = e.clientX != null ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : w / 2);
    const cy = e.clientY != null ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : h / 2);
    pointer.tx = (cx / w) * 2 - 1;
    pointer.ty = (cy / h) * 2 - 1;
    if (drag.active) {
      const dx = cx - drag.lx;
      const dy = cy - drag.ly;
      drag.tyaw += dx * 0.005;
      drag.tpitch += dy * 0.003;
      drag.tpitch = Math.max(-0.55, Math.min(0.55, drag.tpitch));
      drag.lx = cx; drag.ly = cy;
    }
  }
  function onPointerDown(e) {
    const cx = e.clientX != null ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const cy = e.clientY != null ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    const w = window.innerWidth || 1;
    if (!coarse && cx < w * 0.32) return;
    drag.active = true;
    drag.lx = cx; drag.ly = cy;
    canvas.style.pointerEvents = 'auto';
  }
  function onPointerUp() { drag.active = false; }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  window.addEventListener('pointerup', onPointerUp, { passive: true });
  canvas.style.pointerEvents = 'auto';
  document.querySelector('.hero-stage').style.pointerEvents = 'auto';
  document.querySelectorAll('.topbar, .hero-copy, .scroll-cue, .section, .footer, .preview-ribbon, .chart-hud')
    .forEach((el) => { el.style.pointerEvents = 'auto'; });

  let gyro = null;
  if (coarse && window.DeviceOrientationEvent) {
    const applyOri = (e) => {
      if (e.gamma == null || e.beta == null) return;
      gyro = {
        x: Math.max(-1, Math.min(1, e.gamma / 30)),
        y: Math.max(-1, Math.min(1, (e.beta - 45) / 30)),
      };
    };
    window.addEventListener('deviceorientation', applyOri, { passive: true });
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  let last = performance.now();
  let autoT = 0;
  const posAttr = geo.getAttribute('position');
  // climb progress for animated rise (0→1)
  let climb = 0;

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    autoT += dt;
    climb = Math.min(1, climb + dt * 0.12);

    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    drag.yaw += (drag.tyaw - drag.yaw) * 0.08;
    drag.pitch += (drag.tpitch - drag.pitch) * 0.08;

    const arr = posAttr.array;
    for (let i = 0; i < COUNT; i++) {
      const kind = seeds[i * 4];
      const a = seeds[i * 4 + 1];
      const b = seeds[i * 4 + 2];
      const spd = seeds[i * 4 + 3];
      const baseX = positions[i * 3];
      // recompute from seeds for animated kinds
      if (kind === 0) {
        // line: a=t, b=lineIndex
        const t = a;
        const li = b | 0;
        const kn = lineKinds[li] || 'eq';
        const x = -2.2 + t * 4.4;
        const reveal = Math.min(1, climb * 1.15 + t * 0.15);
        const h = sampleLine(kn, t) * 2.6 * reveal - 0.6;
        const pulse = Math.sin(autoT * spd + t * 6) * 0.025;
        arr[i * 3] = x;
        arr[i * 3 + 1] = h + pulse;
        arr[i * 3 + 2] = -0.55 + li * 0.55 + Math.sin(autoT * 0.4 + t) * 0.02;
      } else if (kind === 1) {
        // bar column: a=bx, b=targetH — particles rise with climb
        const bx = a;
        const targetH = b;
        const phase = (i % 97) / 97;
        const rise = Math.min(1, climb * 1.1 + phase * 0.2);
        const yMax = -0.7 + targetH * rise;
        const u = ((autoT * spd * 0.15 + phase) % 1);
        const y = -0.7 + u * (yMax + 0.7);
        arr[i * 3] = bx + Math.sin(autoT * 0.6 + phase * 10) * 0.02;
        arr[i * 3 + 1] = y;
        arr[i * 3 + 2] = 1.15 + Math.cos(autoT * 0.5 + phase * 8) * 0.04;
      } else if (kind === 2) {
        // arrow spark rising
        const ax = a;
        const u0 = b;
        const rise = Math.min(1, climb + 0.1);
        const travel = (u0 + autoT * spd * 0.08) % 1;
        const tipY = (-0.4 + travel * 2.6) * rise;
        const side = (i % 2 === 0) ? -1 : 1;
        arr[i * 3] = ax + side * (1 - travel) * 0.28;
        arr[i * 3 + 1] = tipY;
        arr[i * 3 + 2] = -1.35 + (i % 3) * 0.08;
      } else {
        // mist drift
        const ang = a + autoT * spd * 0.25;
        const r = b;
        arr[i * 3] = Math.cos(ang) * r * 2.2;
        arr[i * 3 + 1] = Math.sin(ang * 0.7 + autoT * 0.2) * 1.2;
        arr[i * 3 + 2] = Math.sin(ang) * r * 1.6;
      }
    }
    posAttr.needsUpdate = true;

    // gentle HUD climb synced to hologram rise
    setBureauScores(climb * 0.55);

    const gx = gyro ? gyro.x : 0;
    const gy = gyro ? gyro.y : 0;
    const parallaxX = (gyro ? gx : pointer.x) * 0.55 + drag.yaw * 0.35;
    const parallaxY = (gyro ? -gy : -pointer.y) * 0.35 + drag.pitch * 0.25;
    const idleX = Math.sin(autoT * 0.22) * 0.12;
    const idleY = Math.cos(autoT * 0.18) * 0.07;

    root.rotation.y = drag.yaw + parallaxX * 0.2;
    root.rotation.x = drag.pitch * 0.35 + parallaxY * 0.12;

    camera.position.x = 0.35 + parallaxX * 0.45 + idleX;
    camera.position.y = 0.55 + parallaxY * 0.35 + idleY;
    camera.position.z = 7.2;
    camera.lookAt(0.15, 0.35, 0);

    grid.rotation.y = -autoT * 0.03;

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) mat.opacity = 0.45;
    else mat.opacity = 0.92;
  });
})();
