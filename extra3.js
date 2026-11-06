// Дополнительные дома по заказам из комментариев
import * as THREE from './three.module.js';
import { M, box, cyl, sph, cone, gable, pyramid, windows, door, BUILD, WIN } from './builders.js';

const win = (g, x, y, z, r = 0.28) => { const w = new THREE.Mesh(new THREE.CircleGeometry(r, 12), WIN()); w.position.set(x, y, z); g.add(w); return w; };
const glow = (g, w, h, x, y, z) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), WIN()); p.position.set(x, y, z); g.add(p); return p; };

Object.assign(BUILD, {
  eiffel(g) {
    const c = '#7a6a58';
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = box(g, 0.45, 5.2, 0.45, c, sx * 1.3, 0, sz * 1.3); l.rotation.set(sz * 0.22, 0, -sx * 0.22); l.position.set(sx * 0.75, 2.5, sz * 0.75); }
    box(g, 3.0, 0.35, 3.0, c, 0, 2.2, 0); box(g, 1.9, 0.3, 1.9, c, 0, 4.9, 0);
    cyl(g, 0.25, 0.75, 4.6, c, 0, 5.2, 0, 4); cyl(g, 0.08, 0.2, 1.6, c, 0, 9.8, 0, 6);
    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.16, 6, 14, Math.PI), M(c)); arch.position.set(0, 1.25, 1.35); g.add(arch);
    return 11.4;
  },
  icecream(g) {
    cone(g, 1.6, 4.0, '#e0a96d', 0, 0, 0, 14).rotation.x = Math.PI; g.children[g.children.length - 1].position.y = 2.0;
    sph(g, 1.8, '#f7a8c8', 0, 4.6, 0, undefined, 16, 12); sph(g, 1.4, '#fff3d6', 0, 6.0, 0, undefined, 14, 10); sph(g, 0.4, '#e63946', 0, 7.5, 0);
    for (let i = 0; i < 10; i++) { const a = i * 0.63; box(g, 0.12, 0.12, 0.4, ['#ff5a3c', '#ffc23d', '#19b38a', '#2f80ed'][i % 4], Math.cos(a) * 1.2, 6.2 + (i % 3) * 0.3, Math.sin(a) * 1.2).rotation.y = a; }
    door(g, 0, 3.2, 1.75, 0.7, 1.1); win(g, -0.8, 4.9, 1.6); win(g, 0.8, 4.9, 1.6);
    return 7.9;
  },
  bear(g) {
    const f = '#a0673f', l = '#e2b58a';
    sph(g, 2.0, f, 0, 2.0, 0, undefined, 16, 12); sph(g, 1.5, f, 0, 4.4, 0.3, undefined, 16, 12);
    for (const x of [-1, 1]) { sph(g, 0.55, f, x * 1.05, 5.6, 0.2); sph(g, 0.3, l, x * 1.05, 5.6, 0.45); sph(g, 0.6, f, x * 1.6, 0.6, 1.0); sph(g, 0.6, f, x * 1.9, 2.4, 0.6); sph(g, 0.16, '#16223a', x * 0.5, 4.75, 1.65); }
    sph(g, 0.65, l, 0, 4.1, 1.55); sph(g, 0.22, '#16223a', 0, 4.35, 2.15);
    sph(g, 1.2, l, 0, 2.0, 1.2); door(g, 0, 0.9, 2.15, 0.7, 1.1);
    return 6.2;
  },
  strawberry(g) {
    const b = sph(g, 2.2, '#e63946', 0, 2.4, 0, undefined, 16, 12); b.scale.set(1, 1.2, 1);
    for (let i = 0; i < 40; i++) { const a = i * 2.4, t = (i % 10) / 10; const y = 0.9 + t * 3.2; const r = Math.sin(Math.acos((y - 2.4) / 2.7)) * 2.2; sph(g, 0.09, '#ffe08a', Math.cos(a) * r, y, Math.sin(a) * r, undefined, 4, 3); }
    for (let i = 0; i < 6; i++) { const lf = box(g, 0.9, 0.12, 0.4, '#2f9e44', Math.cos(i) * 0.6, 4.95, Math.sin(i) * 0.6); lf.rotation.y = -i; }
    cyl(g, 0.12, 0.15, 0.8, '#2f9e44', 0, 5, 0, 6); door(g, 0, 0.6, 2.1, 0.7, 1.1); win(g, -0.9, 2.8, 1.95); win(g, 0.9, 2.8, 1.95);
    return 5.8;
  },
  plane(g, n, c = '#f4a6c4') {
    cyl(g, 0.9, 0.9, 6.4, c, 0, 0, 0, 14).rotation.x = Math.PI / 2; g.children[g.children.length - 1].position.set(0, 1.9, 0);
    sph(g, 0.9, c, 0, 1.9, 3.2, undefined, 12, 10); cone(g, 0.9, 1.6, c, 0, 1.1, -4.0, 12).rotation.x = -Math.PI / 2;
    g.children[g.children.length - 1].position.set(0, 1.9, -4.0);
    box(g, 7.4, 0.15, 1.6, '#ffffff', 0, 1.6, 0.3); box(g, 2.6, 0.12, 0.9, '#ffffff', 0, 2.0, -3.6); box(g, 0.12, 1.4, 1.0, c, 0, 2.3, -3.7);
    for (let i = 0; i < 4; i++) for (const x of [-0.92, 0.92]) { const w = win(g, x, 2.2, 1.6 - i * 1.1, 0.22); w.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2; }
    for (const z of [2.2, -1.6]) box(g, 0.2, 1.0, 0.2, '#555', 0, 0, z);
    return 3.6;
  },
  cactus(g) {
    const c = '#3fa34d';
    cyl(g, 1.2, 1.3, 5.2, c, 0, 0, 0, 12); sph(g, 1.2, c, 0, 5.2, 0, undefined, 12, 8);
    for (const s of [-1, 1]) { box(g, 1.0, 0.7, 0.7, c, s * 1.5, 2.0 + (s > 0 ? 0.6 : 0), 0); cyl(g, 0.45, 0.45, 1.8, c, s * 2.0, 2.0 + (s > 0 ? 0.6 : 0), 0, 8); sph(g, 0.45, c, s * 2.0, 3.8 + (s > 0 ? 0.6 : 0), 0, undefined, 8, 6); }
    sph(g, 0.45, '#ff6fa8', 0, 6.4, 0); cyl(g, 1.7, 1.4, 0.9, '#c8683e', 0, 0, 0, 12);
    door(g, 0, 0.9, 1.25, 0.6, 1.1); win(g, 0, 3.4, 1.25);
    return 6.8;
  },
  globe(g) {
    cyl(g, 0.8, 1.6, 0.8, '#c9a23f', 0, 0, 0, 12); cyl(g, 0.2, 0.2, 1.2, '#c9a23f', 0, 0.8, 0, 8);
    const s = sph(g, 2.6, '#2f80ed', 0, 4.4, 0, undefined, 20, 14);
    for (const [a, b, r] of [[0.3, 0.6, 1.1], [2.2, 0.1, 1.3], [4.0, -0.4, 1.0], [5.3, 0.7, 0.8]]) { const c = sph(g, r, '#4caf50', Math.cos(a) * Math.cos(b) * 2.0, 4.4 + Math.sin(b) * 2.0, Math.sin(a) * Math.cos(b) * 2.0, undefined, 8, 6); c.scale.set(1, 0.6, 1); }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.12, 6, 32), M('#c9a23f')); ring.position.y = 4.4; ring.rotation.set(1.2, 0, 0.4); g.add(ring);
    door(g, 0, 2.1, 2.45, 0.7, 1.0);
    return 7.2;
  },
  aquapark(g) {
    box(g, 5.6, 0.4, 4.6, '#e9e2d3', 0, 0, 0);
    const water = box(g, 4.0, 0.1, 2.6, '#5cc7e8', -0.4, 0.4, 0.6); water.material = M('#5cc7e8', { emissive: '#2a9cc2', emissiveIntensity: 0.3 });
    box(g, 1.6, 3.6, 1.6, '#ffc23d', 1.9, 0.4, -1.4); box(g, 2.0, 0.3, 2.0, '#ff5a3c', 1.9, 4.0, -1.4);
    for (let i = 0; i < 10; i++) { const a = i * 0.55; const t = box(g, 0.9, 0.2, 0.9, i % 2 ? '#2f80ed' : '#ff5a3c', 1.9 + Math.cos(a) * 1.3, 3.8 - i * 0.36, -1.4 + Math.sin(a) * 1.3); t.rotation.y = -a; }
    const sl = box(g, 0.8, 0.15, 4.2, '#19b38a', -1.6, 1.8, -0.9); sl.rotation.x = 0.55;
    for (const x of [-2.2, 0.4]) { const u = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.5, 8), M(x < 0 ? '#ff5a3c' : '#ffffff')); u.position.set(x, 2.6, 2.0); g.add(u); cyl(g, 0.05, 0.05, 2.2, '#888', x, 0.4, 2.0, 4); }
    return 4.3;
  },
  farm(g) {
    box(g, 3.6, 2.6, 3.2, '#c0392b'); gable(g, 3.6, 3.2, 1.5, '#7a2e22', 0, 2.6, 0); door(g, 0, 0, 1.61, 1.4, 1.8, '#f4f1e6');
    box(g, 1.4, 0.1, 0.1, '#ffffff', 0, 0.9, 1.63); cyl(g, 0.8, 0.8, 4.2, '#d9d4c7', 2.6, 0, -0.8, 12); sph(g, 0.8, '#9aa0a8', 2.6, 4.2, -0.8);
    for (let i = 0; i < 9; i++) box(g, 0.1, 0.6, 0.1, '#f4f1e6', -2.4 + i * 0.6, 0, 2.6); box(g, 5.0, 0.08, 0.08, '#f4f1e6', 0, 0.45, 2.6);
    for (const [x, z, c] of [[-1.6, 2.0, '#ffffff'], [1.5, 2.1, '#3a2a20']]) { box(g, 0.9, 0.5, 0.5, c, x, 0.35, z); box(g, 0.35, 0.35, 0.35, c, x + 0.55, 0.6, z); for (const dx of [-0.3, 0.3]) box(g, 0.1, 0.35, 0.1, c, x + dx, 0, z); }
    return 4.6;
  },
  hospital(g) {
    box(g, 4.6, 5.4, 3.4, '#f4f6f8'); windows(g, 4.6, 5.4, 3.4, 0, 0, 0, 3, 4, { skipDoor: true }); door(g, 0, 0, 1.71, 1.2, 1.4, '#7fc4ef');
    box(g, 4.8, 0.3, 3.6, '#d9dde2', 0, 5.4, 0);
    const cr = M('#e63946'); box(g, 1.6, 0.5, 0.06, null, 0, 4.6, 1.74, cr); box(g, 0.5, 1.6, 0.06, null, 0, 4.05, 1.74, cr);
    box(g, 1.2, 0.08, 1.2, '#2f3645', 0, 5.7, 0); return 5.8;
  },
  mall(g) {
    box(g, 5.4, 3.6, 3.6, '#eef1f4'); box(g, 5.0, 2.2, 0.06, '#9fd8ea', 0, 0.3, 1.81); box(g, 5.6, 0.3, 3.8, '#2f3645', 0, 3.6, 0);
    const sg = box(g, 3.6, 0.8, 0.12, '#ff5a3c', 0, 2.65, 1.85); door(g, 0, 0, 1.86, 1.1, 1.5, '#2f3645');
    for (let i = 0; i < 5; i++) box(g, 0.9, 0.12, 0.9, ['#ff5a3c', '#ffc23d', '#19b38a', '#2f80ed', '#e84a7f'][i], -2 + i, 2.25, 2.25).rotation.x = -0.4;
    box(g, 1.3, 1.0, 0.5, '#ffc23d', 1.8, 3.9, 0.6); return 4.9;
  },
  xmas(g) {
    const h = 2.6; box(g, 3.4, h, 3.0, '#f2e3c6'); windows(g, 3.4, h, 3.0, 0, 0, 0, 1, 3, { skipDoor: true }); door(g, 0, 0, 1.5, 0.7, 1.2, '#b22222');
    gable(g, 3.4, 3.0, 1.6, '#ffffff', 0, h, 0, 0.35);
    const LC = ['#ff3b3b', '#ffd23f', '#3bff7a', '#3bb2ff'];
    for (let i = 0; i < 14; i++) { const m = M(LC[i % 4], { emissive: LC[i % 4], emissiveIntensity: 1 }); sph(g, 0.1, null, -1.9 + i * 0.29, h - 0.05 + Math.sin(i) * 0.05, 1.72, m, 5, 4); }
    cone(g, 1.0, 2.6, '#1f7a3a', 2.6, 0.3, 1.0, 8); cyl(g, 0.15, 0.15, 0.3, '#6b4526', 2.6, 0, 1.0, 6); sph(g, 0.2, '#ffd23f', 2.6, 3.0, 1.0, M('#ffd23f', { emissive: '#ffb000', emissiveIntensity: 0.8 }));
    sph(g, 0.6, '#ffffff', -2.5, 0.55, 1.4); sph(g, 0.42, '#ffffff', -2.5, 1.45, 1.4); cone(g, 0.1, 0.35, '#ff7a2a', -2.5, 1.4, 1.85).rotation.x = Math.PI / 2;
    return h + 1.6;
  },
  pyramid(g) { pyramid(g, 5.6, 4.6, '#e2c27a'); cone(g, 0.5, 0.7, '#c9a23f', 0, 4.1, 0, 4).rotation.y = Math.PI / 4; door(g, 0, 0, 2.02, 0.9, 1.3, '#5a4630'); return 4.9; },
  // параметризованный обычный дом: colored:<стены>:<крыша>:<этажи>
  colored(g, n, body = '#e9d2a6', roof = '#a6402f', floors = 1) {
    const fl = Math.max(1, Math.min(4, +floors || 1)); const h = 2.3 * fl;
    box(g, 3.4, h, 3.0, body); windows(g, 3.4, h, 3.0, 0, 0, 0, fl, 3, { skipDoor: true }); door(g, 0, 0, 1.5);
    gable(g, 3.4, 3.0, 1.5, roof, 0, h, 0); if (fl > 1) box(g, 1.2, 0.1, 0.8, '#fff', 0, 2.3, 1.9);
    return h + 1.5;
  },
});
