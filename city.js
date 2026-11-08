// =====================================================================
//  ГОРОД ДОМИНО — интерактивный 3D-город подписчиков @domino.gorod
// =====================================================================
import * as THREE from './three.module.js';
import { M, box, cyl, sph, cone, gable, windows, buildHouse } from './builders.js';
import { createGame } from './game.js';
import './extra.js';
import './extra2.js';
import './extra3.js';
import './extra4.js';

const IG = 'domino.gorod', POP = 6137, SITE = 'gorod-domeno.vercel.app';
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
const STREETS = ['Подписчиков', 'Лайков', 'Репостов', 'Капибарная', 'Чебуречная', 'Арбузная', 'Сторис', 'Рилсов', 'Пельменная', 'Комментариев', 'Солнечная', 'Хештегов', 'Дружбы', 'Весёлая', 'Мечтателей', 'Звёздная', 'Мэрская', 'Площадная', 'Юртовая', 'Замковая', 'Особняковая', 'Ракетная', 'Речная', 'Мостовая', 'Набережная', 'Садовая', 'Ёлочная', 'Морская', 'Пирсовая', 'Аэропортовая', 'Рыночная', 'Торговая', 'Деловая', 'Выборная', 'Тарелочная', 'Защитников'];
const NEWS = [
  '🗳 Идут выборы мэра! Мэром станет тот, у кого больше всех комментариев',
  '🛸 НЛО атакуют город — жми «Играть» и отбивайся от пришельцев',
  '🎄 Рядом с мэрией выросла огромная ёлка — игрушки начнём вешать позже',
  '🛍 Открылся торговый квартал: рынок, два ТЦ и места под бизнесы',
  '🏪 Есть бизнес? Подпишись и напиши название в комментах — повесим вывеску',
  '🌊 У города появился океан. Пирс откроется на 10 000 подписчиков',
  '🏙 Мегаполис с квартирами начнёт строиться на 10 000 подписчиков',
  '✈️ Аэропорт откроется на 15 000 — добавятся новые города',
  '🌉 Через реку построили мосты, город разбит на районы',
  '🏡 В городе уже 6137 жителей — найди свой дом по нику',
  '🕌 Мечеть и ⛪ православный храм переехали в свои кварталы — с подъездом и парковкой',
  '🌋 Вулкан на горизонте не спит…',
];

// ---------------- city layout ----------------
const LOT = 6.4, NCX = 4, NCZ = 2, SW = 1.8, ROAD = 7;
const BW = NCX * LOT, BD = NCZ * LOT;
const PX = BW + 2 * SW + ROAD, PZ = BD + 2 * SW + ROAD;
const NB = 15;
const isPlaza = (bx, bz) => Math.abs(bx) <= 1 && Math.abs(bz) <= 1;
const RIVER_BZ = 7; const isRiver = (bz) => bz === RIVER_BZ;
const isCom = (bx, bz) => bx >= 2 && bx <= 4 && Math.abs(bz) <= 1;
const isMosqB = (bx, bz) => bx >= -4 && bx <= -2 && Math.abs(bz) <= 1;
const isChurB = (bx, bz) => Math.abs(bx) <= 1 && bz >= 2 && bz <= 4;
const isSkip = (bx, bz) => isPlaza(bx, bz) || isRiver(bz) || isCom(bx, bz) || isMosqB(bx, bz) || isChurB(bx, bz);
const CX = (NB + 0.5) * PX, CZ = (NB + 0.5) * PZ;      // centre lines of outer roads
const PLAZA_W = 3 * PX - ROAD, PLAZA_D = 3 * PZ - ROAD;
const MOSQ = { x: -96, z: 0 }, CHUR = { x: -14, z: 70.2 }, HALL = { x: 0, z: -13 }, SECRET = { x: 0, z: -CZ - 58 }, VOLC = { x: -470, z: -700 };
const TREE = { x: 35, z: 0 };
const RZ = RIVER_BZ * PZ, RW = BD + 2 * SW;                       // river centre z / width
const COM = { x0: 2 * PX - BW / 2 - SW, x1: 4 * PX + BW / 2 + SW, z0: -PZ - BD / 2 - SW, z1: PZ + BD / 2 + SW };
const MOSQ_SB = { x0: -4 * PX - BW / 2 - SW, x1: -2 * PX + BW / 2 + SW, z0: -PZ - BD / 2 - SW, z1: PZ + BD / 2 + SW };
const CHUR_SB = { x0: -PX - BW / 2 - SW, x1: PX + BW / 2 + SW, z0: 2 * PZ - BD / 2 - SW, z1: 4 * PZ + BD / 2 + SW };
const MEGA = { x0: -CX - 255, x1: -CX - 28, z0: -250, z1: 135 };
const AIR = { x0: CX + 28, x1: CX + 330, z0: -265, z1: 135 };
const OCEAN_Z = CZ + 44;
const ZONES = [];   // tappable areas: {x0,x1,z0,z1,fn}
const SHOPS = [];

let renderer, scene, camera, game = null, lastFound = null;
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
const inR = (R, x, z) => x > R.x0 - 2 && x < R.x1 + 2 && z > R.z0 - 2 && z < R.z1 + 2;
const inCom = (x, z) => inR(COM, x, z) || inR(MOSQ_SB, x, z) || inR(CHUR_SB, x, z);
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
    if (isSkip(bx, bz)) continue;
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
    if (rnd() < 0.55) { const s = rnd() < 0.5 ? -1 : 1; const x = bx * PX + (rnd() - 0.5) * (BW - 6), z = (j + 0.5) * PZ + s * 2.3; if (!(Math.abs(x) < PLAZA_W / 2 + 3 && Math.abs(z) < PLAZA_D / 2 + 3) && !inCom(x, z)) cars.push([x, 0, z, Math.PI / 2 + (s > 0 ? 0 : Math.PI)]); }
  }
  for (let i = -NB - 1; i <= NB; i++) for (let bz = -NB; bz <= NB; bz++) {
    if (!isRiver(bz) && rnd() < 0.4) { const s = rnd() < 0.5 ? -1 : 1; const x = (i + 0.5) * PX + s * 2.3, z = bz * PZ + (rnd() - 0.5) * (BD - 5); if (!(Math.abs(x) < PLAZA_W / 2 + 3 && Math.abs(z) < PLAZA_D / 2 + 3) && !inCom(x, z)) cars.push([x, 0, z, s > 0 ? 0 : Math.PI]); }
  }
  const carCol = cars.map(() => new THREE.Color(CAR_C[Math.floor(rnd() * CAR_C.length)]));
  inst(new THREE.BoxGeometry(1.7, 0.75, 3.6).translate(0, 0.55, 0), WHITE(), cars, (i) => carCol[i]);
  inst(new THREE.BoxGeometry(1.45, 0.6, 1.9).translate(0, 1.2, -0.15), M('#2b3445'), cars);

  buildPlaza();
  buildDistricts();
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
    for (let i = 0; i < 26; i++) { const x = s * (PLAZA_W / 2 - 5 - rnd() * 22), z = (rnd() - 0.5) * (PLAZA_D - 10); if (Math.abs(z) < 2.2 || Math.hypot(x - MOSQ.x, z - MOSQ.z) < 13 || Math.hypot(x - TREE.x, z - TREE.z) < 15) continue; addTree(x, z, 1 + rnd() * 0.4); }
    const path = new THREE.Mesh(new THREE.PlaneGeometry(26, 3).rotateX(-Math.PI / 2), M('#e3d6bd')); path.position.set(s * (PLAZA_W / 2 - 16), 0.28, 0); g.add(path);
    if (s < 0) for (let k = 0; k < 3; k++) { box(g, 2.2, 0.5, 0.6, '#a0663d', s * (PLAZA_W / 2 - 8 - k * 7), 0.26, 2.4); }
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
  POIS.push({ key: 'hall', x: HALL.x, y: 30, z: HALL.z, html: '🏛 МЭРИЯ<i>🗳 идут выборы мэра</i>' });
  buildXmasTree(g);

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
  inst(new THREE.IcosahedronGeometry(1, 0), WHITE(), flowers, () => FC[Math.floor(rnd() * FC.length)]);
  scene.userData.plaza = g;
}

function buildOutskirts() {
  // forest ring
  for (let i = 0; i < 2600; i++) {
    const x = (rnd() - 0.5) * 2 * (CX + 360), z = (rnd() - 0.5) * 2 * (CZ + 170);
    if (Math.abs(x) < CX + 8 && Math.abs(z) < CZ + 8) continue;
    if (Math.abs(x - SECRET.x) < 70 && Math.abs(z - SECRET.z) < 46) continue;
    if (z > CZ - 20) continue;                                                     // ocean side
    if (x < MEGA.x1 + 10 && x > MEGA.x0 - 10 && z > MEGA.z0 - 10 && z < RZ + 30) continue;
    if (x > AIR.x0 - 10 && x < AIR.x1 + 10 && z > AIR.z0 - 10 && z < RZ + 30) continue;
    if (Math.abs(z - RZ) < RW / 2 + 3) continue;
    addTree(x, z, 1.4 + rnd() * 0.9);
  }
  // hills
  const hills = []; const HC = ['#86b865', '#7aac5c', '#93c06e'].map(c => new THREE.Color(c));
  for (let i = 0; i < 26; i++) { const a = Math.PI + i / 26 * Math.PI + rnd() * 0.1, r = 900 + rnd() * 200; hills.push([Math.cos(a) * r * 1.2, -2, Math.sin(a) * r, rnd() * 6, 1, 60 + rnd() * 70, 25 + rnd() * 45, 60 + rnd() * 70]); }
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
  POIS.push({ key: 'secret', x: SECRET.x, y: 34, z: SECRET.z, html: '🔒 СЕКРЕТНАЯ ЛОКАЦИЯ<i>скоро откроем</i>' });
}

