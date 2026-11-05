import * as THREE from './three.module.js';
import { M, box, cyl, sph, cone, buildHouse, gable } from './builders.js';
import './extra.js';
import './extra2.js';

const W = 1080, H = 1920;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const sm = (a, b, t) => { const k = clamp((t - a) / (b - a)); return k * k * (3 - 2 * k); };
const outBack = (k) => { k = clamp(k); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const esc = (s) => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// ================= TIMELINE =================
export const TL = {
  s1: 0.2, sB: 8.45, s3: 15.5233, s4: 19.9233, s5: 30.8933, s6: 39.5533, s7: 45.7833, s8: 51.8933, s9: 57.2533, end: 66.0633,
  t1: 1.9, agro: 8.35, grow0: 11.9, grow1: 14.95, tap: 2.2, pop: 3.85, bub: 5.2, castle: 5.45, m: [5.45, 6.15, 6.85, 7.55], ty: [999, 999, 999], rise: 15.3233, big: 999,
  f0: 17.7933, sec0: 30.4933, sec1: 38.2533, f1: 39.2533, alert: 42.2833, w0: 42.9833, w1: 45.6833, minus: 45.9833, rebuild: 48.3833, mayor: 51.6933, volc: 51.6933, zomb: 999, fin: 57.1533,
};
const DEMO = [['std', 'ТВОЙ_НИК', null], ['castle', 'ominahon498', 'Хочу дом Замок 🏰'], ['rocket', 'mark_burlai', 'Можно мне дом ракету 🚀'], ['pizza', 'rasulaliaskarov', 'Хочу дом пицца 🍕'], ['shark', 'aminka39833', 'Можно дом акула 🦈']];
const VOICE = {"capybara": 2.24, "shark": 3.74, "watermelon": 4.69, "pizza": 5.44, "pelmen": 6.14, "cheburek": 7.19, "ferris": 8.54, "burj": 9.94};
const VCHIP = { capybara: '🦫 ДОМ-КАПИБАРА', shark: '🦈 ДОМ-АКУЛА', watermelon: '🍉 ДОМ-АРБУЗ', pizza: '🍕 ДОМ-ПИЦЦА', pelmen: '🥟 ДОМ-ПЕЛЬМЕНЬ', cheburek: '🥟 ЧЕБУРЕЧНАЯ', ferris: '🎡 КОЛЕСО ОБОЗРЕНИЯ', burj: '🏙 БУРДЖ-ХАЛИФА' };
const VT = Object.fromEntries(Object.entries(VOICE).map(([k, v]) => [k, TL.s4 + v]));

// ================= CITY GEOMETRY =================
const COLS = [-17.4, -11.2, -5.0, 5.0, 11.2, 17.4];
const RS = 6.2, NR = 199, GAPA = 55, GSN = 5; let GAPB = 120;
const zRow = (r) => -(r + (r >= GAPA ? 3 : 0) + (r >= GAPB ? GSN : 0)) * RS;
const zA = -(GAPA + 1) * RS; let zS = 0;
const Z_END = -(NR - 1 + 3 + GSN) * RS, Z_COAST = Z_END - 12, Z_SEA = Z_END - 24;
function hc(z) { // city ground height (relief along the avenue)
  if (z > 0) return 0;
  let h = 2.6 * Math.sin(-z / 150) + 1.3 * Math.sin(-z / 47 + 1.0) * clamp(-z / 40);
  h = Math.max(h, -0.4) + 0.4;
  return h * (1 - sm(Z_END + 120, Z_END, z)) + 0;
}
// river path
const RIVER = new THREE.CatmullRomCurve3([[-190, -260], [-110, -360], [-50, zA + 8], [0, zA], [50, zA - 8], [62, zA - 70], [52, -600], [62, -900], [56, -1150], [58, Z_SEA + 40], [52, Z_SEA - 60]].map(([x, z]) => v3(x, 0, z)), false, 'catmullrom', 0.4);
const RPTS = RIVER.getSpacedPoints(700);
function riverDist(x, z) { let best = 1e9; for (let i = 0; i < RPTS.length; i += 1) { const p = RPTS[i]; const dx = p.x - x, dz = p.z - z; const d = dx * dx + dz * dz; if (d < best) best = d; } return Math.sqrt(best); }
function terrainH(x, z) {
  const ax = Math.abs(x); const base = hc(Math.min(z, 0));
  const n = Math.sin(x * 0.07) + Math.sin(z * 0.05 + x * 0.03) + 0.5 * Math.sin(x * 0.19 + z * 0.11) + 0.35 * Math.sin(z * 0.27 - x * 0.15);
  const ramp = clamp((ax - 30) / 70);
  let h = base + ramp * ramp * 46 + ramp * (4 + 3 * n) + clamp((ax - 23) / 10) * (0.8 + 0.5 * n);
  if (z > 30) h += clamp((z - 30) / 60) * (10 + 6 * n) * clamp(ax / 40 + 0.3);
  return h;
}
let RD; // cached river distance grid for terrain
function groundH(x, z, rd) {
  let h = terrainH(x, z);
  if (rd === undefined) rd = riverDist(x, z);
  const wl = hc(z) - 1.0;
  if (rd < 5) h = wl - 0.8; else if (rd < 11) h = lerp(wl - 0.8, Math.max(h, wl + 0.6), sm(5, 11, rd));
  if (z < Z_COAST) { const k = clamp((Z_COAST - z) / 14); h = lerp(h, -2.2, k * clamp(1 - (Math.abs(x) - 120) / 200)); if (Math.abs(x) < 140) h = lerp(h, -2.2, k); }
  return h;
}

let renderer, scene, camera, skyU, hemi, dir, fogCol;
const houses = []; let byZ = [];
const overlay = {}; const S = {};

function makeGlowTex(c0 = 'rgba(255,220,140,0.9)', c1 = 'rgba(255,200,110,0.35)') {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, c0); g.addColorStop(0.3, c1); g.addColorStop(1, 'rgba(255,180,90,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
}

function stripAlong(width, x, z0, z1, step, color, yoff, mat) { // ribbon following hc(z)
  const v = [], idx = []; let k = 0;
  for (let z = z0; z >= z1; z -= step) { const y = hc(z) + yoff; v.push(x - width / 2, y, z, x + width / 2, y, z); if (k) idx.push(2 * k - 2, 2 * k - 1, 2 * k, 2 * k - 1, 2 * k + 1, 2 * k); k++; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat || M(color)); scene.add(m); return m;
}

function buildWorld() {
  skyU = { storm: { value: 0 }, green: { value: 0 } };
  scene.add(S.sky = new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: skyU, fog: false,
    vertexShader: 'varying vec3 vp; void main(){ vp = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} ',
    fragmentShader: `uniform float storm; uniform float green; varying vec3 vp; void main(){ float y = vp.y;
      vec3 top = mix(vec3(0.33,0.22,0.45), vec3(0.17,0.13,0.27), storm);
      vec3 mid = mix(vec3(0.62,0.38,0.58), vec3(0.32,0.24,0.42), storm);
      vec3 hor = mix(vec3(0.98,0.62,0.45), vec3(0.58,0.46,0.66), storm);
      top = mix(top, vec3(0.06,0.14,0.06), green); mid = mix(mid, vec3(0.16,0.32,0.14), green); hor = mix(hor, vec3(0.55,0.85,0.35), green);
      vec3 c = y > 0.12 ? mix(mid, top, clamp((y-0.12)/0.5,0.,1.)) : mix(hor, mid, clamp((y+0.02)/0.14,0.,1.));
      gl_FragColor = vec4(c,1.0);} `,
  })));
  fogCol = new THREE.Color('#7e5a86'); scene.fog = new THREE.Fog(fogCol, 160, 620);
  hemi = new THREE.HemisphereLight('#c9a6e6', '#3b5a3a', 1.6); scene.add(hemi);
  dir = new THREE.DirectionalLight('#ffd2b0', 1.5); dir.position.set(-40, 60, 80); scene.add(dir);

  // terrain
  const ZT0 = 160, ZT1 = Z_SEA - 160, XT = 300;
  const geo = new THREE.PlaneGeometry(2 * XT, ZT0 - ZT1, 150, 520); geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position; const col = [];
  const C = (h) => new THREE.Color(h);
  const cCity = C('#5b4868'), g1 = C('#5f9a48'), g2 = C('#4e8a3e'), g3 = C('#7f8f58'), rock = C('#8a7f88'), snow = C('#f4f2f8'), sand = C('#d9c08a');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i) + (ZT0 + ZT1) / 2; pos.setZ(i, z);
    const rd = riverDist(x, z); const h = groundH(x, z, rd); pos.setY(i, h - 0.05);
    const rel = h - hc(Math.min(z, 0)); let c;
    if (z < Z_COAST + 4 && z > Z_SEA - 30) c = sand;
    else if (rd < 11) c = sand;
    else if (Math.abs(x) < 23 && z < 22 && z > Z_COAST) c = cCity;
    else if (rel > 38) c = snow; else if (rel > 28) c = rock; else if (rel > 15) c = g3;
    else c = ((Math.floor(x / 9) + Math.floor(z / 9)) & 1) ? g1 : g2;
    col.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals();
  scene.add(new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })));
  // river ribbon
  const waterM = new THREE.MeshLambertMaterial({ color: '#3d9be0', emissive: '#1d5f9a', emissiveIntensity: 0.5, side: THREE.DoubleSide });
  { const v = [], idx = []; const pts = RIVER.getSpacedPoints(900); pts.forEach((p, k) => { const tg = RIVER.getTangentAt(k / 900); const nx = -tg.z, nz = tg.x; const y = Math.max(hc(Math.min(p.z, 0)) - 1.0, -0.6); v.push(p.x + nx * 5.6, y, p.z + nz * 5.6, p.x - nx * 5.6, y, p.z - nz * 5.6); if (k) idx.push(2 * k - 2, 2 * k - 1, 2 * k, 2 * k - 1, 2 * k + 1, 2 * k); });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setIndex(idx); g.computeVertexNormals(); scene.add(new THREE.Mesh(g, waterM)); }
  // sea
  S.sea = new THREE.Mesh(new THREE.PlaneGeometry(2400, 1400), M('#2d6fa8', { emissive: '#14385a', emissiveIntensity: 0.35 })); S.sea.rotation.x = -Math.PI / 2; S.sea.position.set(0, -0.6, Z_SEA - 700); scene.add(S.sea);
  // roads
  stripAlong(5.2, 0, 40, Z_COAST, 3, '#4a3a57', 0.06);
  const dashG = new THREE.PlaneGeometry(0.22, 1.6); const dashM = M('#e8d9a8', { emissive: '#bfae80', emissiveIntensity: 0.3 });
  const dashes = new THREE.InstancedMesh(dashG, dashM, 700); let di = 0; const mtx = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)), one = v3(1, 1, 1);
  for (let z = 38; z > Z_COAST && di < 700; z -= 4) { mtx.compose(v3(0, hc(z) + 0.09, z), q, one); dashes.setMatrixAt(di++, mtx); } dashes.count = di; scene.add(dashes);
  for (const x of [-8.1, 8.1, -14.3, 14.3]) stripAlong(1.0, x, 12, Z_COAST, 6, '#53435f', 0.05);
  // plots (instanced)
  const plotG = new THREE.BoxGeometry(5.2, 0.9, 5.2); const plots = new THREE.InstancedMesh(plotG, M('#55803f'), NR * 6 + 20); let pi = 0;
  for (let r = 0; r < NR; r++) for (const x of COLS) { const z = zRow(r); mtx.compose(v3(x, hc(z) - 0.33, z), new THREE.Quaternion(), one); plots.setMatrixAt(pi++, mtx); }
  mtx.compose(v3(5.0, -0.33, 7.4), new THREE.Quaternion(), one); plots.setMatrixAt(pi++, mtx);
  plots.count = pi; scene.add(plots);
  // bridges over the river crossings
  for (const zc of [zA]) {
    const y = hc(zc);
    box(scene, 6.4, 0.7, 26, '#9a6a3c', 0, y - 0.5, zc); box(scene, 5.2, 0.05, 26, '#4a3a57', 0, y + 0.2, zc);
    for (const s of [-3.1, 3.1]) { box(scene, 0.18, 0.18, 26, '#6b4224', s, y + 1.1, zc); for (let i = -12; i <= 12; i += 2) box(scene, 0.15, 1.0, 0.15, '#6b4224', s, y + 0.2, zc + i); }
    for (const x of [-11.2, 11.2]) { box(scene, 2.4, 0.4, 26, '#b08a5c', x, y - 0.3, zc); }
    for (const x of [-19, 19]) { box(scene, 1.2, 4, 1.2, '#cfc4b0', x, y - 3, zc - 12); }
  }
  // lamps (instanced posts + bulbs) + glow sprites
  const postG = new THREE.CylinderGeometry(0.06, 0.08, 3.4, 6); postG.translate(0, 1.7, 0);
  const posts = new THREE.InstancedMesh(postG, M('#2a2233'), 400), bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.2, 8, 6), M('#ffe6a8', { emissive: '#ffd27a', emissiveIntensity: 1 }), 400);
  const glowM = new THREE.SpriteMaterial({ map: makeGlowTex(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  let li = 0; for (let r = -1; r < NR; r += 2) for (const s of [-1, 1]) { const z = zRow(Math.max(r, 0)) + (r < 0 ? 12 : 3.1), x = s * 2.85, y = hc(z); mtx.compose(v3(x, y, z), new THREE.Quaternion(), one); posts.setMatrixAt(li, mtx); mtx.compose(v3(x, y + 3.45, z), new THREE.Quaternion(), one); bulbs.setMatrixAt(li, mtx); li++; const sp = new THREE.Sprite(glowM); sp.position.set(x, y + 3.4, z); sp.scale.set(4.2, 4.2, 1); scene.add(sp); }
  posts.count = bulbs.count = li; scene.add(posts, bulbs);
  // trees (instanced)
  const rnd = mulberry(77);
  const trunkG = new THREE.CylinderGeometry(0.12, 0.18, 1.4, 5); trunkG.translate(0, 0.7, 0);
  const crownG = new THREE.IcosahedronGeometry(1, 0); crownG.translate(0, 1.9, 0);
  const pineG = new THREE.ConeGeometry(1.1, 3.4, 6); pineG.translate(0, 2.6, 0);
  const NT = 2600; const trunks = new THREE.InstancedMesh(trunkG, M('#5a3d2b'), NT), crowns = new THREE.InstancedMesh(crownG, M('#5f9a48'), NT), pines = new THREE.InstancedMesh(pineG, M('#2f6b3a'), NT);
  let ti = 0, ci = 0, pin = 0; const cA = new THREE.Color('#4e8a3e'), cB = new THREE.Color('#6aa64e'), pA = new THREE.Color('#2f6b3a'), pB = new THREE.Color('#3c7a42');
  const addTree = (x, z, pine) => { const h = groundH(x, z); const s = 1 + rnd() * 0.8; mtx.compose(v3(x, h, z), new THREE.Quaternion().setFromAxisAngle(v3(0, 1, 0), rnd() * 6), v3(s, s, s)); trunks.setMatrixAt(ti++, mtx); if (pine) { pines.setMatrixAt(pin, mtx); pines.setColorAt(pin++, rnd() < 0.5 ? pA : pB); } else { crowns.setMatrixAt(ci, mtx); crowns.setColorAt(ci++, rnd() < 0.5 ? cA : cB); } };
  for (let i = 0; i < 2300 && ti < NT - 300; i++) { const side = rnd() < 0.5 ? -1 : 1; const x = side * (25 + Math.pow(rnd(), 1.4) * 180), z = 120 - rnd() * (120 - Z_COAST); const rd = riverDist(x, z); if (rd < 9) continue; const rel = terrainH(x, z) - hc(Math.min(z, 0)); if (rel > 30) continue; addTree(x, z, rel > 8 || rnd() < 0.3); }
  for (let r = 0; r < NR; r += 2) for (const s of [-1, 1]) if (rnd() < 0.7 && ti < NT) addTree(s * (21.3 + rnd() * 1.2), zRow(r) + (rnd() - 0.5) * 4, false);
  trunks.count = ti; crowns.count = ci; pines.count = pin; scene.add(trunks, crowns, pines);
  // mountains far + snow
  for (let i = 0; i < 11; i++) { const hgt = 70 + (i % 3) * 30, r = 90 + (i % 4) * 25; const m = new THREE.Mesh(new THREE.ConeGeometry(r, hgt, 7), M('#6a4a78')); m.position.set(-500 + i * 100, hgt / 2 - 4, 300 + (i % 2) * 60); scene.add(m); const cp = new THREE.Mesh(new THREE.ConeGeometry(r * 0.3, hgt * 0.3, 7), M('#f4f2f8')); cp.position.set(m.position.x, hgt - hgt * 0.15 - 4, m.position.z); scene.add(cp); }
  // city hall + plaza + fountain at the entrance
  const ch = new THREE.Group();
  box(ch, 9, 4.5, 6, '#f2efe8'); box(ch, 9.6, 0.5, 6.6, '#ddd8cc', 0, 4.5);
  for (let i = 0; i < 7; i++) cyl(ch, 0.28, 0.3, 4.2, '#ffffff', -3.6 + i * 1.2, 0, 3.4, 10);
  gable(ch, 9.6, 6.6, 1.8, '#e8e3d6', 0, 5.0, 0, 0.05);
  cyl(ch, 0.05, 0.05, 2.4, '#ccc', 0, 6.8, 0); box(ch, 1.2, 0.7, 0.03, '#f4c430', 0.62, 8.4, 0);
  ch.position.set(-11.6, 0, 12); ch.rotation.y = 0.35; scene.add(ch); S.hall = ch;
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(26, 14).rotateX(-Math.PI / 2), M('#cbbfae')); plaza.position.set(-12, 0.04, 14); scene.add(plaza);
  cyl(scene, 1.6, 1.8, 0.5, '#e6dccb', -18.5, 0, 19, 18); const fw = new THREE.Mesh(new THREE.CircleGeometry(1.45, 18).rotateX(-Math.PI / 2), M('#6cc6ff', { emissive: '#3aa0e0', emissiveIntensity: 0.7 })); fw.position.set(-18.5, 0.52, 19); scene.add(fw);
  // entrance arch "ДОМИНО"
  const arch = new THREE.Group(); for (const s of [-1, 1]) box(arch, 0.8, 7, 0.8, '#f2efe8', s * 3.4, 0, 0); box(arch, 8, 1.6, 0.9, '#2b1f3d', 0, 6.4, 0);
  const c = document.createElement('canvas'); c.width = 512; c.height = 100; const x = c.getContext('2d'); x.fillStyle = '#2b1f3d'; x.fillRect(0, 0, 512, 100); x.fillStyle = '#ffd23f'; x.font = '900 72px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ДОМИНО', 256, 54);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 1.45), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) })); sg.position.set(0, 7.2, 0.47); arch.add(sg);
  arch.position.set(0, 0, 26); scene.add(arch); S.arch = arch;
  // beach huts / lighthouse at coast
  const lh = new THREE.Group(); cyl(lh, 1.2, 1.6, 12, '#ffffff', 0, 0, 0, 12); for (let i = 0; i < 3; i++) cyl(lh, 1.25 - i * 0.12, 1.4 - i * 0.12, 1.4, '#e5383b', 0, 2 + i * 3.6, 0, 12); cyl(lh, 1.0, 1.0, 1.4, '#ffe6a8', 0, 12, 0, 12, M('#ffe6a8', { emissive: '#ffd27a', emissiveIntensity: 1 })); cone(lh, 1.3, 1.6, '#2b1f3d', 0, 13.4, 0, 12);
  lh.position.set(34, groundH(34, Z_COAST - 2), Z_COAST - 2); scene.add(lh);
  // ---- secret location ----
  { const y = hc(zS), W2 = 42, D2 = GSN * RS + 3; S.secret = new THREE.Group(); S.secret.position.set(0, y, zS); scene.add(S.secret);
    const pad = new THREE.Mesh(new THREE.BoxGeometry(W2, 0.6, D2), M('#3d3350')); pad.position.y = -0.2; S.secret.add(pad);
    for (let i = 0; i <= 28; i++) { const k = i / 28; for (const [x, z] of [[-W2 / 2 + k * W2, -D2 / 2], [-W2 / 2 + k * W2, D2 / 2]]) box(S.secret, 0.25, 2.2, 0.25, '#ffd23f', x, 0, z); }
    for (let i = 0; i <= 8; i++) { const k = i / 8; for (const x of [-W2 / 2, W2 / 2]) box(S.secret, 0.25, 2.2, 0.25, '#ffd23f', x, 0, -D2 / 2 + k * D2); }
    for (const z of [-D2 / 2, D2 / 2]) for (const yy of [0.8, 1.8]) box(S.secret, W2, 0.14, 0.14, '#2b1f3d', 0, yy, z);
    for (const x of [-W2 / 2, W2 / 2]) for (const yy of [0.8, 1.8]) box(S.secret, 0.14, 0.14, D2, '#2b1f3d', x, yy, 0);
    const hid = new THREE.Group(); S.secret.add(hid); cyl(hid, 3, 4, 14, '#7a6a90', 0, 0, 0, 8); cone(hid, 4, 8, '#ffd23f', 0, 14, 0, 8); S.hidden = hid;
    const cm = new THREE.MeshLambertMaterial({ color: '#f4f0fa', emissive: '#8a7aa8', emissiveIntensity: 0.35, flatShading: true });
    S.clouds = []; const rr = mulberry(31);
    for (let i = 0; i < 80; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), cm); const sc = 3 + rr() * 2.6; c.userData = { x: (rr() - 0.5) * (W2 - 6), z: (rr() - 0.5) * (D2 - 4), y: 2 + rr() * 5, s: sc, ph: rr() * 6 }; c.scale.setScalar(sc); S.secret.add(c); S.clouds.push(c); }
  }
  // ---- volcano (next episode) ----
  { const V = new THREE.Group(); const vx = -150, vz = Z_END + 140; V.position.set(vx, groundH(vx, vz) - 6, vz); scene.add(V); S.volc = V;
    const vg = new THREE.CylinderGeometry(13, 80, 82, 28, 8, true); const vp = vg.attributes.position; const vr = mulberry(5);
    for (let i = 0; i < vp.count; i++) { const y = vp.getY(i); if (y > -40 && y < 40) { vp.setX(i, vp.getX(i) * (1 + (vr() - 0.5) * 0.12)); vp.setZ(i, vp.getZ(i) * (1 + (vr() - 0.5) * 0.12)); } }
    vg.translate(0, 41, 0); vg.computeVertexNormals(); V.add(new THREE.Mesh(vg, new THREE.MeshLambertMaterial({ color: '#4a3a46', flatShading: true })));
    const lava = new THREE.Mesh(new THREE.CircleGeometry(13, 24).rotateX(-Math.PI / 2), M('#ff6a1a', { emissive: '#ff4a00', emissiveIntensity: 1 })); lava.position.y = 80; V.add(lava);
    for (let i = 0; i < 6; i++) { const a = -0.6 + i * 0.35 + (i > 2 ? 0.6 : 0); const st = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 62), M('#ff7a1a', { emissive: '#ff5000', emissiveIntensity: 1 })); st.position.set(Math.sin(a) * 42, 44, Math.cos(a) * 42); st.rotation.y = a; st.rotation.x = 0.82; st.scale.z = 0.8 + (i % 3) * 0.15; V.add(st); }
    S.vglow = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlowTex('rgba(255,160,60,1)', 'rgba(255,80,20,0.6)'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); S.vglow.position.set(0, 86, 0); S.vglow.scale.set(70, 70, 1); V.add(S.vglow);
    const sm2 = new THREE.MeshLambertMaterial({ color: '#4d4450', transparent: true, opacity: 0.85, flatShading: true });
    S.vsmoke = []; for (let i = 0; i < 26; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), sm2); c.userData = { ph: vr(), dx: (vr() - 0.5) * 14, dz: (vr() - 0.5) * 14 }; V.add(c); S.vsmoke.push(c); }
    S.vbomb = []; for (let i = 0; i < 14; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 0), M('#ffb347', { emissive: '#ff6a00', emissiveIntensity: 1 })); b.userData = { ph: vr(), a: vr() * 6.28, v: 18 + vr() * 14 }; V.add(b); S.vbomb.push(b); }
  }
  // tsunami wave
  const s = new THREE.Shape();
  s.moveTo(0, 0); s.lineTo(70, 0); s.bezierCurveTo(50, 20, 40, 34, 22, 40); s.bezierCurveTo(8, 44, -6, 40, -12, 30); s.bezierCurveTo(-14, 24, -8, 22, -4, 26); s.bezierCurveTo(-2, 20, -4, 8, 0, 0);
  const wg = new THREE.ExtrudeGeometry(s, { depth: 700, bevelEnabled: false, curveSegments: 16 }); wg.rotateY(Math.PI / 2); wg.translate(-350, 0, 0);
  const wc = []; const wp = wg.attributes.position; const ca = new THREE.Color('#0a2f5e'), cb = new THREE.Color('#4cc4f4'), cw = new THREE.Color('#f2fbff');
  for (let i = 0; i < wp.count; i++) { const y = wp.getY(i) / 44; const cc = y > 0.86 ? cw : ca.clone().lerp(cb, clamp(y)); wc.push(cc.r, cc.g, cc.b); }
  wg.setAttribute('color', new THREE.Float32BufferAttribute(wc, 3));
  S.wave = new THREE.Mesh(wg, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, emissive: '#1a5a8a', emissiveIntensity: 0.55, fog: false })); S.wave.visible = false; scene.add(S.wave);
  const foamM = new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#cfefff', emissiveIntensity: 0.7, flatShading: true, fog: false });
  for (const [y, z, r] of [[42, -10, 4.2], [38, -20, 3.2], [30, 8, 3.0], [26, 12, 2.2]]) { const f = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 700, 10, 1), foamM); f.rotation.z = Math.PI / 2; f.position.set(0, y, z); S.wave.add(f); }
  S.flood = new THREE.Mesh(new THREE.PlaneGeometry(160, 320), new THREE.MeshLambertMaterial({ color: '#3a8fd0', emissive: '#1d5f9a', emissiveIntensity: 0.5, transparent: true, opacity: 0.85 })); S.flood.rotation.x = -Math.PI / 2; S.flood.visible = false; scene.add(S.flood);
  // spray particles
  S.spray = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.7, 0), new THREE.MeshLambertMaterial({ color: '#e8f8ff', emissive: '#9fdcff', emissiveIntensity: 0.6 }), 260); S.spray.visible = false; scene.add(S.spray);
  S.sprayD = Array.from({ length: 260 }, () => ({ x: (rnd() - 0.5) * 70, ph: rnd(), v: 0.6 + rnd() * 0.8 }));
}

