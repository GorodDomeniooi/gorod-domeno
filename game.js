// =====================================================================
//  Мини-игра «Защити город» — одиночная: сбивай НЛО, пока они не похитили дома
// =====================================================================
export function createGame(ctx) {
  const { THREE, scene, camera, cam, houses, flyTo, proj, buildHouse, hideObj, showObj, IG, SITE, clamp, closeAll } = ctx;
  const $ = (s) => document.querySelector(s);
  const DUR = 60, LIVES = 3;
  const G = { on: false };
  let ufos = [], fx = [], stolen = [], targets = [], center = null, st = null, ui = null, audio = null;

  // ---------- assets ----------
  const mDisk = new THREE.MeshLambertMaterial({ color: '#b8c4d6', flatShading: true });
  const mBoss = new THREE.MeshLambertMaterial({ color: '#8a3b55', flatShading: true });
  const mDome = new THREE.MeshLambertMaterial({ color: '#7fe8ff', emissive: '#3ab0d0', emissiveIntensity: 0.7 });
  const mLight = new THREE.MeshBasicMaterial({ color: '#7dff9a' });
  const mBeam = new THREE.MeshBasicMaterial({ color: '#7dff9a', transparent: true, opacity: 0.28, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const gDisk = new THREE.SphereGeometry(3, 22, 8).scale(1, 0.3, 1), gDome = new THREE.SphereGeometry(1.4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), gLight = new THREE.SphereGeometry(0.22, 6, 4);
  const gBeam = new THREE.CylinderGeometry(0.8, 4, 1, 20, 1, true).translate(0, -0.5, 0);
  const gBit = new THREE.BoxGeometry(0.7, 0.7, 0.7);
  const mBoom = new THREE.MeshBasicMaterial({ color: '#ffd23f', transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
  const mBit = [new THREE.MeshBasicMaterial({ color: '#ff5a3c' }), new THREE.MeshBasicMaterial({ color: '#ffc23d' }), new THREE.MeshBasicMaterial({ color: '#b8c4d6' })];
  const gBoom = new THREE.SphereGeometry(1, 14, 10);

  function mkUfo(boss) {
    const g = new THREE.Group(); const s = boss ? 3.4 : 2.2; g.scale.setScalar(s);
    g.add(new THREE.Mesh(gDisk, boss ? mBoss : mDisk)); const d = new THREE.Mesh(gDome, mDome); d.position.y = 0.45; g.add(d);
    for (let i = 0; i < 10; i++) { const l = new THREE.Mesh(gLight, mLight); const a = i / 10 * Math.PI * 2; l.position.set(Math.cos(a) * 2.6, 0, Math.sin(a) * 2.6); g.add(l); }
    const beam = new THREE.Mesh(gBeam, mBeam); beam.visible = false; g.add(beam); g.userData.beam = beam;
    scene.add(g); return g;
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
    d.innerHTML = `<div class="gbar"><div class="glives" id="gL"></div><div class="gtime" id="gT">60</div><div class="gscore">🛸 <b id="gS">0</b></div><button class="gx" id="gX" aria-label="Выйти">✕</button></div>
      <div class="gmsg" id="gM"></div><div class="gflash" id="gF"></div><div id="gPop"></div>
      <button class="gshield" id="gSh">❤️ ЛАЙК-ЩИТ<i>сбивает все НЛО</i></button>`;
    document.body.appendChild(d);
    $('#gX').onclick = () => end(true);
    $('#gSh').onclick = (e) => { e.stopPropagation(); shield(); };
    ui = d; return d;
  }
  const best = () => { try { return +localStorage.getItem('domino_ufo_best') || 0; } catch (e) { return 0; } };
  const setBest = (v) => { try { localStorage.setItem('domino_ufo_best', String(v)); } catch (e) {} };

  G.intro = function () {
    closeAll();
    const c = ctx.getCenter();
    const m = $('#modal'); m.querySelector('.in').innerHTML = `<button class="x" aria-label="Закрыть">✕</button>
      <h2>🛸 Защити город!</h2><p>НЛО прилетели похищать дома. <b>Тапай по тарелкам</b>, пока зелёный луч не утащил дом.${c ? ` Защищаем район @${c.nick}.` : ''}</p>
      <div class="step"><span>⏱</span><div><b>60 секунд, 3 жизни</b><i>Похитили дом — минус жизнь</i></div></div>
      <div class="step"><span>👾</span><div><b>Босс-тарелка</b><i>Большая красная — бей 4 раза</i></div></div>
      <div class="step"><span>❤️</span><div><b>Лайк-щит</b><i>Один раз за игру сбивает все НЛО на экране</i></div></div>
      ${best() ? `<p>Твой рекорд: <b>${best()}</b> очков</p>` : ''}
      <div class="row"><button class="b1" id="gGo">Играть 🛸</button></div>`;
    m.classList.add('on'); m.querySelector('.x').onclick = () => m.classList.remove('on');
    $('#gGo').onclick = () => { m.classList.remove('on'); start(); };
  };

  function start() {
    buildUI(); document.body.classList.add('playing');
    const c = ctx.getCenter();
    center = c ? { x: c.x, z: c.z } : { x: -181, z: -117 };
    // fixed high top-down camera over a residential district
    cam.fly = null; cam.idle = false; cam.x = center.x; cam.z = center.z; cam.d = 200; cam.yaw = 0; ctx.markDirty();
    targets = []; G.needTargets = true;
    st = { t0: performance.now() + 2600, last: performance.now(), score: 0, kills: 0, lives: LIVES, combo: 0, nextSpawn: 0, nextBoss: 20, shield: 1, over: false, el: 0 };
    G.on = true; renderHud();
    msg('3'); setTimeout(() => msg('2'), 800); setTimeout(() => msg('1'), 1600); setTimeout(() => msg('ЗАЩИЩАЙ!'), 2400); setTimeout(() => msg(''), 3300);
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
    const a = Math.random() * Math.PI * 2, R = 45;
    const g = mkUfo(boss);
    const hy = h.y + Math.min(h.h, 14) + (boss ? 20 : 14);
    const u = { g, h, boss, hp: boss ? 4 : 1, phase: 'in', t: 0, sx: h.x + Math.cos(a) * R, sz: h.z + Math.sin(a) * R, sy: 40, hy, abd: boss ? 4.6 : clamp(3.4 - G.el() / 40, 2.1, 3.4), spin: Math.random() * 6 };
    g.position.set(u.sx, u.sy, u.sz); ufos.push(u); beep(300, 600, 0.25, 'sine', 0.03);
  }
  G.el = () => st.el;

  function boom(p, big) {
    const s = new THREE.Mesh(gBoom, mBoom.clone()); s.position.copy(p); scene.add(s); fx.push({ m: s, t: 0, kind: 'boom', big });
    for (let i = 0; i < (big ? 26 : 14); i++) { const b = new THREE.Mesh(gBit, mBit[i % 3]); b.position.copy(p); scene.add(b); fx.push({ m: b, t: 0, kind: 'bit', v: new THREE.Vector3((Math.random() - 0.5) * 30, Math.random() * 22, (Math.random() - 0.5) * 30) }); }
  }
  function kill(u, sx, sy) {
    u.phase = 'dead'; u.h._busy = false; scene.remove(u.g); boom(u.g.position, u.boss);
    st.combo++; st.kills++; const pts = (u.boss ? 50 : 10) * (1 + Math.min(4, Math.floor(st.combo / 4)));
    st.score += pts; if (sx != null) pop(sx, sy, `+${pts}${st.combo >= 4 ? ' x' + (1 + Math.min(4, Math.floor(st.combo / 4))) : ''}`, u.boss ? 'big' : '');
    beep(u.boss ? 900 : 700, 80, u.boss ? 0.5 : 0.25, 'sawtooth', 0.05);
  }
  function abduct(u) {
    const h = u.h; h._stolen = true; h._busy = false; st.lives--; st.combo = 0;
    hideObj(h.obj); stolen.push(h);
    const c = buildHouse(h.type, h.nick); c.userData.inner.scale.copy(h.obj.userData.inner.scale); c.position.copy(h.obj.position); c.rotation.copy(h.obj.rotation); scene.add(c);
    u.clone = c; u.phase = 'up'; u.t = 0;
    flash('rgba(229,56,59,.45)'); beep(500, 60, 0.7, 'triangle', 0.07);
    const q = proj(h.x, h.y + 6, h.z); pop(q.x, q.y, `Похитили @${h.nick}!`, 'bad');
    if (navigator.vibrate) try { navigator.vibrate(120); } catch (e) {}
  }
  function shield() {
    if (!G.on || !st || !st.shield || st.t0 > performance.now()) return; st.shield = 0;
    flash('rgba(255,90,60,.35)'); beep(200, 1200, 0.5, 'sine', 0.06);
    for (const u of ufos) if (u.phase === 'in' || u.phase === 'beam') { u.hp = 0; const q = proj(u.g.position.x, u.g.position.y, u.g.position.z); kill(u, q.x, q.y); }
    renderHud();
  }

  G.tap = function (sx, sy) {
    if (!st || st.over) return;
    let best = null, bd = 1e9;
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    for (const u of ufos) {
      if (u.phase !== 'in' && u.phase !== 'beam') continue;
      const p = u.g.position, q = proj(p.x, p.y, p.z); if (!q.ok) continue;
      const r = 3 * u.g.scale.x; const e = proj(p.x + right.x * r, p.y + right.y * r, p.z + right.z * r);
      const rp = Math.max(46, Math.hypot(e.x - q.x, e.y - q.y) * 1.3 + 16); const d = Math.hypot(q.x - sx, q.y - sy);
      if (d < rp && d / rp < bd) { bd = d / rp; best = { u, q }; }
    }
    if (best) {
      const { u, q } = best; u.hp--;
      if (u.hp <= 0) kill(u, q.x, q.y); else { pop(q.x, q.y, '💥', 'big'); beep(500, 200, 0.12, 'square', 0.04); u.g.position.y += 1.5; }
    } else { st.combo = 0; beep(180, 120, 0.08, 'square', 0.02); }
    renderHud();
  };

  G.update = function (now) {
    if (!st) return;
    if (G.needTargets && now > st.t0 - 2000) {   // houses actually visible on screen (away from the HUD and the shield button)
      G.needTargets = false;
      targets = houses.filter(h => { const q = proj(h.x, h.y + 4, h.z); return q.ok && q.x > 50 && q.x < innerWidth - 50 && q.y > 150 && q.y < innerHeight - 170; });
      if (targets.length < 8) targets = houses.slice().sort((a, b) => Math.hypot(a.x - center.x, a.z - center.z) - Math.hypot(b.x - center.x, b.z - center.z)).slice(0, 40);
    }
    const dt = Math.min(0.05, (now - st.last) / 1000); st.last = now;
    if (now >= st.t0 && !st.over) st.el += dt;
    const el = st.el;
    if (!st.over && now >= st.t0) {
      if (el >= st.nextSpawn) { const maxU = Math.floor(3 + el / 10); if (ufos.filter(u => u.phase === 'in' || u.phase === 'beam').length < maxU) spawn(false); st.nextSpawn = el + clamp(1.5 - el / 55, 0.5, 1.5) * (0.7 + Math.random() * 0.6); }
      if (el >= st.nextBoss) { spawn(true); st.nextBoss += 18; }
      if (el >= DUR || st.lives <= 0) end(false);
    }
    for (const u of ufos) {
      u.t += dt; u.g.rotation.y += dt * (u.boss ? 1.4 : 3);
      if (u.phase === 'in') {
        const k = clamp(u.t / 1.7), e = k * k * (3 - 2 * k);
        u.g.position.set(u.sx + (u.h.x - u.sx) * e, u.sy + (u.hy - u.sy) * e + Math.sin(u.t * 3) * 0.4, u.sz + (u.h.z - u.sz) * e);
        if (k >= 1) { u.phase = 'beam'; u.t = 0; u.g.userData.beam.visible = true; }
      } else if (u.phase === 'beam') {
        const k = u.t / u.abd, b = u.g.userData.beam; const L = (u.hy - u.h.y) / u.g.scale.y;
        b.scale.set(0.6 + k * 0.6, L * Math.min(1, u.t * 3), 0.6 + k * 0.6); b.material.opacity = 0.18 + 0.25 * k + 0.08 * Math.sin(u.t * 20);
        u.g.position.y = u.hy + Math.sin(u.t * 4) * 0.3;
        if (k >= 1 && !st.over) abduct(u);
      } else if (u.phase === 'up') {
        const k = clamp(u.t / 1.6); u.clone.position.y = u.h.y + (u.hy - u.h.y) * k; u.clone.scale.setScalar(1 - k * 0.85); u.clone.rotation.y += dt * 3;
        if (k >= 0.4) u.g.position.y += dt * 60 * (k - 0.4);
        if (k >= 1) { scene.remove(u.clone); scene.remove(u.g); u.phase = 'gone'; }
      }
    }
    ufos = ufos.filter(u => u.phase !== 'dead' && u.phase !== 'gone');
    for (const f of fx) {
      f.t += dt;
      if (f.kind === 'boom') { const s = (f.big ? 9 : 5) * (0.3 + f.t * 3); f.m.scale.setScalar(s); f.m.material.opacity = Math.max(0, 0.9 - f.t * 2.2); if (f.t > 0.45) { scene.remove(f.m); f.dead = true; } }
      else { f.v.y -= 40 * dt; f.m.position.addScaledVector(f.v, dt); f.m.rotation.x += dt * 8; if (f.t > 1.1) { scene.remove(f.m); f.dead = true; } }
    }
    fx = fx.filter(f => !f.dead);
    if (G.on) renderHud();
  };

  function cleanup() {
    for (const u of ufos) { scene.remove(u.g); if (u.clone) scene.remove(u.clone); u.h._busy = false; }
    for (const f of fx) scene.remove(f.m);
    ufos = []; fx = [];
    for (const h of stolen) { showObj(h.obj); h._stolen = false; }
    stolen = []; for (const h of targets) h._busy = false;
  }
  function end(quit) {
    if (!st || st.over) return; st.over = true; G.on = false; msg('');
    document.body.classList.remove('playing'); cleanup(); ctx.markDirty();
    if (quit) return;
    const b0 = best(), rec = st.score > b0; if (rec) setBest(st.score);
    const won = st.lives > 0, saved = targets.length - (LIVES - Math.max(0, st.lives));
    const text = `Я сбил ${st.kills} НЛО и набрал ${st.score} очков в Городе Домино 🛸 Попробуй побить: ${SITE}`;
    const m = $('#modal'); m.querySelector('.in').innerHTML = `<button class="x" aria-label="Закрыть">✕</button>
      <h2>${won ? '🏆 Город спасён!' : '💥 НЛО победили…'}</h2>
      <div class="gres"><div><b>${st.kills}</b><i>НЛО сбито</i></div><div><b>${st.score}</b><i>очков</i></div><div><b>${Math.max(0, saved)}</b><i>домов спасено</i></div></div>
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
