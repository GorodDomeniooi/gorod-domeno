// =====================================================================
//  ГОРОД ДОМИНО — интерактивный 3D-город подписчиков @domino.gorod
// =====================================================================
import * as THREE from './three.module.js';
import { M, box, cyl, sph, cone, gable, windows, buildHouse } from './builders.js';
import './extra.js';
import './extra2.js';
import './extra3.js';
import './extra4.js';

const IG = 'domino.gorod', POP = 2886, SITE = 'gorod-domeno.vercel.app';
const $ = (s) => document.querySelector(s);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const sm = (a, b, t) => { const k = clamp((t - a) / (b - a)); return k * k * (3 - 2 * k); };
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => (s || '').toLowerCase().trim().replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/[/?#].*$/, '').replace(/^@/, '');
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = mulberry(20261106);

const EMO = { capybara: '🦫', shark: '🦈', watermelon: '🍉', pizza: '🍕', pelmen: '🥟', cheburek: '🥟', ferris: '🎡', burj: '🏙', pinkcastle: '🏰', kremlin: '🏯', stadium: '⚽', school: '🏫', pumpkin: '🎃', dog: '🐶', hotdog: '🌭', burger: '🍔', mosque: '🕌', rocket: '🚀', moonrocket: '🌙', f1: '🏎', tv: '📺', pineapple: '🍍', banana: '🍌', cucumber: '🥒', diamond: '💎', chocolate: '🍫', cake: '🧁', bigcastle: '🏰', court: '🏀', jurassic: '🦖', ballet: '🩰', hotel: '🏨', bunker: '🛡', catroof: '🐱', pillow: '🛏', kirik: '🧖', theater: '🎭', dance: '💃', royal: '👑', purple: '💜', blue: '💙', star: '⭐', bunkerhouse: '🛡', best: '🏆', villa: '🏝', yurt: '⛺', apple: '🍎', orange: '🍊', tank: '🪖', donut: '🍩', khinkali: '🥟', flyhouse: '🎈', chips: '🥔', crownhouse: '👑', guitar: '🎸', mug: '☕', ufo: '🛸', billion: '🏢', xmas: '🎄', castle: '🏰', mansion: '🏡', carhouse: '🚗', bunker: '🛡', poolhouse: '🏊', poolmansion: '🏊', tower: '🏢', apart: '🏢', two: '🏠', court: '🏀', restaurant: '🍽', mall: '🛍', hut: '🌳', farm: '🐄', xmas: '🎄', aquapark: '🌊', pinkheart: '💖', rock: '🪨', kennel: '🐶', flyrocket: '🚀', bear: '🧸', hospital: '🏥', smile: '😊', plane: '✈️', globe: '🌍', titan: '🛡', tuva: '🏳️', armenian: '🇦🇲', icecream: '🍦', mushroom: '🍄', strawberry: '🍓', eiffel: '🗼', cactus: '🌵', pyramid: '🔺', carsmansion: '🏎', kirik: '🧖' };
const emo = (t) => EMO[String(t).split(':')[0]] || '🏠';
const STREETS = ['Подписчиков', 'Лайков', 'Репостов', 'Капибарная', 'Чебуречная', 'Арбузная', 'Сторис', 'Рилсов', 'Пельменная', 'Комментариев', 'Солнечная', 'Хештегов', 'Дружбы', 'Весёлая', 'Мечтателей', 'Звёздная', 'Мэрская', 'Площадная', 'Юртовая', 'Замковая', 'Особняковая', 'Ракетная'];
const NEWS = [
  '🕌 Голосование выиграла мечеть — она уже стоит на площади',
  '🏡 Город перестроен: у каждого свой двор и дорожка к двери',
  '⬆ Дома теперь можно улучшать — жми «Улучшить» в карточке дома',
  '🏛 В центре города мэрия. Мэра пока нет — выборы скоро',
  '🌊 Цунами смыло 200 домов у моря — город отстроил их заново',
  '🦫 @artemii45872 заселился в дом-капибару',
  '🥟 На улице Чебуречной пахнет чебуреками — это @morskoy_cheburek',
  '🎡 @salem44731 построил колесо обозрения',
  '🔒 Секретная локация на севере откроется на 2500 подписчиков',
  '🌋 Вулкан на горизонте проснулся. Следующая катастрофа — его',
  '👑 1000 лайков на выпуске = выборы мэра',
  '🏰 @dashy_ha получила розовый замок',
];

// ---------------- city layout ----------------
const LOT = 6.4, NCX = 4, NCZ = 2, SW = 1.8, ROAD = 7;
const BW = NCX * LOT, BD = NCZ * LOT;
const PX = BW + 2 * SW + ROAD, PZ = BD + 2 * SW + ROAD;
const NB = 10;
const isPlaza = (bx, bz) => Math.abs(bx) <= 1 && Math.abs(bz) <= 1;
const CX = (NB + 0.5) * PX, CZ = (NB + 0.5) * PZ;      // centre lines of outer roads
const PLAZA_W = 3 * PX - ROAD, PLAZA_D = 3 * PZ - ROAD;
const MOSQ = { x: -34, z: -6 }, HALL = { x: 0, z: -13 }, SECRET = { x: 0, z: -CZ - 58 }, VOLC = { x: -330, z: -470 };

let renderer, scene, camera;
const houses = [];
const POIS = [];

// ---------------- helpers ----------------
function inst(geo, mat, list, colorFn) {
  const m = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length));
  const o = new THREE.Object3D();
  list.forEach((p, i) => {
    o.position.set(p[0], p[1], p[2]); o.rotation.set(0, p[3] || 0, 0); const s = p[4] || 1; o.scale.set(p[5] || s, p[6] || s, p[7] || s); o.updateMatrix();
    m.setMatrixAt(i, o.matrix); if (colorFn) m.setColorAt(i, colorFn(i, p));
  });
  m.count = list.length; scene.add(m); return m;
}
const WHITE = () => new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true });
function canvasTex(w, h, draw, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}

// ---------------- world ----------------
const trees = [], lamps = [], cars = [];
function addTree(x, z, s = 1) { trees.push([x, 0, z, rnd() * 6, s * (0.8 + rnd() * 0.5)]); }