// ---------------- signs ----------------
const FU = (n) => `900 ${n}px Unbounded, Arial Black, sans-serif`, FM = (n) => `800 ${n}px Manrope, Arial, sans-serif`;
function signTex(lines, o = {}) {
  const w = o.w || 512, h = o.h || 128;
  return canvasTex(w, h, (x) => {
    x.fillStyle = o.bg || '#16223a'; x.beginPath(); x.roundRect(0, 0, w, h, o.r ?? 18); x.fill();
    if (o.stripes) { x.save(); x.beginPath(); x.roundRect(0, 0, w, h, o.r ?? 18); x.clip(); x.fillStyle = o.stripes; for (let i = -h; i < w; i += 60) { x.beginPath(); x.moveTo(i, h); x.lineTo(i + 30, h); x.lineTo(i + 30 + h, 0); x.lineTo(i + h, 0); x.fill(); } x.restore(); x.fillStyle = o.bg2 || '#16223a'; x.fillRect(w * 0.06, h * 0.16, w * 0.88, h * 0.68); }
    if (o.border) { x.strokeStyle = o.border; x.lineWidth = o.bw || 8; x.beginPath(); x.roundRect(5, 5, w - 10, h - 10, o.r ?? 16); x.stroke(); }
    x.textAlign = 'center'; x.textBaseline = 'middle';
    const tot = lines.reduce((a, l) => a + l[1] * 1.2, 0); let y = h / 2 - tot / 2;
    for (const [t, sz, c, fam] of lines) {
      const F = fam === 'M' ? FM : FU; let size = sz; x.font = F(size); const mw = x.measureText(t).width;
      if (mw > w * 0.88) { size = Math.floor(size * w * 0.88 / mw); x.font = F(size); }
      x.fillStyle = c; y += sz * 0.6; x.fillText(t, w / 2, y + 3); y += sz * 0.6;
    }
  });
}
function plate(g, tex, w, h, x, y, z, ry = 0, two = false) {
  const mat = new THREE.MeshBasicMaterial({ map: tex });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; g.add(m);
  if (two) { const b = m.clone(); b.rotation.y = ry + Math.PI; b.position.set(x - Math.sin(ry) * 0.12, y, z - Math.cos(ry) * 0.12); g.add(b); }
  return m;
}
function billboard(g, tex, w, h, x, z, ry, leg = 4) {
  const bg = new THREE.Group(); bg.position.set(x, 0.05, z); bg.rotation.y = ry; g.add(bg);
  for (const s of [-1, 1]) box(bg, 0.5, leg + h, 0.5, '#2f3645', s * w * 0.32, 0, -0.2);
  box(bg, w + 0.6, h + 0.6, 0.25, '#2f3645', 0, leg - 0.3, -0.1);
  plate(bg, tex, w, h, 0, leg + h / 2, 0.04); plate(bg, tex, w, h, 0, leg + h / 2, -0.24, Math.PI);
  return bg;
}
const GLASS = () => M('#9fdcf6', { emissive: '#3a9cc8', emissiveIntensity: 0.35 });

// ---------------- giant xmas tree ----------------
function buildXmasTree(g) {
  const t = new THREE.Group(); t.position.set(TREE.x, 0.26, TREE.z); g.add(t);
  const pad = new THREE.Mesh(new THREE.CircleGeometry(12.5, 40).rotateX(-Math.PI / 2), M('#e8dfcc')); pad.position.y = 0.03; t.add(pad);
  cyl(t, 3.4, 3.8, 1.2, '#c9b28f', 0, 0, 0, 24);
  cyl(t, 1.3, 1.7, 7, '#6b4a2e', 0, 1, 0, 10);
  for (let i = 0; i < 7; i++) { const r = 10.8 - i * 1.4, hh = 9.5 - i * 0.65, y = 4.6 + i * 5.3; cone(t, r, hh, i % 2 ? '#1f7a3e' : '#25904c', 0, y, 0, 14).rotation.y = i * 0.4; }
  const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 1.1 : 2.6; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const star = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.7, bevelEnabled: false }).translate(0, 0, -0.35), M('#ffc23d', { emissive: '#ffb000', emissiveIntensity: 0.9 })); star.position.set(0, 44.3, 0); t.add(star);
  for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; box(t, 0.25, 1.3, 0.25, '#c9a23f', Math.cos(a) * 11.6, 0, Math.sin(a) * 11.6); }
  const rope = new THREE.Mesh(new THREE.TorusGeometry(11.6, 0.09, 4, 56).rotateX(Math.PI / 2), M('#ff5a3c')); rope.position.y = 1.05; t.add(rope);
  plate(t, signTex([['ГЛАВНАЯ ЁЛКА', 64, '#ffc23d'], ['игрушки — скоро', 40, '#ffffff', 'M']], { bg: '#16223a', h: 180 }), 6, 2.1, 0, 2.9, 3.9);
  POIS.push({ key: 'tree', x: TREE.x, y: 49, z: TREE.z, html: '🎄 ГЛАВНАЯ ЁЛКА<i>скоро повесим игрушки</i>' });
  ZONES.push({ key: 'tree', x: TREE.x, y: 20, z: TREE.z, r: 13, fn: treeCard });
}

// ---------------- districts ----------------
function buildDistricts() {
  const g = new THREE.Group(); scene.add(g); scene.userData.districts = g;
  buildRiver(g); buildCommerce(g); buildGrandMosque(g); buildCathedral(g); buildOcean(g); buildMegapolis(g); buildAirport(g);
}

function buildRiver(g) {
  const wm = M('#3aa6dc', { emissive: '#1d6f9a', emissiveIntensity: 0.25 });
  const xa = MEGA.x0 - 8, xb = AIR.x1 + 8, L = xb - xa;
  const w = new THREE.Mesh(new THREE.PlaneGeometry(L, RW).rotateX(-Math.PI / 2), wm); w.position.set((xa + xb) / 2, 0.06, RZ); g.add(w);
  for (const s of [-1, 1]) box(g, L, 0.5, 0.7, '#cfc6b2', (xa + xb) / 2, 0, RZ + s * (RW / 2 + 0.35));
  // the river flows into the ocean on both sides of the city
  for (const x of [xa + RW / 2, xb - RW / 2]) { const len = OCEAN_Z + 6 - RZ; const s2 = new THREE.Mesh(new THREE.PlaneGeometry(RW, len).rotateX(-Math.PI / 2), wm); s2.position.set(x, 0.06, RZ + len / 2); g.add(s2); }
  // bridges on every street crossing
  for (let i = -NB - 1; i <= NB; i++) {
    const x = (i + 0.5) * PX, len = RW + 2.6;
    box(g, ROAD + 1.4, 0.5, len, '#5d6372', x, 0.28, RZ);
    for (let k = 0; k < 3; k++) box(g, 0.22, 0.02, 2.2, '#f4f1e6', x, 0.78, RZ - 5 + k * 5);
    for (const s of [-1, 1]) {
      box(g, 0.55, 0.35, len, '#e6dfd1', x + s * (ROAD / 2 + 0.45), 0.78, RZ);
      box(g, 0.12, 0.12, len, '#2f3645', x + s * (ROAD / 2 + 0.55), 1.85, RZ);
      for (let k = 0; k <= 4; k++) box(g, 0.12, 0.9, 0.12, '#2f3645', x + s * (ROAD / 2 + 0.55), 1.05, RZ - len / 2 + k * len / 4);
    }
    box(g, ROAD - 1, 1.2, 1.4, '#b9b2a2', x, -0.9, RZ);
  }
  // boats
  for (let i = 0; i < 9; i++) {
    const x = -CX + 40 + i * (2 * CX / 9) + rnd() * 20; if (Math.abs(((x / PX) % 1 + 1) % 1 - 0.5) < 0.18) continue;
    const b = new THREE.Group(); b.position.set(x, 0.1, RZ + (rnd() - 0.5) * 6); b.rotation.y = Math.PI / 2; g.add(b);
    box(b, 2.2, 0.8, 5.5, i % 2 ? '#ffffff' : '#ff5a3c'); box(b, 1.6, 0.9, 2, '#f4f1e6', 0, 0.8, -0.6);
  }
}

const BIZ = [['nikmalsev', 'БАР', 'Бар', '#7a3b2e'], ['zhylkaidar_zarina', 'AMBI', 'Косметический магазин', '#e84a7f'], ['mirbekov504', 'СУУУПЕР БАНК', 'Банк', '#19b38a'], ['baha_meko', 'СТАРТ', 'Шиномонтаж', '#2d3142'],
  ['ahtem102', 'ДРУЖБА', 'Стадион', '#2f80ed'], ['artyom_vitalievichc', 'ПЕКАРНЯ', 'Пекарня', '#d98a3a'], ['mustafo100k1', 'СПОРТ', 'Спорт магазин', '#ff5a3c'], ['_kobirjonov_o15', 'GLOBALL COFFE', 'Кофейня', '#6b4a2e'],
  ['nurik0_213', 'НУРСАЛОН', 'Автосалон', '#16223a'], ['eden_visipski', 'ВЕЛОМАГАЗИН', 'Велосипедный магазин', '#9b51e0'], ['arnurshaimerden', 'БИМАГ', 'Магазин', '#f2994a'], ['the.myrza_', 'СТОМАТОЛОГИЯ', 'Стоматология', '#2fa58f']];