// ---------- flyover path ----------
const FSTEPS = 2000; let FZ = [];
const Z_FLY0 = 26, Z_FLY1 = Z_END + 40;
function buildFly() {
  const sp = (t) => (1 - 0.55 * Math.min(1, Object.values(VT).reduce((a, ti) => a + Math.exp(-(((t - ti) / 0.3) ** 2)), 0))) * (1 - 0.9 * sm(TL.sec0, TL.sec0 + 0.8, t) * (1 - sm(TL.sec1 - 0.6, TL.sec1, t))) * lerp(1, 4, sm(TL.sec1 - 0.3, TL.sec1 + 0.2, t)) * lerp(0.35, 1, sm(TL.f0, TL.f0 + 1.0, t)) * lerp(1, 0.35, sm(TL.f1 - 1.2, TL.f1, t));
  let acc = 0; const cum = [0];
  for (let i = 1; i <= FSTEPS; i++) { const t = lerp(TL.f0, TL.f1, (i - 0.5) / FSTEPS); acc += Math.max(0.05, sp(t)); cum.push(acc); }
  FZ = cum.map(c => lerp(Z_FLY0, Z_FLY1, c / acc));
  const zt = flyZ((TL.sec0 + TL.sec1) / 2 + 0.3) - FLY_LOOK; GAPB = Math.round(-zt / RS - 3 - (GSN - 1) / 2); zS = -(GAPB + 3 + (GSN - 1) / 2) * RS;
}
const flyZ = (t) => { const k = clamp((t - TL.f0) / (TL.f1 - TL.f0)) * FSTEPS; const i = Math.floor(k), f = k - i; return i >= FSTEPS ? FZ[FSTEPS] : lerp(FZ[i], FZ[i + 1], f); };
const FLY_H = 44, FLY_BACK = 10, FLY_LOOK = 16;
function flyCam(t) { const z = flyZ(t); return { p: v3(Math.sin(t * 0.5) * 0.8, hc(z) + FLY_H, z + FLY_BACK), q: v3(0, hc(z - FLY_LOOK), z - FLY_LOOK) }; }