function buildWorld() {
  // sky + fog
  scene.background = canvasTex(4, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5fb0ea'); g.addColorStop(0.55, '#a9d8f2'); g.addColorStop(1, '#e8f4ec'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  scene.fog = new THREE.Fog('#dcefee', 200, 900);
  scene.add(new THREE.HemisphereLight('#e9f6ff', '#6f8f5a', 1.15));
  const sun = new THREE.DirectionalLight('#fff0d2', 1.55); sun.position.set(-0.55, 1, 0.45); scene.add(sun);

  // ground + asphalt
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000).rotateX(-Math.PI / 2), M('#9ccb74')); ground.position.y = -0.05; scene.add(ground);
  const asph = new THREE.Mesh(new THREE.PlaneGeometry(2 * CX + ROAD, 2 * CZ + ROAD).rotateX(-Math.PI / 2), M('#5d6372')); asph.position.y = 0; scene.add(asph);

  // blocks: sidewalk pads (curb) + lawns
  const pads = [], lawns = [];
  for (let bx = -NB; bx <= NB; bx++) for (let bz = -NB; bz <= NB; bz++) {
    if (isPlaza(bx, bz)) continue;
    const cx = bx * PX, cz = bz * PZ;
    pads.push([cx, 0, cz, 0, 1, BW + 2 * SW, 1, BD + 2 * SW]);
    lawns.push([cx, 0.25, cz, 0, 1, BW, 1, BD]);
    // lamps & street trees along the sidewalk ring
    const hw = BW / 2 + SW - 0.45, hd = BD / 2 + SW - 0.45;
    for (const s of [-1, 1]) {
      for (let i = 0; i <= 3; i++) { const x = cx - BW / 2 + i * (BW / 3); lamps.push([x, 0.25, cz + s * hd, s > 0 ? 0 : Math.PI]); if (i < 3 && rnd() < 0.75) addTree(x + BW / 6, cz + s * hd, 0.75); }
      lamps.push([cx + s * hw, 0.25, cz, s > 0 ? Math.PI / 2 : -Math.PI / 2]);
      if (rnd() < 0.8) { addTree(cx + s * hw, cz + BD / 4, 0.75); addTree(cx + s * hw, cz - BD / 4, 0.75); }
    }
  }
  inst(new THREE.BoxGeometry(1, 0.25, 1).translate(0, 0.125, 0), M('#e6dfd1'), pads);
  inst(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), M('#a8d67e'), lawns.map(l => [l[0], 0.255, l[2], 0, 1, l[5], 1, l[7]]));

  // road markings + crosswalks
  const dash = [], zeb = [];
  for (let j = -NB - 1; j <= NB; j++) {
    const z = (j + 0.5) * PZ, x = (j + 0.5) * PX;
    for (let bx = -NB; bx <= NB; bx++) for (let k = 0; k < 6; k++) dash.push([bx * PX - BW / 2 + 1.6 + k * (BW / 5.6), 0.02, z, 0, 1, 2.2, 1, 0.22]);
    for (let bz = -NB; bz <= NB; bz++) for (let k = 0; k < 3; k++) dash.push([x, 0.02, bz * PZ - BD / 2 + 1.2 + k * (BD / 2.6), 0, 1, 0.22, 1, 2.2]);
  }
  for (let i = -NB - 1; i <= NB; i++) for (let j = -NB - 1; j <= NB; j++) {
    const x = (i + 0.5) * PX, z = (j + 0.5) * PZ;
    for (let k = -2; k <= 2; k++) {
      for (const s of [-1, 1]) { zeb.push([x + k * 1.1, 0.025, z + s * (ROAD / 2 + 1.6), 0, 1, 0.55, 1, 2.2]); zeb.push([x + s * (ROAD / 2 + 1.6), 0.025, z + k * 1.1, 0, 1, 2.2, 1, 0.55]); }
    }
  }
  const flat = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  inst(flat, M('#f4f1e6'), dash); inst(flat, M('#f4f1e6'), zeb);

  // parked cars along the roads
  const CAR_C = ['#ff5a3c', '#ffc23d', '#2f80ed', '#19b38a', '#ffffff', '#9b51e0', '#f2994a', '#2d3142', '#e84a7f'];
  for (let j = -NB - 1; j <= NB; j++) for (let bx = -NB; bx <= NB; bx++) {
    if (rnd() < 0.55) { const s = rnd() < 0.5 ? -1 : 1; const x = bx * PX + (rnd() - 0.5) * (BW - 6), z = (j + 0.5) * PZ + s * 2.3; if (!(Math.abs(x) < PLAZA_W / 2 + 3 && Math.abs(z) < PLAZA_D / 2 + 3)) cars.push([x, 0, z, Math.PI / 2 + (s > 0 ? 0 : Math.PI)]); }
  }
  for (let i = -NB - 1; i <= NB; i++) for (let bz = -NB; bz <= NB; bz++) {
    if (rnd() < 0.4) { const s = rnd() < 0.5 ? -1 : 1; const x = (i + 0.5) * PX + s * 2.3, z = bz * PZ + (rnd() - 0.5) * (BD - 5); if (!(Math.abs(x) < PLAZA_W / 2 + 3 && Math.abs(z) < PLAZA_D / 2 + 3)) cars.push([x, 0, z, s > 0 ? 0 : Math.PI]); }
  }
  const carCol = cars.map(() => new THREE.Color(CAR_C[Math.floor(rnd() * CAR_C.length)]));
  inst(new THREE.BoxGeometry(1.7, 0.75, 3.6).translate(0, 0.55, 0), WHITE(), cars, (i) => carCol[i]);
  inst(new THREE.BoxGeometry(1.45, 0.6, 1.9).translate(0, 1.2, -0.15), M('#2b3445'), cars);

  buildPlaza();
  buildOutskirts();

  // lamps (instanced): pole + arm + lantern
  inst(new THREE.CylinderGeometry(0.08, 0.11, 3.6, 6).translate(0, 1.8, 0), M('#2f3645'), lamps);
  inst(new THREE.BoxGeometry(0.1, 0.1, 0.9).translate(0, 3.55, -0.4), M('#2f3645'), lamps);
  inst(new THREE.BoxGeometry(0.42, 0.3, 0.42).translate(0, 3.4, -0.8), M('#fff2c2', { emissive: '#ffd77a', emissiveIntensity: 0.8 }), lamps);
  // trees (instanced)
  const TC = ['#4fa04a', '#5cb357', '#3f8f48', '#6cbf4f', '#86c95a'].map(c => new THREE.Color(c));
  inst(new THREE.CylinderGeometry(0.14, 0.2, 1.6, 5).translate(0, 0.8, 0), M('#7a5638'), trees);
  inst(new THREE.IcosahedronGeometry(1.25, 0).translate(0, 2.3, 0), WHITE(), trees, () => TC[Math.floor(rnd() * TC.length)]);
}

