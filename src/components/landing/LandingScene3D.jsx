import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Scroll-driven WebGL backdrop for the landing page. It stages the product in
// four beats, so scrolling the page *is* the product demo:
//
//   0.00–0.25  the backlog — cards tumbling loose in the dark
//   0.25–0.50  workspaces  — they sort themselves into five lit columns
//   0.50–0.78  focus       — one card lifts out, a Pomodoro ring closes on it
//   0.78–1.00  done        — the ring completes, it's checked, the rest settle
//
// Deliberately restrained: warm paper-white cards, one terracotta accent, gentle
// bloom. Purely decorative — the page's real content is HTML on top of it, and
// the canvas is aria-hidden.

const CARD_W = 2.15;
const CARD_H = 0.58;
const CARD_D = 0.07;

const CARDS = 84;
const COLUMNS = 5; // one per workspace: Personal / Work / School / Fitness / Other
const DUST = 260;

const INK = 0x0b0a0c;
const PAPER = 0xf4f1ec;
const TERRACOTTA = 0xe25a3c;

// Priority accent colours — high / medium / low, matching the app's edges.
const PRIORITY = [0xe25a3c, 0xe0a53f, 0x5b8f7d];

// Keyframed camera path, sampled by scroll progress (pos → target).
const CAM = [
  { pos: [1.5, 2.2, 26], tgt: [0, 0, 0] }, // 0 — wide, the loose backlog
  { pos: [-3.4, 1.4, 18], tgt: [0, 0.2, 0] }, // 1 — drift across the sorted columns
  { pos: [0, 0.1, 8.2], tgt: [0, 0.1, 0] }, // 2 — push in on the focused card
  { pos: [1.1, 0.4, 6.6], tgt: [0, 0.1, 0] }, // 3 — hold through the timer
  { pos: [0, 3.2, 19], tgt: [0, -0.4, 0] }, // 4 — pull back over the finished board
];

const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
/** Eased 0→1 ramp across the scroll window [a, b]. */
const phase = (p, a, b) => smooth(clamp01((p - a) / (b - a)));

/** Deterministic PRNG so the composition is identical on every load. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function sampleCam(p) {
  const span = CAM.length - 1;
  const i = Math.min(span - 1, Math.floor(p * span));
  const local = smooth(clamp01(p * span - i));
  const a = CAM[i];
  const b = CAM[i + 1];
  return {
    pos: [0, 1, 2].map((k) => lerp(a.pos[k], b.pos[k], local)),
    tgt: [0, 1, 2].map((k) => lerp(a.tgt[k], b.tgt[k], local)),
  };
}

/** A rounded-rectangle card with a soft bevel, so edges catch the key light. */
function cardGeometry() {
  const r = 0.12;
  const w = CARD_W / 2 - r;
  const h = CARD_H / 2 - r;
  const shape = new THREE.Shape();
  shape.moveTo(-w - r, -h);
  shape.lineTo(-w - r, h);
  shape.quadraticCurveTo(-w - r, h + r, -w, h + r);
  shape.lineTo(w, h + r);
  shape.quadraticCurveTo(w + r, h + r, w + r, h);
  shape.lineTo(w + r, -h);
  shape.quadraticCurveTo(w + r, -h - r, w, -h - r);
  shape.lineTo(-w, -h - r);
  shape.quadraticCurveTo(-w - r, -h - r, -w - r, -h);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: CARD_D,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 6,
  });
  geo.center();
  return geo;
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.3, 'rgba(255,255,255,0.55)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/**
 * @param {object}  props
 * @param {React.RefObject<number>} props.progressRef  scroll progress, 0→1
 */