// ---------- residents ----------
function shieldDome(r = 4) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#7fe8ff', transparent: true, opacity: 0.16, depthWrite: false })));
  g.add(new THREE.Mesh(new THREE.SphereGeometry(r * 1.002, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#bff6ff', wireframe: true, transparent: true, opacity: 0.25 })));
  return g;
}
function placeResidents(res) {
  const used = new Set(); const slotKey = (r, c) => r * 6 + c;
  const place = (h, r, c) => { used.add(slotKey(r, c)); h.r = r; h.c = c; };
  const feats = res.feat.map(f => ({ ...f })), stds = res.std.map(s => ({ ...s }));
  const vcols = [3, 2, 4, 1, 3, 2, 4, 1];
  feats.filter(f => f.voice).forEach((f, i) => {
    const zt = flyZ(VT[f.voice]) - FLY_LOOK; let best = 0, bd = 1e9; for (let r = 0; r < NR; r++) { const d = Math.abs(zRow(r) - zt); if (d < bd) { bd = d; best = r; } }
    place(f, best, f.voice === 'billion' ? 3 : vcols[i]);
  });
  const others = feats.filter(f => !f.voice); const vr = feats.filter(f => f.voice).map(f => f.r);
  let cands = []; for (let r = 3; r < NR - 42; r++) if (!vr.some(x => Math.abs(x - r) < 3)) cands.push(r);
  others.forEach((f, i) => { const r = cands[Math.floor((i + 0.5) * cands.length / others.length)]; place(f, r, [1, 4, 2, 3][i % 4]); });
  // also clear neighbours of voiced billion so its label is clean
  let si = 0; const free = []; for (let r = 0; r < NR; r++) for (let c = 0; c < 6; c++) if (!used.has(slotKey(r, c))) free.push([r, c]);
  for (const s of stds) { const [r, c] = free[si++]; s.r = r; s.c = c; }
  const all = [...feats, ...stds];
  // the coast: last 200 standard houses (largest r) are destroyed by the wave
  const doomed = stds.slice().sort((a, b) => b.r - a.r || a.c - b.c).slice(0, 200); doomed.forEach(d => d.doom = true);
  for (const h of all) {
    const x = COLS[h.c], z = zRow(h.r), y = hc(z) + 0.12;
    const obj = buildHouse(h.type, h.nick); const sc = h.feat ? (h.type === 'billion' || h.type === 'burj' ? 1 : 0.95) : 0.82;
    obj.userData.inner.scale.multiplyScalar(sc); obj.position.set(x, y, z);
    obj.rotation.y = h.feat ? 0 : (h.c < 3 ? 0.08 : -0.08);
    scene.add(obj);
    let dome = null; if (h.shield) { dome = shieldDome(4.0); dome.position.set(x, y, z); scene.add(dome); }
    const rr = mulberry(h.r * 7 + h.c)(); houses.push({ ...h, obj, dome, x, y, z, h: obj.userData.h * sc, rnd: rr, popT: h.old ? -1 : lerp(TL.grow0, TL.grow1 - 0.5, h.r / NR) + rr * 0.25 });
  }
  byZ = houses.slice().sort((a, b) => b.z - a.z);
}

// ---------- overlay ----------

// =====================================================================
//  ГОРОД ДОМИНО — интерактивный сайт
// =====================================================================
const IG = 'domino.gorod', POP = 1211;
const $ = (s) => document.querySelector(s);
const norm = (s) => (s || '').toLowerCase().trim().replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/[/?#].*$/, '').replace(/^@/, '');
const EMO = { capybara: '🦫', shark: '🦈', watermelon: '🍉', pizza: '🍕', pelmen: '🥟', cheburek: '🥟', ferris: '🎡', burj: '🏙', pinkcastle: '🏰', kremlin: '🇷🇺', stadium: '⚽', school: '🏫', pumpkin: '🎃', dog: '🐶', hotdog: '🌭', burger: '🍔', mosque: '🕌', rocket: '🚀', moonrocket: '🌙', f1: '🏎', tv: '📺', pineapple: '🍍', banana: '🍌', cucumber: '🥒', diamond: '💎', chocolate: '🍫', cake: '🧁', bigcastle: '🏰', court: '🏀', jurassic: '🦖', ballet: '🩰', hotel: '🏨', bunker: '🛡', catroof: '🐱', pillow: '🛏', kirik: '🧖', theater: '🎭', dance: '💃', royal: '👑', purple: '💜', blue: '💙', star: '⭐', bunkerhouse: '🛡', best: '🏆', villa: '🏝' };
const NEWS = [
  '🌊 Цунами смыло 200 домов у моря — город отстроил их заново',
  '🦫 @artemii45872 заселился в дом-капибару',
  '🥟 @morskoy_cheburek открыл чебуречную — весь город ест чебуреки',
  '🎡 @salem44731 построил колесо обозрения',
  '🔒 Секретная локация откроется на 2500 подписчиков',
  '🌋 Следующая катастрофа — ВУЛКАН. Репост = щит',
  '👑 1000 лайков на выпуске = выборы мэра',
  '🏰 @dashy_ha получила розовый замок с принцем',
  '🍉 @rhino.89978859 живёт в арбузе',
];
const SIGHTS_EXTRA = [['🔒', 'Секретная локация', 'откроется на 2500 подписчиков', 'secret'], ['🌋', 'Вулкан', 'следующая катастрофа', 'volcano'], ['🏛', 'Мэрия', 'мэр: ??? — выборы скоро', 'hall']];

// ---------- static merge of all houses (few draw calls for phones) ----------
function mergeStatic(objs) {
  const buckets = new Map();
  const nm = new THREE.Matrix3();
  for (const o of objs) {
    o.updateMatrixWorld(true);
    o.traverse((m) => {
      if (!m.isMesh || !m.visible) return; const mat = m.material; if (Array.isArray(mat)) return;
      if (mat.transparent || mat.wireframe) return;
      let g = m.geometry; g = g.index ? g.toNonIndexed() : g.clone();
      g.applyMatrix4(m.matrixWorld);
      let b = buckets.get(mat); if (!b) { b = { pos: [], nor: [], uv: [], uvAll: true }; buckets.set(mat, b); }
      const p = g.attributes.position.array; b.pos.push(p);
      if (!g.attributes.normal) g.computeVertexNormals(); b.nor.push(g.attributes.normal.array);
      if (g.attributes.uv) b.uv.push(g.attributes.uv.array); else { b.uvAll = false; b.uv.push(new Float32Array(p.length / 3 * 2)); }
      m.userData.merged = true;
    });
  }
  const cat = (arrs) => { let n = 0; for (const a of arrs) n += a.length; const out = new Float32Array(n); let o = 0; for (const a of arrs) { out.set(a, o); o += a.length; } return out; };
  for (const [mat, b] of buckets) {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(cat(b.pos), 3)); g.setAttribute('normal', new THREE.BufferAttribute(cat(b.nor), 3));
    if (mat.map) g.setAttribute('uv', new THREE.BufferAttribute(cat(b.uv), 2));
    g.computeBoundingSphere(); const mesh = new THREE.Mesh(g, mat); mesh.matrixAutoUpdate = false; scene.add(mesh);
  }
  for (const o of objs) { o.traverse((m) => { if (m.isMesh && m.userData.merged) m.visible = false; }); }
}

// ---------- camera state ----------
const cam = { x: 0, z: -40, h: 150, tx: 0, tz: -40, th: 150, fly: null };
const LIM = { x0: -70, x1: 70, z0: Z_END - 60, z1: 70, h0: 9, h1: 260 };
function applyCam() {
  const y = hc(Math.min(cam.z, 0)); const tilt = 0.55;
  camera.position.set(cam.x, y + cam.h, cam.z + cam.h * tilt); camera.lookAt(cam.x, y, cam.z - cam.h * 0.05);
  camera.updateMatrixWorld(true); S.sky.position.copy(camera.position);
}
let dirty = true; const markDirty = () => { dirty = true; };
function flyTo(x, z, h, dur = 1.4) { cam.fly = { x0: cam.x, z0: cam.z, h0: cam.h, x1: x, z1: z, h1: h, t0: performance.now(), d: dur * 1000, arc: Math.min(120, Math.abs(z - cam.z) * 0.25) }; markDirty(); }

// ---------- labels pool ----------
let pool = []; const tmp = new THREE.Vector3();
function proj(x, y, z) { tmp.set(x, y, z).project(camera); return { x: (tmp.x * 0.5 + 0.5) * innerWidth, y: (-tmp.y * 0.5 + 0.5) * innerHeight, ok: tmp.z < 1 && tmp.z > -1 }; }
function labelEl(i) { while (pool.length <= i) { const d = document.createElement('div'); d.className = 'lb'; $('#labels').appendChild(d); pool.push(d); } return pool[i]; }
let selected = null;
function updateLabels() {
  const H = cam.h; let n = 0; const cand = [];
  const zr = Math.max(40, H * 1.9), xr = Math.max(30, H * 1.1);
  for (const h of houses) {
    if (Math.abs(h.z - cam.z) > zr || Math.abs(h.x - cam.x) > xr) continue;
    const show = h.feat ? H < 170 : H < 75; if (!show && h !== selected) continue;
    cand.push(h);
  }
  cand.sort((a, b) => (b === selected) - (a === selected) || (b.feat - a.feat) || (Math.hypot(a.x - cam.x, a.z - cam.z) - Math.hypot(b.x - cam.x, b.z - cam.z)));
  const max = H < 30 ? 60 : H < 75 ? 90 : 30;
  for (const h of cand) {
    if (n >= max) break;
    const p = proj(h.x, h.y + Math.min(h.h, 8) + 0.8, h.z); if (!p.ok || p.x < -80 || p.x > innerWidth + 80 || p.y < ($('#top').offsetHeight + 18) || p.y > innerHeight - 70) continue;
    const L = labelEl(n++); const sel = h === selected;
    const html = `${h.shield ? '<i class="sh">ЩИТ</i>' : ''}${esc(h.nick)}${h.req && (sel || H < 60) ? `<small>${EMO[h.type] || '🏠'} ${esc(h.req)}</small>` : ''}`;
    if (L._h !== html) { L.innerHTML = html; L._h = html; }
    L.className = 'lb' + (h.feat ? ' ft' : '') + (sel ? ' sel' : '');
    const sc = sel ? 1.25 : Math.max(0.62, Math.min(1.1, 38 / H + 0.45));
    L.style.transform = `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px) translate(-50%,-100%) scale(${sc.toFixed(3)})`; L.style.display = 'block'; L.style.zIndex = sel ? 999 : h.feat ? 500 + Math.round(p.y) : Math.round(p.y);
  }
  for (let i = n; i < pool.length; i++) pool[i].style.display = 'none';
  // secret sign
  const sp = proj(0, hc(zS) + 16, zS); const sg = $('#secretSign'); if (sp.ok && H < 200 && sp.y > 80 && sp.y < innerHeight) { sg.style.display = 'block'; sg.style.transform = `translate(${sp.x}px,${sp.y}px) translate(-50%,-100%)`; } else sg.style.display = 'none';
}

// ---------- selection marker ----------
let marker, beam;
function buildMarker() {
  marker = new THREE.Mesh(new THREE.RingGeometry(3.4, 4.1, 32), new THREE.MeshBasicMaterial({ color: '#ffd23f', transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false })); marker.rotation.x = -Math.PI / 2; marker.visible = false; scene.add(marker);
  beam = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 60, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#ffd23f', transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); beam.visible = false; scene.add(beam);
}
function select(h) {
  selected = h; marker.visible = beam.visible = !!h;
  if (h) { marker.position.set(h.x, h.y + 0.3, h.z); beam.position.set(h.x, h.y + 30, h.z); flyTo(h.x, h.z + 4, 26); }
  markDirty();
}
function streetOf(h) { return { st: h.r + 1, no: h.c + 1 }; }

// ---------- UI ----------
function card(html) { const c = $('#card'); c.innerHTML = `<button class="x" onclick="this.parentNode.style.display='none'">✕</button>` + html; c.style.display = 'block'; }
function findNick(raw, fromWelcome) {
  const q = norm(raw); if (!q) return;
  const h = houses.find(x => x.nick.toLowerCase() === q);
  $('#welcome').style.display = 'none';
  if (h) {
    select(h); const { st, no } = streetOf(h);
    card(`<div class="c0">🏠 Твой дом найден!</div><div class="c1">@${esc(h.nick)}</div><div class="c2">Улица ${st}, дом ${no}${h.req ? `<br>${EMO[h.type] || '🏠'} ${esc(h.req)}` : ''}${h.shield ? '<br>🛡 Дом под щитом' : ''}</div>
      <div class="row"><button onclick="shareHome('${esc(h.nick)}')">Поделиться</button><a class="btn2" target="_blank" href="https://instagram.com/${IG}">@${IG}</a></div>
      <div class="c3">Хочешь другой дом? Напиши в комментах под рилсом, каким он должен быть — построим в выпуске 🏗</div>`);
    history.replaceState(null, '', '?nick=' + encodeURIComponent(h.nick));
  } else {
    select(null);
    card(`<div class="c0">😢 @${esc(q)} пока нет в городе</div><div class="c2">Если ты подписался недавно — твой дом появится в следующем выпуске. Если ещё нет — подпишись, и тебе построят дом!</div>
      <div class="row"><a class="btn" target="_blank" href="https://instagram.com/${IG}">👤+ Подписаться</a></div>`);
  }
}
window.shareHome = (n) => { const url = location.origin + location.pathname + '?nick=' + encodeURIComponent(n); const txt = `Мой дом в ГОРОДЕ ДОМИНО 🏠 Найди свой!`; if (navigator.share) navigator.share({ title: 'Город Домино', text: txt, url }).catch(() => {}); else { navigator.clipboard?.writeText(url); alert('Ссылка скопирована: ' + url); } };
function openSights() {
  const items = houses.filter(h => h.feat).map(h => `<div class="it"><span class="e">${EMO[h.type] || '🏠'}</span><div><b>${esc(h.req)}</b><i>@${esc(h.nick)}</i></div><button data-n="${esc(h.nick)}">Показать</button></div>`).join('');
  const ex = SIGHTS_EXTRA.map(([e, a, b, k]) => `<div class="it"><span class="e">${e}</span><div><b>${a}</b><i>${b}</i></div><button data-k="${k}">Показать</button></div>`).join('');
  modal(`<h2>🏛 Достопримечательности</h2><p>Дома, которые заказали подписчики в комментах.</p>${ex}${items}`);
  $('#modal').querySelectorAll('button[data-n]').forEach(b => b.onclick = () => { closeModal(); findNick(b.dataset.n); });
  $('#modal').querySelectorAll('button[data-k]').forEach(b => b.onclick = () => { closeModal(); select(null); $('#card').style.display = 'none'; const k = b.dataset.k; if (k === 'secret') flyTo(0, zS + 45, 95); else if (k === 'volcano') flyTo(-70, S.volc.position.z + 60, 140); else flyTo(-11.6, 16, 30); });
}
function openVote() {
  const opts = ['🎢 Парк аттракционов', '🎬 Кинотеатр', '🌊 Аквапарк', '🦁 Зоопарк'];
  modal(`<h2>🗳 Что строим дальше?</h2><p>Голосование идёт в комментах под последним рилсом. Нажми на вариант — мы скопируем твой голос, вставь его в комментарий.</p>
    ${opts.map((o, i) => `<button class="opt" data-i="${i}">${o}</button>`).join('')}
    <div class="built"><b>Уже построено по просьбе жителей:</b> капибара, акула, чебуречная, колесо обозрения, Кремль, стадион с Роналду и ещё 40 домов 🏗</div>`);
  $('#modal').querySelectorAll('.opt').forEach(b => b.onclick = () => { const txt = `Голосую: ${opts[b.dataset.i].replace(/^\S+\s/, '')} 🗳`; navigator.clipboard?.writeText(txt).catch(() => {}); b.textContent = '✓ Скопировано! Вставь в комменты'; setTimeout(() => window.open('https://instagram.com/' + IG, '_blank'), 700); });
}
function modal(html) { const m = $('#modal'); m.querySelector('.in').innerHTML = `<button class="x" onclick="closeModal()">✕</button>` + html; m.style.display = 'flex'; }
window.closeModal = () => { $('#modal').style.display = 'none'; };

// ---------- input: drag / pinch / wheel ----------
function bindControls(el) {
  const pts = new Map(); let lastD = 0;
  el.addEventListener('pointerdown', (e) => { el.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); cam.fly = null; });
  el.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) return; const prev = pts.get(e.pointerId); const cur = { x: e.clientX, y: e.clientY }; pts.set(e.pointerId, cur);
    if (pts.size === 1) { const k = cam.h / innerHeight * 1.6; cam.x -= (cur.x - prev.x) * k; cam.z -= (cur.y - prev.y) * k * 1.4; }
    else if (pts.size === 2) { const [a, b] = [...pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (lastD) cam.h *= lastD / d; lastD = d; }
    clampCam(); markDirty();
  });
  const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) lastD = 0; };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('wheel', (e) => { e.preventDefault(); cam.h *= Math.exp(e.deltaY * 0.0012); cam.fly = null; clampCam(); markDirty(); }, { passive: false });
}
function clampCam() { cam.x = clamp(cam.x, LIM.x0, LIM.x1); cam.z = clamp(cam.z, LIM.z0, LIM.z1); cam.h = clamp(cam.h, LIM.h0, LIM.h1); }