function buildPlaza() {
  const g = new THREE.Group(); scene.add(g);
  // paving
  const tile = canvasTex(128, 128, (x) => { x.fillStyle = '#efe6d4'; x.fillRect(0, 0, 128, 128); x.fillStyle = '#e3d6bd'; x.fillRect(0, 0, 64, 64); x.fillRect(64, 64, 64, 64); x.strokeStyle = 'rgba(160,140,110,.35)'; x.lineWidth = 2; x.strokeRect(0, 0, 128, 128); }, [PLAZA_W / 6, PLAZA_D / 6]);
  const pad = new THREE.Mesh(new THREE.BoxGeometry(PLAZA_W + 2 * SW, 0.25, PLAZA_D + 2 * SW).translate(0, 0.125, 0), M('#e6dfd1')); g.add(pad);
  const pav = new THREE.Mesh(new THREE.PlaneGeometry(PLAZA_W, PLAZA_D).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: tile })); pav.position.y = 0.26; g.add(pav);
  // side parks
  for (const s of [-1, 1]) {
    const lawn = new THREE.Mesh(new THREE.PlaneGeometry(26, PLAZA_D - 6).rotateX(-Math.PI / 2), M('#a8d67e')); lawn.position.set(s * (PLAZA_W / 2 - 16), 0.27, 0); g.add(lawn);
    for (let i = 0; i < 26; i++) { const x = s * (PLAZA_W / 2 - 5 - rnd() * 22), z = (rnd() - 0.5) * (PLAZA_D - 10); if (Math.abs(z) < 2.2 || Math.hypot(x - MOSQ.x, z - MOSQ.z) < 13) continue; addTree(x, z, 1 + rnd() * 0.4); }
    const path = new THREE.Mesh(new THREE.PlaneGeometry(26, 3).rotateX(-Math.PI / 2), M('#e3d6bd')); path.position.set(s * (PLAZA_W / 2 - 16), 0.28, 0); g.add(path);
    for (let k = 0; k < 3; k++) { box(g, 2.2, 0.5, 0.6, '#a0663d', s * (PLAZA_W / 2 - 8 - k * 7), 0.26, 2.4); }
  }
  // perimeter lamps
  for (let i = 0; i <= 10; i++) { const x = -PLAZA_W / 2 + i * PLAZA_W / 10; lamps.push([x, 0.25, PLAZA_D / 2 + SW - 0.45, 0]); lamps.push([x, 0.25, -PLAZA_D / 2 - SW + 0.45, Math.PI]); }
  for (let i = 0; i <= 6; i++) { const z = -PLAZA_D / 2 + i * PLAZA_D / 6; lamps.push([PLAZA_W / 2 + SW - 0.45, 0.25, z, Math.PI / 2]); lamps.push([-PLAZA_W / 2 - SW + 0.45, 0.25, z, -Math.PI / 2]); }

  // ---- city hall ----
  const h = new THREE.Group(); h.position.set(HALL.x, 0.26, HALL.z); g.add(h);
  box(h, 30, 0.5, 15, '#ddd2bd', 0, 0, 0.5); box(h, 14, 0.35, 3, '#e8dfcc', 0, 0, 8.2); box(h, 12, 0.35, 2, '#efe7d6', 0, 0.35, 7.6);
  box(h, 26, 7.5, 11, '#f6eedd', 0, 0.5, -0.5);
  windows(h, 26, 7.5, 11, 0, 0.5, -0.5, 2, 9, { sides: false });
  box(h, 27, 0.7, 12, '#e4d6b8', 0, 8, -0.5); box(h, 25, 0.6, 10, '#d9c9a6', 0, 8.7, -0.5);
  for (let i = 0; i < 6; i++) cyl(h, 0.45, 0.5, 7.4, '#ffffff', -6.25 + i * 2.5, 0.85, 6.3, 12);
  box(h, 15, 0.8, 3.2, '#efe5cf', 0, 8.2, 6.1); gable(h, 15, 3.2, 2.6, '#f6eedd', 0, 9.0, 6.1, 0.05);
  box(h, 7, 6, 7, '#f6eedd', 0, 9.3, -1); box(h, 7.6, 0.5, 7.6, '#e4d6b8', 0, 15.3, -1);
  const clock = new THREE.Mesh(new THREE.CircleGeometry(2, 28), M('#ffffff')); clock.position.set(0, 12.4, 2.55); h.add(clock);
  const rim = new THREE.Mesh(new THREE.RingGeometry(2, 2.3, 28), M('#c9a23f')); rim.position.set(0, 12.4, 2.56); h.add(rim);
  const hand1 = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 1.5), M('#16223a')); hand1.position.set(0.3, 12.85, 2.57); hand1.rotation.z = -0.6; h.add(hand1);
  const hand2 = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 1.1), M('#16223a')); hand2.position.set(-0.3, 12.2, 2.57); hand2.rotation.z = -2.2; h.add(hand2);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(3.4, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), M('#2fa58f')); dome.position.set(0, 15.8, -1); h.add(dome);
  cyl(h, 0.7, 0.9, 1.2, '#f6eedd', 0, 19.0, -1, 10); cone(h, 0.6, 3, '#c9a23f', 0, 20.2, -1, 8);
  cyl(h, 0.07, 0.07, 4, '#cccccc', 0, 23, -1, 6); box(h, 2.2, 1.3, 0.06, '#ff5a3c', 1.1, 25.6, -1);
  const sg = canvasTex(512, 96, (x, w, hh) => { x.fillStyle = '#16223a'; x.beginPath(); x.roundRect(0, 0, w, hh, 18); x.fill(); x.fillStyle = '#ffc23d'; x.font = '900 60px Unbounded, Arial Black, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('МЭРИЯ', w / 2, hh / 2 + 3); });
  const sm2 = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.12), new THREE.MeshBasicMaterial({ map: sg })); sm2.position.set(0, 9.4, 7.75); h.add(sm2);
  POIS.push({ key: 'hall', x: HALL.x, y: 30, z: HALL.z, html: '🏛 МЭРИЯ<i>мэр: ??? • выборы скоро</i>' });

  // ---- fountain ----
  const f = new THREE.Group(); f.position.set(0, 0.26, 13); g.add(f);
  cyl(f, 5.6, 5.9, 0.9, '#d9cdb5', 0, 0, 0, 28);
  const water = new THREE.Mesh(new THREE.CircleGeometry(5.1, 28).rotateX(-Math.PI / 2), M('#5cc7e8', { emissive: '#2a9cc2', emissiveIntensity: 0.25 })); water.position.y = 0.92; f.add(water);
  cyl(f, 0.6, 0.8, 2.6, '#e6dccb', 0, 0.9, 0, 12); cyl(f, 2.0, 1.6, 0.4, '#d9cdb5', 0, 3.4, 0, 18); cyl(f, 0.35, 0.45, 1.4, '#e6dccb', 0, 3.8, 0, 10);
  sph(f, 0.8, '#a9e6f7', 0, 5.6, 0, M('#bfefff', { emissive: '#7fd8f5', emissiveIntensity: 0.3 }), 10, 8);
  // flower beds
  const flowers = []; const FC = ['#ff5a3c', '#ffc23d', '#e84a7f', '#ffffff', '#9b51e0'].map(c => new THREE.Color(c));
  for (const [bx, bz] of [[-14, 13], [14, 13], [-9, 22], [9, 22]]) {
    const bed = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.6, 0.5, 20), M('#7a5638')); bed.position.set(bx, 0.5, bz); g.add(bed);
    for (let i = 0; i < 40; i++) { const a = rnd() * 6.28, r = Math.sqrt(rnd()) * 3; flowers.push([bx + Math.cos(a) * r, 0.8, bz + Math.sin(a) * r, 0, 0.3 + rnd() * 0.15]); }
  }
  // ---- mosque (won the vote) ----
  const mq = buildHouse('mosque', 'mosque'); mq.userData.inner.scale.setScalar(2.7); mq.position.set(MOSQ.x, 0.26, MOSQ.z); mq.rotation.y = 0.5; g.add(mq);
  const mpad = new THREE.Mesh(new THREE.CircleGeometry(10, 32).rotateX(-Math.PI / 2), M('#e8dfcc')); mpad.position.set(MOSQ.x, 0.27, MOSQ.z); g.add(mpad);
  POIS.push({ key: 'mosque', x: MOSQ.x, y: 23, z: MOSQ.z, html: '🕌 МЕЧЕТЬ<i>победила в голосовании</i>' });
  inst(new THREE.IcosahedronGeometry(1, 0), WHITE(), flowers, () => FC[Math.floor(rnd() * FC.length)]);
  scene.userData.plaza = g;
}

