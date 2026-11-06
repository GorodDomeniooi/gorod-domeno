import * as THREE from './three.module.js';

const matCache = new Map();
export function M(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) {
    const m = new THREE.MeshLambertMaterial({ color, flatShading: true, ...opts });
    matCache.set(key, m);
  }
  return matCache.get(key);
}
export const WIN = () => M('#ffd67a', { emissive: '#ffc85a', emissiveIntensity: 0.9 });
const DOOR = '#4a2f22';

export function box(g, w, h, d, color, x = 0, y = 0, z = 0, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat || M(color));
  m.position.set(x, y + h / 2, z);
  g.add(m);
  return m;
}
export function cyl(g, rt, rb, h, color, x = 0, y = 0, z = 0, seg = 12, mat) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat || M(color));
  m.position.set(x, y + h / 2, z);
  g.add(m);
  return m;
}
export function sph(g, r, color, x = 0, y = 0, z = 0, mat, wseg = 12, hseg = 8) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, wseg, hseg), mat || M(color));
  m.position.set(x, y, z);
  g.add(m);
  return m;
}
export function cone(g, r, h, color, x = 0, y = 0, z = 0, seg = 12, mat) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat || M(color));
  m.position.set(x, y + h / 2, z);
  g.add(m);
  return m;
}
// gable roof: ridge along x
export function gable(g, w, d, h, color, x = 0, y = 0, z = 0, over = 0.25) {
  const s = new THREE.Shape();
  const W = w / 2 + over;
  s.moveTo(-W, 0); s.lineTo(W, 0); s.lineTo(0, h); s.lineTo(-W, 0);
  // extrude along z: shape in x-y
  const geo = new THREE.ExtrudeGeometry(s, { depth: d + over * 2, bevelEnabled: false });
  geo.translate(0, 0, -(d + over * 2) / 2);
  const m = new THREE.Mesh(geo, M(color));
  m.position.set(x, y, z);
  g.add(m);
  return m;
}
export function pyramid(g, w, h, color, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(w * 0.72, h, 4), M(color));
  m.rotation.y = Math.PI / 4;
  m.position.set(x, y + h / 2, z);
  g.add(m);
  return m;
}
// windows on +z face and +/-x faces of a box at (x,y0,z) size w,h,d
export function windows(g, w, h, d, x, y0, z, floors = 1, cols = 2, opts = {}) {
  const fh = h / floors;
  const ww = Math.min(0.55, (w / cols) * 0.45), wh = Math.min(0.6, fh * 0.42);
  for (let f = 0; f < floors; f++) {
    const yy = y0 + fh * f + fh * 0.55;
    for (let c = 0; c < cols; c++) {
      if (opts.skipDoor && f === 0 && c === Math.floor(cols / 2) && cols % 2 === 1) continue;
      const xx = x - w / 2 + (w / cols) * (c + 0.5);
      const p = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), WIN());
      p.position.set(xx, yy, z + d / 2 + 0.02);
      g.add(p);
    }
    if (opts.sides !== false) {
      const sc = Math.max(1, Math.round(d / 1.4));
      for (let c = 0; c < sc; c++) {
        const zz = z - d / 2 + (d / sc) * (c + 0.5);
        for (const s of [-1, 1]) {
          const p = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), WIN());
          p.position.set(x + s * (w / 2 + 0.02), yy, zz);
          p.rotation.y = s * Math.PI / 2;
          g.add(p);
        }
      }
    }
  }
}
export function door(g, x, y, z, w = 0.7, h = 1.2, color = DOOR) {
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M(color));
  p.position.set(x, y + h / 2, z + 0.03);
  g.add(p);
}
export function textTex(text, opts = {}) {
  const { w = 512, h = 128, bg = '#2b1f3d', fg = '#ffd23f', font = '900 72px Inter', radius = 20 } = opts;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  if (bg) { x.fillStyle = bg; x.beginPath(); x.roundRect(0, 0, w, h, radius); x.fill(); }
  x.fillStyle = fg; x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, w / 2, h / 2 + 4);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
export function sign(g, text, w, h, x, y, z, opts = {}) {
  const t = textTex(text, opts);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true }));
  m.position.set(x, y, z);
  g.add(m);
  return m;
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function hash(s) { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0); }

const BODY = ['#d9b48a', '#a8724a', '#c9604a', '#7f8fb3', '#e8d8b0', '#b98c6a', '#8fa889', '#d6c3a0'];
const ROOF = ['#7a3b2e', '#3f4a5c', '#5a3d2b', '#b23a2e', '#4a3b5c', '#2f3e4f'];

function basicHouse(g, body, roof, floors = 1, w = 3.4, d = 3.0) {
  const h = 2.3 * floors;
  box(g, w, h, d, body);
  windows(g, w, h, d, 0, 0, 0, floors, 3, { skipDoor: true });
  door(g, 0, 0, d / 2);
  gable(g, w, d, 1.5, roof, 0, h, 0);
  return h + 1.5;
}