function buildCommerce(g) {
  const W = COM.x1 - COM.x0, D = COM.z1 - COM.z0, cx = (COM.x0 + COM.x1) / 2, cz = (COM.z0 + COM.z1) / 2;
  box(g, W, 0.25, D, '#e6dfd1', cx, 0, cz);
  const tile = canvasTex(128, 128, (x) => { x.fillStyle = '#e4e7ec'; x.fillRect(0, 0, 128, 128); x.fillStyle = '#d3d8e0'; x.fillRect(0, 0, 64, 64); x.fillRect(64, 64, 64, 64); }, [W / 5, D / 5]);
  const pav = new THREE.Mesh(new THREE.PlaneGeometry(W - 2, D - 2).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: tile })); pav.position.set(cx, 0.26, cz); g.add(pav);
  // two malls
  const mall = (x, z, w, d, h, name, sub, col, key) => {
    const m = new THREE.Group(); m.position.set(x, 0.26, z); g.add(m);
    box(m, w, h, d, '#eef1f5'); box(m, w + 0.1, h * 0.42, d + 0.1, null, 0, h * 0.18, 0, GLASS());
    box(m, w + 0.8, 0.8, d + 0.8, col, 0, h, 0); box(m, 9, 4.2, 3, '#ffffff', 0, 0, d / 2 + 1.4); box(m, 8, 3, 0.1, null, 0, 0, d / 2 + 2.95, GLASS());
    box(m, 10, 0.4, 4, col, 0, 4.2, d / 2 + 1.6);
    for (let i = 0; i < 4; i++) box(m, 3, 1.4, 3, '#b9bec8', -w / 3 + i * w / 4.5, h + 0.8, -d / 4 + (i % 2) * 3);
    plate(m, signTex([[name, 76, '#ffffff'], [sub, 34, '#ffc23d', 'M']], { bg: col, w: 768, h: 170 }), w * 0.62, w * 0.62 * 170 / 768, 0, h - 1.9, d / 2 + 0.08);
    POIS.push({ key, x, y: h + 9, z, html: `🛍 ${name}<i>${sub}</i>` });
    ZONES.push({ key, x, y: h / 2, z, r: Math.max(w, d) / 2, fn: () => mallCard(name) });
  };
  mall(79, -21, 40, 17, 12, 'ДОМИНО МОЛЛ', 'торговый центр', '#ff5a3c', 'mall1');
  mall(122, -21, 34, 17, 9, 'ТЦ ПОДПИСЧИК', 'торговый центр', '#2f80ed', 'mall2');
  // parking
  const CC = ['#ffc23d', '#2f80ed', '#ffffff', '#19b38a', '#e84a7f', '#2d3142'];
  for (let i = 0; i < 12; i++) { const x = 143.5 + (i % 3) * 5.5, z = -28 + Math.floor(i / 3) * 4.6; box(g, 3.6, 0.75, 1.7, CC[i % CC.length], x, 0.36, z); box(g, 1.9, 0.6, 1.45, '#2b3445', x - 0.15, 1.1, z); }
  // market stalls
  const stripe = (c) => new THREE.MeshLambertMaterial({ map: canvasTex(64, 16, (x) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#ffffff' : c; x.fillRect(i * 8, 0, 8, 16); } }) });
  const AW = ['#ff5a3c', '#2f80ed', '#19b38a', '#ffc23d', '#9b51e0'].map(stripe);
  const FRUIT = ['#ff5a3c', '#ffc23d', '#6cbf4f', '#f2994a', '#e84a7f', '#9b51e0'];
  for (const face of [-1, 1]) for (let k = 0; k < 21; k++) {
    const x = 62 + k * 4.6, z = face * 4.4, s = new THREE.Group(); s.position.set(x, 0.26, z); s.rotation.y = face > 0 ? Math.PI : 0; g.add(s);
    box(s, 3.6, 1.0, 1.3, '#a0663d', 0, 0, 0.7);
    for (const [px, pz] of [[-1.7, 1.3], [1.7, 1.3], [-1.7, -0.9], [1.7, -0.9]]) box(s, 0.1, 2.7, 0.1, '#5a3d2b', px, 0, pz);
    const aw = new THREE.Mesh(new THREE.BoxGeometry(4, 0.12, 2.8), AW[(k + (face > 0 ? 2 : 0)) % AW.length]); aw.position.set(0, 2.8, 0.25); aw.rotation.x = 0.2; s.add(aw);
    for (let f = 0; f < 3; f++) box(s, 0.9, 0.35, 0.8, FRUIT[(k * 3 + f) % FRUIT.length], -1.1 + f * 1.1, 1.0, 0.75);
  }
  billboard(g, signTex([['РЫНОК', 84, '#ffc23d']], { bg: '#16223a', w: 512, h: 150 }), 9, 2.6, 61, 0, -Math.PI / 2, 3.2);
  POIS.push({ key: 'market', x: 108, y: 10, z: 0, html: '🛒 РЫНОК<i>свежие фрукты и овощи</i>' });
  ZONES.push({ key: 'market', x: 108, y: 2, z: 0, r: 20, fn: marketCard });
  // business street: 26 shops, 12 named, the rest for rent / under construction
  const kinds = []; let bi = 0;
  for (let i = 0; i < 26; i++) kinds.push(i % 2 === 0 && bi < BIZ.length ? ['biz', BIZ[bi++]] : (i % 5 === 3 ? ['build'] : ['rent']));
  while (bi < BIZ.length) { const j = kinds.findIndex(k => k[0] !== 'biz'); kinds[j] = ['biz', BIZ[bi++]]; }
  kinds.forEach(([kind, b], i) => {
    const row = i < 13 ? 1 : 0, k = i % 13, face = row === 0 ? -1 : 1;
    const x = COM.x0 + 7.2 + k * 7.3, z = row === 0 ? 14.8 : 27.6;
    shop(g, x, z, face, kind, b);
    SHOPS.push({ x, z, kind, nick: b && b[0], name: b && b[1], cat: b && b[2] });
  });
  for (let k = 0; k < 13; k++) { const x = COM.x0 + 7.2 + k * 7.3 + 3.65; if (k % 2) addTree(x, 21.2, 0.8); else lamps.push([x, 0.25, 21.2, 0]); }
  POIS.push({ key: 'bizrow', x: 108, y: 13, z: 21, html: '🏪 БИЗНЕС-УЛИЦА<i>есть места под АРЕНДУ</i>' });
}
function shop(g, x, z, face, kind, b) {
  const s = new THREE.Group(); s.position.set(x, 0.26, z); s.rotation.y = face > 0 ? 0 : Math.PI; g.add(s);
  if (kind === 'biz') {
    const col = b[3];
    box(s, 6.4, 4.4, 5, '#f6eedd'); box(s, 6.5, 0.5, 5.1, col, 0, 4.4, 0);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.2), GLASS()); gl.position.set(-0.7, 1.5, 2.52); s.add(gl);
    const dr = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.3), M('#4a2f22')); dr.position.set(2.2, 1.15, 2.52); s.add(dr);
    const aw = box(s, 6.6, 0.12, 1.5, col, 0, 2.95, 3.1); aw.rotation.x = 0.25;
    plate(s, signTex([[b[1], 70, '#ffffff'], [b[2], 30, '#ffc23d', 'M']], { bg: col, w: 512, h: 150, border: 'rgba(255,255,255,.5)', bw: 5 }), 6.0, 1.75, 0, 3.75, 2.56);
  } else if (kind === 'rent') {
    box(s, 6.4, 4.4, 5, '#d9d4ca'); box(s, 6.5, 0.4, 5.1, '#b8b2a6', 0, 4.4, 0);
    const pw = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 2.6), M('#efe8d8')); pw.position.set(0, 1.6, 2.52); s.add(pw);
    plate(s, signTex([['АРЕНДА', 82, '#e5383b'], ['место под бизнес', 30, '#16223a', 'M']], { bg: '#ffffff', w: 512, h: 180, border: '#e5383b', bw: 9 }), 3.8, 1.34, 0, 1.75, 2.55);
    plate(s, signTex([['СВОБОДНО', 60, '#ffffff']], { bg: '#56607a', w: 512, h: 110 }), 5.2, 1.1, 0, 3.75, 2.55);
  } else {
    box(s, 6.4, 2.4, 5, '#b9b4aa');
    for (const [px, pz] of [[-3, -2.3], [3, -2.3], [-3, 2.3], [3, 2.3], [0, 2.3], [0, -2.3]]) box(s, 0.12, 1.8, 0.12, '#7a5a3a', px, 2.4, pz);
    for (let i = 0; i < 4; i++) box(s, 0.1, 5, 0.1, '#c0c6cf', -3.1 + i * 2.07, 0, 3.0);
    for (let j = 1; j <= 3; j++) { box(s, 6.4, 0.1, 0.1, '#c0c6cf', 0, j * 1.5, 3.0); box(s, 6.4, 0.08, 0.7, '#a0663d', 0, j * 1.5 - 0.06, 2.7); }
    plate(s, signTex([['СТРОИТСЯ', 64, '#16223a']], { bg: '#ffc23d', w: 512, h: 120, stripes: '#16223a', bg2: '#ffc23d' }), 5.0, 1.2, 0, 3.6, 3.08);
    cone(s, 0.3, 0.8, '#ff7a2a', 2.6, 0, 4.2, 8); cone(s, 0.3, 0.8, '#ff7a2a', -2.4, 0, 4.4, 8);
  }
}

