import * as THREE from './three.module.js';
import { M, box, cyl, sph, cone, gable, windows, door, BUILD, WIN } from './builders.js';

const win = (g, x, y, z, r = 0.28, ry = 0) => { const w = new THREE.Mesh(new THREE.CircleGeometry(r, 12), WIN()); w.position.set(x, y, z); w.rotation.y = ry; g.add(w); return w; };

Object.assign(BUILD, {
  capybara(g) {
    const fur = '#a8754a', dark = '#6b4526';
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(1.6, 2.6, 6, 12), M(fur)); b.rotation.x = Math.PI / 2; b.position.set(0, 2.0, -0.2); g.add(b);
    const h = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.9, 2.2), M(fur)); h.position.set(0, 3.0, 2.2); g.add(h);
    box(g, 1.7, 0.9, 0.6, dark, 0, 2.2, 3.3);
    for (const x of [-0.6, 0.6]) { sph(g, 0.2, '#1a1a1a', x, 3.5, 3.31, undefined, 8, 6); sph(g, 0.28, dark, x * 1.3, 4.0, 1.7, undefined, 8, 6); }
    for (const [x, z] of [[-1, 1.4], [1, 1.4], [-1, -1.8], [1, -1.8]]) box(g, 0.6, 0.9, 0.6, dark, x, 0, z);
    const o = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 8), M('#ff9f2a', { emissive: '#ff7a00', emissiveIntensity: 0.4 })); o.position.set(0, 4.25, 2.2); g.add(o);
    door(g, 1.62, 0.5, 0, 0.7, 1.1); g.children[g.children.length - 1].rotation.y = Math.PI / 2;
    win(g, 1.62, 2.4, -0.8, 0.3, Math.PI / 2);
    return 4.8;
  },
  shark(g) {
    const grey = '#6f8fa8', white = '#eef3f6';
    const b = new THREE.Mesh(new THREE.SphereGeometry(1.7, 16, 12), M(grey)); b.scale.set(1, 1, 2.4); b.position.y = 2.0; g.add(b);
    const belly = new THREE.Mesh(new THREE.SphereGeometry(1.5, 14, 10), M(white)); belly.scale.set(0.95, 0.6, 2.2); belly.position.set(0, 1.25, 0.2); g.add(belly);
    const fin = cone(g, 0.9, 2.2, grey, 0, 3.4, -0.4, 4); fin.scale.z = 0.35; fin.rotation.x = -0.3;
    const tail = cone(g, 1.0, 2.2, grey, 0, 2.2, -4.6, 4); tail.rotation.x = -Math.PI / 2; tail.scale.x = 0.25;
    for (const s of [-1, 1]) { const p = cone(g, 0.5, 1.8, grey, s * 1.7, 1.3, 0.8, 4); p.rotation.z = s * 1.7; p.scale.x = 0.3; sph(g, 0.18, '#111', s * 0.9, 2.6, 3.3, undefined, 8, 6); }
    for (let i = -3; i <= 3; i++) cone(g, 0.12, 0.35, '#ffffff', i * 0.22, 1.55, 3.85 - Math.abs(i) * 0.08, 4).rotation.x = Math.PI;
    door(g, 1.68, 0.6, 0.2, 0.6, 1.0); g.children[g.children.length - 1].rotation.y = Math.PI / 2;
    win(g, 1.6, 2.4, -1.4, 0.3, Math.PI / 2);
    return 4.6;
  },
  watermelon(g) {
    const tex = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#3e9a3a'; x.fillRect(0, 0, 256, 128); x.fillStyle = '#1f5e22'; for (let i = 0; i < 256; i += 32) { x.beginPath(); x.moveTo(i, 0); for (let y = 0; y <= 128; y += 8) x.lineTo(i + 8 * Math.sin(y / 9), y); x.lineTo(i + 12, 128); x.lineTo(i + 12, 0); x.fill(); } return new THREE.CanvasTexture(c); })();
    const w = new THREE.Mesh(new THREE.SphereGeometry(2.5, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2 + 0.6), new THREE.MeshLambertMaterial({ map: tex })); w.position.y = 1.6; g.add(w);
    const cut = new THREE.Mesh(new THREE.CircleGeometry(2.45, 20), M('#ff4d5e')); cut.rotation.x = Math.PI / 2 - 0.6; cut.position.set(0, 3.5, 1.2); cut.rotation.x = -Math.PI / 2 + 0.55; g.add(cut);
    for (let i = 0; i < 9; i++) sph(g, 0.1, '#1a1a1a', Math.cos(i * 0.7) * (0.6 + (i % 3) * 0.5), 3.6 + Math.sin(i) * 0.3, 1.0 + Math.sin(i * 0.7) * 0.6, undefined, 4, 3);
    door(g, 0, 0, 2.3, 0.7, 1.2); win(g, -1.3, 1.9, 2.0, 0.28, -0.6); win(g, 1.3, 1.9, 2.0, 0.28, 0.6);
    return 4.4;
  },
  pizza(g) {
    cyl(g, 2.9, 2.9, 0.6, '#e8b45a', 0, 0, 0, 24); cyl(g, 2.6, 2.6, 0.2, '#e5383b', 0, 0.6, 0, 24); cyl(g, 2.5, 2.5, 0.12, '#ffe08a', 0, 0.78, 0, 24);
    for (let i = 0; i < 9; i++) cyl(g, 0.35, 0.35, 0.12, '#b8323a', Math.cos(i * 0.7) * (0.8 + (i % 3) * 0.55), 0.88, Math.sin(i * 0.7) * (0.8 + (i % 3) * 0.55), 12);
    for (let i = 0; i < 6; i++) box(g, 0.25, 0.1, 0.25, '#3f9a3a', Math.cos(i * 1.1 + 0.3) * 1.6, 0.9, Math.sin(i * 1.1 + 0.3) * 1.6);
    // small house standing on the pizza
    box(g, 2.2, 1.8, 1.8, '#f2e3c6', 0, 0.9, -0.2); gable(g, 2.2, 1.8, 1.0, '#e5383b', 0, 2.7, -0.2); door(g, 0, 0.9, 0.71, 0.55, 0.95); win(g, 0.7, 2.0, 0.71, 0.22);
    return 3.8;
  },
  pelmen(g) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(2.3, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), M('#f6ead2')); d.scale.set(1.25, 1.15, 1); g.add(d);
    const ridge = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.35, 8, 24, Math.PI), M('#efdcb8')); ridge.scale.set(1.25, 1.15, 1); g.add(ridge);
    for (let i = 0; i < 8; i++) { const a = 0.25 + i * 0.37; sph(g, 0.3, '#efdcb8', Math.cos(a) * 2.75, Math.sin(a) * 2.5, 0, undefined, 6, 4); }
    sph(g, 0.4, '#ffffff', 0.8, 2.4, 1.1, undefined, 6, 4); cyl(g, 0.05, 0.05, 0.5, '#3f9a3a', -0.5, 2.5, 1.0, 6);
    door(g, 0, 0, 2.2, 0.7, 1.1); win(g, -1.4, 1.2, 1.75, 0.25, -0.6); win(g, 1.4, 1.2, 1.75, 0.25, 0.6);
    return 3.0;
  },
  cheburek(g) {
    box(g, 4.4, 2.6, 3.2, '#f2d9a8'); windows(g, 4.4, 2.6, 3.2, 0, 0, 0, 1, 3, { skipDoor: true }); door(g, 0, 0, 1.6);
    box(g, 4.8, 0.4, 3.6, '#c0632e', 0, 2.6);
    for (let i = 0; i < 5; i++) box(g, 0.9, 0.1, 1.2, i % 2 ? '#e5383b' : '#ffffff', -1.8 + i * 0.9, 2.2, 2.0).rotation.x = 0.4;
    // giant cheburek on the roof
    const c = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 8, 0, Math.PI), M('#e8b45a')); c.rotation.z = Math.PI / 2; c.scale.set(1, 1.6, 0.4); c.position.set(0, 3.0, 0); c.rotation.set(0, 0, 0); c.rotation.x = -Math.PI / 2; c.scale.set(1.6, 1, 0.5); c.position.set(0, 3.0, 0); g.add(c);
    for (let i = 0; i < 7; i++) sph(g, 0.16, '#c98a3a', -2.2 + i * 0.73, 3.02, 0.05, undefined, 6, 4);
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const x = cv.getContext('2d'); x.fillStyle = '#2b1f3d'; x.fillRect(0, 0, 512, 96); x.fillStyle = '#ffd23f'; x.font = '900 64px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ЧЕБУРЕКИ', 256, 52);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.7), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv) })); sg.position.set(0, 2.35, 1.62); g.add(sg);
    return 4.6;
  },
  ferris(g) {
    for (const s of [-1, 1]) { const l1 = box(g, 0.3, 6.5, 0.3, '#cfc4b0', s * 1.6, 0, 0.9); l1.rotation.z = s * 0.25; const l2 = box(g, 0.3, 6.5, 0.3, '#cfc4b0', s * 1.6, 0, -0.9); l2.rotation.z = s * 0.25; }
    const wheel = new THREE.Group(); wheel.position.set(0, 6.0, 0); g.add(wheel);
    wheel.add(new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.12, 6, 32), M('#ff7fc8', { emissive: '#ff4fa8', emissiveIntensity: 0.5 })));
    const cols = ['#ffd23f', '#7fe8ff', '#ff6b6b', '#8dff6a', '#c9a6ff', '#ff9f43', '#ffffff', '#5cc8ff'];
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; const sp = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.2, 0.08), M('#ffffff')); sp.position.set(Math.cos(a) * 2.1, Math.sin(a) * 2.1, 0); sp.rotation.z = a - Math.PI / 2; wheel.add(sp);
      const cab = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.9), M(cols[i], { emissive: cols[i], emissiveIntensity: 0.25 })); cab.position.set(Math.cos(a) * 4.2, Math.sin(a) * 4.2 - 0.5, 0); cab.userData.a = a; wheel.add(cab); }
    sph(wheel, 0.5, '#ffd23f', 0, 0, 0, M('#ffd23f', { emissive: '#ffb000', emissiveIntensity: 0.8 }), 10, 8);
    g.userData.wheel = wheel; g.rotation.y = Math.PI / 2;
    return 10.8;
  },
  pumpkin(g) {
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; const s = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 10), M('#ff8a1e')); s.scale.set(0.8, 1.2, 0.8); s.position.set(Math.cos(a) * 1.25, 1.75, Math.sin(a) * 1.25); g.add(s); }
    sph(g, 1.6, '#ff9a2e', 0, 1.8, 0, undefined, 12, 10); cyl(g, 0.2, 0.3, 1.0, '#3f7a35', 0, 3.4, 0, 6);
    door(g, 0, 0.1, 2.2, 0.7, 1.2); win(g, -0.9, 2.3, 2.0, 0.3, -0.4); win(g, 0.9, 2.3, 2.0, 0.3, 0.4);
    return 4.4;
  },
  hotdog(g) {
    const bun = new THREE.Mesh(new THREE.CapsuleGeometry(1.2, 3.4, 6, 12), M('#e8b45a')); bun.rotation.z = Math.PI / 2; bun.scale.set(1, 1, 1.5); bun.position.y = 1.2; g.add(bun);
    const s = new THREE.Mesh(new THREE.CapsuleGeometry(0.75, 4.4, 6, 12), M('#c0442e')); s.rotation.z = Math.PI / 2; s.position.y = 2.4; g.add(s);
    for (let i = 0; i < 9; i++) sph(g, 0.16, '#ffd23f', -2 + i * 0.5, 3.1 + Math.sin(i * 1.5) * 0.12, Math.sin(i * 1.5) * 0.25, undefined, 6, 4);
    door(g, 0, 0.2, 1.75, 0.6, 1.0); win(g, -1.5, 1.2, 1.7, 0.25); win(g, 1.5, 1.2, 1.7, 0.25);
    return 3.6;
  },
  burger(g) {
    cyl(g, 2.3, 2.1, 0.8, '#d99a48', 0, 0, 0, 20); cyl(g, 2.5, 2.5, 0.25, '#4fae3a', 0, 0.8, 0, 20); cyl(g, 2.3, 2.3, 0.9, '#6b3a1e', 0, 1.0, 0, 20); cyl(g, 2.45, 2.45, 0.18, '#ffd23f', 0, 1.9, 0, 4);
    cyl(g, 2.2, 2.2, 0.3, '#e5383b', 0, 2.08, 0, 20);
    const top = new THREE.Mesh(new THREE.SphereGeometry(2.4, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), M('#e3a24e')); top.scale.y = 0.75; top.position.y = 2.35; g.add(top);
    for (let i = 0; i < 12; i++) sph(g, 0.1, '#fff6d8', Math.cos(i * 1.7) * (0.6 + (i % 3) * 0.5), 3.8 - (i % 3) * 0.25, Math.sin(i * 1.7) * (0.6 + (i % 3) * 0.5), undefined, 4, 3);
    door(g, 0, 0.9, 2.28, 0.6, 0.9, '#3a1e0e'); win(g, 1.2, 1.5, 1.95, 0.22, 0.6);
    return 4.2;
  },
  pinkcastle(g) {
    const C = '#ffc4dc', R = '#ff5fa2';
    box(g, 4.2, 2.4, 3.6, C); windows(g, 4.2, 2.4, 3.6, 0, 0, 0, 1, 3, { skipDoor: true }); door(g, 0, 0, 1.8, 0.9, 1.4, '#a8326a');
    box(g, 2.2, 2.6, 2.0, C, 0, 2.4, -0.4); windows(g, 2.2, 2.6, 2.0, 0, 2.4, -0.4, 1, 2);
    for (const [x, z] of [[-2.1, 1.8], [2.1, 1.8], [-2.1, -1.8], [2.1, -1.8]]) { cyl(g, 0.65, 0.7, 3.9, C, x, 0, z, 10); cone(g, 0.85, 1.8, R, x, 3.9, z, 10); }
    cone(g, 1.3, 2.2, R, 0, 5.0, -0.4, 10);
    for (let i = 0; i < 6; i++) sph(g, 0.14, '#ffffff', Math.cos(i) * 2.3, 0.3 + (i % 2) * 0.2, 2.0 + Math.sin(i) * 0.2, M('#ffffff', { emissive: '#ffd6ea', emissiveIntensity: 0.6 }), 6, 4);
    return 7.4;
  },
});