function buildOutskirts() {
  // forest ring
  for (let i = 0; i < 1900; i++) {
    const x = (rnd() - 0.5) * 2 * (CX + 170), z = (rnd() - 0.5) * 2 * (CZ + 170);
    if (Math.abs(x) < CX + 8 && Math.abs(z) < CZ + 8) continue;
    if (Math.abs(x - SECRET.x) < 70 && Math.abs(z - SECRET.z) < 46) continue;
    addTree(x, z, 1.4 + rnd() * 0.9);
  }
  // hills
  const hills = []; const HC = ['#86b865', '#7aac5c', '#93c06e'].map(c => new THREE.Color(c));
  for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2 + rnd() * 0.2, r = 520 + rnd() * 160; hills.push([Math.cos(a) * r * 1.2, -2, Math.sin(a) * r, rnd() * 6, 1, 60 + rnd() * 70, 25 + rnd() * 45, 60 + rnd() * 70]); }
  inst(new THREE.ConeGeometry(1, 1, 7).translate(0, 0.5, 0), WHITE(), hills, () => HC[Math.floor(rnd() * 3)]);
  // volcano
  const v = new THREE.Group(); v.position.set(VOLC.x, -2, VOLC.z); scene.add(v);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(28, 150, 140, 9, 1, true), M('#7d5a4c')); body.position.y = 70; v.add(body);
  const lava = new THREE.Mesh(new THREE.CircleGeometry(27, 9).rotateX(-Math.PI / 2), M('#ff6a2a', { emissive: '#ff4a10', emissiveIntensity: 1 })); lava.position.y = 139; v.add(lava);
  for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(6, 70 - i * 12, 3), M('#ff7a2a', { emissive: '#ff5a10', emissiveIntensity: 0.9 })); s.position.set(Math.cos(i * 1.7) * 60, 45 - i * 4, Math.sin(i * 1.7) * 60 + 40); s.rotation.set(0.25, i * 1.7, 0.3); v.add(s); }
  const smoke = new THREE.MeshLambertMaterial({ color: '#8c8c96', transparent: true, opacity: 0.75, flatShading: true });
  for (let i = 0; i < 9; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(16 + i * 3, 1), smoke); s.position.set(Math.sin(i) * 14 + i * 6, 150 + i * 18, Math.cos(i * 1.3) * 10); v.add(s); }
  POIS.push({ key: 'volcano', x: VOLC.x, y: 230, z: VOLC.z, html: '🌋 ВУЛКАН<i>следующая катастрофа</i>', far: true });
  // secret location
  const sg = new THREE.Group(); sg.position.set(SECRET.x, 0, SECRET.z); scene.add(sg);
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(120, 72).rotateX(-Math.PI / 2), M('#4a4f5c')); sp.position.y = 0.05; sg.add(sp);
  for (let i = 0; i <= 40; i++) { const t = i / 40; for (const [x, z] of [[-60 + 120 * t, 36], [-60 + 120 * t, -36]]) box(sg, 0.25, 3.2, 0.25, '#ffc23d', x, 0, z); }
  for (let i = 0; i <= 24; i++) { const t = i / 24; for (const x of [-60, 60]) box(sg, 0.25, 3.2, 0.25, '#ffc23d', x, 0, -36 + 72 * t); }
  for (const [w, d, x, z, r] of [[120, 0.2, 0, 36, 0], [120, 0.2, 0, -36, 0], [0.2, 72, 60, 0, 0], [0.2, 72, -60, 0, 0]]) { box(sg, w, 0.3, d, '#16223a', x, 2.4, z); box(sg, w, 0.3, d, '#16223a', x, 1.2, z); }
  const cloudM = new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true, transparent: true, opacity: 0.96 });
  for (let i = 0; i < 34; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(9 + rnd() * 9, 1), cloudM); c.position.set((rnd() - 0.5) * 108, 6 + rnd() * 10, (rnd() - 0.5) * 62); c.scale.y = 0.6; sg.add(c); }
  POIS.push({ key: 'secret', x: SECRET.x, y: 34, z: SECRET.z, html: '🔒 СЕКРЕТНАЯ ЛОКАЦИЯ<i>откроется на 2500 подписчиков</i>' });
}

// ---------------- residents placement ----------------
function placeResidents(res) {
  const lots = [];
  for (let bx = -NB; bx <= NB; bx++) for (let bz = -NB; bz <= NB; bz++) {
    if (isPlaza(bx, bz)) continue;
    for (let row = 0; row < NCZ; row++) for (let col = 0; col < NCX; col++) {
      const x = bx * PX - BW / 2 + LOT * (col + 0.5), z = bz * PZ + (row === 0 ? LOT / 2 : -LOT / 2);
      lots.push({ bx, bz, row, col, x, z, d: Math.hypot(x, z * 1.35), used: false });
    }
  }
  const lotAt = new Map(lots.map(l => [`${l.bx},${l.bz},${l.row},${l.col}`, l]));
  lots.sort((a, b) => a.d - b.d);
  const BIG = /^(stadium|court|bigcastle|castle|pinkcastle|kremlin|mall|aquapark|farm|hospital|school|jurassic|ferris|hotel|poolmansion|carsmansion|mansion|royal|theater|dance|mosque|villa|plane)/;
  const stars = res.feat.filter(f => f.star), reqs = res.feat.filter(f => !f.star);
  const stds = res.std.slice().sort((a, b) => (b.old ? 1 : 0) - (a.old ? 1 : 0));
  const seq = [...stars]; let ri = 0, si = 0; const ratio = reqs.length / Math.max(1, reqs.length + stds.length);
  while (ri < reqs.length || si < stds.length) { if (si >= stds.length || (ri < reqs.length && (ri + 1) / (ri + si + 1) <= ratio + 0.001)) seq.push(reqs[ri++]); else seq.push(stds[si++]); }
  const takeSingle = () => lots.find(l => !l.used);
  const takePair = () => { for (const l of lots) { if (l.used) continue; const m = lotAt.get(`${l.bx},${l.bz},${l.row},${l.col ^ 1}`); if (m && !m.used) return l.col % 2 === 0 ? [l, m] : [m, l]; } return null; };
  const put = (r, x, z, row, big, lot) => {
    const obj = buildHouse(r.type, r.nick); const inner = obj.userData.inner;
    let sc = r.feat ? 0.95 : 0.85; inner.scale.setScalar(sc);
    const bb = new THREE.Box3().setFromObject(obj); const w = bb.max.x - bb.min.x, d = bb.max.z - bb.min.z;
    const fit = Math.min(1, (big ? 2 * LOT - 1.2 : LOT - 1.2) / Math.max(0.1, w), (LOT - 1.0) / Math.max(0.1, d)); sc *= fit; inner.scale.setScalar(sc);
    const face = row === 0 ? 1 : -1;
    obj.position.set(x, 0.26, z - face * 0.3); obj.rotation.y = row === 0 ? 0 : Math.PI;
    // yard shadow + front path
    const yard = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), M('#93c46c')); yard.scale.set(Math.min(w * fit, big ? 12 : 6) + 0.8, 1, Math.min(d * fit, 6) + 0.8); yard.position.set(0, 0.01, 0); obj.add(yard);
    const path = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), M('#e3d6bd')); path.scale.set(1, 1, 2.4); path.position.set(0, 0.015, 2.6); obj.add(path);
    scene.add(obj);
    const street = row === 0 ? lot.bz + NB + 1 : lot.bz + NB; const gx = (lot.bx + NB) * NCX + lot.col;
    const no = row === 0 ? 2 * gx + 1 : 2 * gx + 2;
    houses.push({ ...r, obj, x, y: 0.26, z, face, h: Math.min(obj.userData.h * sc, 60), big, addr: `ул. ${STREETS[street]}, ${no}` });
  };
  for (const r of seq) {
    const big = r.star || BIG.test(r.type);
    const p = big ? takePair() : null;
    if (p) { p[0].used = p[1].used = true; put(r, (p[0].x + p[1].x) / 2, p[0].z, p[0].row, true, p[0]); }
    else { const l = takeSingle(); if (!l) break; l.used = true; put(r, l.x, l.z, l.row, false, l); }
  }
  const free = lots;
  // leftover lots → mini parks
  for (const l of free) if (!l.used) { addTree(l.x - 1.3, l.z, 1); addTree(l.x + 1.4, l.z + 1, 0.9); }
}