function buildOcean(g) {
  const xa = MEGA.x0 - 300, xb = AIR.x1 + 300;
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(xb - xa, OCEAN_Z + 10 - CZ - 3.5).rotateX(-Math.PI / 2), M('#f1dca6')); sand.position.set((xa + xb) / 2, 0.02, (CZ + 3.5 + OCEAN_Z + 10) / 2); g.add(sand);
  const prom = new THREE.Mesh(new THREE.PlaneGeometry(2 * CX, 6).rotateX(-Math.PI / 2), M('#e3d6bd')); prom.position.set(0, 0.03, CZ + 8); g.add(prom);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(6000, 2400).rotateX(-Math.PI / 2), M('#2b97d4', { emissive: '#14567f', emissiveIntensity: 0.22 })); sea.position.set(0, 0.04, OCEAN_Z + 1200); g.add(sea);
  const shal = new THREE.Mesh(new THREE.PlaneGeometry(6000, 16).rotateX(-Math.PI / 2), M('#5cc3e6', { emissive: '#2a8cb8', emissiveIntensity: 0.2 })); shal.position.set(0, 0.05, OCEAN_Z + 8); g.add(shal);
  const foam = new THREE.Mesh(new THREE.PlaneGeometry(6000, 1.2).rotateX(-Math.PI / 2), M('#ffffff')); foam.position.set(0, 0.06, OCEAN_Z + 0.6); g.add(foam);
  // palms, umbrellas
  const palm = (x, z) => { const p = new THREE.Group(); p.position.set(x, 0.02, z); p.rotation.y = rnd() * 6; g.add(p); const tr = cyl(p, 0.25, 0.4, 7, '#a07850', 0, 0, 0, 6); tr.rotation.z = 0.12; for (let i = 0; i < 6; i++) { const l = box(p, 4.2, 0.12, 1.1, '#3f9e48', Math.cos(i) * 1.9 + 0.8, 6.6, Math.sin(i) * 1.9); l.rotation.set(0, -i, -0.35); } };
  for (let x = -CX; x <= CX; x += 21) { if (Math.abs(x) < 10) continue; palm(x + rnd() * 6, CZ + 13 + rnd() * 3); }
  const UC = ['#ff5a3c', '#ffc23d', '#2f80ed', '#19b38a', '#e84a7f'];
  for (let i = 0; i < 34; i++) { const x = (rnd() - 0.5) * 2 * (CX - 20), z = CZ + 22 + rnd() * 14; if (Math.abs(x) < 14) continue; cyl(g, 0.06, 0.06, 2.6, '#ffffff', x, 0, z, 5); cone(g, 1.8, 0.8, UC[i % 5], x, 2.3, z, 8); box(g, 0.9, 0.25, 2.2, '#ffffff', x + 1.3, 0.1, z + 0.4); }
  // pier — under construction
  const P = new THREE.Group(); P.position.set(0, 0, 0); g.add(P);
  const z0 = OCEAN_Z - 14, zb = OCEAN_Z + 55, ze = OCEAN_Z + 130;
  box(P, 10, 0.45, zb - z0, '#b07d4f', 0, 1.0, (z0 + zb) / 2);
  for (let z = z0 + 6; z <= zb; z += 6) for (const s of [-1, 1]) { cyl(P, 0.32, 0.32, 1.4, '#7a5638', s * 4.4, -0.2, z, 6); box(P, 0.12, 1.1, 0.12, '#ffffff', s * 4.9, 1.45, z); }
  for (const s of [-1, 1]) box(P, 0.12, 0.12, zb - z0, '#ffffff', s * 4.9, 2.5, (z0 + zb) / 2);
  for (let z = zb + 6; z <= ze; z += 6) for (const s of [-1, 1]) cyl(P, 0.32, 0.32, 2.4, '#8a6a4a', s * 4.4, -0.2, z, 6);
  for (let z = zb; z <= zb + 30; z += 12) box(P, 10, 0.3, 0.6, '#9a7350', 0, 1.6, z);
  for (let i = 0; i < 6; i++) box(P, 1.6, 1.0, 0.25, i % 2 ? '#ffffff' : '#e5383b', -4 + i * 1.6, 1.45, zb + 0.4);
  plate(P, signTex([['ПИРС ЗАКРЫТ', 60, '#16223a'], ['откроется на 10 000', 40, '#16223a', 'M']], { bg: '#ffc23d', w: 512, h: 170, border: '#16223a' }), 5.2, 1.7, 0, 3.6, zb + 0.3, Math.PI, true);
  // crane barge
  const B = new THREE.Group(); B.position.set(12, 0, OCEAN_Z + 92); g.add(B);
  box(B, 12, 1.4, 18, '#56607a', 0, -0.4, 0); box(B, 1.2, 16, 1.2, '#ffc23d', -3, 1, -4); const jib = box(B, 1, 1, 22, '#ffc23d', -3, 16.5, 4); jib.rotation.x = -0.25; box(B, 3, 2.4, 3, '#ffffff', -3, 1, -6.5);
  // beach billboard
  billboard(g, signTex([['🌊 ПИРС', 70, '#ffffff'], ['откроется на 10 000 подписчиков', 34, '#ffc23d', 'M']], { bg: '#2f80ed', w: 768, h: 210 }), 14, 3.8, 0, CZ + 18, Math.PI, 3.5);
  // lighthouse
  const LH = new THREE.Group(); LH.position.set(-190, 0, OCEAN_Z + 70); g.add(LH);
  cyl(LH, 9, 11, 2, '#9c9586', 0, -0.5, 0, 12); for (let i = 0; i < 5; i++) cyl(LH, 2.6 - i * 0.2, 2.8 - i * 0.2, 4, i % 2 ? '#ffffff' : '#e5383b', 0, 1.5 + i * 4, 0, 14);
  cyl(LH, 1.6, 1.6, 2.2, null, 0, 21.5, 0, 12, M('#fff2c2', { emissive: '#ffd77a', emissiveIntensity: 1 })); cone(LH, 2.4, 2.2, '#16223a', 0, 23.7, 0, 12);
  for (let i = 0; i < 4; i++) { const y = new THREE.Group(); y.position.set(-300 + i * 190 + rnd() * 40, 0.05, OCEAN_Z + 60 + rnd() * 120); y.rotation.y = rnd() * 6; g.add(y); box(y, 3, 1.2, 9, '#ffffff'); box(y, 2.2, 1.1, 3.4, '#2f80ed', 0, 1.2, -0.5); cyl(y, 0.08, 0.08, 9, '#ffffff', 0, 1.2, 1.2, 5); }
  POIS.push({ key: 'pier', x: 0, y: 16, z: OCEAN_Z + 40, html: '🌊 ОКЕАН И ПИРС<i>пирс откроется на 10 000</i>' });
  ZONES.push({ key: 'pier', x: 0, y: 2, z: OCEAN_Z + 45, r: 40, fn: pierCard });
}

function buildMegapolis(g) {
  const { x0, x1, z0, z1 } = MEGA, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, W = x1 - x0, D = z1 - z0;
  const dirt = new THREE.Mesh(new THREE.PlaneGeometry(W, D).rotateX(-Math.PI / 2), M('#c9b38a')); dirt.position.set(cx, 0.03, cz); g.add(dirt);
  const road = (x, z, w, d) => { const r = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), M('#6b7080')); r.position.set(x, 0.045, z); g.add(r); };
  road((x1 + -CX) / 2, 0, -CX - x1 + 4, 10);           // access road from the city
  for (const z of [-185, -115, -45, 25, 95]) road(cx, z + 35, W - 8, 7);
  for (const x of [x0 + 56, x0 + 108, x0 + 160]) road(x, cz, 7, D - 8);
  // fence
  for (const [w, d, x, z] of [[W, 0.3, cx, z0], [W, 0.3, cx, z1], [0.3, D, x0, cz], [0.3, (D / 2 - 8), x1, z0 + (D / 2 - 8) / 2 + (cz - z0 - D / 2)], [0.3, (D / 2 - 8), x1, z1 - (D / 2 - 8) / 2]]) { box(g, w, 2.3, d, '#e9eef3', x, 0, z); box(g, w + 0.05, 0.5, d + 0.05, '#2f80ed', x, 1.2, z); }
  // planned towers (hologram) + foundations
  const ghostTex = canvasTex(64, 64, (x) => { x.clearRect(0, 0, 64, 64); x.fillStyle = 'rgba(127,211,255,.35)'; x.fillRect(0, 0, 64, 64); x.fillStyle = 'rgba(255,255,255,.75)'; x.fillRect(10, 14, 18, 26); x.fillRect(36, 14, 18, 26); x.fillStyle = 'rgba(63,182,255,.9)'; x.fillRect(0, 0, 64, 3); });
  const edgeM = new THREE.LineBasicMaterial({ color: '#3fb6ff', transparent: true, opacity: 0.8 });
  let n = 0;
  for (let c = 0; c < 4; c++) for (let r = 0; r < 5; r++) {
    const x = x0 + 30 + c * 52, z = z0 + 33 + r * 70, centr = 1 - Math.hypot(c - 1.5, r - 2) / 3;
    const h = 36 + centr * 70 + rnd() * 26, w = 18 + (n++ % 3) * 2;
    box(g, w + 4, 0.6, w + 4, '#a9a59c', x, 0.03, z);
    for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(g, 0.25, 2.4, 0.25, '#7a5a3a', x + px * w / 2, 0.6, z + pz * w / 2);
    const t = ghostTex.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 4, h / 3.6);
    const gm = new THREE.Mesh(new THREE.BoxGeometry(w, h, w).translate(0, h / 2, 0), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide }));
    gm.position.set(x, 0.6, z); scene.add(gm);
    const ed = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, w).translate(0, h / 2, 0)), edgeM); ed.position.copy(gm.position); scene.add(ed);
  }
  // cranes
  for (const [x, z, a] of [[x0 + 82, -60, 0.6], [x0 + 150, 60, 2.4], [x0 + 40, -170, 1.4]]) {
    const cr = new THREE.Group(); cr.position.set(x, 0, z); g.add(cr);
    box(cr, 5, 1, 5, '#a9a59c'); box(cr, 1.8, 70, 1.8, '#ffc23d', 0, 1, 0);
    const top = new THREE.Group(); top.position.y = 71; top.rotation.y = a; cr.add(top);
    box(top, 1.4, 1.4, 46, '#ffc23d', 0, 0, 14); box(top, 1.4, 1.4, 14, '#ffc23d', 0, 0, -10); box(top, 3, 3, 4, '#3a3f4b', 0, -0.2, -14); box(top, 2.4, 2.4, 2.4, '#ffffff', 0, -2.4, 1.6);
    box(top, 0.1, 30, 0.1, '#2f3645', 0, -30, 30); box(top, 1.6, 0.6, 1.6, '#2f3645', 0, -30.6, 30);
  }
  billboard(g, signTex([['МЕГАПОЛИС', 92, '#ffffff'], ['высотки с квартирами для подписчиков', 34, '#7fd3ff', 'M'], ['стройка начнётся на 10 000 подписчиков', 38, '#ffc23d', 'M']], { bg: '#16223a', w: 1024, h: 320 }), 34, 10.6, x1 - 8, -36, Math.PI / 2, 5);
  POIS.push({ key: 'mega', x: cx, y: 125, z: cz, html: '🏙 МЕГАПОЛИС<i>стройка начнётся на 10 000</i>' });
  ZONES.push({ key: 'mega', x: cx, y: 30, z: cz, r: 110, fn: megaCard });
}