export const BUILD = {
  std(g, n) {
    const r = hash(n);
    const floors = r % 5 === 0 ? 2 : 1;
    const h = basicHouse(g, BODY[r % BODY.length], ROOF[(r >> 3) % ROOF.length], floors, 3 + (r % 3) * 0.3, 2.8 + ((r >> 5) % 3) * 0.3);
    if (r % 3 === 0) box(g, 0.45, 1.2, 0.45, '#6b4a3a', 0.9, h - 1.6, -0.5);
    if (r % 4 === 1) { box(g, 1.4, 0.15, 0.6, '#5c4033', 0, 0, 2.2); }
    return h;
  },
  colored(g, n, body, roof, floors = 1) { return basicHouse(g, body, roof, floors, 3.4, 3.0); },
  purple(g) { return basicHouse(g, '#8e5bd6', '#4b2c7a', 1); },
  blue(g) { return basicHouse(g, '#7fc4ef', '#ffffff', 1); },
  brown2(g) { return basicHouse(g, '#8a5a3c', '#5a3622', 2); },
  two(g) { const h = basicHouse(g, '#e9d2a6', '#a6402f', 2); box(g, 1.2, 0.1, 0.8, '#fff', 0, 2.3, 1.9); return h; },
  twostone(g) { return basicHouse(g, '#9aa0a8', '#3a4250', 2, 3.8, 3.2); },
  pinkheart(g) {
    const h = basicHouse(g, '#ff9fcf', '#ff5fa8', 1);
    const s = new THREE.Shape(); s.moveTo(0, -0.5); s.bezierCurveTo(-1, 0.1, -0.5, 0.8, 0, 0.35); s.bezierCurveTo(0.5, 0.8, 1, 0.1, 0, -0.5);
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.15, bevelEnabled: false }), M('#ff2f7d', { emissive: '#ff2f7d', emissiveIntensity: 0.4 }));
    m.position.set(0, 3.0, 1.45); m.scale.setScalar(0.8); g.add(m);
    return h;
  },
  titan(g) {
    box(g, 3.8, 4.6, 3.2, '#b7c3cf'); box(g, 3.9, 0.2, 3.3, '#7d8a97', 0, 2.3);
    windows(g, 3.8, 4.6, 3.2, 0, 0, 0, 2, 3, { skipDoor: true }); door(g, 0, 0, 1.6, 0.8, 1.3, '#5d6874');
    box(g, 4.0, 0.3, 3.4, '#e6edf3', 0, 4.6); sign(g, 'TI', 1, 0.5, 0, 5.3, 0, { w: 256, h: 128, bg: '#5d6874', fg: '#e6edf3', font: '900 90px Inter' });
    return 5.6;
  },
  rocket(g, n, color = '#e84b3c') {
    cyl(g, 0.95, 1.05, 5.2, '#f4f1ea', 0, 0.6, 0, 16);
    cone(g, 0.95, 1.8, color, 0, 5.8, 0, 16);
    for (let i = 0; i < 3; i++) { const f = box(g, 0.15, 1.6, 1.1, color, Math.cos(i * 2.09) * 1.05, 0, Math.sin(i * 2.09) * 1.05); f.rotation.y = -i * 2.09; }
    const p = new THREE.Mesh(new THREE.CircleGeometry(0.38, 16), WIN()); p.position.set(0, 4.2, 0.98); g.add(p);
    const p2 = new THREE.Mesh(new THREE.CircleGeometry(0.3, 16), WIN()); p2.position.set(0, 3.0, 1.02); g.add(p2);
    box(g, 2.0, 0.12, 0.25, color, 0, 2.0, 0.95); door(g, 0, 0.6, 1.0, 0.6, 1.0, '#555');
    return 7.6;
  },
  flyrocket(g, n) {
    const sub = new THREE.Group(); const h = BUILD.rocket(sub, n, '#3c7be8'); sub.position.y = 1.4; g.add(sub);
    const fl = cone(g, 0.7, 1.6, '#ff8a2a', 0, -0.2, 0, 10, M('#ff8a2a', { emissive: '#ff6a00', emissiveIntensity: 1 })); fl.rotation.x = Math.PI; fl.position.y = 1.2;
    g.userData.float = sub; g.userData.flame = fl;
    return h + 1.4;
  },
  moonrocket(g, n) {
    const h = BUILD.rocket(g, n, '#7b4be8');
    const s = new THREE.Shape(); s.absarc(0, 0, 0.6, 0.6, Math.PI * 2 - 0.6, false); s.absarc(0.3, 0, 0.45, Math.PI * 2 - 0.9, 0.9, true);
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: false }), M('#ffe27a', { emissive: '#ffd23f', emissiveIntensity: 0.8 }));
    m.position.set(1.6, 6.2, 0); g.add(m);
    return h;
  },
  f1(g) {
    const R = '#d81f26';
    box(g, 1.7, 0.55, 4.6, R, 0, 0.45, 0); box(g, 1.0, 0.5, 1.6, R, 0, 0.95, -0.2);
    box(g, 3.0, 0.12, 0.6, R, 0, 0.5, 2.6); box(g, 2.6, 0.12, 0.6, R, 0, 1.5, -2.4); box(g, 0.12, 0.7, 0.4, '#222', -1, 0.8, -2.4); box(g, 0.12, 0.7, 0.4, '#222', 1, 0.8, -2.4);
    for (const [x, z] of [[-1.25, 1.6], [1.25, 1.6], [-1.3, -1.6], [1.3, -1.6]]) { const w = cyl(g, 0.55, 0.55, 0.6, '#1d1d1d', x, 0, z, 14); w.rotation.z = Math.PI / 2; w.position.y = 0.55; }
    sph(g, 0.32, '#f4c430', 0, 1.6, 0.2); box(g, 0.6, 0.1, 0.1, '#fff', 0, 1.0, 1.4);
    g.scale.setScalar(1.15);
    return 2.6;
  },
  tv(g) {
    box(g, 4.2, 3.2, 1.0, '#26232e', 0, 0.6, 0);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.5), M('#5bc8ff', { emissive: '#3aa8ff', emissiveIntensity: 0.9 })); s.position.set(0, 2.2, 0.52); g.add(s);
    box(g, 0.2, 0.6, 0.2, '#444', -1.5, 0, 0); box(g, 0.2, 0.6, 0.2, '#444', 1.5, 0, 0);
    const a1 = cyl(g, 0.04, 0.04, 1.6, '#aaa', -0.4, 3.8, 0); a1.rotation.z = 0.5; const a2 = cyl(g, 0.04, 0.04, 1.6, '#aaa', 0.4, 3.8, 0); a2.rotation.z = -0.5;
    door(g, 0, 0.6, 0.55, 0.7, 1.0, '#222');
    return 5.2;
  },
  restaurant(g) {
    box(g, 4.4, 2.6, 3.2, '#f2e3c6'); windows(g, 4.4, 2.6, 3.2, 0, 0, 0, 1, 3, { skipDoor: true }); door(g, 0, 0, 1.6);
    for (let i = 0; i < 8; i++) { const a = box(g, 0.55, 0.12, 1.1, i % 2 ? '#fff' : '#d93a3a', -1.92 + i * 0.55, 2.2, 2.0); a.rotation.x = 0.4; }
    box(g, 4.6, 0.3, 3.4, '#8a3a2a', 0, 2.6); sign(g, 'РЕСТОРАН', 3.6, 0.8, 0, 3.4, 1.0, { w: 640, h: 140, bg: '#2b1f3d', fg: '#ffd23f', font: '900 86px Inter' });
    for (const x of [-1.3, 1.3]) { cyl(g, 0.45, 0.45, 0.08, '#fff', x, 0.7, 3.2); cyl(g, 0.06, 0.06, 0.7, '#555', x, 0, 3.2); }
    return 4.0;
  },
  carhouse(g) {
    box(g, 3.2, 1.4, 4.6, '#2f9be0', 0, 0.6, 0); box(g, 2.8, 1.4, 2.6, '#2f9be0', 0, 2.0, -0.3);
    const ws = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.0), M('#bfe6ff', { emissive: '#9fd6ff', emissiveIntensity: 0.5 })); ws.position.set(0, 2.6, 1.02); g.add(ws);
    for (const [x, z] of [[-1.6, 1.5], [1.6, 1.5], [-1.6, -1.5], [1.6, -1.5]]) { const w = cyl(g, 0.7, 0.7, 0.5, '#1d1d1d', x, 0, z, 14); w.rotation.z = Math.PI / 2; w.position.y = 0.7; }
    sph(g, 0.22, '#fff6b0', -1.0, 1.4, 2.32, M('#fff6b0', { emissive: '#fff2a0', emissiveIntensity: 1 })); sph(g, 0.22, '#fff6b0', 1.0, 1.4, 2.32, M('#fff6b0', { emissive: '#fff2a0', emissiveIntensity: 1 }));
    door(g, 0, 0.6, 2.3, 0.8, 0.9, '#1c5f8f');
    return 3.6;
  },
  villa(g) {
    box(g, 4.2, 2.2, 3.0, '#f6f4ef', 0, 0, -0.6); box(g, 3.0, 2.0, 2.4, '#f6f4ef', 0.5, 2.2, -0.9);
    windows(g, 4.2, 2.2, 3.0, 0, 0, -0.6, 1, 3, { skipDoor: true }); windows(g, 3.0, 2.0, 2.4, 0.5, 2.2, -0.9, 1, 2);
    const pool = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 1.6), M('#3ec5f5', { emissive: '#1aa0e0', emissiveIntensity: 0.4 })); pool.position.set(0, 0.06, 2.2); g.add(pool);
    const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 0), M('#ffffff')); ball.position.set(-0.9, 4.8, -0.9); g.add(ball);
    sph(g, 0.2, '#111', -0.9, 4.9, -0.4);
    return 5.4;
  },
  kennel(g, n) {
    const h = basicHouse(g, '#d9b48a', '#7a3b2e', 1);
    box(g, 1.0, 0.8, 1.0, '#a5552f', 2.3, 0, 1.6); gable(g, 1.0, 1.0, 0.5, '#5a3622', 2.3, 0.8, 1.6, 0.1);
    box(g, 0.5, 0.35, 0.8, '#e8c08a', 2.3, 0, 2.6); box(g, 0.35, 0.35, 0.35, '#e8c08a', 2.3, 0.3, 3.1);
    return h;
  },
  castle(g, n, s = 1) {
    const C = '#c9c1b5', R = '#3d5a9e';
    box(g, 4.2, 2.2, 3.6, C); windows(g, 4.2, 2.2, 3.6, 0, 0, 0, 1, 3, { skipDoor: true }); door(g, 0, 0, 1.8, 0.9, 1.4, '#5a3b26');
    box(g, 2.2, 2.4, 2.0, C, 0, 2.2, -0.4); windows(g, 2.2, 2.4, 2.0, 0, 2.2, -0.4, 1, 2);
    for (let i = -1; i <= 1; i++) box(g, 0.5, 0.45, 0.5, C, i * 0.8, 4.6, -0.4);
    for (const [x, z] of [[-2.1, 1.8], [2.1, 1.8], [-2.1, -1.8], [2.1, -1.8]]) { cyl(g, 0.65, 0.7, 3.6, C, x, 0, z, 10); cone(g, 0.85, 1.6, R, x, 3.6, z, 10); }
    cyl(g, 0.03, 0.03, 1.2, '#555', 0, 4.6, -0.4); box(g, 0.7, 0.4, 0.02, '#e84b3c', 0.35, 5.3, -0.4);
    g.scale.setScalar(s * 0.95);
    return 6.0 * s;
  },
  bigcastle(g, n) { return BUILD.castle(g, n, 1.25); },
  rock(g) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(2.2, 9, 6, 0, Math.PI * 2, 0, Math.PI / 2), M('#8d7b6a')); g.add(m);
    door(g, 0, 0, 2.05, 0.8, 1.1, '#4a3a2c');
    const a = cyl(g, 0.05, 0.05, 1.0, '#666', 0, 2.1, 0); box(g, 0.3, 0.3, 0.02, '#ffd23f', 0, 3.0, 0);
    return 3.2;
  },
  kremlin(g) {
    const R = '#b8352b', W = '#f2ece2', G = '#2e7d4f';
    box(g, 5.0, 1.6, 0.9, R, 0, 0, -1.6);
    for (let i = -4; i <= 4; i++) box(g, 0.32, 0.4, 0.9, R, i * 0.55, 1.6, -1.6);
    box(g, 2.0, 3.2, 2.0, R, 0, 0, 0.4); box(g, 2.1, 0.2, 2.1, W, 0, 3.2, 0.4);
    box(g, 1.6, 1.6, 1.6, R, 0, 3.4, 0.4);
    const cl = new THREE.Mesh(new THREE.CircleGeometry(0.45, 20), M('#fff7d6', { emissive: '#fff2b0', emissiveIntensity: 0.8 })); cl.position.set(0, 4.3, 1.22); g.add(cl);
    box(g, 1.2, 1.2, 1.2, W, 0, 5.0, 0.4); cone(g, 0.85, 2.4, G, 0, 6.2, 0.4, 8);
    const st = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 + Math.PI / 2, r = i % 2 ? 0.22 : 0.5; i ? st.lineTo(Math.cos(a) * r, Math.sin(a) * r) : st.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    const star = new THREE.Mesh(new THREE.ExtrudeGeometry(st, { depth: 0.12, bevelEnabled: false }), M('#ff2a2a', { emissive: '#ff1010', emissiveIntensity: 1 })); star.position.set(0, 9.1, 0.4); g.add(star);
    door(g, 0, 0, 1.42, 0.8, 1.4, '#3d2219');
    return 9.8;
  },
  mansion(g, n, body = '#efe4cf', roof = '#3f4a5c') {
    box(g, 5.0, 4.2, 3.2, body); windows(g, 5.0, 4.2, 3.2, 0, 0, 0, 2, 5, { skipDoor: true }); door(g, 0, 0, 1.6, 0.9, 1.5, '#5a3b26');
    pyramid(g, 4.8, 1.7, roof, 0, 4.2, 0);
    for (const x of [-0.8, 0.8]) cyl(g, 0.15, 0.15, 2.0, '#fff', x, 0, 2.0);
    box(g, 2.2, 0.25, 1.2, '#fff', 0, 2.0, 2.0);
    return 6.0;
  },
  carsmansion(g, n) {
    const h = BUILD.mansion(g, n, '#f3ead8', '#2f3e4f');
    for (const [x, c] of [[-1.4, '#f4c430'], [1.4, '#e03131']]) { box(g, 1.1, 0.5, 2.0, c, x, 0.15, 3.0); box(g, 0.9, 0.4, 1.0, c, x, 0.65, 2.9); for (const zz of [2.4, 3.6]) for (const xx of [-0.55, 0.55]) { const w = cyl(g, 0.22, 0.22, 0.2, '#111', x + xx, 0, zz, 10); w.rotation.z = Math.PI / 2; w.position.y = 0.22; } }
    return h;
  },
  ballet(g) {
    box(g, 3.6, 8.0, 3.0, '#f7b6d2'); windows(g, 3.6, 8.0, 3.0, 0, 0, 0, 5, 3, { skipDoor: true }); door(g, 0, 0, 1.5);
    const t = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.35, 6, 20), M('#ffd6ea')); t.rotation.x = Math.PI / 2; t.position.y = 8.1; g.add(t);
    cone(g, 1.7, 1.6, '#ff6fb0', 0, 8.0, 0, 4).rotation.y = Math.PI / 4;
    return 9.8;
  },
  giant(g) {
    box(g, 3.0, 7.5, 3.0, '#3b2f57'); box(g, 3.4, 0.4, 3.4, '#241b38', 0, 7.5);
    for (const x of [-0.7, 0.7]) { const e = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.4), M('#9dff6b', { emissive: '#7dff3a', emissiveIntensity: 1 })); e.position.set(x, 6.2, 1.52); g.add(e); }
    windows(g, 3.0, 5.0, 3.0, 0, 0, 0, 3, 2, { sides: false }); door(g, 0, 0, 1.5);
    return 8.4;
  },
  court(g) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.12, 5.4), M('#e07a35')); s.position.y = 0.08; g.add(s);
    for (const [w, d, x, z] of [[5.0, 0.08, 0, 2.55], [5.0, 0.08, 0, -2.55], [0.08, 5.2, 2.45, 0], [0.08, 5.2, -2.45, 0], [5.0, 0.08, 0, 0]]) box(g, w, 0.02, d, '#fff', x, 0.14, z);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.06, 6, 16), M('#ffffff')); ring.rotation.x = Math.PI / 2; ring.position.set(0, 0.16, 0); g.add(ring);
    for (const z of [-2.4, 2.4]) { cyl(g, 0.08, 0.08, 2.8, '#555', 0, 0, z * 1.05); box(g, 1.2, 0.8, 0.08, '#fff', 0, 2.6, z * 0.98); const r = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 6, 12), M('#ff5a1f')); r.rotation.x = Math.PI / 2; r.position.set(0, 2.6, z * 0.9); g.add(r); }
    sph(g, 0.3, '#e8641e', 1.0, 0.45, 0.6);
    return 3.6;
  },
  carroof(g, n) {
    box(g, 3.6, 2.4, 3.2, '#c9b79c'); windows(g, 3.6, 2.4, 3.2, 0, 0, 0, 1, 3, { skipDoor: true }); door(g, 0, 0, 1.6); box(g, 3.8, 0.2, 3.4, '#5a4a3a', 0, 2.4);
    box(g, 1.6, 0.6, 2.6, '#e03131', 0, 2.65, 0); box(g, 1.3, 0.55, 1.3, '#e03131', 0, 3.25, -0.1);
    for (const zz of [-0.9, 0.9]) for (const xx of [-0.8, 0.8]) { const w = cyl(g, 0.3, 0.3, 0.2, '#111', xx, 0, zz, 10); w.rotation.z = Math.PI / 2; w.position.y = 2.9; }
    return 4.3;
  },
  star(g) {
    const st = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 + Math.PI / 2, r = i % 2 ? 1.2 : 2.8; i ? st.lineTo(Math.cos(a) * r, Math.sin(a) * r) : st.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(st, { depth: 1.2, bevelEnabled: true, bevelSize: 0.15, bevelThickness: 0.15, bevelSegments: 1 }), M('#ff7fc4', { emissive: '#ff4fa8', emissiveIntensity: 0.35 }));
    m.position.set(0, 2.6, -0.6); g.add(m);
    door(g, 0, 0, 0.8, 0.6, 1.0, '#8a2a5c');
    const w = new THREE.Mesh(new THREE.CircleGeometry(0.35, 16), WIN()); w.position.set(0, 3.0, 0.8); g.add(w);
    return 5.6;
  },
  hut(g) {
    box(g, 2.6, 1.8, 2.4, '#8a5a35'); for (let i = 0; i < 4; i++) box(g, 2.7, 0.08, 2.5, '#6b4224', 0, 0.3 + i * 0.42);
    door(g, 0, 0, 1.2, 0.6, 1.1); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), WIN()); p.position.set(0.8, 1.0, 1.22); g.add(p);
    gable(g, 2.6, 2.4, 1.4, '#d4b45a', 0, 1.8, 0, 0.35);
    return 3.3;
  },
  stadium(g) {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 2.5, 1.6, 24, 1, true), M('#c9ced6', { side: THREE.DoubleSide })); ring.scale.z = 1.25; ring.position.y = 0.8; g.add(ring);
    const inner = new THREE.Mesh(new THREE.CylinderGeometry(2.45, 2.45, 0.1, 24), M('#3fa34d')); inner.scale.z = 1.25; inner.position.y = 0.1; g.add(inner);
    box(g, 0.05, 0.02, 4.0, '#fff', 0, 0.16, 0); const c = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.04, 4, 16), M('#fff')); c.rotation.x = Math.PI / 2; c.position.y = 0.17; g.add(c);
    const top = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.18, 4, 24), M('#e03131')); top.rotation.x = Math.PI / 2; top.scale.y = 1.25; top.position.y = 1.62; g.add(top);
    for (const [x, z] of [[-2.8, 3.2], [2.8, 3.2], [-2.8, -3.2], [2.8, -3.2]]) { cyl(g, 0.07, 0.07, 3.4, '#777', x, 0, z); box(g, 0.7, 0.35, 0.1, '#fff', x, 3.4, z, M('#fffbe0', { emissive: '#fff6c0', emissiveIntensity: 1 })); }
    return 3.9;
  },
  bunkerhouse(g, n) {
    const h = basicHouse(g, '#e5cfa8', '#3f4a5c', 1);
    box(g, 1.2, 0.35, 1.2, '#7a7f86', 2.2, 0, 2.0); for (let i = 0; i < 3; i++) box(g, 1.22, 0.05, 0.18, i % 2 ? '#222' : '#f4c430', 2.2, 0.36, 1.6 + i * 0.4);
    return h;
  },
  best(g) {
    const Gd = '#f2c14e';
    box(g, 5.0, 5.4, 3.4, '#fff4d6'); windows(g, 5.0, 5.4, 3.4, 0, 0, 0, 3, 5, { skipDoor: true }); door(g, 0, 0, 1.7, 1.0, 1.6, '#7a4b16');
    for (let i = 0; i < 6; i++) cyl(g, 0.16, 0.16, 3.6, '#fff', -1.75 + i * 0.7, 0, 2.1);
    gable(g, 4.6, 1.0, 0.8, Gd, 0, 3.6, 2.1, 0.1);
    pyramid(g, 4.8, 1.6, Gd, 0, 5.4, 0);
    const cr = new THREE.Group(); cyl(cr, 0.6, 0.6, 0.4, Gd); for (let i = 0; i < 5; i++) cone(cr, 0.14, 0.4, Gd, Math.cos(i * 1.256) * 0.55, 0.4, Math.sin(i * 1.256) * 0.55, 6); cr.position.y = 7.0; g.add(cr);
    return 7.8;
  },
  kirik(g) {
    box(g, 3.4, 4.4, 3.0, '#a7acb2', -0.6, 0, -0.2); windows(g, 3.4, 4.4, 3.0, -0.6, 0, -0.2, 2, 3, { skipDoor: true }); door(g, -0.6, 0, 1.3);
    gable(g, 3.4, 3.0, 1.4, '#3a4250', -0.6, 4.4, -0.2);
    box(g, 1.8, 2.0, 2.6, '#8e949b', 1.9, 0, -0.4); box(g, 1.4, 1.4, 0.05, '#5d636a', 1.9, 0, 0.92);
    box(g, 1.3, 1.3, 1.3, '#9a6a3c', 2.1, 0, 2.3); gable(g, 1.3, 1.3, 0.6, '#5a3622', 2.1, 1.3, 2.3, 0.1);
    box(g, 0.5, 0.35, 0.8, '#3a2a20', -1.6, 0, 2.4); box(g, 0.35, 0.35, 0.35, '#3a2a20', -1.6, 0.3, 2.9);
    const cols = ['#ff4d4d', '#4dff88', '#4db8ff', '#ffd24d', '#ff7af0'];
    for (let i = 0; i < 9; i++) sph(g, 0.1, cols[i % 5], -2.3 + i * 0.42, 4.35 - Math.sin(i / 8 * Math.PI) * 0.18, 1.35, M(cols[i % 5], { emissive: cols[i % 5], emissiveIntensity: 1 }), 6, 4);
    return 5.9;
  },
  tuva(g) {
    const flag = canvasTex(512, 320, (x, w, h) => {
      x.fillStyle = '#1f5fbf'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(0, 0); x.lineTo(110, 0); x.lineTo(300, 120); x.lineTo(w, 120); x.lineTo(w, 200); x.lineTo(300, 200); x.lineTo(110, h); x.lineTo(0, h); x.closePath(); x.fill();
      x.fillStyle = '#f8d22a'; x.beginPath(); x.moveTo(0, 30); x.lineTo(230, h / 2); x.lineTo(0, h - 30); x.closePath(); x.fill();
    });
    box(g, 3.6, 2.6, 3.0, '#f2f2f2'); const f = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.1), new THREE.MeshBasicMaterial({ map: flag })); f.position.set(0, 1.4, 1.52); g.add(f);
    door(g, 0, 0, 1.55, 0.6, 1.0); gable(g, 3.6, 3.0, 1.4, '#1f5fbf', 0, 2.6, 0);
    cyl(g, 0.05, 0.05, 3.2, '#ddd', 2.2, 0, 1.2); const ff = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.75), new THREE.MeshBasicMaterial({ map: flag, side: THREE.DoubleSide })); ff.position.set(2.82, 2.8, 1.2); g.add(ff);
    return 4.4;
  },
  theater(g) {
    box(g, 4.8, 3.6, 3.0, '#efe0c4', 0, 0, -0.4); box(g, 5.0, 0.3, 4.2, '#d8c49f', 0, 0, 0);
    for (let i = 0; i < 6; i++) cyl(g, 0.17, 0.2, 3.0, '#fffaf0', -2.0 + i * 0.8, 0.3, 1.6, 10);
    gable(g, 5.0, 1.4, 1.1, '#efe0c4', 0, 3.3, 1.4, 0.05); box(g, 5.0, 0.3, 4.0, '#d8c49f', 0, 3.3, -0.2);
    door(g, 0, 0.3, 1.11, 1.6, 2.0, '#b3122e'); sign(g, 'ТЕАТР', 2.4, 0.6, 0, 4.9, 1.2, { w: 512, h: 128, bg: '#2b1f3d', fg: '#ffd23f', font: '900 90px Inter' });
    return 5.6;
  },
  poolhouse(g) {
    box(g, 4.6, 3.0, 3.0, '#e8c3a0', 0, 0, -0.8); windows(g, 4.6, 3.0, 3.0, 0, 0, -0.8, 1, 4); door(g, 0, 0, 0.72);
    pyramid(g, 4.5, 1.4, '#ffffff', 0, 3.0, -0.8);
    const pool = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 1.5), M('#3ec5f5', { emissive: '#1aa0e0', emissiveIntensity: 0.4 })); pool.position.set(-0.4, 0.06, 2.0); g.add(pool);
    for (const z of [1.5, 2.4]) { const l = box(g, 0.5, 0.15, 1.1, '#ffffff', 2.0, 0.2, z); l.rotation.x = 0; }
    return 4.6;
  },
  poolmansion(g, n) {
    const h = BUILD.mansion(g, n, '#f7efe3', '#7a3b2e');
    const pool = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 1.3), M('#3ec5f5', { emissive: '#1aa0e0', emissiveIntensity: 0.4 })); pool.position.set(0, 0.06, 3.0); g.add(pool);
    return h;
  },
  apart(g) {
    box(g, 3.8, 7.0, 3.2, '#d7c9b8'); windows(g, 3.8, 7.0, 3.2, 0, 0, 0, 5, 4); door(g, 0, 0, 1.6, 0.8, 1.2, '#3a3a4a');
    box(g, 4.0, 0.3, 3.4, '#6a5f78', 0, 7.0);
    for (let f = 1; f < 5; f++) box(g, 3.0, 0.1, 0.4, '#8a7f98', 0, f * 1.4, 1.75);
    return 7.6;
  },
  dog(g) {
    const B = '#c98b4a', D = '#7a4e2a';
    box(g, 2.4, 2.0, 3.6, B, 0, 0.8, 0); for (const [x, z] of [[-0.8, 1.3], [0.8, 1.3], [-0.8, -1.3], [0.8, -1.3]]) box(g, 0.5, 0.8, 0.5, D, x, 0, z);
    box(g, 1.8, 1.7, 1.6, B, 0, 2.2, 1.9); box(g, 0.9, 0.6, 0.6, '#e8c08a', 0, 2.4, 2.9); sph(g, 0.2, '#222', 0, 2.95, 3.2);
    box(g, 0.4, 0.9, 0.4, D, -0.8, 3.6, 1.7); box(g, 0.4, 0.9, 0.4, D, 0.8, 3.6, 1.7);
    for (const x of [-0.45, 0.45]) { const e = new THREE.Mesh(new THREE.CircleGeometry(0.16, 12), M('#111')); e.position.set(x, 3.3, 2.71); g.add(e); }
    const t = box(g, 0.25, 1.0, 0.25, D, 0, 2.4, -1.9); t.rotation.x = -0.6;
    door(g, 0, 0.8, 1.8, 0.8, 1.0, '#5a3b26');
    return 4.6;
  },
  tower(g) {
    cyl(g, 1.4, 1.6, 7.0, '#9b93a3', 0, 0, 0, 12); for (let i = 0; i < 8; i++) box(g, 0.45, 0.5, 0.45, '#9b93a3', Math.cos(i * 0.785) * 1.4, 7.0, Math.sin(i * 0.785) * 1.4);
    cone(g, 1.6, 2.4, '#4b2c7a', 0, 7.5, 0, 12);
    for (let f = 0; f < 4; f++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.6), WIN()); p.position.set(0, 1.6 + f * 1.4, 1.52); g.add(p); }
    door(g, 0, 0, 1.58, 0.7, 1.2);
    return 10;
  },
  catroof(g, n) {
    const h = basicHouse(g, '#e9d6b9', '#8a3b6a', 1);
    const C = '#f08c3c'; box(g, 0.5, 0.45, 0.9, C, 0.5, 3.0, 0); box(g, 0.5, 0.45, 0.45, C, 0.5, 3.35, 0.45);
    cone(g, 0.12, 0.25, C, 0.36, 3.8, 0.45, 4); cone(g, 0.12, 0.25, C, 0.64, 3.8, 0.45, 4);
    const tl = box(g, 0.1, 0.7, 0.1, C, 0.5, 3.3, -0.5); tl.rotation.x = -0.5;
    return h + 0.5;
  },
  dance(g) {
    box(g, 4.6, 3.0, 3.2, '#3a2a5a'); const cols = ['#ff4fd8', '#4fd8ff', '#ffe14f'];
    for (let i = 0; i < 3; i++) box(g, 4.62, 0.15, 3.22, cols[i], 0, 0.6 + i * 0.8, 0, M(cols[i], { emissive: cols[i], emissiveIntensity: 1 }));
    door(g, 0, 0, 1.6, 1.0, 1.4, '#120a20');
    cyl(g, 0.03, 0.03, 0.6, '#aaa', 0, 3.0, 0); const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 1), M('#d8e2ff', { emissive: '#9fb4ff', emissiveIntensity: 0.6 })); ball.position.y = 4.2; g.add(ball); g.userData.spin = ball;
    return 5.2;
  },
  jurassic(g) {
    const Wd = '#6b4a2a';
    box(g, 0.5, 3.6, 0.5, Wd, -2.2, 0, 2.4); box(g, 0.5, 3.6, 0.5, Wd, 2.2, 0, 2.4); box(g, 5.2, 0.7, 0.5, Wd, 0, 3.6, 2.4);
    sign(g, 'ПАРК', 2.4, 0.55, 0, 3.95, 2.68, { w: 512, h: 120, bg: '#6b4a2a', fg: '#ffd23f', font: '900 90px Inter' });
    const D = '#5fae4f';
    const body = sph(g, 1, D, 0, 1.8, -0.8); body.scale.set(1.0, 0.9, 1.6);
    for (const [x, z] of [[-0.6, 0], [0.6, 0], [-0.6, -1.6], [0.6, -1.6]]) cyl(g, 0.25, 0.25, 1.2, D, x, 0, z);
    const neck = cyl(g, 0.3, 0.4, 2.8, D, 0, 2.0, 0.5); neck.rotation.x = 0.5; neck.position.set(0, 3.0, 0.9);
    const hd = sph(g, 0.5, D, 0, 4.3, 1.6); hd.scale.set(0.8, 0.7, 1.2);
    const tail = cyl(g, 0.05, 0.4, 2.6, D, 0, 1.6, -2.6); tail.rotation.x = -1.2; tail.position.set(0, 1.7, -2.7);
    for (const x of [-2.4, 2.4]) { cyl(g, 0.12, 0.15, 3.0, '#7a5a3a', x, 0, -1.6); for (let i = 0; i < 5; i++) { const l = box(g, 0.25, 0.06, 1.4, '#3f8f3a', x + Math.cos(i * 1.26) * 0.5, 3.0, -1.6 + Math.sin(i * 1.26) * 0.5); l.rotation.y = i * 1.26; l.rotation.z = 0.3; } }
    return 5.0;
  },
  pillow(g) {
    const p = sph(g, 2.4, '#efe9ff', 0, 1.4, 0, undefined, 16, 10); p.scale.set(1.0, 0.6, 0.9);
    for (const [x, z] of [[-2.1, 1.7], [2.1, 1.7], [-2.1, -1.7], [2.1, -1.7]]) cone(g, 0.35, 0.5, '#efe9ff', x, 1.1, z, 6).rotation.z = x > 0 ? -1.2 : 1.2;
    door(g, 0, 0.1, 2.15, 0.7, 1.1, '#9a8acb'); const w = new THREE.Mesh(new THREE.CircleGeometry(0.3, 14), WIN()); w.position.set(1.1, 1.6, 1.9); g.add(w);
    return 3.0;
  },
  smile(g) {
    const face = canvasTex(512, 512, (x, w, h) => {
      x.fillStyle = '#ffd23f'; x.fillRect(0, 0, w, h);
      const heart = (cx, cy, s) => { x.fillStyle = '#ff2a4f'; x.beginPath(); x.moveTo(cx, cy + s * 0.9); x.bezierCurveTo(cx - s * 1.6, cy - s * 0.2, cx - s * 0.8, cy - s * 1.4, cx, cy - s * 0.5); x.bezierCurveTo(cx + s * 0.8, cy - s * 1.4, cx + s * 1.6, cy - s * 0.2, cx, cy + s * 0.9); x.fill(); };
      heart(170, 200, 60); heart(342, 200, 60);
      x.strokeStyle = '#6a3a10'; x.lineWidth = 26; x.lineCap = 'round'; x.beginPath(); x.arc(256, 290, 110, 0.2, Math.PI - 0.2); x.stroke();
    });
    cyl(g, 2.0, 2.0, 3.6, '#ffd23f', 0, 0, 0, 20);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: face })); f.position.set(0, 1.9, 2.02); g.add(f);
    const dm = new THREE.Mesh(new THREE.SphereGeometry(2.0, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), M('#ffc21a')); dm.position.y = 3.6; g.add(dm);
    door(g, 0, 0, 2.03, 0.6, 0.6, '#a86a10');
    return 5.8;
  },
  armenian(g) {
    const T = '#d39a86';
    box(g, 5.0, 4.0, 3.2, T); door(g, 0, 0, 1.6, 0.9, 1.6, '#4a2a1e');
    for (let f = 0; f < 2; f++) for (let i = 0; i < 4; i++) { if (f === 0 && (i === 1 || i === 2)) continue; const a = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.9), WIN()); a.position.set(-1.8 + i * 1.2, 1.0 + f * 1.9, 1.62); g.add(a); const ar = new THREE.Mesh(new THREE.CircleGeometry(0.3, 10, 0, Math.PI), WIN()); ar.position.set(-1.8 + i * 1.2, 1.45 + f * 1.9, 1.62); g.add(ar); }
    windows(g, 5.0, 4.0, 3.2, 0, 0, 0, 2, 0, { sides: true });
    cyl(g, 1.0, 1.0, 1.0, T, 0, 4.0, 0, 8); cone(g, 1.2, 1.4, '#8a4a3a', 0, 5.0, 0, 8);
    return 6.6;
  },
  royal(g, n) {
    const h = BUILD.mansion(g, n, '#f1e6f7', '#6a3ab0');
    const Gd = '#f2c14e'; const cr = new THREE.Group(); cyl(cr, 0.8, 0.8, 0.5, Gd, 0, 0, 0, 10, M(Gd, { emissive: '#c98a10', emissiveIntensity: 0.4 }));
    for (let i = 0; i < 5; i++) cone(cr, 0.18, 0.55, Gd, Math.cos(i * 1.256) * 0.72, 0.5, Math.sin(i * 1.256) * 0.72, 6);
    cr.position.y = 5.9; g.add(cr);
    return h + 1.2;
  },
  mosque(g) {
    const W = '#f5f2ea', T = '#2fb5a8';
    box(g, 4.4, 2.8, 3.4, W); door(g, 0, 0, 1.7, 0.9, 1.6, '#2a6b66');
    for (const x of [-1.4, 1.4]) { const a = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.0), WIN()); a.position.set(x, 1.4, 1.72); g.add(a); }
    cyl(g, 1.3, 1.3, 0.5, W, 0, 2.8, 0, 16);
    const dm = new THREE.Mesh(new THREE.SphereGeometry(1.3, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M(T)); dm.position.y = 3.3; dm.scale.y = 1.3; g.add(dm);
    for (const x of [-2.5, 2.5]) { cyl(g, 0.28, 0.32, 6.0, W, x, 0, 1.2, 10); box(g, 0.8, 0.15, 0.8, W, x, 4.6, 1.2); cone(g, 0.32, 1.0, T, x, 6.0, 1.2, 10); }
    const cs = new THREE.Shape(); cs.absarc(0, 0, 0.3, 0.7, Math.PI * 2 - 0.7, false); cs.absarc(0.15, 0, 0.24, Math.PI * 2 - 1.0, 1.0, true);
    const c = new THREE.Mesh(new THREE.ExtrudeGeometry(cs, { depth: 0.06, bevelEnabled: false }), M('#ffd23f', { emissive: '#ffb800', emissiveIntensity: 0.6 })); c.rotation.z = Math.PI / 2; c.position.set(0, 5.4, 0); g.add(c);
    return 7.2;
  },
  hotel(g) {
    box(g, 4.0, 8.4, 3.0, '#e9e3f0'); windows(g, 4.0, 8.4, 3.0, 0, 0, 0, 6, 4, { skipDoor: false }); door(g, 0, 0, 1.5, 1.0, 1.3, '#2b1f3d');
    box(g, 4.2, 0.3, 3.2, '#4b2c7a', 0, 8.4);
    sign(g, 'ОТЕЛЬ', 3.2, 0.8, 0, 9.3, 0.6, { w: 512, h: 128, bg: '#c2185b', fg: '#ffffff', font: '900 92px Inter' });
    box(g, 2.6, 0.12, 1.0, '#c2185b', 0, 1.6, 2.0);
    return 10;
  },
  bunker(g) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(2.4, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M('#5f7a45')); m.scale.y = 0.7; g.add(m);
    box(g, 1.6, 1.4, 1.2, '#8a8f96', 0, 0, 1.8); box(g, 1.0, 1.0, 0.05, '#4a4f56', 0, 0, 2.42);
    for (let i = 0; i < 4; i++) box(g, 0.25, 0.12, 0.06, i % 2 ? '#222' : '#f4c430', -0.5 + i * 0.33, 1.15, 2.42);
    cyl(g, 0.15, 0.15, 1.2, '#8a8f96', 1.0, 1.2, -0.5); cyl(g, 0.25, 0.25, 0.15, '#6a6f76', 1.0, 2.4, -0.5);
    return 2.8;
  },
  pineapple(g) {
    const tex = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#f0a62a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#b8720f'; x.lineWidth = 6; for (let i = -w; i < w * 2; i += 40) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + h, h); x.stroke(); x.beginPath(); x.moveTo(i, h); x.lineTo(i + h, 0); x.stroke(); } });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 2);
    const b = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 12), new THREE.MeshLambertMaterial({ map: tex })); b.scale.set(1, 1.5, 1); b.position.y = 2.6; g.add(b);
    for (let i = 0; i < 7; i++) { const l = cone(g, 0.35, 2.0, '#3f9a3a', Math.cos(i * 0.9) * 0.35, 4.6, Math.sin(i * 0.9) * 0.35, 5); l.rotation.z = Math.cos(i * 0.9) * 0.5; l.rotation.x = Math.sin(i * 0.9) * 0.5; }
    door(g, 0, 0, 1.65, 0.7, 1.2, '#6a4a2a');
    for (const [x, y] of [[-0.8, 3.0], [0.8, 3.6]]) { const w = new THREE.Mesh(new THREE.CircleGeometry(0.3, 14), WIN()); w.position.set(x, y, 1.62); g.add(w); }
    return 6.8;
  },
  tiny(g) {
    box(g, 1.8, 1.4, 1.6, '#ffe0e6'); door(g, 0, 0, 0.8, 0.45, 0.8, '#b05a6a'); gable(g, 1.8, 1.6, 0.9, '#ff7f9f', 0, 1.4, 0, 0.15);
    for (let i = 0; i < 4; i++) sph(g, 0.12, ['#ff4d6d', '#ffd23f', '#ff9fcf', '#b18cff'][i], -0.8 + i * 0.5, 0.15, 1.2, undefined, 6, 4);
    return 2.4;
  },
  school(g) {
    box(g, 6.0, 5.2, 3.4, '#f4b860'); windows(g, 6.0, 5.2, 3.4, 0, 0, 0, 3, 6, { skipDoor: true }); door(g, 0, 0, 1.7, 1.1, 1.5, '#5a3b26');
    box(g, 6.2, 0.35, 3.6, '#a6402f', 0, 5.2);
    sign(g, 'ШКОЛА №120', 4.6, 0.95, 0, 6.2, 1.2, { w: 768, h: 160, bg: '#2b1f3d', fg: '#ffd23f', font: '900 100px Inter' });
    cyl(g, 0.05, 0.05, 2.4, '#ddd', 2.6, 5.5, 1.0); box(g, 0.9, 0.55, 0.03, '#ffffff', 3.05, 7.3, 1.0); box(g, 0.9, 0.18, 0.04, '#2050c0', 3.05, 7.48, 1.0); box(g, 0.9, 0.18, 0.05, '#d02020', 3.05, 7.3, 1.0);
    return 7.0;
  },
};

export function buildHouse(type, nick) {
  const g = new THREE.Group();
  const [t0, ...args] = String(type).split(':');
  const fn = BUILD[t0] || BUILD.std;
  const h = fn(g, nick, ...args);
  g.userData.h = h * (g.scale.y || 1);
  const outer = new THREE.Group(); outer.add(g); outer.userData = { h: g.userData.h, inner: g };
  return outer;
}