// ---------- boot ----------
export async function boot() {
  const canvas = $('#c');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight, false);
  scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.5, 3000);
  const res = await (await fetch('./residents.json')).json();
  const step = (t) => new Promise(r => { $('#loadtxt').textContent = t; setTimeout(r, 30); });
  await step('Рисуем город…'); buildFly(); buildWorld();
  await step('Ставим дома…'); placeResidents(res);
  for (const h of houses) { h.popT = -1; h.obj.visible = true; }
  await step('Зажигаем фонари…'); mergeStatic(houses.map(h => h.obj));
  S.wave.visible = S.flood.visible = S.spray.visible = false;
  buildMarker(); bindControls(canvas);
  $('#pop').textContent = POP.toLocaleString('ru-RU'); $('#pop2').textContent = POP.toLocaleString('ru-RU');
  $('#ticker').innerHTML = `<span>${NEWS.join('&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;')}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</span>`.repeat(2);
  $('#loader').style.display = 'none';
  const go = (inp) => findNick($(inp).value, inp === '#wnick');
  $('#wgo').onclick = () => go('#wnick'); $('#wnick').onkeydown = (e) => { if (e.key === 'Enter') go('#wnick'); };
  $('#sgo').onclick = () => go('#snick'); $('#snick').onkeydown = (e) => { if (e.key === 'Enter') go('#snick'); };
  $('#walk').onclick = () => { $('#welcome').style.display = 'none'; flyTo(0, -30, 55); };
  $('#zin').onclick = () => { cam.fly = null; cam.h = clamp(cam.h * 0.7, LIM.h0, LIM.h1); markDirty(); };
  $('#zout').onclick = () => { cam.fly = null; cam.h = clamp(cam.h * 1.4, LIM.h0, LIM.h1); markDirty(); };
  $('#home').onclick = () => { if (selected) flyTo(selected.x, selected.z + 4, 26); else flyTo(0, -40, 150); };
  $('#bSights').onclick = openSights; $('#bVote').onclick = openVote;
  $('#secretSign').onclick = () => flyTo(0, zS + 45, 95);
  addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); markDirty(); });
  const qn = new URLSearchParams(location.search).get('nick'); if (qn) { findNick(qn); }
  let t0 = performance.now();
  const loop = (now) => {
    if (cam.fly) { const f = cam.fly; const k = clamp((now - f.t0) / f.d); const e = k * k * (3 - 2 * k);
      cam.x = lerp(f.x0, f.x1, e); cam.z = lerp(f.z0, f.z1, e); cam.h = lerp(f.h0, f.h1, e) + Math.sin(Math.PI * e) * f.arc; if (k >= 1) cam.fly = null; dirty = true; }
    if (selected) { const s = 1 + 0.08 * Math.sin(now / 160); marker.scale.set(s, s, s); dirty = true; }
    if (dirty) { applyCam(); renderer.render(scene, camera); updateLabels(); dirty = false; }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
