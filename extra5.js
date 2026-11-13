// v6 builders: ship, flower, fridge, upside-down house
import * as THREE from './three.module.js';
import { M, box, cyl, sph, cone, gable, windows, door, BUILD, WIN } from './builders.js';
const win = (g, x, y, z, r = 0.28, ry = 0) => { const w = new THREE.Mesh(new THREE.CircleGeometry(r, 12), WIN()); w.position.set(x, y, z); w.rotation.y = ry; g.add(w); return w; };
Object.assign(BUILD, {
  airfryer(g) {
    // body: rounded black air fryer, like the reference photo
    const body = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.45, 4.2, 28), M('#3a3a40')); body.scale.set(1, 1, 0.82); body.position.y = 2.1; g.add(body);
    const top = new THREE.Mesh(new THREE.SphereGeometry(2.3, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2), M('#1f1f22')); top.scale.set(1, 0.32, 0.82); top.position.y = 4.2; g.add(top);
    // control panel + display + silver knob
    const pan = box(g, 2.6, 0.08, 1.0, '#141416', 0, 4.55, 0.95); pan.rotation.x = -0.35;
    const disp = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.42), M('#7fd3ff', { emissive: '#3fa8e0', emissiveIntensity: 1 })); disp.position.set(0, 4.82, 0.55); disp.rotation.x = -1.2; g.add(disp);
    cyl(g, 0.34, 0.38, 0.28, '#c9ced6', 0, 4.6, 1.2, 18); cyl(g, 0.14, 0.14, 0.12, '#8a9099', 0, 4.88, 1.2, 10);
    for (let i = 0; i < 8; i++) { const a = -0.9 + i * 0.26; sph(g, 0.06, null, Math.sin(a) * 0.95, 4.62, 1.2 + Math.cos(a) * 0.25, M('#ff5a3c', { emissive: '#ff5a3c', emissiveIntensity: 1 }), 6, 4); }
    // basket drawer pulled out, with fries
    box(g, 3.4, 2.0, 1.6, '#232326', 0, 0.35, 1.85);
    box(g, 3.0, 0.08, 1.3, '#3a3a3e', 0, 2.36, 1.85);
    const FR = ['#e8a33d', '#d98a2b', '#f0b54a'];
    for (let i = 0; i < 22; i++) { const f = box(g, 0.16, 0.16, 0.9, FR[i % 3], -1.3 + (i % 8) * 0.37, 2.4 + Math.floor(i / 8) * 0.12, 1.85 + ((i * 7) % 5 - 2) * 0.12); f.rotation.y = (i * 1.7) % 1.2 - 0.6; f.rotation.z = (i % 3 - 1) * 0.2; }
    // silver handle
    box(g, 0.55, 0.22, 0.9, '#b8bec7', 0, 1.9, 3.05); box(g, 0.55, 1.9, 0.25, '#c9ced6', 0, 0.2, 3.45);
    // it is a house: door + round windows on the sides, chimney steam
    door(g, 1.55, 0, 1.4, 0.75, 1.5, '#c9ced6');
    for (const s of [-1, 1]) { win(g, s * 2.32, 2.8, 0, 0.32, s * Math.PI / 2); win(g, s * 2.2, 2.8, -0.9, 0.26, s * Math.PI / 2); }
    for (let i = 0; i < 3; i++) { const p = sph(g, 0.35 + i * 0.12, null, -0.8 + i * 0.25, 5.2 + i * 0.55, -0.6, M('#ffffff', { transparent: true, opacity: 0.55 }), 8, 6); }
    return 5.4;
  },

  ship(g) {
    const hull = '#2f4a7a', deck = '#c9a06a';
    const sh = new THREE.Shape(); sh.moveTo(-2.6, 1.4); sh.lineTo(2.9, 1.4); sh.quadraticCurveTo(2.6, 0.2, 1.6, 0); sh.lineTo(-2.2, 0); sh.quadraticCurveTo(-2.6, 0.4, -2.6, 1.4);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 2.6, bevelEnabled: false }); geo.translate(0, 0, -1.3); const m = new THREE.Mesh(geo, M(hull)); m.rotation.y = Math.PI / 2; g.add(m);
    box(g, 2.5, 0.12, 5.2, deck, 0, 1.4, 0.1); box(g, 2.6, 0.18, 5.4, '#e8e2d4', 0, 1.0, 0.1);
    box(g, 1.8, 1.4, 2.0, '#f4f1ea', 0, 1.52, -0.6); box(g, 2.0, 0.15, 2.2, '#c0392b', 0, 2.92, -0.6);
    win(g, -0.45, 2.3, 0.42, 0.22); win(g, 0.45, 2.3, 0.42, 0.22); door(g, 0, 1.52, 0.41, 0.55, 0.95, '#7a3b2e');
    cyl(g, 0.08, 0.1, 3.6, '#5a3622', 0, 1.5, 1.2, 8);
    const sail = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.2), M('#fffaf0')); sail.position.set(0, 3.6, 1.25); sail.rotation.y = Math.PI / 2; sail.material.side = THREE.DoubleSide; g.add(sail);
    box(g, 0.6, 0.35, 0.03, '#e5383b', 0.3, 4.9, 1.2);
    for (let i = -1; i <= 1; i++) win(g, 1.31, 0.75, i * 1.2, 0.18, Math.PI / 2);
    return 5.3;
  },
  flower(g) {
    cyl(g, 0.35, 0.45, 2.6, '#3f8f3a', 0, 0, 0, 10);
    for (const s of [-1, 1]) { const lf = sph(g, 0.7, '#5aa84a', s * 0.8, 1.2, 0); lf.scale.set(1.3, 0.25, 0.6); lf.rotation.z = s * 0.4; }
    const pc = '#f48fb1';
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const p = sph(g, 1.05, pc, Math.cos(a) * 1.5, 3.6 + Math.sin(a) * 1.5, 0.05); p.scale.set(1, 1, 0.35); }
    const c = cyl(g, 1.25, 1.25, 1.1, '#ffd54a', 0, 3.05, 0, 20); c.rotation.x = Math.PI / 2; c.position.set(0, 3.6, 0);
    door(g, 0, 3.05, 0.58, 0.55, 0.85, '#8a5a2a'); win(g, -0.55, 4.05, 0.57, 0.18); win(g, 0.55, 4.05, 0.57, 0.18);
    return 5.4;
  },
  fridge(g) {
    box(g, 2.8, 4.6, 2.4, '#eef2f5', 0, 0, 0); box(g, 2.82, 0.06, 2.42, '#b8c2cc', 0, 2.9, 0);
    box(g, 0.12, 0.9, 0.15, '#9aa4ae', 1.05, 3.3, 1.25); box(g, 0.12, 1.2, 0.15, '#9aa4ae', 1.05, 1.4, 1.25);
    door(g, -0.4, 0, 1.2, 0.8, 1.4, '#7a8a9a'); win(g, -0.4, 3.8, 1.21, 0.3); win(g, 0.4, 2.0, 1.21, 0.26);
    box(g, 0.5, 0.5, 0.04, '#e5383b', -0.6, 2.3, 1.21); box(g, 0.45, 0.35, 0.04, '#ffcf40', 0.2, 3.4, 1.21);
    return 4.8;
  },
  upside(g) {
    const W = '#e7c9a0', R = '#9a3b2e';
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.8, 4), M(R)); roof.rotation.x = Math.PI; roof.rotation.y = Math.PI / 4; roof.position.y = 0.9; g.add(roof);
    box(g, 3.4, 2.6, 3.4, W, 0, 1.75, 0); box(g, 3.6, 0.2, 3.6, '#7a5a3a', 0, 4.35, 0);
    const d = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.2), M('#7a3b2e')); d.position.set(0, 3.6, 1.71); d.rotation.z = Math.PI; g.add(d);
    win(g, -0.9, 2.5, 1.71, 0.3); win(g, 0.9, 2.5, 1.71, 0.3);
    cyl(g, 0.2, 0.2, 0.9, '#8a8a8a', 0.9, 4.55, -0.8, 8);
    return 5.6;
  },
});