// ---------------- merge static geometry ----------------
function mergeStatic(objs) {
  const buckets = new Map();
  for (const o of objs) {
    o.updateMatrixWorld(true);
    o.traverse((m) => {
      if (!m.isMesh || !m.visible || m.isInstancedMesh) return; const mat = m.material; if (Array.isArray(mat) || mat.transparent) return;
      let g = m.geometry; g = g.index ? g.toNonIndexed() : g.clone(); g.applyMatrix4(m.matrixWorld);
      let b = buckets.get(mat); if (!b) { b = { pos: [], nor: [], uv: [] }; buckets.set(mat, b); }
      const p = g.attributes.position.array; b.pos.push(p); if (!g.attributes.normal) g.computeVertexNormals(); b.nor.push(g.attributes.normal.array);
      b.uv.push(g.attributes.uv ? g.attributes.uv.array : new Float32Array(p.length / 3 * 2)); m.userData.merged = true;
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

// ---------------- camera ----------------
const cam = { x: 0, z: 10, d: 260, yaw: 0.0, fly: null, idle: true };
const LIM = { x0: -CX - 40, x1: CX + 40, z0: SECRET.z - 30, z1: CZ + 40, d0: 18, d1: 420 };
const pitchOf = (d) => lerp(0.36, 1.14, sm(12, 230, d));
function applyCam(c = cam) {
  const p = pitchOf(c.d);
  camera.position.set(c.x + Math.sin(c.yaw) * Math.cos(p) * c.d, Math.sin(p) * c.d, c.z + Math.cos(c.yaw) * Math.cos(p) * c.d);
  camera.lookAt(c.x, 0, c.z); camera.updateMatrixWorld(true);
  scene.fog.near = c.d * 1.0 + 90; scene.fog.far = c.d * 1.6 + 700;
}
let dirty = true; const markDirty = () => { dirty = true; };
function flyTo(x, z, d, yaw = cam.yaw, dur = 1.5) {
  let dy = ((yaw - cam.yaw + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  const dist = Math.hypot(x - cam.x, z - cam.z);
  cam.fly = { x0: cam.x, z0: cam.z, d0: cam.d, y0: cam.yaw, x1: x, z1: z, d1: d, y1: cam.yaw + dy, t0: performance.now(), dur: dur * 1000, arc: Math.min(160, dist * 0.45) };
  cam.idle = false; markDirty();
}
function clampCam() { cam.x = clamp(cam.x, LIM.x0, LIM.x1); cam.z = clamp(cam.z, LIM.z0, LIM.z1); cam.d = clamp(cam.d, LIM.d0, LIM.d1); }
const goHall = () => flyTo(HALL.x, HALL.z + 8, 100, 0.25);

// ---------------- labels ----------------
let pool = []; const tmp = new THREE.Vector3();
function proj(x, y, z) { tmp.set(x, y, z).project(camera); return { x: (tmp.x * 0.5 + 0.5) * innerWidth, y: (-tmp.y * 0.5 + 0.5) * innerHeight, z: tmp.z, ok: tmp.z < 1 && tmp.z > -1 }; }
function labelEl(i) { while (pool.length <= i) { const d = document.createElement('div'); d.className = 'lb'; $('#labels').appendChild(d); pool.push(d); } return pool[i]; }
let selected = null;
function updateLabels() {
  const D = cam.d; const topY = $('#hud').getBoundingClientRect().bottom + 6, botY = $('#dock').getBoundingClientRect().top - 6;
  const rects = []; let n = 0;
  const hit = (x0, y0, x1, y1) => { for (const r of rects) if (x0 < r[2] && x1 > r[0] && y0 < r[3] && y1 > r[1]) return true; return false; };
  const cand = [];
  const R = Math.max(60, D * 1.6);
  for (const h of houses) {
    const dd = Math.hypot(h.x - cam.x, h.z - cam.z); if (dd > R && h !== selected) continue;
    if (h !== selected && ((D > 150 && !h.star) || (!h.feat && D > 70))) continue;
    cand.push([h, (h === selected ? -1e6 : 0) + (h.star ? -2e4 : 0) + (h.feat ? -1e4 : 0) + dd]);
  }
  cand.sort((a, b) => a[1] - b[1]);
  const max = D < 40 ? 22 : D < 90 ? 26 : 18;
  // POIs first
  for (const p of POIS) {
    if (p.far && D < 60) continue;
    const q = proj(p.x, p.y, p.z); if (!q.ok || q.x < 20 || q.x > innerWidth - 20 || q.y < topY + 20 || q.y > botY) continue;
    const L = labelEl(n++); const html = p.html; if (L._h !== html) { L.innerHTML = html; L._h = html; L.dataset.k = p.key; }
    L.className = 'lb poi'; const w = L._w || (L._w = L.offsetWidth || 180);
    L.style.transform = `translate(${q.x.toFixed(1)}px,${q.y.toFixed(1)}px) translate(-50%,-100%)`; L.style.display = 'block'; L.style.zIndex = 900;
    rects.push([q.x - w / 2, q.y - 46, q.x + w / 2, q.y]);
  }
  let shown = 0;
  for (const [h] of cand) {
    if (shown >= max) break;
    const q = proj(h.x, h.y + Math.min(h.h, 14) + 0.9, h.z); if (!q.ok || q.x < -10 || q.x > innerWidth + 10 || q.y < topY + 24 || q.y > botY) continue;
    const sel = h === selected; const showReq = h.feat && (sel || D < 75);
    const wEst = (Math.max(h.nick.length, showReq ? (h.req || '').length + 3 : 0)) * 7.4 + 26, hEst = showReq ? 44 : 28;
    const sc = sel ? 1.15 : clamp(46 / D + 0.55, 0.7, 1.05);
    const x0 = q.x - wEst * sc / 2, x1 = q.x + wEst * sc / 2, y0 = q.y - hEst * sc - 6, y1 = q.y;
    if (!sel && hit(x0, y0, x1, y1)) continue;
    rects.push([x0, y0, x1, y1]); shown++;
    const L = labelEl(n++);
    const html = `${h.feat ? `<b>${emo(h.type)}</b>` : ''}${esc(h.nick)}${showReq ? `<i>${esc(h.req)}</i>` : ''}`;
    if (L._h !== html) { L.innerHTML = html; L._h = html; delete L.dataset.k; }
    L.className = 'lb' + (h.star ? ' ft' : h.feat ? ' rq' : '') + (sel ? ' sel' : ''); L._house = h;
    L.style.transform = `translate(${q.x.toFixed(1)}px,${q.y.toFixed(1)}px) translate(-50%,-100%) scale(${sc.toFixed(3)})`; L.style.display = 'block'; L.style.zIndex = sel ? 999 : (h.feat ? 500 : 0) + Math.round(q.y / 4);
  }
  for (let i = n; i < pool.length; i++) { pool[i].style.display = 'none'; pool[i]._house = null; }
}

// ---------------- selection marker ----------------
let marker, beam;
function buildMarker() {
  marker = new THREE.Mesh(new THREE.RingGeometry(3.1, 3.5, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ff5a3c', transparent: true, opacity: 0.95, depthWrite: false })); marker.visible = false; scene.add(marker);
  beam = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 90, 28, 1, true), new THREE.MeshBasicMaterial({ color: '#ffc23d', transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); beam.visible = false; scene.add(beam);
}
function viewFor(h) { const d = clamp(h.h * 2.2 + 30, 36, 85); return [h.x, h.z, d, h.face > 0 ? 0.35 : Math.PI + 0.35]; }
function select(h, fly = true) {
  selected = h; marker.visible = beam.visible = !!h;
  if (h) { const r = h.big ? 1.8 : 1; marker.scale.set(r, 1, r); marker.position.set(h.x, 0.32, h.z); beam.position.set(h.x, 45, h.z); if (fly) { const v = viewFor(h); flyTo(v[0], v[1], v[2], v[3]); } }
  markDirty();
}

// ---------------- UI ----------------
function sheet(html) { const c = $('#card'); c.innerHTML = `<button class="x" aria-label="Закрыть">✕</button>` + html; c.classList.add('on'); c.querySelector('.x').onclick = closeCard; }
function closeCard() { $('#card').classList.remove('on'); }
function houseCard(h, found) {
  sheet(`<div class="kick">${found ? '🎉 Нашли твой дом!' : '🏠 Здесь живёт'}</div>
    <div class="nick">@${esc(h.nick)}</div>
    <div class="addr">📍 ${esc(h.addr)}</div>
    ${h.req ? `<div class="chip">${emo(h.type)} ${esc(h.req)}</div>` : ''}${h.shield ? '<div class="chip sh">🛡 Дом под щитом</div>' : ''}
    <div class="row"><button class="b1" id="cStory">📸 В сторис</button><button class="b3" id="cUp">⬆ Улучшить</button><button class="b2" id="cLink">🔗</button></div>`);
  $('#cUp').onclick = () => openUpgrade(h);
  $('#cStory').onclick = () => makeStory(h);
  $('#cLink').onclick = () => shareLink(h);
}
function findNick(raw) {
  const q = norm(raw); if (!q) return;
  hideWelcome();
  const h = houses.find(x => x.nick.toLowerCase() === q);
  if (h) { select(h); houseCard(h, true); history.replaceState(null, '', '?nick=' + encodeURIComponent(h.nick)); return; }
  select(null);
  const sug = houses.filter(x => x.nick.toLowerCase().includes(q) || (q.length > 3 && x.nick.toLowerCase().startsWith(q.slice(0, -1)))).slice(0, 4);
  sheet(`<div class="kick">🤔 @${esc(q)} пока нет в городе</div>
    ${sug.length ? `<div class="txt">Может, ты:</div><div class="sug">${sug.map(s => `<button data-n="${esc(s.nick)}">@${esc(s.nick)}</button>`).join('')}</div>` : ''}
    <div class="txt">Подписался недавно? Твой дом появится в следующем выпуске. Ещё не подписан — подпишись, и мы построим тебе дом!</div>
    <div class="row"><a class="b1" target="_blank" href="https://instagram.com/${IG}">Подписаться на @${IG}</a></div>`);
  $('#card').querySelectorAll('.sug button').forEach(b => b.onclick = () => findNick(b.dataset.n));
}
function shareLink(h) {
  const url = `https://${SITE}/?nick=${encodeURIComponent(h.nick)}`;
  if (navigator.share) navigator.share({ title: 'Город Домино', text: 'Мой дом в Городе Домино 🏠 Найди свой!', url }).catch(() => {});
  else { navigator.clipboard?.writeText(url).catch(() => {}); toast('Ссылка скопирована'); }
}
function toast(t) { const e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(e._t); e._t = setTimeout(() => e.classList.remove('on'), 2200); }
function modal(html) { const m = $('#modal'); m.querySelector('.in').innerHTML = `<button class="x" aria-label="Закрыть">✕</button>` + html; m.classList.add('on'); m.querySelector('.x').onclick = closeModal; }
function closeModal() { $('#modal').classList.remove('on'); }
function openPlaces() {
  const extra = [['🏛', 'Мэрия', 'центр города • мэр: ???', 'hall'], ['🕌', 'Мечеть', 'победила в голосовании', 'mosque'], ['🔒', 'Секретная локация', 'откроется на 2500 подписчиков', 'secret'], ['🌋', 'Вулкан', 'следующая катастрофа', 'volcano']];
  modal(`<h2>✨ Места города</h2><p>Дома, которые подписчики заказали в комментариях.</p>
    ${extra.map(([e, a, b, k]) => `<button class="it" data-k="${k}"><span class="e">${e}</span><span class="t"><b>${a}</b><i>${b}</i></span><span class="go">→</span></button>`).join('')}
    <p style="margin-top:14px"><b>${houses.filter(h => h.feat).length}</b> домов построено по заказам из комментариев. Найди свой по нику!</p>
    ${houses.filter(h => h.star).map(h => `<button class="it" data-n="${esc(h.nick)}"><span class="e">${emo(h.type)}</span><span class="t"><b>${esc(h.req)}</b><i>@${esc(h.nick)} • ${esc(h.addr)}</i></span><span class="go">→</span></button>`).join('')}`);
  $('#modal').querySelectorAll('.it').forEach(b => b.onclick = () => {
    closeModal(); if (b.dataset.n) { const h = houses.find(x => x.nick === b.dataset.n); select(h); houseCard(h, false); return; }
    select(null); closeCard(); const k = b.dataset.k;
    if (k === 'hall') { goHall(); hallCard(); } else if (k === 'mosque') flyTo(MOSQ.x, MOSQ.z + 4, 55, 0.6); else if (k === 'secret') flyTo(SECRET.x, SECRET.z + 20, 120, 0); else flyTo(-120, -150, 260, 0.6);
  });
}
function openUpgrade(h) {
  modal(`<h2>⬆ Улучшение дома</h2><p>Дом @${esc(h.nick)} можно прокачать до особняка. Уровни обновляются с каждым выпуском.</p>
    <div class="step"><span>1</span><div><b>Дом</b><i>Подписка на @${IG} — твой дом уже стоит ✅</i></div></div>
    <div class="step"><span>2</span><div><b>Усадьба: забор, сад, деревья</b><i>Напиши 3 комментария под последним выпуском</i></div></div>
    <div class="step"><span>3</span><div><b>Особняк: бассейн и машина</b><i>Сделай репост выпуска в сторис с отметкой @${IG}</i></div></div>
    <div class="row"><a class="b1" target="_blank" href="https://instagram.com/${IG}">Открыть @${IG}</a></div>`);
}
function hallCard() {
  sheet(`<div class="kick">🏛 Мэрия Города Домино</div><div class="nick">Мэр: ???</div>
    <div class="txt">Наберём 1000 лайков на выпуске — проведём выборы мэра. Шанс есть у того, кто больше всех комментирует 👑</div>
    <div class="row"><a class="b1" target="_blank" href="https://instagram.com/${IG}">Поставить лайк ❤️</a></div>`);
}
function openVote() {
  const opts = ['🎢 Парк аттракционов', '🎬 Кинотеатр', '🌊 Аквапарк', '🦁 Зоопарк'];
  modal(`<h2>🗳 Что строим дальше?</h2><p>Прошлое голосование выиграла <b>мечеть</b> — она уже стоит на площади ✅<br>Голосуем в комментариях под последним рилсом. Нажми на вариант — мы скопируем голос, останется вставить в комментарий.</p>
    ${opts.map((o, i) => `<button class="opt" data-i="${i}">${o}</button>`).join('')}`);
  $('#modal').querySelectorAll('.opt').forEach(b => b.onclick = () => { const txt = `Голосую: ${opts[b.dataset.i].replace(/^\S+\s/, '')} 🗳`; navigator.clipboard?.writeText(txt).catch(() => {}); b.textContent = '✓ Скопировано — вставь в комменты'; b.classList.add('ok'); setTimeout(() => window.open('https://instagram.com/' + IG, '_blank'), 800); });
}
function openHow() {
  modal(`<h2>🏠 Как попасть в город</h2>
    <div class="step"><span>1</span><div><b>Подпишись на @${IG}</b><i>Один подписчик — один дом. Твой появится в ближайшем выпуске.</i></div></div>
    <div class="step"><span>2</span><div><b>Напиши в комментах, какой дом хочешь</b><i>Капибара, арбуз, замок, ракета — построим самые интересные.</i></div></div>
    <div class="step"><span>3</span><div><b>Лайк = щит от апокалипсиса</b><i>Цунами, вулкан, зомби… Активные жители получают защиту.</i></div></div>
    <div class="row"><a class="b1" target="_blank" href="https://instagram.com/${IG}">Открыть @${IG}</a></div>`);
}

// ---------------- story image ----------------
async function makeStory(h) {
  toast('Рисуем картинку…');
  try { await Promise.all([document.fonts.load('900 80px Unbounded'), document.fonts.load('800 40px Manrope')]); } catch (e) {}
  const save = { ...cam }; const was = marker.visible;
  const v = viewFor(h); const sc = { x: v[0], z: v[1], d: v[2] * 0.95, yaw: v[3] - 0.15 };
  applyCam(sc); marker.visible = beam.visible = false; renderer.render(scene, camera);
  const src = renderer.domElement; const W = 1080, H = 1920;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const s = Math.max(W / src.width, H / src.height); const dw = src.width * s, dh = src.height * s, ox = (W - dw) / 2, oy = (H - dh) / 2;
  const q = proj(h.x, h.y + Math.min(h.h, 14) + 1, h.z);
  const oy2 = clamp(860 - q.y / innerHeight * dh, H - dh, 0);
  x.drawImage(src, ox, oy2, dw, dh);
  const px = ox + q.x / innerWidth * dw, py = oy2 + q.y / innerHeight * dh;
  marker.visible = beam.visible = was; applyCam(); markDirty();
  // overlays
  let g = x.createLinearGradient(0, 0, 0, 600); g.addColorStop(0, 'rgba(22,34,58,.7)'); g.addColorStop(1, 'rgba(22,34,58,0)'); x.fillStyle = g; x.fillRect(0, 0, W, 600); x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 18;
  g = x.createLinearGradient(0, H - 760, 0, H); g.addColorStop(0, 'rgba(22,34,58,0)'); g.addColorStop(1, 'rgba(22,34,58,.9)'); x.fillStyle = g; x.fillRect(0, H - 760, W, 760);
  const F1 = 'Unbounded, Arial Black, sans-serif', F2 = 'Manrope, Arial, sans-serif';
  x.textAlign = 'center'; x.fillStyle = '#ffffff'; x.font = `900 92px ${F1}`; x.fillText('МОЙ ДОМ', W / 2, 330);
  x.fillStyle = '#ffc23d'; x.font = `800 58px ${F1}`; x.fillText('В ГОРОДЕ ДОМИНО', W / 2, 410); x.shadowBlur = 0;
  // pin label
  const nick = '@' + h.nick; x.font = `800 50px ${F2}`; const tw = Math.min(900, x.measureText(nick).width) + 70;
  const ly = clamp(py, 700, 1300); const lx = clamp(px, tw / 2 + 30, W - tw / 2 - 30);
  x.fillStyle = '#ff5a3c'; x.beginPath(); x.roundRect(lx - tw / 2, ly - 120, tw, 92, 46); x.fill();
  x.beginPath(); x.moveTo(lx - 22, ly - 30); x.lineTo(lx + 22, ly - 30); x.lineTo(lx, ly); x.fill();
  x.fillStyle = '#ffffff'; x.fillText(nick, lx, ly - 57, 880);
  if (h.req) { const t = `${emo(h.type)} ${h.req}`; x.font = `800 38px ${F2}`; const w2 = x.measureText(t).width + 50; x.fillStyle = 'rgba(255,255,255,.95)'; x.beginPath(); x.roundRect(lx - w2 / 2, ly - 196, w2, 64, 32); x.fill(); x.fillStyle = '#16223a'; x.fillText(t, lx, ly - 151); }
  // bottom card
  const by = 1380; x.fillStyle = '#fffaf2'; x.beginPath(); x.roundRect(70, by, W - 140, 300, 44); x.fill();
  x.fillStyle = '#16223a'; x.font = `800 46px ${F1}`; x.fillText('📍 ' + h.addr, W / 2, by + 86, W - 200);
  x.font = `700 38px ${F2}`; x.fillStyle = '#56607a'; x.fillText('1 подписчик = 1 дом. Найди свой 👇', W / 2, by + 160);
  x.font = `800 46px ${F2}`; x.fillStyle = '#ff5a3c'; x.fillText(SITE, W / 2, by + 236);
  x.font = `800 36px ${F2}`; x.fillStyle = 'rgba(255,255,255,.85)'; x.fillText('@' + IG, W / 2, by + 360);
  const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.92)); const url = URL.createObjectURL(blob);
  const file = new File([blob], `domino-${h.nick}.jpg`, { type: 'image/jpeg' });
  const canFiles = !!(navigator.canShare && navigator.canShare({ files: [file] }));
  modal(`<h2>📸 Твоя картинка для сторис</h2><p>${canFiles ? 'Нажми «Поделиться» → Instagram → История.' : 'Зажми картинку пальцем → «Сохранить», потом выложи в сторис.'} Добавь стикер-ссылку на <b>${SITE}</b>, чтобы друзья нашли свои дома! ${canFiles ? '' : '<br>Не сохраняется? Открой сайт в Safari/Chrome: «⋯» → «Открыть в браузере».'}</p>
    <img class="story" src="${url}" alt="Мой дом в Городе Домино">
    <div class="row">${canFiles ? '<button class="b1" id="sShare">Поделиться</button>' : ''}<a class="${canFiles ? 'b2' : 'b1'}" id="sDl" href="${url}" download="domino-${esc(h.nick)}.jpg">Скачать</a></div>`);
  if (canFiles) $('#sShare').onclick = () => navigator.share({ files: [file], title: 'Мой дом в Городе Домино' }).catch(() => {});
}

// ---------------- input ----------------
function bindControls(el) {
  const pts = new Map(); let g0 = null, tap = null;
  const two = () => { const [a, b] = [...pts.values()]; return { cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y), a: Math.atan2(b.y - a.y, b.x - a.x) }; };
  const pan = (dx, dy) => { const p = pitchOf(cam.d); const k = cam.d / innerHeight * 1.25; const kz = k / Math.max(0.45, Math.sin(p)); const c = Math.cos(cam.yaw), s = Math.sin(cam.yaw); cam.x -= dx * k * c + dy * kz * s; cam.z -= -dx * k * s + dy * kz * c; };
  el.addEventListener('pointerdown', (e) => {
    el.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY, b: e.button }); cam.fly = null; cam.idle = false;
    tap = pts.size === 1 ? { x: e.clientX, y: e.clientY, t: performance.now() } : null; if (pts.size === 2) g0 = two();
  });
  el.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) return; const prev = pts.get(e.pointerId); const cur = { x: e.clientX, y: e.clientY, b: prev.b }; pts.set(e.pointerId, cur);
    if (tap && Math.hypot(cur.x - tap.x, cur.y - tap.y) > 8) tap = null;
    if (pts.size === 1) {
      if (prev.b === 2 || e.shiftKey) { cam.yaw -= (cur.x - prev.x) * 0.006; } else pan(cur.x - prev.x, cur.y - prev.y);
    } else if (pts.size === 2) { const g = two(); if (g0) { cam.d *= g0.d / g.d; let da = g.a - g0.a; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; cam.yaw -= da; pan(g.cx - g0.cx, g.cy - g0.cy); } g0 = g; }
    clampCam(); markDirty();
  });
  const up = (e) => {
    if (tap && pts.size === 1 && performance.now() - tap.t < 450) onTap(tap.x, tap.y);
    pts.delete(e.pointerId); tap = null; g0 = pts.size === 2 ? two() : null;
  };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', (e) => { pts.delete(e.pointerId); tap = null; g0 = null; });
  el.addEventListener('contextmenu', (e) => e.preventDefault());
  el.addEventListener('wheel', (e) => { e.preventDefault(); cam.d *= Math.exp(e.deltaY * 0.0012); cam.fly = null; cam.idle = false; clampCam(); markDirty(); }, { passive: false });
}
const ray = new THREE.Raycaster(), gPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.26), gHit = new THREE.Vector3();
function onTap(sx, sy) {
  ray.setFromCamera(new THREE.Vector2(sx / innerWidth * 2 - 1, -(sy / innerHeight) * 2 + 1), camera);
  if (ray.ray.intersectPlane(gPlane, gHit)) {
    if (Math.abs(gHit.x - HALL.x) < 16 && Math.abs(gHit.z - HALL.z) < 9) { select(null); goHall(); hallCard(); return; }
    const g = houses.find(h => Math.abs(gHit.x - h.x) < (h.big ? LOT : LOT / 2) && Math.abs(gHit.z - h.z) < LOT / 2);
    if (g) { select(g); houseCard(g, false); return; }
  }
  let best = null, bd = 1e9;
  for (const h of houses) {
    if (Math.hypot(h.x - cam.x, h.z - cam.z) > cam.d * 2 + 40) continue;
    const q = proj(h.x, h.y + h.h * 0.45, h.z); if (!q.ok) continue;
    const lim = clamp(900 / cam.d, 18, 70) * (h.big ? 1.8 : 1);
    const dd = Math.hypot(q.x - sx, q.y - sy); if (dd < lim && dd / lim + q.z * 0.2 < bd) { bd = dd / lim + q.z * 0.2; best = h; }
  }
  const hq = proj(HALL.x, 8, HALL.z); const hl = clamp(4000 / cam.d, 40, 220);
  if (hq.ok && Math.hypot(hq.x - sx, hq.y - sy) < hl && (!best || Math.hypot(hq.x - sx, hq.y - sy) / hl < bd)) { select(null); goHall(); hallCard(); return; }
  if (best) { select(best); houseCard(best, false); }
}