function airliner(g, x, z, ry, col = '#ff5a3c') {
  const p = new THREE.Group(); p.position.set(x, 0, z); p.rotation.y = ry; g.add(p);
  const f = cyl(p, 2, 2, 28, '#ffffff', 0, 0, 0, 14); f.rotation.x = Math.PI / 2; f.position.set(0, 3.4, 0);
  const n = sph(p, 2, '#ffffff', 0, 3.4, 14, undefined, 14, 10); n.scale.z = 1.6;
  const tl = cone(p, 2, 6, '#ffffff', 0, 0, 0, 14); tl.rotation.x = -Math.PI / 2; tl.position.set(0, 3.6, -17);
  box(p, 4.05, 0.7, 26, col, 0, 3.0, -1);
  const wg = box(p, 30, 0.4, 5.5, '#e6e9ee', 0, 2.6, 0); wg.rotation.y = 0;
  box(p, 11, 0.3, 3, '#e6e9ee', 0, 4.4, -17.5); box(p, 0.4, 6, 4.5, col, 0, 4.6, -17.6);
  for (const s of [-1, 1]) { const e = cyl(p, 0.9, 0.9, 3.6, '#c9ced6', s * 6.5, 0, 0, 10); e.rotation.x = Math.PI / 2; e.position.set(s * 6.5, 1.9, 1.2); }
  for (const zz of [9, -2]) for (const s of [-1, 1]) box(p, 0.25, 1.4, 0.25, '#555b66', s * (zz > 0 ? 0 : 2.5), 0, zz);
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 20), M('#2b3445')); ws.rotation.set(0, Math.PI / 2, Math.PI / 2); ws.position.set(2.02, 4.1, 0); p.add(ws);
  return p;
}
function buildAirport(g) {
  const { x0, x1, z0, z1 } = AIR;
  const fl = (x, z, w, d, c, y = 0.04) => { const r = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), M(c)); r.position.set(x, y, z); g.add(r); return r; };
  fl(x0 + 75, -60, 120, 330, '#c7cbd2');                       // apron
  const rx = x0 + 240; fl(rx, (z0 + z1) / 2, 30, z1 - z0 - 10, '#4a4f5c', 0.045);
  for (let z = z0 + 30; z < z1 - 25; z += 18) fl(rx, z, 0.8, 9, '#ffffff', 0.05);
  for (const zz of [z0 + 12, z1 - 12]) for (let i = 0; i < 8; i++) fl(rx - 12 + i * 3.4, zz, 1.4, 12, '#ffffff', 0.05);
  for (const s of [-1, 1]) fl(rx + s * 14, (z0 + z1) / 2, 0.5, z1 - z0 - 16, '#ffffff', 0.05);
  fl(x0 + 175, -60, 12, 330, '#5d6372', 0.045);
  for (const z of [-200, -60, 80]) fl(x0 + 175 + 32, z, 64, 12, '#5d6372', 0.044);
  fl((CX + 3.5 + x0 + 18) / 2, 0, x0 + 18 - CX - 3.5, 10, '#5d6372', 0.045);          // road from the city
  // terminal
  const T = new THREE.Group(); T.position.set(x0 + 26, 0, -10); g.add(T);
  box(T, 22, 10, 120, '#eef1f5'); box(T, 22.1, 5, 120.1, null, 0, 3, 0, GLASS()); box(T, 26, 1.2, 124, '#2f80ed', 0, 10, 0);
  plate(T, signTex([['АЭРОПОРТ ДОМИНО', 70, '#ffffff']], { bg: '#2f80ed', w: 1024, h: 120 }), 40, 4.7, -11.1, 7.5, 0, -Math.PI / 2);
  for (const z of [-55, -5, 45]) { box(T, 18, 3, 3, '#dfe3ea', 20, 4, z); }
  const tw = new THREE.Group(); tw.position.set(x0 + 30, 0, 72); g.add(tw);
  cyl(tw, 2.2, 3, 34, '#eef1f5', 0, 0, 0, 12); cyl(tw, 5, 4, 4.5, null, 0, 34, 0, 12, GLASS()); cyl(tw, 5.6, 5.6, 1, '#2f3645', 0, 38.5, 0, 12); cyl(tw, 0.1, 0.1, 5, '#cccccc', 0, 39.5, 0, 5);
  for (const [z, c] of [[-65, '#ff5a3c'], [-15, '#19b38a'], [35, '#9b51e0']]) airliner(g, x0 + 66, z, -Math.PI / 2, c);
  airliner(g, rx, -150, 0, '#2f80ed');
  // closed barrier + billboard
  for (let i = 0; i < 5; i++) box(g, 2, 0.6, 0.6, i % 2 ? '#ffffff' : '#e5383b', CX + 16, 0.9, -4 + i * 2);
  box(g, 0.6, 1.5, 0.6, '#2f3645', CX + 16, 0, -5.4);
  billboard(g, signTex([['✈️ АЭРОПОРТ', 86, '#ffffff'], ['откроется на 15 000 подписчиков', 38, '#ffc23d', 'M'], ['+ добавятся новые города', 38, '#7fd3ff', 'M']], { bg: '#16223a', w: 1024, h: 320 }), 30, 9.4, CX + 22, 22, -Math.PI / 2, 4);
  for (const [w, d, x, z] of [[x1 - x0, 0.25, (x0 + x1) / 2, z0], [x1 - x0, 0.25, (x0 + x1) / 2, z1], [0.25, z1 - z0, x1, (z0 + z1) / 2]]) box(g, w, 1.8, d, '#c0c6cf', x, 0, z);
  POIS.push({ key: 'air', x: x0 + 150, y: 45, z: -40, html: '✈️ АЭРОПОРТ<i>откроется на 15 000</i>' });
  ZONES.push({ key: 'air', x: x0 + 140, y: 6, z: -60, r: 130, fn: airCard });
}

