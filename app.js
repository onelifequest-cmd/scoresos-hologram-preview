/**
 * Score OS hologram preview
 * Three.js particle vortex → holographic credit-score gauge
 * Cursor parallax / drag-to-spin / gyro or auto-motion fallback
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

  /* ---------- Score HUD helpers ---------- */
  const scoreEl = document.getElementById('gaugeScore');
  const bandEl = document.getElementById('gaugeBand');
  const climbFill = document.getElementById('climbFill');
  function bandFor(v) {
    if (v < 580) return 'Poor';
    if (v < 670) return 'Fair';
    if (v < 740) return 'Good';
    return 'Excellent';
  }
  function setScore(v) {
    const n = Math.round(v);
    if (scoreEl) scoreEl.textContent = String(n);
    if (bandEl) bandEl.textContent = bandFor(n);
    if (climbFill) {
      const t = Math.min(1, Math.max(0, (n - 580) / (740 - 580)));
      climbFill.style.width = (12 + t * 88) + '%';
    }
  }

  /* ---------- Scroll hologram ornament + climb ---------- */
  const scrollHolo = document.getElementById('scrollHolo');
  const scrollHoloCore = document.getElementById('scrollHoloCore');
  function onScrollFx() {
    const y = window.scrollY || 0;
    const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const t = y / max;
    if (scrollHolo) {
      scrollHolo.style.transform = `translateY(${t * -80}px) rotate(${t * 40}deg)`;
      scrollHolo.style.opacity = String(0.35 + Math.sin(t * Math.PI) * 0.4);
    }
    if (scrollHoloCore) {
      scrollHoloCore.style.transform = `scale(${0.85 + t * 0.4}) rotate(${-t * 60}deg)`;
    }
    // Soft score climb only once the flow section is on screen
    const flow = document.getElementById('flow');
    if (flow) {
      const r = flow.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      if (r.top < vh * 0.92 && r.bottom > 0) {
        const prog = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.85 + r.height * 0.35)));
        setScore(620 + prog * 140);
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
    // Still allow gentle CSS HUD animation via scroll
    return;
  }

  /* ---------- WebGL particle vortex ---------- */
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
  camera.position.set(0, 0.15, 6.2);

  const COUNT = coarse ? 4500 : 9000;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT * 4); // angle, radius, ySpread, speed

  for (let i = 0; i < COUNT; i++) {
    const ring = Math.random();
    // Bias toward a torus / gauge ring
    const baseR = ring < 0.72
      ? 1.55 + (Math.random() - 0.5) * 0.55
      : 0.2 + Math.random() * 2.4;
    const angle = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * (ring < 0.72 ? 0.35 : 2.8);
    seeds[i * 4] = angle;
    seeds[i * 4 + 1] = baseR;
    seeds[i * 4 + 2] = y;
    seeds[i * 4 + 3] = 0.35 + Math.random() * 0.9;

    positions[i * 3] = Math.cos(angle) * baseR;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(angle) * baseR;

    const c = GOLD.clone().lerp(ring < 0.5 ? GREEN : MINT, Math.random() * 0.85);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: coarse ? 0.035 : 0.028,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // Neon torus rings (hologram gauge frame)
  function makeRing(radius, tube, color, opacity) {
    const g = new THREE.TorusGeometry(radius, tube, 12, 96);
    const m = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(g, m);
    mesh.rotation.x = Math.PI / 2.15;
    return mesh;
  }
  const ringGroup = new THREE.Group();
  ringGroup.add(makeRing(1.55, 0.018, 0xf4d96b, 0.55));
  ringGroup.add(makeRing(1.78, 0.01, 0x1a6b3c, 0.45));
  ringGroup.add(makeRing(1.32, 0.008, 0x8fd9a8, 0.35));
  scene.add(ringGroup);

  // Soft center glow sprite via a small point cloud disk
  const glowCount = 400;
  const gPos = new Float32Array(glowCount * 3);
  const gCol = new Float32Array(glowCount * 3);
  for (let i = 0; i < glowCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.85;
    gPos[i * 3] = Math.cos(a) * r;
    gPos[i * 3 + 1] = (Math.random() - 0.5) * 0.15;
    gPos[i * 3 + 2] = Math.sin(a) * r;
    const c = GOLD.clone().lerp(MINT, Math.random());
    gCol[i * 3] = c.r; gCol[i * 3 + 1] = c.g; gCol[i * 3 + 2] = c.b;
  }
  const gGeo = new THREE.BufferGeometry();
  gGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
  gGeo.setAttribute('color', new THREE.BufferAttribute(gCol, 3));
  const glow = new THREE.Points(gGeo, new THREE.PointsMaterial({
    size: 0.06, vertexColors: true, transparent: true, opacity: 0.55,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  scene.add(glow);

  /* Pointer / drag / gyro */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const drag = { active: false, lx: 0, ly: 0, yaw: 0, pitch: 0, tyaw: 0, tpitch: 0 };
  const target = new THREE.Object3D();
  scene.add(target);

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
      drag.tpitch = Math.max(-0.6, Math.min(0.6, drag.tpitch));
      drag.lx = cx; drag.ly = cy;
    }
  }
  function onPointerDown(e) {
    const cx = e.clientX != null ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const cy = e.clientY != null ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    // Only drag when interacting near the gauge (right half on desktop)
    const w = window.innerWidth || 1;
    if (!coarse && cx < w * 0.35) return;
    drag.active = true;
    drag.lx = cx; drag.ly = cy;
    canvas.style.pointerEvents = 'auto';
  }
  function onPointerUp() { drag.active = false; }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  window.addEventListener('pointerup', onPointerUp, { passive: true });
  // Allow dragging on the canvas specifically
  canvas.style.pointerEvents = 'auto';
  document.querySelector('.hero-stage').style.pointerEvents = 'auto';
  // But keep UI clickable above
  document.querySelectorAll('.topbar, .hero-copy, .scroll-cue, .section, .footer, .preview-ribbon')
    .forEach((el) => { el.style.pointerEvents = 'auto'; });

  // Gyro on supporting devices
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

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    autoT += dt;

    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    drag.yaw += (drag.tyaw - drag.yaw) * 0.08;
    drag.pitch += (drag.tpitch - drag.pitch) * 0.08;

    // Spiral update
    const arr = posAttr.array;
    for (let i = 0; i < COUNT; i++) {
      const a0 = seeds[i * 4];
      const r0 = seeds[i * 4 + 1];
      const y0 = seeds[i * 4 + 2];
      const spd = seeds[i * 4 + 3];
      const a = a0 + autoT * spd * 0.55;
      // Gentle vertical swirl
      const y = y0 + Math.sin(a * 1.4 + autoT) * 0.08;
      const pulse = 1 + Math.sin(autoT * 0.7 + r0) * 0.03;
      const r = r0 * pulse;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    posAttr.needsUpdate = true;

    ringGroup.rotation.z = autoT * 0.12 + drag.yaw;
    ringGroup.rotation.x = Math.PI / 2.15 + drag.pitch * 0.4;
    glow.rotation.y = -autoT * 0.2;

    const gx = gyro ? gyro.x : 0;
    const gy = gyro ? gyro.y : 0;
    const parallaxX = (gyro ? gx : pointer.x) * 0.55 + drag.yaw * 0.3;
    const parallaxY = (gyro ? -gy : -pointer.y) * 0.35 + drag.pitch * 0.25;
    // Auto idle sway when no input
    const idleX = Math.sin(autoT * 0.25) * 0.15;
    const idleY = Math.cos(autoT * 0.2) * 0.08;

    camera.position.x = parallaxX + idleX;
    camera.position.y = 0.15 + parallaxY + idleY;
    camera.lookAt(0, 0, 0);

    // Nudge group toward pointer for Hellon-like depth shift
    points.rotation.y = parallaxX * 0.25;
    points.rotation.x = parallaxY * 0.15;

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) mat.opacity = 0.5;
    else mat.opacity = 0.9;
  });
})();