function hideWelcome() { $('#welcome').classList.add('off'); cam.idle = false; }

// ---------------- boot ----------------
export async function boot() {
  const canvas = $('#c');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight, false);
  scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.5, 4000);
  const step = (t) => new Promise(r => { $('#loadtxt').textContent = t; setTimeout(r, 20); });
  const res = await (await fetch('./residents.json')).json();
  await step('Прокладываем дороги…'); buildWorld();
  await step('Ставим дома…'); placeResidents(res);
  await step('Зажигаем фонари…'); mergeStatic([...houses.map(h => h.obj), scene.userData.plaza]);
  buildMarker(); bindControls(canvas);
  $('#pop').textContent = POP.toLocaleString('ru-RU'); $('#pop2').textContent = POP.toLocaleString('ru-RU');
  $('#ticker').innerHTML = `<span>${NEWS.join('&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;')}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</span>`.repeat(2);
  const go = (inp) => findNick($(inp).value);
  $('#wgo').onclick = () => go('#wnick'); $('#wnick').onkeydown = (e) => { if (e.key === 'Enter') go('#wnick'); };
  $('#sgo').onclick = () => go('#snick'); $('#snick').onkeydown = (e) => { if (e.key === 'Enter') { go('#snick'); e.target.blur(); } };
  $('#walk').onclick = () => { hideWelcome(); goHall(); };
  $('#zin').onclick = () => { cam.fly = null; flyTo(cam.x, cam.z, clamp(cam.d * 0.6, LIM.d0, LIM.d1), cam.yaw, 0.5); };
  $('#zout').onclick = () => { cam.fly = null; flyTo(cam.x, cam.z, clamp(cam.d * 1.6, LIM.d0, LIM.d1), cam.yaw, 0.5); };
  $('#rot').onclick = () => flyTo(cam.x, cam.z, cam.d, cam.yaw + Math.PI / 4, 0.6);
  $('#home').onclick = () => { select(null); goHall(); hallCard(); };
  $('#tPlaces').onclick = openPlaces; $('#tVote').onclick = openVote; $('#tHow').onclick = openHow;
  $('#labels').addEventListener('click', (e) => { const L = e.target.closest('.lb'); if (!L) return; if (L._house) { select(L._house); houseCard(L._house, false); } else if (L.dataset.k === 'hall') { goHall(); hallCard(); } else if (L.dataset.k === 'secret') flyTo(SECRET.x, SECRET.z + 20, 120, 0); });
  addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); markDirty(); });
  $('#loader').classList.add('off');
  const qn = new URLSearchParams(location.search).get('nick'); if (qn) findNick(qn);
  window.__city = { cam, houses, flyTo, select, findNick, makeStory, markDirty };
  const loop = (now) => {
    if (cam.fly) { const f = cam.fly; const k = clamp((now - f.t0) / f.dur); const e = k * k * (3 - 2 * k);
      cam.x = lerp(f.x0, f.x1, e); cam.z = lerp(f.z0, f.z1, e); cam.d = lerp(f.d0, f.d1, e) + Math.sin(Math.PI * e) * f.arc; cam.yaw = lerp(f.y0, f.y1, e); if (k >= 1) cam.fly = null; dirty = true; }
    if (cam.idle) { if (cam.idleT0 == null) { cam.idleT0 = now; cam.idleY0 = cam.yaw; } cam.yaw = cam.idleY0 + 0.07 * (now - cam.idleT0) / 1000; dirty = true; } else cam.idleT0 = null;
    if (selected) { const s = (selected.big ? 1.8 : 1) * (1 + 0.07 * Math.sin(now / 170)); marker.scale.set(s, 1, s); dirty = true; }
    if (dirty) { applyCam(); renderer.render(scene, camera); updateLabels(); dirty = false; }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