export default function LandingScene3D({ progressRef }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      // No WebGL (or it's blocked) — the CSS gradient behind us stands in.
      mount.classList.add('scene-failed');
      return undefined;
    }

    const W = () => mount.clientWidth || window.innerWidth;
    const H = () => mount.clientHeight || window.innerHeight;
    const small = window.innerWidth < 820;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2));
    renderer.setSize(W(), H());
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(INK);
    scene.fog = new THREE.FogExp2(INK, 0.026);

    const camera = new THREE.PerspectiveCamera(48, W() / H(), 0.1, 400);
    camera.position.set(...CAM[0].pos);

    // ── lighting: warm key, terracotta rim, cool fill ──────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const key = new THREE.DirectionalLight(0xfff0e2, 2.4);
    key.position.set(-6, 9, 11);
    scene.add(key);

    const rim = new THREE.PointLight(TERRACOTTA, 42, 40, 2);
    rim.position.set(3.5, -1.5, -7);
    scene.add(rim);

    const fill = new THREE.DirectionalLight(0x93a8c9, 0.55);
    fill.position.set(7, -4, 5);
    scene.add(fill);

    // ── the task cards ────────────────────────────────────────────────
    const cardGeo = cardGeometry();
    const cardMat = new THREE.MeshStandardMaterial({
      color: PAPER,
      roughness: 0.62,
      metalness: 0.04,
    });
    const cards = new THREE.InstancedMesh(cardGeo, cardMat, CARDS);
    cards.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    cards.frustumCulled = false;
    scene.add(cards);

    // Priority edge: a thin emissive bar riding the card's left edge.
    const accentGeo = new THREE.BoxGeometry(0.075, CARD_H * 0.66, CARD_D * 0.9);
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1.15,
      roughness: 0.4,
      toneMapped: false,
    });
    const accents = new THREE.InstancedMesh(accentGeo, accentMat, CARDS);
    accents.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    accents.frustumCulled = false;
    scene.add(accents);

    // Per-card traits + the four layouts it interpolates between.
    const rand = rng(20260731);
    const seeds = [];
    for (let i = 0; i < CARDS; i++) {
      const col = i % COLUMNS;
      const row = Math.floor(i / COLUMNS);
      const priority = i % 3;

      seeds.push({
        priority,
        // 0 — loose in the dark, tumbling
        scatter: new THREE.Vector3(
          (rand() - 0.5) * 30,
          (rand() - 0.5) * 17,
          -4 - rand() * 26
        ),
        spin: new THREE.Euler(
          (rand() - 0.5) * 2.6,
          (rand() - 0.5) * 3.4,
          (rand() - 0.5) * 1.5
        ),
        // 1 — sorted into workspace columns
        column: new THREE.Vector3(
          (col - (COLUMNS - 1) / 2) * 2.9,
          4.1 - row * 0.78,
          (col - (COLUMNS - 1) / 2) * -0.35
        ),
        // 3 — the calm finished board
        grid: new THREE.Vector3(
          (col - (COLUMNS - 1) / 2) * 2.75,
          3.4 - row * 0.72,
          -1.2
        ),
        drift: rand() * Math.PI * 2,
        speed: 0.35 + rand() * 0.5,
      });
    }

    // The card the story focuses on — pulled from the middle of the board.
    const HERO = 22;
    const heroSeed = seeds[HERO];

    // ── the Pomodoro ring around the focused card ─────────────────────
    const ringGroup = new THREE.Group();
    ringGroup.visible = false;
    scene.add(ringGroup);

    const RING_SEGMENTS = 180;
    const ringGeo = new THREE.RingGeometry(1.36, 1.44, RING_SEGMENTS, 1);
    const ringMat = new THREE.MeshBasicMaterial({
      color: TERRACOTTA,
      side: THREE.DoubleSide,
      transparent: true,
      toneMapped: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    // RingGeometry indexes vertices in theta order, so clipping the draw range
    // sweeps the arc — a countdown dial for free, with no shader.
    const RING_INDEX_COUNT = ringGeo.index.count;
    ring.rotation.z = Math.PI / 2; // put theta=0 at 12 o'clock
    ring.scale.x = -1; // mirror so the sweep runs clockwise, like a real dial
    ringGroup.add(ring);

    const trackGeo = new THREE.RingGeometry(1.37, 1.43, 96, 1);
    const trackMat = new THREE.MeshBasicMaterial({
      color: PAPER,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.12,
      toneMapped: false,
    });
    ringGroup.add(new THREE.Mesh(trackGeo, trackMat));

    // Checkmark: two bars struck through the card once the timer completes.
    const checkMat = new THREE.MeshBasicMaterial({ color: 0x5fd39a, toneMapped: false });
    const check = new THREE.Group();
    const checkShort = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.075, 0.075), checkMat);
    checkShort.position.set(-0.13, -0.06, 0);
    checkShort.rotation.z = Math.PI / 4;
    const checkLong = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.075, 0.075), checkMat);
    checkLong.position.set(0.13, 0.04, 0);
    checkLong.rotation.z = -Math.PI / 5.2;
    check.add(checkShort, checkLong);
    check.visible = false;
    scene.add(check);

    // ── far-field dust for depth ──────────────────────────────────────
    const dustPos = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) {
      dustPos[i * 3] = (rand() - 0.5) * 62;
      dustPos[i * 3 + 1] = (rand() - 0.5) * 40;
      dustPos[i * 3 + 2] = -12 - rand() * 48;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const glow = glowTexture();
    const dustMat = new THREE.PointsMaterial({
      size: 0.13,
      map: glow,
      color: 0xffd9c0,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // ── post-processing ───────────────────────────────────────────────
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(W(), H()),
      small ? 0.42 : 0.62, // strength
      0.85, // radius
      0.62 // threshold — only the accents and ring really bloom
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    composer.setSize(W(), H());

    // ── per-frame composition ─────────────────────────────────────────
    const dummy = new THREE.Object3D();
    const edgeOffset = new THREE.Matrix4().makeTranslation(
      -CARD_W / 2 + 0.11,
      0,
      CARD_D / 2 + 0.01
    );
    const cardMatrix = new THREE.Matrix4();
    const accentMatrix = new THREE.Matrix4();
    const tint = new THREE.Color();
    const heroPos = new THREE.Vector3();
    const camTarget = new THREE.Vector3();

    function build(p, t) {
      const sorted = phase(p, 0.14, 0.46); // scatter → columns
      const focusing = phase(p, 0.5, 0.72); // columns → recede behind the hero
      const settled = phase(p, 0.78, 0.98); // recede → finished board
      const timer = phase(p, 0.56, 0.86); // the Pomodoro sweep itself
      const done = phase(p, 0.84, 0.94); // the checkmark

      for (let i = 0; i < CARDS; i++) {
        const s = seeds[i];
        const hero = i === HERO;

        // act 1 — tumbling loose
        const bob = Math.sin(t * s.speed + s.drift) * 0.55;
        dummy.position.set(s.scatter.x, s.scatter.y + bob, s.scatter.z);
        dummy.rotation.set(
          s.spin.x + t * 0.09 * s.speed,
          s.spin.y + t * 0.13 * s.speed,
          s.spin.z
        );

        // act 2 — snap into workspace columns, square to camera
        dummy.position.lerp(s.column, sorted);
        dummy.rotation.x = lerp(dummy.rotation.x, 0, sorted);
        dummy.rotation.y = lerp(dummy.rotation.y, 0, sorted);
        dummy.rotation.z = lerp(dummy.rotation.z, 0, sorted);

        if (hero) {
          // act 3 — the focused card lifts out to centre stage
          heroPos.set(0, 0.1, 3.2);
          dummy.position.lerp(heroPos, focusing);
          dummy.scale.setScalar(1 + focusing * 0.42);
        } else {
          // everything else falls back and out of the way
          const recede = focusing * (1 - settled);
          dummy.position.z -= recede * 9;
          dummy.position.y += recede * (s.column.y > 0 ? 1.4 : -1.4);
          dummy.position.lerp(s.grid, settled);
          dummy.scale.setScalar(1 - recede * 0.16);
        }

        dummy.updateMatrix();
        cardMatrix.copy(dummy.matrix);
        cards.setMatrixAt(i, cardMatrix);

        accentMatrix.multiplyMatrices(cardMatrix, edgeOffset);
        accents.setMatrixAt(i, accentMatrix);

        // accents only light up once the board is sorted — that *is* the point
        tint.setHex(PRIORITY[s.priority]);
        const lit = hero
          ? 0.35 + sorted * 0.4 + focusing * 0.9
          : 0.12 + sorted * 0.7 - focusing * (1 - settled) * 0.55;
        accents.setColorAt(i, tint.multiplyScalar(Math.max(lit, 0.06)));
      }

      cards.instanceMatrix.needsUpdate = true;
      accents.instanceMatrix.needsUpdate = true;
      if (accents.instanceColor) accents.instanceColor.needsUpdate = true;

      // the ring tracks the hero card and sweeps its countdown
      cards.getMatrixAt(HERO, cardMatrix);
      ringGroup.position.setFromMatrixPosition(cardMatrix);
      ringGroup.visible = focusing > 0.02 && settled < 0.98;
      const ringScale = focusing * (1 - settled * 0.85);
      ringGroup.scale.setScalar(Math.max(ringScale, 0.001));
      ringMat.opacity = focusing * (1 - settled);
      trackMat.opacity = 0.12 * focusing * (1 - settled);
      // sweep clockwise from 12 o'clock
      const swept = Math.max(1, Math.round(RING_INDEX_COUNT * timer));
      ring.geometry.setDrawRange(0, swept);

      check.position.setFromMatrixPosition(cardMatrix);
      check.position.z += 0.14;
      check.visible = done > 0.02;
      check.scale.setScalar(done * 1.15 * (1 - settled * 0.4));

      // gentle parallax on the dust field
      dust.rotation.z = t * 0.006;
      dust.position.z = lerp(0, 6, p);

      const cam = sampleCam(p);
      camera.position.set(cam.pos[0], cam.pos[1], cam.pos[2]);
      camTarget.set(cam.tgt[0], cam.tgt[1], cam.tgt[2]);
      camera.lookAt(camTarget);

      // the whole frame blooms hardest at the moment the timer completes
      bloom.strength = (small ? 0.42 : 0.62) + Math.sin(timer * Math.PI) * 0.55;
    }

    // ── loop ──────────────────────────────────────────────────────────
    // Elapsed seconds straight from the rAF timestamp — THREE.Clock is
    // deprecated in r185, and this is all it was being used for.
    const start = performance.now();
    let frame = 0;
    let visible = true;

    const render = (now) => {
      frame = requestAnimationFrame(render);
      if (!visible) return;
      build(clamp01(progressRef.current ?? 0), (now - start) / 1000);
      composer.render();
    };

    if (reduceMotion) {
      // One still frame, held at the most legible moment of the story.
      build(0.62, 0);
      composer.render();
    } else {
      frame = requestAnimationFrame(render);
    }

    // Stop rendering entirely when the scene scrolls off screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: '160px' }
    );
    io.observe(mount);

    const onResize = () => {
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
      composer.setSize(W(), H());
      if (reduceMotion) {
        build(0.62, 0);
        composer.render();
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener('resize', onResize);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => m.dispose());
        }
      });
      glow.dispose();
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [progressRef]);

  return <div className="landing-scene" ref={mountRef} aria-hidden="true" />;
}