// ---------------- religious quarters: grand mosque + orthodox cathedral ----------------
const GOLD = () => M('#e2aa3c', { emissive: '#a86c10', emissiveIntensity: 0.4 });
function superPad(g, R, c1, c2) {
  const W = R.x1 - R.x0, D = R.z1 - R.z0, cx = (R.x0 + R.x1) / 2, cz = (R.z0 + R.z1) / 2;
  box(g, W, 0.25, D, '#e6dfd1', cx, 0, cz);
  const tile = canvasTex(128, 128, (x) => { x.fillStyle = c1; x.fillRect(0, 0, 128, 128); x.fillStyle = c2; x.fillRect(0, 0, 64, 64); x.fillRect(64, 64, 64, 64); }, [W / 6, D / 6]);
  const pav = new THREE.Mesh(new THREE.PlaneGeometry(W - 2, D - 2).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: tile })); pav.position.set(cx, 0.26, cz); g.add(pav);
}
function parking(g, x0, x1, z0, z1, entry) {
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, W = x1 - x0, D = z1 - z0;
  const a = new THREE.Mesh(new THREE.PlaneGeometry(W, D).rotateX(-Math.PI / 2), M('#5d6372')); a.position.set(cx, 0.28, cz); g.add(a);
  // driveway to the street
  const dw = new THREE.Mesh(new THREE.PlaneGeometry(entry.w, entry.d).rotateX(-Math.PI / 2), M('#5d6372')); dw.position.set(entry.x, 0.285, entry.z); g.add(dw);
  const CC = ['#ffc23d', '#2f80ed', '#ffffff', '#19b38a', '#e84a7f', '#2d3142', '#ff5a3c', '#9b51e0'];
  const rows = Math.floor((D - 4) / 12); const cols = Math.floor((W - 2) / 3);
  let k = 0;
  for (let r = 0; r < rows; r++) for (const side of [-1, 1]) {
    const z = z0 + 6 + r * 12 + side * 3.2;
    for (let c = 0; c < cols; c++) {
      const x = x0 + 2.5 + c * 3;
      const st = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 4.8).rotateX(-Math.PI / 2), M('#f4f1e6')); st.position.set(x - 1.5, 0.29, z); g.add(st);
      if (rnd() < 0.62) { const col = CC[k++ % CC.length]; box(g, 1.7, 0.75, 3.6, col, x, 0.36, z); box(g, 1.45, 0.6, 1.9, '#2b3445', x, 1.1, z - side * 0.15); }
    }
  }
  const p = signTex([['P', 96, '#ffffff']], { bg: '#2f80ed', w: 128, h: 128 });
  for (const [x, z] of [[entry.x - entry.w / 2 - 1.2, entry.z], [entry.x + entry.w / 2 + 1.2, entry.z]]) { box(g, 0.2, 3, 0.2, '#2f3645', x, 0.25, z); plate(g, p, 1.4, 1.4, x, 3.6, z + 0.12, 0, true); }
}
function minaret(g, x, z, h) {
  cyl(g, 1.9, 2.2, 3, '#f7f4ee', x, 0, z, 10);
  cyl(g, 1.2, 1.45, h, '#fbfaf6', x, 3, z, 10);
  for (const f of [0.45, 0.72, 0.9]) { cyl(g, 2.0, 1.4, 0.8, '#f1ece2', x, 3 + h * f, z, 12); }
  cyl(g, 1.0, 1.0, 3, '#fbfaf6', x, 3 + h, z, 10);
  const d = sph(g, 1.25, null, x, 6 + h, z, GOLD(), 10, 8); d.scale.y = 1.3;
  cone(g, 0.3, 2.6, null, x, 7.2 + h, z, 6, GOLD());
}
function buildGrandMosque(g) {
  const R = MOSQ_SB; superPad(g, R, '#eef0ea', '#e0e6dc');
  // gardens with palms
  const lawnM = M('#a8d67e');
  const L = new THREE.Mesh(new THREE.PlaneGeometry(R.x1 - R.x0 - 4, R.z1 - R.z0 - 4).rotateX(-Math.PI / 2), lawnM); L.position.set((R.x0 + R.x1) / 2 + 0, 0.27, (R.z0 + R.z1) / 2); g.add(L);
  const m = new THREE.Group(); m.position.set(MOSQ.x, 0.27, MOSQ.z); g.add(m);
  const W = 60, D = 46;
  box(m, W + 4, 0.7, D + 4, '#f4f1ea');
  // reflecting pools in front + sides
  const pool = M('#2f86c9', { emissive: '#174f7a', emissiveIntensity: 0.3 });
  for (const [w, d, x, z] of [[W - 12, 3.2, 0, D / 2 + 4.2], [3, D - 10, -W / 2 - 4, 0], [3, D - 10, W / 2 + 4, 0]]) { box(m, w + 0.8, 0.5, d + 0.8, '#f4f1ea', x, 0, z); const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), pool); p.position.set(x, 0.52, z); m.add(p); }
  // courtyard floor
  const cf = new THREE.Mesh(new THREE.PlaneGeometry(W - 6, D - 18).rotateX(-Math.PI / 2), M('#ffffff')); cf.position.set(0, 0.72, 6); m.add(cf);
  // arcade walls with little domes
  const arc = (w, d, x, z) => { box(m, w, 5, d, '#fbfaf6', x, 0.7, z); box(m, w + 0.3, 0.6, d + 0.3, '#ece6da', x, 5.7, z); };
  arc(W, 3, 0, D / 2 - 1.5); arc(3, D, -W / 2 + 1.5, 0); arc(3, D, W / 2 - 1.5, 0);
  for (let i = 0; i <= 10; i++) { const x = -W / 2 + 3 + i * (W - 6) / 10; if (Math.abs(x) > 4) sph(m, 1.25, '#ffffff', x, 6.6, D / 2 - 1.5, undefined, 10, 6); }
  for (let i = 0; i <= 7; i++) { const z = -D / 2 + 3 + i * (D - 6) / 7; for (const s of [-1, 1]) sph(m, 1.25, '#ffffff', s * (W / 2 - 1.5), 6.6, z, undefined, 10, 6); }
  const arch = M('#c9d6e3');
  for (let i = 0; i < 12; i++) { const x = -W / 2 + 4 + i * (W - 8) / 11; const a = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 3.2), arch); a.position.set(x, 2.5, D / 2 + 0.02); m.add(a); }
  // gate
  box(m, 9, 9, 4, '#fbfaf6', 0, 0.7, D / 2 - 1.5); const ga = new THREE.Mesh(new THREE.PlaneGeometry(4, 6), M('#8fa6bd')); ga.position.set(0, 3.8, D / 2 + 0.55); m.add(ga);
  sph(m, 2.6, '#ffffff', 0, 10, D / 2 - 1.5, undefined, 12, 8);
  // corner pavilions
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { box(m, 7, 8, 7, '#fbfaf6', sx * (W / 2 - 3.5), 0.7, sz * (D / 2 - 3.5)); const d = sph(m, 2.8, '#ffffff', sx * (W / 2 - 3.5), 9.3, sz * (D / 2 - 3.5), undefined, 12, 8); d.scale.y = 1.15; }
  // prayer hall
  const hz = -D / 2 + 9;
  box(m, W - 6, 11, 16, '#fbfaf6', 0, 0.7, hz);
  for (let i = 0; i < 9; i++) { const a = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 5), arch); a.position.set(-20 + i * 5, 4, hz + 8.02); m.add(a); }
  cyl(m, 7.6, 8, 4, '#fbfaf6', 0, 11.7, hz, 24);
  const big = sph(m, 8.6, '#ffffff', 0, 17, hz, undefined, 24, 14); big.scale.y = 1.2;
  cone(m, 0.45, 3.5, null, 0, 26.8, hz, 6, GOLD());
  const cres = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.22, 6, 14, Math.PI * 1.4), GOLD()); cres.position.set(0, 31, hz); cres.rotation.z = -0.3; m.add(cres);
  for (const s of [-1, 1]) {
    cyl(m, 4.2, 4.4, 2, '#fbfaf6', s * 14, 11.7, hz, 16); const d = sph(m, 4.6, '#ffffff', s * 14, 14.6, hz, undefined, 16, 10); d.scale.y = 1.2; cone(m, 0.3, 2.2, null, s * 14, 19.8, hz, 6, GOLD());
    for (const dx of [7.5, 21]) { const d2 = sph(m, 2.6, '#ffffff', s * dx, 12.6, hz + (dx > 10 ? -4 : 4), undefined, 12, 8); d2.scale.y = 1.2; }
  }
  // 4 minarets
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) minaret(m, sx * (W / 2 + 1.5), sz * (D / 2 + 1.5), 36);
  // palms + lamps around
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const x = MOSQ.x + Math.cos(a) * 44, z = MOSQ.z + Math.sin(a) * 32; if (x < R.x0 + 3 || x > R.x1 - 3 || z < R.z0 + 3 || z > R.z1 - 3 || x < R.x0 + 26) continue; addTree(x, z, 0.9); }
  parking(g, R.x0 + 2, R.x0 + 24, R.z0 + 3, R.z1 - 3, { x: R.x0 + 13, z: R.z1 - 1, w: 8, d: 4 });
  POIS.push({ key: 'mosque', x: MOSQ.x, y: 50, z: MOSQ.z, html: '🕌 МЕЧЕТЬ<i>соборная мечеть города</i>' });
  ZONES.push({ key: 'mosque', x: MOSQ.x, y: 12, z: MOSQ.z, r: 34, fn: mosqueCard });
}
function onion(g, r, h, x, y, z, mat) {
  const pts = [];
  for (let i = 0; i <= 16; i++) { const t = i / 16; const rr = r * (t < 0.55 ? Math.sin((t / 0.55) * Math.PI * 0.62) / Math.sin(Math.PI * 0.62) * (0.85 + 0.15 * t / 0.55) : Math.pow(1 - (t - 0.55) / 0.45, 1.6)); pts.push(new THREE.Vector2(Math.max(0.001, rr), t * h)); }
  pts[0].x = r * 0.82;
  const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 20), mat); m.position.set(x, y, z); g.add(m); return m;
}
function cross(g, x, y, z, s = 1) {
  const G = GOLD(); box(g, 0.35 * s, 5 * s, 0.35 * s, null, x, y, z, G); box(g, 2.4 * s, 0.32 * s, 0.32 * s, null, x, y + 3.5 * s, z, G); box(g, 1.4 * s, 0.28 * s, 0.28 * s, null, x, y + 4.4 * s, z, G);
  const sl = box(g, 1.6 * s, 0.26 * s, 0.26 * s, null, x, y + 1.6 * s, z, G); sl.rotation.z = -0.35;
}
function buildCathedral(g) {
  const R = CHUR_SB; superPad(g, R, '#efe6d4', '#e3d6bd');
  const c = new THREE.Group(); c.position.set(CHUR.x, 0.27, CHUR.z); g.add(c);
  const S = 34, WH = '#fbfaf6';
  box(c, S + 14, 1.4, S + 14, '#e8e2d6'); box(c, S + 8, 0.8, S + 8, '#f1ece2', 0, 1.4, 0);
  const y0 = 2.2;
  box(c, S, 20, S, WH, 0, y0, 0);
  const win = M('#5b4a3a'); const winL = M('#ffd67a', { emissive: '#ffc85a', emissiveIntensity: 0.55 });
  const kok = (w, d, x, y, z, ry) => { const k = new THREE.Mesh(new THREE.CylinderGeometry(w / 2, w / 2, d, 20, 1, false, -Math.PI / 2, Math.PI).rotateX(Math.PI / 2).rotateZ(0), M(WH)); k.position.set(x, y, z); k.rotation.y = ry; c.add(k); };
  for (let side = 0; side < 4; side++) {
    const ry = side * Math.PI / 2, nx = Math.sin(ry), nz = Math.cos(ry), tx = Math.cos(ry), tz = -Math.sin(ry);
    // central portico with big kokoshnik
    const P = new THREE.Group(); P.position.set(nx * (S / 2 + 1.5), y0, nz * (S / 2 + 1.5)); P.rotation.y = ry; c.add(P);
    box(P, 14, 21, 3, WH, 0, 0, 0); box(P, 15, 0.8, 3.6, '#ece6da', 0, 21, 0);
    const k = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 3, 20, 1, false, -Math.PI / 2, Math.PI).rotateX(Math.PI / 2), M(WH)); k.rotation.z = Math.PI / 2; k.position.set(0, 21.8, 0); P.add(k);
    const kr = new THREE.Mesh(new THREE.TorusGeometry(6.4, 0.25, 4, 20, Math.PI), M('#e8d9b8')); kr.position.set(0, 21.8, 1.55); P.add(kr);
    for (let i = -1; i <= 1; i++) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 5.5), i ? win : winL); w.position.set(i * 3.6, 12, 1.52); P.add(w); }
    const dr = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 5.4), M('#3f5a4a')); dr.position.set(0, 2.7, 1.52); P.add(dr);
    const icon = new THREE.Mesh(new THREE.CircleGeometry(1.4, 16), GOLD()); icon.position.set(0, 21.5, 1.56); P.add(icon);
    // side windows + small kokoshniks
    for (const s of [-1, 1]) { for (const yy of [6, 14]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 4.4), win); w.position.set(nx * (S / 2 + 0.02) + tx * s * 12, y0 + yy, nz * (S / 2 + 0.02) + tz * s * 12); w.rotation.y = ry; c.add(w); }
      const k2 = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 1.6, 16, 1, false, -Math.PI / 2, Math.PI).rotateX(Math.PI / 2), M(WH)); k2.rotation.set(0, ry, Math.PI / 2); k2.position.set(nx * (S / 2 - 0.5) + tx * s * 12, y0 + 20, nz * (S / 2 - 0.5) + tz * s * 12); c.add(k2); }
  }
  box(c, S - 2, 1.2, S - 2, '#d9cdb5', 0, y0 + 20, 0);
  // 4 belfries with golden domes
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const x = sx * (S / 2 - 4), z = sz * (S / 2 - 4);
    box(c, 6.5, 9, 6.5, WH, x, y0 + 21.2, z);
    for (let a = 0; a < 4; a++) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 3.6), win); const ry = a * Math.PI / 2; w.position.set(x + Math.sin(ry) * 3.27, y0 + 26, z + Math.cos(ry) * 3.27); w.rotation.y = ry; c.add(w); }
    cyl(c, 2.6, 2.6, 2.4, WH, x, y0 + 30.2, z, 14);
    onion(c, 3.2, 6.5, x, y0 + 32.6, z, GOLD()); cross(c, x, y0 + 39, z, 0.75);
  }
  // central drum + big golden onion dome
  const dy = y0 + 21.2;
  cyl(c, 10.5, 11, 3, '#ece6da', 0, dy, 0, 28);
  cyl(c, 9.4, 9.4, 11, WH, 0, dy + 3, 0, 28);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const w = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 5.4), i % 3 ? win : winL); w.position.set(Math.sin(a) * 9.45, dy + 8.6, Math.cos(a) * 9.45); w.rotation.y = a; c.add(w); }
  cyl(c, 10, 10, 1.2, '#e8d9b8', 0, dy + 14, 0, 28);
  onion(c, 10.4, 19, 0, dy + 15.2, 0, GOLD());
  cyl(c, 1, 1.2, 2, null, 0, dy + 33.6, 0, 10, GOLD()); cross(c, 0, dy + 35.4, 0, 1.4);
  // lamps + trees + parking
  for (let i = -3; i <= 3; i++) lamps.push([CHUR.x + i * 7, 0.25, CHUR.z + S / 2 + 10, 0]);
  for (const s of [-1, 1]) for (let i = 0; i < 5; i++) addTree(CHUR.x + s * 30, CHUR.z - 20 + i * 10, 0.9);
  parking(g, R.x1 - 30, R.x1 - 2, R.z0 + 3, R.z1 - 3, { x: R.x1 - 16, z: R.z1 - 1, w: 8, d: 4 });
  POIS.push({ key: 'church', x: CHUR.x, y: 66, z: CHUR.z, html: '⛪ ПРАВОСЛАВНЫЙ ХРАМ<i>кафедральный собор</i>' });
  ZONES.push({ key: 'church', x: CHUR.x, y: 20, z: CHUR.z, r: 30, fn: churchCard });
}

