// =====================================================================
//  Мини-игра «Нашествие зомби» — тапай по зомби, пока они не разрушили дома
// =====================================================================
export function createGame(ctx) {
  const { THREE, scene, camera, cam, houses, flyTo, proj, buildHouse, hideObj, showObj, IG, SITE, clamp, closeAll } = ctx;
  const $ = (s) => document.querySelector(s);
  const DUR = 60, LIVES = 3;
  const G = { on: false };
  let zs = [], fx = [], stolen = [], targets = [], center = null, st = null, ui = null, audio = null;

  // ---------- assets: zombies ----------
  const SKIN = ['#8fbf6a', '#7fb069', '#9ac77a', '#88b38a'].map(c => new THREE.MeshLambertMaterial({ color: c, flatShading: true }));
  const SHIRT = ['#5b6b8a', '#8a5b5b', '#6b7d5a', '#7a6a8f', '#a08a5a'].map(c => new THREE.MeshLambertMaterial({ color: c, flatShading: true }));
  const mPants = new THREE.MeshLambertMaterial({ color: '#3a3f4b', flatShading: true });
  const mBossSkin = new THREE.MeshLambertMaterial({ color: '#6c9a4a', flatShading: true }), mBossShirt = new THREE.MeshLambertMaterial({ color: '#7a1f2b', flatShading: true });
  const mEye = new THREE.MeshBasicMaterial({ color: '#ff2a2a' }), mMouth = new THREE.MeshBasicMaterial({ color: '#2a0d0d' });
  const mShadow = new THREE.MeshBasicMaterial({ color: '#b6ff3a', transparent: true, opacity: 0.55, depthWrite: false });
  const gB = (w, h, d, py = 0) => new THREE.BoxGeometry(w, h, d).translate(0, py, 0);
  const gLeg = gB(0.42, 1.3, 0.42, -0.65), gBody = gB(1.15, 1.4, 0.6), gArm = gB(0.32, 0.32, 1.25, 0).translate(0, 0, 0.62), gHead = gB(0.85, 0.85, 0.8), gEye = gB(0.16, 0.12, 0.05), gMouth = gB(0.4, 0.1, 0.05), gSh = new THREE.RingGeometry(0.7, 1.05, 18).rotateX(-Math.PI / 2);
  const gBit = new THREE.BoxGeometry(0.6, 0.6, 0.6), gBoom = new THREE.SphereGeometry(1, 14, 10);
  const mBoom = new THREE.MeshBasicMaterial({ color: '#b6ff5a', transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending });
  const mBit = [new THREE.MeshBasicMaterial({ color: '#7fd34a' }), new THREE.MeshBasicMaterial({ color: '#4e8a2e' }), new THREE.MeshBasicMaterial({ color: '#c9b38a' })];
  const mDust = new THREE.MeshBasicMaterial({ color: '#c9b9a0', transparent: true, opacity: 0.7, depthWrite: false });

  function mkZombie(boss) {
    const g = new THREE.Group(); const s = boss ? 4.6 : 3.0; g.scale.setScalar(s);
    const skin = boss ? mBossSkin : SKIN[Math.floor(Math.random() * SKIN.length)], shirt = boss ? mBossShirt : SHIRT[Math.floor(Math.random() * SHIRT.length)];
    const sh = new THREE.Mesh(gSh, mShadow); sh.position.y = 0.03; g.add(sh);
    const legs = []; for (const x of [-0.27, 0.27]) { const l = new THREE.Mesh(gLeg, mPants); l.position.set(x, 1.3, 0); g.add(l); legs.push(l); }
    const body = new THREE.Mesh(gBody, shirt); body.position.y = 2.0; body.rotation.x = 0.18; g.add(body);
    const arms = []; for (const x of [-0.72, 0.72]) { const a = new THREE.Mesh(gArm, skin); a.position.set(x, 2.5, 0.1); a.rotation.x = -0.1; g.add(a); arms.push(a); }
    const head = new THREE.Mesh(gHead, skin); head.position.set(0, 3.15, 0.12); head.rotation.z = (Math.random() - 0.5) * 0.4; g.add(head);
    for (const x of [-0.2, 0.2]) { const e = new THREE.Mesh(gEye, mEye); e.position.set(x, 0.1, 0.41); head.add(e); }
    const mo = new THREE.Mesh(gMouth, mMouth); mo.position.set(0, -0.22, 0.41); head.add(mo);
    g.userData = { legs, arms, head, body };
    scene.add(g); return g;
  }
  function animZ(z, t, mode) {
    const u = z.g.userData;
    if (mode === 'walk') { const k = Math.sin(t * 7); u.legs[0].rotation.x = k * 0.55; u.legs[1].rotation.x = -k * 0.55; u.arms[0].rotation.x = -0.1 + k * 0.12; u.arms[1].rotation.x = -0.1 - k * 0.12; u.head.rotation.x = Math.sin(t * 3.5) * 0.15; z.g.children[0].position.y = 0.03; }
    else if (mode === 'eat') { const k = Math.sin(t * 16); u.arms[0].rotation.x = -0.6 + k * 0.5; u.arms[1].rotation.x = -0.6 - k * 0.5; u.legs[0].rotation.x = u.legs[1].rotation.x = 0; u.head.rotation.x = 0.3 + Math.abs(k) * 0.2; }
  }

  // ---------- sound ----------
  function beep(f0, f1, dur, type = 'square', vol = 0.06) {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)(); const t = audio.currentTime;
      const o = audio.createOscillator(), g = audio.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(audio.destination); o.start(t); o.stop(t + dur);
    } catch (e) {}
  }

  // ---------- UI ----------
  function buildUI() {
    if (ui) return ui;
    const d = document.createElement('div'); d.id = 'game';
    d.innerHTML = `<div class="gbar"><div class="glives" id="gL"></div><div class="gtime" id="gT">60</div><div class="gscore">🧟 <b id="gS">0</b></div><button class="gx" id="gX" aria-label="Выйти">✕</button></div>
      <div class="gmsg" id="gM"></div><div class="gflash" id="gF"></div><div id="gPop"></div>
      <button class="gshield" id="gSh">❤️ ЛАЙК-БОМБА<i>уничтожает всех зомби</i></button>`;
    document.body.appendChild(d);
    $('#gX').onclick = () => end(true);
    $('#gSh').onclick = (e) => { e.stopPropagation(); shield(); };
    ui = d; return d;
  }
  const best = () => { try { return +localStorage.getItem('domino_zombie_best') || 0; } catch (e) { return 0; } };
  const setBest = (v) => { try { localStorage.setItem('domino_zombie_best', String(v)); } catch (e) {} };

  G.intro = function () {
    closeAll();
    const c = ctx.getCenter();
    const m = $('#modal'); m.querySelector('.in').innerHTML = `<button class="x" aria-label="Закрыть">✕</button>
      <h2>🧟 Нашествие зомби!</h2><p>Зомби идут по улицам к домам жителей. <b>Тапай по зомби</b>, пока они не дошли до дома и не разломали его.${c ? ` Защищаем район @${c.nick}.` : ''}</p>
      <div class="step"><span>⏱</span><div><b>60 секунд, 3 жизни</b><i>Зомби разрушил дом — минус жизнь</i></div></div>
      <div class="step"><span>👹</span><div><b>Зомби-босс</b><i>Огромный, в красной рубашке — бей 4 раза</i></div></div>
      <div class="step"><span>❤️</span><div><b>Лайк-бомба</b><i>Один раз за игру уничтожает всех зомби</i></div></div>
      ${best() ? `<p>Твой рекорд: <b>${best()}</b> очков</p>` : ''}
      <div class="row"><button class="b1" id="gGo">Играть 🧟</button></div>`;
    m.classList.add('on'); m.querySelector('.x').onclick = () => m.classList.remove('on');
    $('#gGo').onclick = () => { m.classList.remove('on'); start(); };
  };

  function start() {
    buildUI(); document.body.classList.add('playing');
    const c = ctx.getCenter();
    center = c ? { x: c.x, z: c.z } : { x: -181, z: -117 };
    // fixed high top-down camera over a residential district
    cam.fly = null; cam.idle = false; cam.x = center.x; cam.z = center.z; cam.d = 115; cam.yaw = 0; ctx.markDirty();
    targets = []; G.needTargets = true;
    st = { t0: performance.now() + 2600, last: performance.now(), score: 0, kills: 0, lives: LIVES, combo: 0, nextSpawn: 0, nextBoss: 20, shield: 1, over: false, el: 0 };
    G.on = true; renderHud();
    msg('3'); setTimeout(() => msg('2'), 800); setTimeout(() => msg('1'), 1600); setTimeout(() => msg('ЗОМБИ ИДУТ!'), 2400); setTimeout(() => msg(''), 3300);
  }
  function msg(t) { const m = $('#gM'); m.textContent = t; m.classList.toggle('on', !!t); }
  function renderHud() {
    $('#gL').textContent = '❤️'.repeat(Math.max(0, st.lives)) + '🖤'.repeat(LIVES - Math.max(0, st.lives));
    const left = Math.max(0, DUR - st.el);
    $('#gT').textContent = Math.ceil(left); $('#gS').textContent = st.score;
    $('#gSh').disabled = !st.shield; $('#gSh').classList.toggle('used', !st.shield);
  }
  function pop(x, y, t, cls = '') { const e = document.createElement('div'); e.className = 'gp ' + cls; e.textContent = t; e.style.left = x + 'px'; e.style.top = y + 'px'; $('#gPop').appendChild(e); setTimeout(() => e.remove(), 900); }
  function flash(c) { const f = $('#gF'); f.style.background = c; f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); }

  function spawn(boss) {
    const free = targets.filter(h => !h._busy && !h._stolen); if (!free.length) return;
    const h = free[Math.floor(Math.random() * free.length)]; h._busy = true;
    const face = h.face || 1, rz = h.z + face * 8.5, side = Math.random() < 0.5 ? -1 : 1, L = 34 + Math.random() * 14;
    const g = mkZombie(boss);
    const sp = boss ? 0.75 : 1;
    const z = { g, h, boss, hp: boss ? 4 : 1, phase: 'road', t: 0, x: h.x + side * L, z: rz, rz, side, eat: boss ? 3.6 : clamp(3 - G.el() / 45, 1.7, 3), sp: (5.5 + G.el() / 12) * sp };
    g.position.set(z.x, 0.3, z.z); g.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; zs.push(z); beep(140, 90, 0.35, 'sawtooth', 0.025);
  }
  G.el = () => st.el;

  function boom(p, big) {
    const s = new THREE.Mesh(gBoom, mBoom.clone()); s.position.copy(p); s.position.y += 3; scene.add(s); fx.push({ m: s, t: 0, kind: 'boom', big });
    for (let i = 0; i < (big ? 26 : 14); i++) { const b = new THREE.Mesh(gBit, mBit[i % 3]); b.position.copy(p); b.position.y += 3; scene.add(b); fx.push({ m: b, t: 0, kind: 'bit', v: new THREE.Vector3((Math.random() - 0.5) * 24, Math.random() * 20, (Math.random() - 0.5) * 24) }); }
  }
  function kill(z, sx, sy) {
    z.phase = 'dead'; z.t = 0; z.h._busy = false; boom(z.g.position, z.boss); fx.push({ m: z.g, t: 0, kind: 'fall' });
    st.combo++; st.kills++; const pts = (z.boss ? 50 : 10) * (1 + Math.min(4, Math.floor(st.combo / 4)));
    st.score += pts; if (sx != null) pop(sx, sy, `+${pts}${st.combo >= 4 ? ' x' + (1 + Math.min(4, Math.floor(st.combo / 4))) : ''}`, z.boss ? 'big' : '');
    beep(z.boss ? 260 : 380, 60, z.boss ? 0.5 : 0.22, 'sawtooth', 0.05);
  }
  function wreck(z) {
    const h = z.h; h._stolen = true; h._busy = false; st.lives--; st.combo = 0;
    hideObj(h.obj); stolen.push(h);
    const c = buildHouse(h.type, h.nick); c.userData.inner.scale.copy(h.obj.userData.inner.scale); c.position.copy(h.obj.position); c.rotation.copy(h.obj.rotation); scene.add(c);
    fx.push({ m: c, t: 0, kind: 'collapse', y0: c.position.y, rx: (Math.random() - 0.5) * 0.5, rz: (Math.random() - 0.5) * 0.5 });
    for (let i = 0; i < 10; i++) { const d = new THREE.Mesh(gBoom, mDust.clone()); d.position.set(h.x + (Math.random() - 0.5) * 6, 1, h.z + (Math.random() - 0.5) * 6); scene.add(d); fx.push({ m: d, t: 0, kind: 'dust', s: 1.5 + Math.random() * 2 }); }
    z.phase = 'leave'; z.t = 0;
    flash('rgba(90,170,60,.45)'); beep(120, 40, 0.8, 'sawtooth', 0.07);
    const q = proj(h.x, h.y + 6, h.z); pop(q.x, q.y, `Зомби разрушили дом @${h.nick}!`, 'bad');
    if (navigator.vibrate) try { navigator.vibrate(150); } catch (e) {}
  }
  function shield() {
    if (!G.on || !st || !st.shield || st.t0 > performance.now()) return; st.shield = 0;
    flash('rgba(255,90,60,.35)'); beep(200, 1200, 0.5, 'sine', 0.06);
    for (const z of zs) if (z.phase === 'road' || z.phase === 'yard' || z.phase === 'eat') { z.hp = 0; const q = proj(z.g.position.x, z.g.position.y + 3, z.g.position.z); kill(z, q.x, q.y); }
    renderHud();
  }

  G.tap = function (sx, sy) {
    if (!st || st.over) return;
    let best = null, bd = 1e9;
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    for (const z of zs) {
      if (z.phase !== 'road' && z.phase !== 'yard' && z.phase !== 'eat') continue;
      const sc = z.g.scale.x, p = z.g.position, q = proj(p.x, p.y + 2 * sc, p.z); if (!q.ok) continue;
      const r = 1.6 * sc; const e = proj(p.x + right.x * r, p.y + 2 * sc + right.y * r, p.z + right.z * r);
      const rp = Math.max(44, Math.hypot(e.x - q.x, e.y - q.y) * 1.3 + 14); const d = Math.hypot(q.x - sx, q.y - sy);
      if (d < rp && d / rp < bd) { bd = d / rp; best = { u: z, q }; }
    }
    if (best) {
      const { u, q } = best; u.hp--;
      if (u.hp <= 0) kill(u, q.x, q.y); else { pop(q.x, q.y, '💥', 'big'); beep(300, 120, 0.12, 'square', 0.04); u.knock = 0.25; }
    } else { st.combo = 0; beep(180, 120, 0.08, 'square', 0.02); }
    renderHud();
  };

  G.update = function (now) {
    if (!st) return;
    if (G.needTargets && now > st.t0 - 2000) {   // houses actually visible on screen (away from the HUD and the shield button)
      G.needTargets = false;
      targets = houses.filter(h => { if (h.palace) return false; const q = proj(h.x, h.y + 4, h.z); return q.ok && q.x > 50 && q.x < innerWidth - 50 && q.y > 150 && q.y < innerHeight - 170; });
      if (targets.length < 8) targets = houses.slice().sort((a, b) => Math.hypot(a.x - center.x, a.z - center.z) - Math.hypot(b.x - center.x, b.z - center.z)).filter(h => !h.palace).slice(0, 40);
    }
    const dt = Math.min(0.05, (now - st.last) / 1000); st.last = now;
    if (now >= st.t0 && !st.over) st.el += dt;
    const el = st.el;
    if (!st.over && now >= st.t0) {
      if (el >= st.nextSpawn) { const maxU = Math.floor(3 + el / 9); if (zs.filter(z => z.phase === 'road' || z.phase === 'yard' || z.phase === 'eat').length < maxU) spawn(false); st.nextSpawn = el + clamp(1.4 - el / 55, 0.45, 1.4) * (0.7 + Math.random() * 0.6); }
      if (el >= st.nextBoss) { spawn(true); st.nextBoss += 18; }
      if (el >= DUR || st.lives <= 0) end(false);
    }
    for (const z of zs) {
      z.t += dt; const g = z.g;
      let sp = z.sp; if (z.knock > 0) { z.knock -= dt; sp = -6; }
      if (z.phase === 'road') {
        animZ(z, z.t, 'walk'); const dx = z.h.x - g.position.x; const step = Math.min(Math.abs(dx), Math.max(-Math.abs(dx), sp * dt));
        g.position.x += Math.sign(dx) * step; g.rotation.y = dx > 0 ? Math.PI / 2 : -Math.PI / 2;
        if (Math.abs(dx) < 0.3) { z.phase = 'yard'; z.t = 0; }
      } else if (z.phase === 'yard') {
        animZ(z, z.t, 'walk'); const tz = z.h.z + (z.h.face || 1) * 3.2, dz = tz - g.position.z;
        g.rotation.y = dz > 0 ? 0 : Math.PI; g.position.z += Math.sign(dz) * Math.min(Math.abs(dz), Math.max(0, sp) * dt);
        if (Math.abs(dz) < 0.3) { z.phase = 'eat'; z.t = 0; g.rotation.y = (z.h.face || 1) > 0 ? Math.PI : 0; }
      } else if (z.phase === 'eat') {
        animZ(z, z.t, 'eat'); const k = z.t / z.eat;
        z.h.obj.position.x = z.h.x + Math.sin(z.t * 40) * 0.12 * k;
        if (Math.random() < dt * 3) beep(90 + Math.random() * 40, 60, 0.12, 'square', 0.02);
        if (k >= 1 && !st.over) { z.h.obj.position.x = z.h.x; wreck(z); }
      } else if (z.phase === 'leave') {
        animZ(z, z.t, 'walk'); g.rotation.y = z.side > 0 ? Math.PI / 2 : -Math.PI / 2; g.position.x += z.side * z.sp * dt;
        if (z.t > 2.5) { scene.remove(g); z.phase = 'gone'; }
      }
    }
    zs = zs.filter(z => z.phase !== 'dead' && z.phase !== 'gone');
    for (const f of fx) {
      f.t += dt;
      if (f.kind === 'boom') { const s = (f.big ? 8 : 4.5) * (0.3 + f.t * 3); f.m.scale.setScalar(s); f.m.material.opacity = Math.max(0, 0.85 - f.t * 2.2); if (f.t > 0.45) { scene.remove(f.m); f.dead = true; } }
      else if (f.kind === 'fall') { f.m.rotation.x = Math.min(Math.PI / 2, f.t * 6) * -1; f.m.position.y = 0.3 - Math.max(0, f.t - 0.5) * 3; if (f.t > 1.2) { scene.remove(f.m); f.dead = true; } }
      else if (f.kind === 'collapse') { const k = clamp(f.t / 1.4); f.m.position.y = f.y0 - k * k * 6; f.m.rotation.x = f.rx * k; f.m.rotation.z = f.rz * k; if (k >= 1) { scene.remove(f.m); f.dead = true; } }
      else if (f.kind === 'dust') { f.m.scale.setScalar(f.s * (0.5 + f.t * 2.5)); f.m.position.y += dt * 2; f.m.material.opacity = Math.max(0, 0.7 - f.t * 0.6); if (f.t > 1.2) { scene.remove(f.m); f.dead = true; } }
      else { f.v.y -= 40 * dt; f.m.position.addScaledVector(f.v, dt); f.m.rotation.x += dt * 8; if (f.t > 1.1) { scene.remove(f.m); f.dead = true; } }
    }
    fx = fx.filter(f => !f.dead);
    if (G.on) renderHud();
  };

  function cleanup() {
    for (const z of zs) { scene.remove(z.g); z.h._busy = false; z.h.obj.position.x = z.h.x; }
    for (const f of fx) scene.remove(f.m);
    zs = []; fx = [];
    for (const h of stolen) { showObj(h.obj); h._stolen = false; }
    stolen = []; for (const h of targets) h._busy = false;
  }
  function end(quit) {
    if (!st || st.over) return; st.over = true; G.on = false; msg('');
    document.body.classList.remove('playing'); cleanup(); ctx.markDirty();
    if (quit) return;
    const b0 = best(), rec = st.score > b0; if (rec) setBest(st.score);
    const won = st.lives > 0, saved = targets.length - (LIVES - Math.max(0, st.lives));
    const text = `Я уничтожил ${st.kills} зомби и набрал ${st.score} очков в Городе Домино 🧟 Попробуй побить: ${SITE}`;
    const m = $('#modal'); m.querySelector('.in').innerHTML = `<button class="x" aria-label="Закрыть">✕</button>
      <h2>${won ? '🏆 Город спасён от зомби!' : '🧟 Зомби захватили город…'}</h2>
      <div class="gres"><div><b>${st.kills}</b><i>зомби уничтожено</i></div><div><b>${st.score}</b><i>очков</i></div><div><b>${Math.max(0, saved)}</b><i>домов спасено</i></div></div>
      <p>${rec ? '🎉 <b>Новый рекорд!</b>' : `Рекорд: <b>${Math.max(b0, st.score)}</b>`} В настоящем выпуске защита дома — это <b>лайк + комментарий</b> под рилсом @${IG}.</p>
      <div class="row"><button class="b1" id="gAgain">🔁 Ещё раз</button><button class="b3" id="gShare">📤 Похвастаться</button></div>
      <div class="row"><a class="b2" style="flex:1!important" target="_blank" href="https://instagram.com/${IG}">❤️ Лайк + коммент = щит</a></div>`;
    m.classList.add('on'); m.querySelector('.x').onclick = () => m.classList.remove('on');
    $('#gAgain').onclick = () => { m.classList.remove('on'); start(); };
    $('#gShare').onclick = () => { if (navigator.share) navigator.share({ title: 'Город Домино', text, url: 'https://' + SITE }).catch(() => {}); else { navigator.clipboard?.writeText(text).catch(() => {}); ctx.toast('Текст скопирован — отправь другу'); } };
    flyTo(cam.x, cam.z, 160, cam.yaw, 1.2);
  }
  return G;
}
