import * as THREE from './three.module.js';
import { M, box, cyl, sph, cone, gable, windows, door, BUILD, WIN } from './builders.js';

const cat = (g, x, y, z, col, s = 1, ry = 0) => {
  const c = new THREE.Group();
  box(c, 0.7, 0.45, 0.4, col, 0, 0, 0); box(c, 0.42, 0.38, 0.38, col, 0.38, 0.35, 0);
  cone(c, 0.1, 0.2, col, 0.3, 0.73, -0.1, 4); cone(c, 0.1, 0.2, col, 0.3, 0.73, 0.1, 4);
  const t = box(c, 0.1, 0.55, 0.1, col, -0.38, 0.3, 0); t.rotation.z = 0.5;
  for (const zz of [-0.1, 0.1]) { const e = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.07), M('#b8ff6a', { emissive: '#8aff2a', emissiveIntensity: 1 })); e.position.set(0.595, 0.6, zz); e.rotation.y = Math.PI / 2; c.add(e); }
  c.position.set(x, y, z); c.rotation.y = ry; c.scale.setScalar(s); g.add(c); return c;
};

Object.assign(BUILD, {
  billion(g) { // endless tower into the clouds
    const cols = ['#e9e4f2', '#d8d0ea'];
    for (let i = 0; i < 46; i++) { const w = 3.2 - i * 0.012; box(g, w, 2.2, w, cols[i % 2], 0, i * 2.2); if (i % 2 === 0) for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.8, 0.9), WIN()); m.position.set(0, i * 2.2 + 1.1, s * (w / 2 + 0.01)); if (s < 0) m.rotation.y = Math.PI; g.add(m); } }
    cone(g, 1.4, 4, '#ffd23f', 0, 101, 0, 8, M('#ffd23f', { emissive: '#ffb000', emissiveIntensity: 0.6 }));
    door(g, 0, 0, 1.61);
    return 105;
  },
  shawarma(g) {
    const lav = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 5.6, 16), M('#e8c27a')); lav.rotation.z = Math.PI / 2 - 0.25; lav.position.set(0, 1.9, 0); g.add(lav);
    const fill = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.3, 16), M('#c0632e')); fill.rotation.z = Math.PI / 2 - 0.25; fill.position.set(2.75, 2.6, 0); g.add(fill);
    for (const [c, dy, dz] of [['#3fae3a', 0.5, 0.3], ['#e5383b', -0.2, -0.5], ['#ffffff', 0.1, 0.6]]) sph(g, 0.35, c, 2.85, 2.5 + dy, dz, undefined, 6, 4);
    for (let i = -2; i <= 2; i++) { const s = new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.06, 4, 16), M('#c79a4f')); s.rotation.y = Math.PI / 2; s.position.set(i * 1.0, 1.9 + i * 0.25, 0); s.rotation.x = 0; s.rotation.z = -0.25; g.add(s); }
    door(g, -0.6, 0.55, 1.5, 0.7, 1.1);
    const w = new THREE.Mesh(new THREE.CircleGeometry(0.35, 12), WIN()); w.position.set(0.8, 2.4, 1.52); g.add(w);
    return 4.5;
  },
  cake(g) {
    const tiers = [[2.4, 1.5, '#f7d7e6'], [1.8, 1.3, '#fff3d6'], [1.2, 1.2, '#f7d7e6']]; let y = 0;
    for (const [r, h, c] of tiers) { cyl(g, r, r, h, c, 0, y, 0, 20); cyl(g, r + 0.05, r + 0.05, 0.25, '#8a4a2a', 0, y + h - 0.2, 0, 20); for (let i = 0; i < 10; i++) sph(g, 0.16, '#e5383b', Math.cos(i * 0.628) * r, y + h + 0.05, Math.sin(i * 0.628) * r, undefined, 6, 4); y += h; }
    for (let i = 0; i < 5; i++) { cyl(g, 0.07, 0.07, 0.6, '#7fc4ef', Math.cos(i * 1.26) * 0.6, y, Math.sin(i * 1.26) * 0.6, 6); sph(g, 0.1, '#ffd23f', Math.cos(i * 1.26) * 0.6, y + 0.7, Math.sin(i * 1.26) * 0.6, M('#ffd23f', { emissive: '#ff9a00', emissiveIntensity: 1 }), 6, 4); }
    door(g, 0, 0, 2.38, 0.7, 1.1, '#8a4a2a');
    for (const a of [-0.6, 0.6]) { const w = new THREE.Mesh(new THREE.CircleGeometry(0.25, 10), WIN()); w.position.set(Math.sin(a) * 1.81, 2.1, Math.cos(a) * 1.81); w.rotation.y = a; g.add(w); }
    return y + 1;
  },
  diamond(g) {
    const mat = new THREE.MeshLambertMaterial({ color: '#9ff2ff', emissive: '#3ec8f0', emissiveIntensity: 0.55, flatShading: true });
    const top = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.6, 8), mat); top.position.y = 4.4; top.rotation.x = Math.PI; g.add(top);
    const low = new THREE.Mesh(new THREE.ConeGeometry(2.6, 3.6, 8), mat); low.position.y = 1.8; low.rotation.x = Math.PI; g.add(low);
    low.rotation.x = 0; low.position.y = 3.6 - 1.8; low.scale.y = -1;
    top.rotation.x = 0; top.position.y = 3.6 + 0.8;
    for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), mat); s.position.set(Math.cos(i * 1.57) * 2.4, 0.5, Math.sin(i * 1.57) * 2.4); g.add(s); }
    door(g, 0, 0, 0.9, 0.6, 1.0, '#2a6a8a');
    return 5.4;
  },
  burj(g) {
    const c = '#cfd8e6';
    const lv = [[3.0, 10], [2.4, 9], [1.8, 8], [1.2, 7], [0.7, 6]]; let y = 0;
    for (const [w, h] of lv) { box(g, w, h, w, c, 0, y); for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.25, h * 0.92), WIN()); m.position.set(0, y + h / 2, s * (w / 2 + 0.01)); if (s < 0) m.rotation.y = Math.PI; g.add(m); } y += h; }
    cyl(g, 0.05, 0.25, 9, '#e8eef6', 0, y, 0, 6); sph(g, 0.3, '#ff3040', 0, y + 9, 0, M('#ff3040', { emissive: '#ff0000', emissiveIntensity: 1 }), 6, 4);
    door(g, 0, 0, 1.51);
    return y + 9;
  },
  cucumber(g) {
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(1.4, 4.2, 6, 12), M('#3f9a3a')); b.position.y = 3.5; g.add(b);
    for (let i = 0; i < 26; i++) { const a = i * 2.4, y = 1.6 + (i % 9) * 0.45; sph(g, 0.12, '#bff07a', Math.cos(a) * 1.38, y, Math.sin(a) * 1.38, undefined, 4, 3); }
    sph(g, 0.3, '#ffd23f', 0, 7.1, 0, M('#ffd23f', { emissive: '#ffb000', emissiveIntensity: 0.7 }), 8, 6);
    door(g, 0, 0, 1.33, 0.6, 1.1);
    for (const y of [3.0, 4.6]) { const w = new THREE.Mesh(new THREE.CircleGeometry(0.28, 10), WIN()); w.position.set(0, y, 1.42); g.add(w); }
    return 7.4;
  },
  moon(g) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(2.6, 20, 14), M('#e9e6d8', { emissive: '#b0aa90', emissiveIntensity: 0.45 })); m.position.y = 2.8; g.add(m);
    for (const [x, y, z, r] of [[1.2, 4.3, 1.6, 0.6], [-1.4, 3.6, 1.9, 0.45], [0.2, 2.2, 2.5, 0.4], [-2.0, 2.4, -1.2, 0.5], [1.9, 2.9, -1.2, 0.5]]) { const c = new THREE.Mesh(new THREE.CircleGeometry(r, 12), M('#bdb8a2')); c.position.set(x, y, z); c.lookAt(x * 2, (y - 2.8) * 2 + 2.8, z * 2); g.add(c); }
    door(g, 0, 0.2, 2.45, 0.7, 1.1, '#5a5548');
    return 5.6;
  },
  cats(g) {
    box(g, 4, 2.6, 3.4, '#f4b6c8'); windows(g, 4, 2.6, 3.4, 0, 0, 0, 1, 3, { skipDoor: true }); door(g, 0, 0, 1.7);
    gable(g, 4, 3.4, 1.6, '#8a4a6a', 0, 2.6, 0);
    const cc = ['#ff9f43', '#2b1f3d', '#ffffff', '#9a9a9a', '#e8c27a'];
    const P = [[-1.2, 3.1, 0.8, 0], [0.2, 3.6, 0.4, 1], [1.3, 3.0, 0.9, 2], [-0.5, 3.8, -0.3, 0.4], [1.0, 3.5, -0.6, 3], [-2.6, 0, 1.6, 1.5], [2.6, 0, 1.4, -1.5], [-2.4, 0, -1.2, 2.5], [2.5, 0, -1.0, -2], [0, 0, 2.3, 0.3]];
    P.forEach(([x, y, z, r], i) => cat(g, x, y + 0.12, z, cc[i % 5], 0.9, r));
    return 5.0;
  },
  mushroom(g) {
    cyl(g, 1.0, 1.3, 2.8, '#f2ead8', 0, 0, 0, 14); door(g, 0, 0, 1.25, 0.6, 1.1);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(2.6, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), M('#e5383b')); cap.position.y = 2.6; cap.scale.y = 0.7; g.add(cap);
    for (let i = 0; i < 9; i++) { const a = i * 0.7, r = 1 + (i % 3) * 0.6; sph(g, 0.3, '#ffffff', Math.cos(a) * r, 2.6 + Math.sqrt(Math.max(0, 6.76 - r * r)) * 0.7 - 0.1, Math.sin(a) * r, undefined, 6, 4); }
    return 4.6;
  },
  peach(g) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(2.4, 18, 14), M('#ffb08a', { emissive: '#ff7a5a', emissiveIntensity: 0.2 })); p.position.y = 2.5; p.scale.set(1, 1.05, 0.95); g.add(p);
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 6), M('#3f9a3a')); leaf.scale.set(1.2, 0.2, 0.5); leaf.position.set(0.6, 5.0, 0); leaf.rotation.z = 0.4; g.add(leaf);
    cyl(g, 0.1, 0.12, 0.6, '#6b4224', 0, 4.8, 0, 6); door(g, 0, 0.2, 2.25, 0.7, 1.1);
    return 5.4;
  },
  banana(g) {
    const pts = []; for (let i = 0; i <= 12; i++) { const a = -0.9 + i * 0.15; pts.push(new THREE.Vector3(Math.sin(a) * 4, 4.6 - Math.cos(a) * 4 + 0.2, 0)); }
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 1.1, 10), M('#ffd84a'));
    g.add(tube); sph(g, 0.3, '#5a3d2b', pts[0].x, pts[0].y, 0, undefined, 6, 4); sph(g, 0.3, '#5a3d2b', pts[12].x, pts[12].y, 0, undefined, 6, 4);
    door(g, 0, 0.1, 1.08, 0.55, 0.9);
    return 4.2;
  },
  chocolate(g) {
    box(g, 4, 2.8, 3.4, '#6b3a1e'); for (let x = -1.5; x <= 1.5; x += 1) for (let y = 0.4; y < 2.6; y += 0.8) box(g, 0.85, 0.65, 0.1, '#7a4628', x, y, 1.72);
    gable(g, 4, 3.4, 1.5, '#4a2410', 0, 2.8, 0); box(g, 4.2, 0.25, 3.6, '#f4efe6', 0, 2.8);
    door(g, 0, 0, 1.78, 0.7, 1.2, '#f4c8a0');
    return 4.4;
  },
});