// ---------------- residents placement ----------------
function placeResidents(res) {
  const lots = [];
  for (let bx = -NB; bx <= NB; bx++) for (let bz = -NB; bz <= NB; bz++) {
    if (isSkip(bx, bz)) continue;
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
    const dist = lot.bz > RIVER_BZ ? 'Заречье' : (Math.abs(lot.bx) <= 4 && Math.abs(lot.bz) <= 4) ? 'Центр' : 'Частный сектор';
    houses.push({ ...r, obj, x, y: 0.26, z, face, h: Math.min(obj.userData.h * sc, 60), big, dist, addr: `ул. ${STREETS[street]}, ${no}` });
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
    o.updateMatrixWorld(true); o.userData.ranges = [];
    o.traverse((m) => {
      if (!m.isMesh || !m.visible || m.isInstancedMesh) return; const mat = m.material; if (Array.isArray(mat) || mat.transparent) return;
      let g = m.geometry; g = g.index ? g.toNonIndexed() : g.clone(); g.applyMatrix4(m.matrixWorld);
      let b = buckets.get(mat); if (!b) { b = { pos: [], nor: [], uv: [], len: 0 }; buckets.set(mat, b); }
      const p = g.attributes.position.array; b.pos.push(p); o.userData.ranges.push([b, b.len, p.length]); b.len += p.length; if (!g.attributes.normal) g.computeVertexNormals(); b.nor.push(g.attributes.normal.array);
      b.uv.push(g.attributes.uv ? g.attributes.uv.array : new Float32Array(p.length / 3 * 2)); m.userData.merged = true;
    });
  }
  const cat = (arrs) => { let n = 0; for (const a of arrs) n += a.length; const out = new Float32Array(n); let o = 0; for (const a of arrs) { out.set(a, o); o += a.length; } return out; };
  for (const [mat, b] of buckets) {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(cat(b.pos), 3)); g.setAttribute('normal', new THREE.BufferAttribute(cat(b.nor), 3));
    if (mat.map) g.setAttribute('uv', new THREE.BufferAttribute(cat(b.uv), 2));
    g.computeBoundingSphere(); const mesh = new THREE.Mesh(g, mat); mesh.matrixAutoUpdate = false; scene.add(mesh); b.mesh = mesh;
  }
  for (const o of objs) { o.traverse((m) => { if (m.isMesh && m.userData.merged) m.visible = false; }); }
}

// hide / restore one merged object (used by the UFO game)
function hideObj(o) {
  if (o.userData.saved) return; o.userData.saved = [];
  for (const [b, off, len] of o.userData.ranges || []) { const at = b.mesh.geometry.attributes.position; o.userData.saved.push(at.array.slice(off, off + len)); const x = at.array[off], y = -50, z = at.array[off + 2]; for (let i = off; i < off + len; i += 3) { at.array[i] = x; at.array[i + 1] = y; at.array[i + 2] = z; } at.needsUpdate = true; }
  markDirty();
}
function showObj(o) {
  if (!o.userData.saved) return;
  (o.userData.ranges || []).forEach(([b, off], i) => { const at = b.mesh.geometry.attributes.position; at.array.set(o.userData.saved[i], off); at.needsUpdate = true; });
  o.userData.saved = null; markDirty();
}

// ---------------- camera ----------------
const cam = { x: 0, z: 10, d: 260, yaw: 0.0, fly: null, idle: true };
const LIM = { x0: MEGA.x0 - 10, x1: AIR.x1 + 10, z0: SECRET.z - 30, z1: CZ + 175, d0: 18, d1: 560 };
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
    <div class="addr">📍 ${esc(h.dist)}, ${esc(h.addr)}</div>
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
  if (h) { lastFound = h; select(h); houseCard(h, true); history.replaceState(null, '', '?nick=' + encodeURIComponent(h.nick)); return; }
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
const PLACES = [['🏛', 'Мэрия', 'идут выборы мэра', 'hall', [HALL.x, HALL.z + 8, 100, 0.25]], ['🎄', 'Главная ёлка', 'игрушки повесим позже', 'tree', [TREE.x, TREE.z + 4, 135, 0.4]],
  ['⛪', 'Православный храм', 'кафедральный собор', 'church', [CHUR.x + 8, CHUR.z + 10, 200, 0.45]], ['🕌', 'Мечеть', 'соборная мечеть', 'mosque', [MOSQ.x - 14, MOSQ.z + 8, 205, -0.4]],
  ['🛍', 'Торговый квартал', 'рынок, 2 ТЦ, бизнесы, аренда', 'mall1', [108, 8, 130, 0.3]], ['🌊', 'Океан и пирс', 'пирс откроется на 10 000', 'pier', [0, OCEAN_Z + 30, 170, 0.5]],
  ['🏙', 'Мегаполис', 'стройка начнётся на 10 000', 'mega', [(MEGA.x0 + MEGA.x1) / 2, 0, 330, -0.7]], ['✈️', 'Аэропорт', 'откроется на 15 000', 'air', [AIR.x0 + 140, -40, 330, 0.8]],
  ['🔒', 'Секретная локация', 'скоро откроем', 'secret', [SECRET.x, SECRET.z + 20, 140, 0]], ['🌋', 'Вулкан', 'следующая катастрофа', 'volcano', [VOLC.x + 200, VOLC.z + 250, 380, 0.6]]];
