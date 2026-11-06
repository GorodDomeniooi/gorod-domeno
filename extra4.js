// TikTok ep3 builders
import * as THREE from './three.module.js';
import { M, box, cyl, sph, cone, gable, windows, door, BUILD, WIN } from './builders.js';
const win = (g, x, y, z, r = 0.28, ry = 0) => { const w = new THREE.Mesh(new THREE.CircleGeometry(r, 12), WIN()); w.position.set(x, y, z); w.rotation.y = ry; g.add(w); return w; };
Object.assign(BUILD, {
  yurt(g) {
    const W = '#f4ecd8', R = '#c0392b';
    cyl(g, 2.6, 2.6, 2.0, W, 0, 0, 0, 20);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.9, 1.6, 20), M(W)); roof.position.y = 2.8; g.add(roof);
    for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; const b = box(g, 0.12, 0.08, 1.5, R, Math.cos(a) * 1.5, 2.55, Math.sin(a) * 1.5); b.rotation.y = -a + Math.PI / 2; b.rotation.x = 0.5; }
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; box(g, 0.35, 0.35, 0.05, i % 2 ? R : '#2b5fa8', Math.cos(a) * 2.62, 1.1, Math.sin(a) * 2.62).rotation.y = -a + Math.PI / 2; }
    cyl(g, 0.5, 0.5, 0.3, '#a0663d', 0, 3.5, 0, 12); door(g, 0, 0, 2.62, 0.8, 1.4, R);
    return 3.9;
  },
  apple(g, n, c = '#e5383b') {
    const a = new THREE.Mesh(new THREE.SphereGeometry(2.3, 20, 14), M(c)); a.scale.set(1, 0.95, 1); a.position.y = 2.2; g.add(a);
    const st = cyl(g, 0.12, 0.16, 1.1, '#5a3622', 0, 4.2, 0, 6); st.rotation.z = 0.25;
    const lf = sph(g, 0.5, '#3fa34d', 0.55, 4.9, 0); lf.scale.set(1.4, 0.3, 0.7); lf.rotation.z = -0.4;
    door(g, 0, 0.2, 2.25, 0.7, 1.1, '#7a2b20'); win(g, -1.0, 2.6, 2.0, 0.28); win(g, 1.0, 2.6, 2.0, 0.28);
    return 5.2;
  },
  orange(g) { return BUILD.apple(g, '', '#ff8c1a'); },
  tank(g) {
    const c = '#5b6b3a', d = '#3f4a28';
    for (const s of [-1, 1]) { box(g, 1.0, 1.0, 5.2, '#2b2b2b', s * 1.55, 0, 0); for (let i = 0; i < 5; i++) { const w = cyl(g, 0.38, 0.38, 1.05, '#555', s * 1.55, 0.12, -2 + i, 10); w.rotation.z = Math.PI / 2; w.position.y = 0.5; } }
    box(g, 3.0, 1.2, 4.6, c, 0, 0.6, 0); box(g, 3.2, 0.25, 4.8, d, 0, 1.8, 0);
    box(g, 2.2, 1.3, 2.4, c, 0, 2.05, -0.3); door(g, 0, 2.05, 0.91, 0.6, 0.9, '#3a2a1a');
    const gun = cyl(g, 0.18, 0.2, 3.6, d, 0, 0, 0, 10); gun.rotation.x = Math.PI / 2; gun.position.set(0, 2.8, 2.3);
    win(g, -0.7, 2.75, 0.91, 0.2); win(g, 0.7, 2.75, 0.91, 0.2); cyl(g, 0.3, 0.3, 0.4, d, -0.6, 3.35, -0.8, 8); box(g, 0.05, 1.4, 0.05, '#222', 0.8, 3.35, -1.2); box(g, 0.7, 0.45, 0.03, '#e5383b', 1.15, 4.3, -1.2);
    return 4.8;
  },
  donut(g) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(2.0, 1.0, 14, 28), M('#d9a066')); t.position.y = 3.1; g.add(t);
    const ic = new THREE.Mesh(new THREE.TorusGeometry(2.0, 1.02, 14, 28, Math.PI * 2), M('#ff7fc8')); ic.position.set(0, 3.1, -0.25); ic.scale.z = 0.75; g.add(ic);
    const SC = ['#ffd23f', '#7fe8ff', '#ffffff', '#7dff9a', '#e5383b'];
    for (let i = 0; i < 26; i++) { const a = i * 0.24, r = 1.6 + (i % 3) * 0.35; const s = box(g, 0.1, 0.1, 0.35, SC[i % 5], Math.cos(a) * r, 3.1 + Math.sin(a) * r, -0.95); s.rotation.z = a * 3; }
    box(g, 1.2, 1.0, 0.6, '#c98a4b', 0, 0, 0.6); door(g, 0, 0, 0.92, 0.7, 1.0, '#6b4226');
    win(g, -2.0, 3.1, 0.95, 0.3); win(g, 2.0, 3.1, 0.95, 0.3); win(g, 0, 5.1, 0.9, 0.28);
    return 6.2;
  },
  khinkali(g) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 12), M('#f4ecd8')); b.scale.set(1, 0.8, 1); b.position.y = 1.9; g.add(b);
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; const p = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.4, 5), M('#efe4c8')); p.position.set(Math.cos(a) * 0.55, 4.1, Math.sin(a) * 0.55); p.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35); g.add(p); }
    cyl(g, 0.45, 0.6, 1.0, '#e8dcc0', 0, 4.4, 0, 10); door(g, 0, 0.3, 2.3, 0.7, 1.1, '#8a5a35'); win(g, -1.1, 2.3, 2.05, 0.25); win(g, 1.1, 2.3, 2.05, 0.25);
    return 5.6;
  },
  flyhouse(g) {
    const h = new THREE.Group(); h.position.y = 2.6; g.add(h);
    box(h, 3.0, 2.2, 2.8, '#f2c6a0'); windows(h, 3.0, 2.2, 2.8, 0, 0, 0, 1, 2, { skipDoor: true }); door(h, 0, 0, 1.41, 0.6, 1.1); gable(h, 3.0, 2.8, 1.3, '#4a7fd6', 0, 2.2, 0);
    const BC = ['#e5383b', '#ffd23f', '#4a5df5', '#7dff9a', '#ff7fc8', '#ffffff', '#ff9a3c'];
    for (let i = 0; i < 14; i++) { const a = i * 2.4, r = 0.4 + (i % 4) * 0.45; const x = Math.cos(a) * r, z = Math.sin(a) * r, y = 6.3 + (i % 3) * 0.7; sph(h, 0.55, BC[i % 7], x, y, z, undefined, 10, 8); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, y - 3.4, 3), M('#ffffff')); st.position.set(x / 2, (y + 3.4) / 2, z / 2); st.rotation.set(z * 0.06, 0, -x * 0.06); h.add(st); }
    const sh = new THREE.Mesh(new THREE.CircleGeometry(1.6, 18).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.25 })); sh.position.y = 0.02; g.add(sh);
    g.userData.float = h; return 10.0;
  },
  chips(g) {
    const bag = new THREE.Mesh(new THREE.BoxGeometry(3.6, 5.2, 1.8, 4, 6, 2), M('#ffcf33')); const p = bag.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i), z = p.getZ(i); const k = 1 - Math.pow(Math.abs(y) / 2.6, 3); p.setZ(i, z * (0.25 + 0.75 * k)); } bag.geometry.computeVertexNormals(); bag.position.y = 2.6; g.add(bag);
    box(g, 3.7, 0.3, 0.5, '#e5383b', 0, 4.95, 0); box(g, 3.7, 0.3, 0.5, '#e5383b', 0, 0.05, 0);
    const lb = box(g, 2.6, 1.2, 0.05, '#e5383b', 0, 3.0, 0.92); const ch = sph(g, 0.5, '#f4c06a', 0, 2.2, 0.95); ch.scale.set(1.3, 0.8, 0.2);
    door(g, 0, 0.3, 0.95, 0.7, 1.1, '#b8860b'); win(g, -1.1, 2.1, 0.94, 0.25); win(g, 1.1, 2.1, 0.94, 0.25);
    for (let i = 0; i < 5; i++) { const c = sph(g, 0.4, '#f4c06a', -1.5 + i * 0.75, 5.4 + (i % 2) * 0.3, 0); c.scale.set(1.2, 0.35, 1); c.rotation.z = i; }
    return 5.8;
  },
  crownhouse(g) {
    const G = M('#f2c14e', { emissive: '#c98a10', emissiveIntensity: 0.35 });
    cyl(g, 2.4, 2.4, 2.4, null, 0, 0, 0, 16, G);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; cone(g, 0.7, 2.2, null, Math.cos(a) * 2.0, 2.4, Math.sin(a) * 2.0, 6, G); sph(g, 0.25, null, Math.cos(a) * 2.0, 4.7, Math.sin(a) * 2.0, M('#ff4d6d', { emissive: '#ff2040', emissiveIntensity: 0.6 }), 8, 6); }
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.4; sph(g, 0.22, null, Math.cos(a) * 2.42, 1.3, Math.sin(a) * 2.42, M(i % 2 ? '#4a5df5' : '#7dff9a', { emissive: i % 2 ? '#2030c0' : '#30c060', emissiveIntensity: 0.6 }), 8, 6); }
    box(g, 4.8, 0.2, 4.8, '#c99a2e', 0, 2.4, 0).scale.set(0.001, 1, 0.001);
    door(g, 0, 0, 2.42, 0.8, 1.3, '#8a5a10'); return 5.0;
  },
  guitar(g) {
    const body = '#c9692e';
    const b1 = cyl(g, 2.2, 2.2, 1.2, body, 0, 0, 0, 24); b1.rotation.x = Math.PI / 2; b1.position.set(0, 2.2, 0);
    const b2 = cyl(g, 1.6, 1.6, 1.2, body, 0, 0, 0, 24); b2.rotation.x = Math.PI / 2; b2.position.set(0, 5.0, 0);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.75, 20), WIN()); hole.position.set(0, 3.5, 0.62); g.add(hole);
    box(g, 0.7, 6.0, 0.4, '#5a3622', 0, 6.0, 0); box(g, 1.0, 1.4, 0.45, '#2b1f3d', 0, 11.6, 0);
    for (let i = 0; i < 6; i++) box(g, 0.03, 9.2, 0.03, '#eeeeee', -0.25 + i * 0.1, 2.0, 0.66);
    for (let i = 0; i < 3; i++) for (const s of [-1, 1]) { const p = cyl(g, 0.1, 0.1, 0.4, '#ddd', s * 0.6, 11.9 + i * 0.4, 0, 6); p.rotation.z = Math.PI / 2; }
    door(g, 0, 0.6, 0.62, 0.7, 1.0, '#5a3622'); return 13.0;
  },
  mug(g) {
    cyl(g, 2.0, 1.8, 4.2, '#ffffff', 0, 0, 0, 20); const top = new THREE.Mesh(new THREE.CircleGeometry(1.9, 20).rotateX(-Math.PI / 2), M('#3a1a0e')); top.position.y = 4.0; g.add(top);
    const h = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.3, 8, 16, Math.PI), M('#ffffff')); h.rotation.z = -Math.PI / 2; h.position.set(2.0, 2.2, 0); g.add(h);
    box(g, 4.05, 0.9, 0.05, '#e5383b', 0, 2.4, 1.85).scale.set(0.8, 1, 1); for (let i = 0; i < 6; i++) sph(g, 0.12, '#ffffff', -1 + i * 0.4, 4.05, (i % 2) * 0.5, undefined, 6, 4);
    door(g, 0, 0, 1.92, 0.7, 1.2, '#b22222'); win(g, -1.0, 3.3, 1.75, 0.25); return 4.6;
  },
  ufo(g) {
    const u = new THREE.Group(); u.position.y = 1.4; g.add(u);
    const d = new THREE.Mesh(new THREE.SphereGeometry(3.0, 24, 10), M('#b8c4d6')); d.scale.y = 0.28; u.add(d);
    const c = new THREE.Mesh(new THREE.SphereGeometry(1.4, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), M('#7fe8ff', { emissive: '#3ab0d0', emissiveIntensity: 0.6 })); c.position.y = 0.5; u.add(c);
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; sph(u, 0.18, null, Math.cos(a) * 2.6, 0.05, Math.sin(a) * 2.6, M(i % 2 ? '#7dff9a' : '#ffd23f', { emissive: i % 2 ? '#30ff60' : '#ffb000', emissiveIntensity: 1 }), 6, 4); }
    for (const a of [0, 2.1, 4.2]) { const l = cyl(g, 0.08, 0.12, 1.5, '#7a8494', Math.cos(a) * 1.6, 0, Math.sin(a) * 1.6, 6); l.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3); }
    box(g, 0.8, 1.2, 0.2, '#7a8494', 0, 0, 1.6).rotation.x = 0.6; return 3.5;
  },
});