function goPlace(k) {
  const p = PLACES.find(q => q[3] === k); if (!p) return; select(null); closeCard(); hideWelcome(); flyTo(...p[4]);
  const z = ZONES.find(q => q.key === k); if (k === 'hall') hallCard(); else if (z) setTimeout(z.fn, 900);
}
function openPlaces() {
  modal(`<h2>✨ Места города</h2><p>Новые районы, главные здания и дома, которые подписчики заказали в комментариях.</p>
    ${PLACES.map(([e, a, b, k]) => `<button class="it" data-k="${k}"><span class="e">${e}</span><span class="t"><b>${a}</b><i>${b}</i></span><span class="go">→</span></button>`).join('')}
    <p style="margin-top:14px"><b>${houses.filter(h => h.feat).length}</b> домов построено по заказам из комментариев. Найди свой по нику!</p>
    ${houses.filter(h => h.star).map(h => `<button class="it" data-n="${esc(h.nick)}"><span class="e">${emo(h.type)}</span><span class="t"><b>${esc(h.req)}</b><i>@${esc(h.nick)} • ${esc(h.addr)}</i></span><span class="go">→</span></button>`).join('')}`);
  $('#modal').querySelectorAll('.it').forEach(b => b.onclick = () => {
    closeModal(); if (b.dataset.n) { const h = houses.find(x => x.nick === b.dataset.n); select(h); houseCard(h, false); return; }
    goPlace(b.dataset.k);
  });
}
function openUpgrade(h) {
  modal(`<h2>⬆ Улучшение дома</h2><p>Дом @${esc(h.nick)} можно прокачать до особняка. Уровни обновляются с каждым выпуском.</p>
    <div class="step"><span>1</span><div><b>Дом</b><i>Подписка на @${IG} — твой дом уже стоит ✅</i></div></div>
    <div class="step"><span>2</span><div><b>Усадьба: забор, сад, деревья</b><i>Напиши 3 комментария под последним выпуском</i></div></div>
    <div class="step"><span>3</span><div><b>Особняк: бассейн и машина</b><i>Сделай репост выпуска в сторис с отметкой @${IG}</i></div></div>
    <div class="row"><a class="b1" target="_blank" href="https://instagram.com/${IG}">Открыть @${IG}</a></div>`);
}
const MAYOR_TOP = [['am.irkhan7793', 33], ['raimjanov_umka', 27], ['kha1id_2015', 25], ['ayima_imamidinova', 19], ['kiraplokhaia', 17]];
const fmt = (n) => n.toLocaleString('ru-RU');
const prog = (goal) => `<div class="prog"><i style="width:${Math.min(100, POP / goal * 100).toFixed(1)}%"></i></div><div class="progt"><b>${fmt(POP)}</b> из ${fmt(goal)} подписчиков · осталось ${fmt(Math.max(0, goal - POP))}</div>`;
const igBtn = (t) => `<div class="row"><a class="b1" target="_blank" href="https://instagram.com/${IG}">${t}</a></div>`;
function hallCard() {
  sheet(`<div class="kick">🏛 Мэрия Города Домино</div><div class="nick">🗳 Идут выборы мэра!</div>
    <div class="txt">Мэром станет тот, у кого будет больше всех комментариев. Мэр решает, какие крупные здания строить в городе.</div>
    <div class="row"><button class="b3" id="cEl">Кто лидирует →</button></div>`);
  $('#cEl').onclick = openElection;
}
function openElection() {
  modal(`<h2>🗳 Выборы мэра</h2><p>Мэром станет тот, у кого будет <b>больше всех комментариев</b> под нашими выпусками. Мэр будет решать, какие крупные постройки появятся в городе.</p>
    ${MAYOR_TOP.map(([n, c], i) => `<button class="it" data-n="${esc(n)}"><span class="e">${['🥇', '🥈', '🥉', '4', '5'][i]}</span><span class="t"><b>@${esc(n)}</b><i>${c} комментариев</i></span><span class="go">🏠</span></button>`).join('')}
    <p style="margin-top:12px">Подсчёт обновляется с каждым выпуском. Пиши комментарии — и ты можешь обогнать лидеров 👑</p>
    ${igBtn('Писать комментарии →')}`);
  $('#modal').querySelectorAll('.it').forEach(b => b.onclick = () => { const h = houses.find(x => x.nick === b.dataset.n); if (!h) { toast('Этот дом скоро появится'); return; } closeModal(); hideWelcome(); select(h); houseCard(h, false); });
}
function treeCard() {
  sheet(`<div class="kick">🎄 Главная ёлка города</div><div class="nick">Игрушки — позже!</div>
    <div class="txt">Начнём вешать игрушки позже. Каждый житель сможет повесить на ёлку свою игрушку со своим ником. Следи за выпусками!</div>${igBtn('Следить за @' + IG)}`);
}
function mosqueCard() {
  sheet(`<div class="kick">🕌 Мечеть</div><div class="nick">Соборная мечеть</div>
    <div class="txt">Главная мечеть Города Домино: купола, четыре минарета, двор и бассейны. Рядом большая парковка и подъезд.</div>`);
}
function churchCard() {
  sheet(`<div class="kick">⛪ Православный храм</div><div class="nick">Кафедральный собор</div>
    <div class="txt">Главный православный храм Города Домино с золотыми куполами. Рядом большая парковка и подъезд.</div>`);
}
function megaCard() {
  sheet(`<div class="kick">🏙 Мегаполис</div><div class="nick">Стройка начнётся на 10 000</div>
    <div class="txt">Здесь вырастут высотки с квартирами для подписчиков. Пока на этом месте только проект и краны.</div>${prog(10000)}${igBtn('Позвать друзей → подписка')}`);
}
function pierCard() {
  sheet(`<div class="kick">🌊 Океан и пирс</div><div class="nick">Пирс откроется на 10 000</div>
    <div class="txt">Пирс ещё строится. Откроем его, когда в городе будет 10 000 жителей.</div>${prog(10000)}${igBtn('Подписаться @' + IG)}`);
}
function airCard() {
  sheet(`<div class="kick">✈️ Аэропорт</div><div class="nick">Откроется на 15 000</div>
    <div class="txt">Когда откроем аэропорт, добавятся новые города и между ними можно будет летать.</div>${prog(15000)}${igBtn('Подписаться @' + IG)}`);
}
function mallCard(name) {
  sheet(`<div class="kick">🛍 Торговый центр</div><div class="nick">${esc(name)}</div>
    <div class="txt">Здесь будут магазины подписчиков. Есть свой бизнес? Подпишись и напиши в комментах его название — дадим ему место в городе.</div>${igBtn('Добавить свой бизнес')}`);
}
function marketCard() {
  sheet(`<div class="kick">🛒 Рынок</div><div class="nick">Городской рынок</div>
    <div class="txt">42 прилавка с фруктами и овощами. Хочешь свой прилавок? Напиши в комментах, что продаёшь.</div>${igBtn('Написать в комменты')}`);
}
function shopCard(sh) {
  if (sh.kind === 'biz') sheet(`<div class="kick">🏪 Бизнес жителя</div><div class="nick">${esc(sh.name)}</div><div class="addr">${esc(sh.cat)} · владелец @${esc(sh.nick)}</div>
    <div class="txt">Бизнес из комментариев подписчиков. Хочешь свою вывеску? Подпишись и напиши название бизнеса в комментах.</div>${igBtn('Добавить свой бизнес')}`);
  else if (sh.kind === 'rent') sheet(`<div class="kick">🔑 АРЕНДА</div><div class="nick">Место под бизнес свободно</div>
    <div class="txt">Подпишись на @${IG} и напиши в комментах название своего бизнеса — повесим вывеску в следующем обновлении.</div>${igBtn('Занять место')}`);
  else sheet(`<div class="kick">🏗 Строится</div><div class="nick">Скоро откроется</div><div class="txt">Здесь строится бизнес одного из подписчиков. Следи за обновлениями карты!</div>`);
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
    if (!pts.has(e.pointerId)) return; if (game && game.on) return; const prev = pts.get(e.pointerId); const cur = { x: e.clientX, y: e.clientY, b: prev.b }; pts.set(e.pointerId, cur);
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
  el.addEventListener('wheel', (e) => { e.preventDefault(); if (game && game.on) return; cam.d *= Math.exp(e.deltaY * 0.0012); cam.fly = null; cam.idle = false; clampCam(); markDirty(); }, { passive: false });
}
const ray = new THREE.Raycaster(), gPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.26), gHit = new THREE.Vector3();
function zoneAt(sx, sy) {
  let best = null, bd = 1;
  for (const z of ZONES) {
    const q = proj(z.x, z.y, z.z); if (!q.ok) continue;
    const e = proj(z.x + camera.matrixWorld.elements[0] * z.r, z.y + camera.matrixWorld.elements[1] * z.r, z.z + camera.matrixWorld.elements[2] * z.r);
    const rp = Math.max(24, Math.hypot(e.x - q.x, e.y - q.y)); const d = Math.hypot(q.x - sx, q.y - sy) / rp;
    if (d < bd) { bd = d; best = z; }
  }
  return best;
}
function onTap(sx, sy) {
  if (game && game.on) { game.tap(sx, sy); return; }
  ray.setFromCamera(new THREE.Vector2(sx / innerWidth * 2 - 1, -(sy / innerHeight) * 2 + 1), camera);
  if (ray.ray.intersectPlane(gPlane, gHit)) {
    if (Math.abs(gHit.x - HALL.x) < 16 && Math.abs(gHit.z - HALL.z) < 9) { select(null); goHall(); hallCard(); return; }
    const sh = SHOPS.find(q => Math.abs(gHit.x - q.x) < 3.4 && Math.abs(gHit.z - q.z) < 3); if (sh) { select(null); shopCard(sh); return; }
  }
  const z = zoneAt(sx, sy); if (z) { select(null); z.fn(); return; }
  if (ray.ray.intersectPlane(gPlane, gHit)) {
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
  try { await Promise.race([Promise.all([document.fonts.load('900 60px Unbounded'), document.fonts.load('800 30px Manrope')]), new Promise(r => setTimeout(r, 2500))]); } catch (e) {}
  const res = await (await fetch('./residents.json')).json();
  await step('Прокладываем дороги…'); buildWorld();
  await step('Ставим дома…'); placeResidents(res);
  await step('Зажигаем фонари…'); mergeStatic([...houses.map(h => h.obj), scene.userData.plaza, scene.userData.districts]);
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
  $('#tPlaces').onclick = openPlaces; $('#tElect').onclick = openElection; $('#tHow').onclick = openHow; $('#elect').onclick = openElection;
  game = createGame({ THREE, scene, camera, cam, houses, flyTo, markDirty, proj, buildHouse, hideObj, showObj, toast, IG, SITE, POP, clamp, getCenter: () => lastFound || selected, closeAll: () => { closeCard(); closeModal(); select(null); hideWelcome(); } });
  const play = () => game.intro(); $('#tGame').onclick = play; $('#wgame').onclick = play;
  $('#labels').addEventListener('click', (e) => { const L = e.target.closest('.lb'); if (!L) return; if (L._house) { select(L._house); houseCard(L._house, false); } else if (L.dataset.k === 'hall') { goHall(); hallCard(); } else if (L.dataset.k) { const z = ZONES.find(q => q.key === L.dataset.k); if (PLACES.some(p => p[3] === L.dataset.k)) goPlace(L.dataset.k); else if (z) z.fn(); } });
  addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); markDirty(); });
  $('#loader').classList.add('off');
  const qn = new URLSearchParams(location.search).get('nick'); if (qn) findNick(qn);
  window.__city = { cam, houses, flyTo, select, findNick, makeStory, markDirty, game, goPlace, SHOPS, ZONES };
  const loop = (now) => {
    if (cam.fly) { const f = cam.fly; const k = clamp((now - f.t0) / f.dur); const e = k * k * (3 - 2 * k);
      cam.x = lerp(f.x0, f.x1, e); cam.z = lerp(f.z0, f.z1, e); cam.d = lerp(f.d0, f.d1, e) + Math.sin(Math.PI * e) * f.arc; cam.yaw = lerp(f.y0, f.y1, e); if (k >= 1) cam.fly = null; dirty = true; }
    if (cam.idle) { if (cam.idleT0 == null) { cam.idleT0 = now; cam.idleY0 = cam.yaw; } cam.yaw = cam.idleY0 + 0.07 * (now - cam.idleT0) / 1000; dirty = true; } else cam.idleT0 = null;
    if (selected) { const s = (selected.big ? 1.8 : 1) * (1 + 0.07 * Math.sin(now / 170)); marker.scale.set(s, 1, s); dirty = true; }
    if (game && game.on) { game.update(now); dirty = true; }
    if (dirty) { applyCam(); renderer.render(scene, camera); if (!(game && game.on)) updateLabels(); dirty = false; }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
