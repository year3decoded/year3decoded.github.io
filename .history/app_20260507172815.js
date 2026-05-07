// app.js — Corrupted Anniversary Plan — all logic
// All placeholder values are in config.js

// ╔══════════════════════════════════════════════════════════════╗
// ║  DEV MODE — add ?dev=1 to URL to enable                     ║
// ║  Adds skip buttons and reset button                         ║
// ║  Never visible on the plain URL your wife will open         ║
// ╚══════════════════════════════════════════════════════════════╝
const DEV_MODE = new URLSearchParams(location.search).has('dev');

// ╔══════════════════════════════════════════════════════════════╗
// ║  STATE / STORAGE                                             ║
// ╚══════════════════════════════════════════════════════════════╝
const SK = 'corrupted_plan_v3';

function defaultState() {
  return {
    s1: { solved: false, done: false },
    s2: {
      sub:     0,     // 0=map  1=bingo  2=complete
      dirs:    {},    // { markerIdx: 'N'|'E'|'S'|'W' }
      matches:    [],    // [[leftIdx, rightDisplayPos], ...]
      shuffle:    null,  // shuffled right column (display pos → original index)
      gameChoice: null,  // 'escape' | 'valorant' | 'both'
      done:       false,
    },
    s3: {
      cur:     0,
      answers: {},   // { stopIdx: ['a','b',...] }
      done:    false,
    },
    s4: {
      strikes: {},   // { countryName: 0|1|2 }
      done:    false,
    },
    s5: { done: false },
  };
}

let st = (function () {
  try {
    const raw = localStorage.getItem(SK);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return defaultState();
})();

function save() { localStorage.setItem(SK, JSON.stringify(st)); }

// ╔══════════════════════════════════════════════════════════════╗
// ║  UNLOCK CONDITIONS                                           ║
// ╚══════════════════════════════════════════════════════════════╝
function unlocked(n) {
  switch (n) {
    case 1: return true;
    case 2: return st.s1.done;
    case 3: return st.s2.done;
    case 4: return st.s3.done;
    case 5: return st.s4.done;
  }
  return false;
}

function stageDone(n) {
  return [null, st.s1.done, st.s2.done, st.s3.done, st.s4.done, st.s5.done][n];
}

// ╔══════════════════════════════════════════════════════════════╗
// ║  RENDER                                                      ║
// ╚══════════════════════════════════════════════════════════════╝
const TITLES = [
  '',
  'the morning walk',
  'the map',
  'the amersfoort trail',
  'dinner',
  'the evening',
];

function render() {
  const el = document.getElementById('stagesEl');
  el.innerHTML = '';
  for (let i = 1; i <= 5; i++) el.appendChild(mkCard(i));
  if (unlocked(2) && st.s2.sub === 0 && !st.s2.done) setTimeout(initMap, 80);
  if (st.s5.done) launchConfetti();
  applyHeal();
}

function mkCard(n) {
  const on   = unlocked(n);
  const done = stageDone(n);
  const warm = (n === 5 && on);
  const div  = document.createElement('div');

  const freshlyDone = done && st['_completedAt_' + n] && (Date.now() - st['_completedAt_' + n] < 6000);
  let cls = 'card';
  if (!on)   cls += ' locked';
  else if (warm) cls += ' warm' + (done ? ' done' : ' active');
  else if (done) cls += ' done' + (freshlyDone ? ' just-complete' : '');
  else           cls += ' active';

  div.className = cls;
  div.id = 'card' + n;

  const sText = done ? 'restored ✓' : (on ? 'active' : 'locked');
  const sCls  = done ? 'status-done' : (on ? 'status-active' : 'status-locked');

  div.innerHTML = `
    <div class="card-head">
      <span class="card-num">STAGE ${n}</span>
      <span class="card-title">${TITLES[n]}</span>
      <span class="card-status ${sCls}">${sText}</span>
    </div>
    <div class="card-body">
      ${on ? body(n) : lockedPreview(n)}
      ${devBar(n)}
    </div>`;
  return div;
}

// ── LOCKED PREVIEWS ─────────────────────────────────────────────
function lockedPreview(n) {
  const s = n * 17; // deterministic seed per stage
  const previews = {
    2: `${noiseDiv()}<div class="lock-preview">${corruptText('The',s)} <span class="blk">████████</span> ${corruptText('walk is just the beginning. The map holds',s+3)} <span class="blk">████████████</span> ${corruptText('answers. Look closely at what',s+9)} <span class="blk">███████████████</span> ${corruptText('faces.',s+12)}<div class="lock-time">[ ${corruptText('finish the morning walk to continue',s+15)} ]</div></div>`,
    3: `${noiseDiv()}<div class="lock-preview">${corruptText('The city of',s)} <span class="blk">██████████</span> ${corruptText('awaits. A trail through',s+3)} <span class="blk">█</span> ${corruptText('stops — Rituals,',s+7)} <span class="blk">████████████</span>${corruptText(', the old gate.',s+10)}<div class="lock-time">[ ${corruptText('finish the map to continue',s+13)} ]</div></div>`,
    4: `${noiseDiv()}<div class="lock-preview"><span class="blk">██</span> ${corruptText('countries. Only one survives. The clues will lead you to',s)} <span class="blk">████████████████████</span><div class="lock-time">[ ${corruptText('finish the trail to continue',s+8)} ]</div></div>`,
    5: `${noiseDiv()}<div class="lock-preview"><span class="blk">████████████████████████████████████</span> <span class="blk">████████████</span> <span class="blk">████</span><div class="lock-time">[ ${corruptText('finish dinner to continue',s+2)} ]</div></div>`,
  };
  return previews[n] || '';
}

function body(n) {
  switch (n) {
    case 1: return s1();
    case 2: return s2();
    case 3: return s3();
    case 4: return s4();
    case 5: return s5();
  }
  return '';
}

// ╔══════════════════════════════════════════════════════════════╗
// ║  STAGE 1 — DOG WALK                                         ║
// ╚══════════════════════════════════════════════════════════════╝
function s1() {
  const { solved, done } = st.s1;
  const word = solved
    ? `<span class="redacted revealed">${DOG_NAME}</span>`
    : `<span class="redacted">[REDACTED]</span>`;
  return `
    <div class="label">day recovered... fragment 1 of 5</div>
    <div class="story">
      The plan begins here. After breakfast, ${word} needs a walk.
      The path is familiar, time to take a breath of fresh air.
      The walk awaits.
    </div>
    ${solved ? `<div class="msg ok show">✓ corruption restored - "${DOG_NAME}" recovered ${heartSVG()}</div>` : ''}
    ${!solved ? `
      <div class="row">
        <input class="inp" id="s1inp" type="text"
          placeholder="type the name..."
          autocomplete="off" autocorrect="off"
          autocapitalize="off" spellcheck="false"
          inputmode="text" enterkeyhint="go" />
        <button class="btn" onclick="checkS1()">restore</button>
      </div>
      <div class="msg bad" id="s1err">incorrect - Did you forget the name of our dog?</div>
    ` : ''}
    ${solved && !done ? `<button class="btn amber full mt8" onclick="doneS1()">mark as complete — unlock stage 2 →</button>` : ''}
    ${done ? `<div class="badge">✓ fragment 1 restored ${heartSVG()}</div>` : ''}`;
}

function checkS1() {
  const inp = document.getElementById('s1inp');
  if (!inp) return;
  const v = inp.value.trim().toLowerCase();
  if (v === DOG_NAME.toLowerCase()) {
    st.s1.solved = true; save(); render();
  } else {
    const err = document.getElementById('s1err');
    err.classList.add('show');
    inp.classList.add('err');
    setTimeout(() => { err.classList.remove('show'); inp.classList.remove('err'); }, 2000);
  }
}

function doneS1() { st.s1.done = true; st._completedAt_1 = Date.now(); save(); render(); }

// ╔══════════════════════════════════════════════════════════════╗
// ║  STAGE 2 — MAP PUZZLE                                        ║
// ╚══════════════════════════════════════════════════════════════╝
function s2() {
  if (st.s2.done) {
    const label = { escape: 'escape academy 🎮', valorant: 'valorant 🔫', both: 'escape academy & valorant 🎮🔫' }[st.s2.gameChoice] || '🎮';
    return `<div class="badge">✓ fragment 2 restored ${heartSVG()} — Afternoon gaming: ${label}</div>`;
  }
  if (st.s2.sub === 0) return s2a();
  if (st.s2.sub === 1) return s2b();
  return '';
}

function s2a() {
  const ans = Object.keys(st.s2.dirs).length;
  const tot = MARKERS.length;
  const all = ans >= tot;
  return `
    <div class="label">sub-step 2a // the map</div>
    <div class="map-prog" id="mapProg">markers located: ${ans} / ${tot}</div>
    <div id="map"></div>
    <div class="small dimtxt mb8">tap a numbered marker and pick the direction it faces</div>
    ${all ? `
      <hr class="div">
      <div class="small greentxt mb8">✓ all markers located</div>
      <button class="btn" onclick="goS2b()">proceed to word association →</button>
    ` : ''}`;
}

function s2b() {
  if (!st.s2.shuffle) {
    st.s2.shuffle = [...Array(BINGO_RIGHT.length).keys()].sort(() => Math.random() - .5);
    save();
  }
  const hits    = st.s2.matches;
  const shuffle = st.s2.shuffle;
  return `
    <div class="label">sub-step 2b // word association</div>
    <div class="bingo-hint">
      <div class="hint-fact">✦ did you know?</div>
      <div class="hint-cap">Our first date was at a restaurant facing West.</div>
    </div>
    <div class="small dimtxt mb8">connect each object to its associated word — objects facing the right direction will bloom.</div>
    <div class="bingo-wrap">
      <div class="bingo-col" id="bleft">
        ${BINGO_LEFT.map((w, i) => {
          const m   = hits.find(h => h[0] === i);
          const cls = m ? (st.s2.dirs[i] === CORRECT_DIR ? ' floral' : ' wrong-dir') : '';
          return `<div class="bingo-item${cls}" id="bl${i}" ${m ? '' : `onclick="pickLeft(${i})"`}>${w}</div>`;
        }).join('')}
      </div>
      <div class="bingo-col" id="bright">
        ${shuffle.map((origIdx, j) => {
          const m   = hits.find(h => h[1] === j);
          const cls = m ? (st.s2.dirs[m[0]] === CORRECT_DIR ? ' floral' : ' wrong-dir') : '';
          return `<div class="bingo-item${cls}" id="br${j}" ${m ? '' : `onclick="pickRight(${j})"`}>${BINGO_RIGHT[origIdx]}</div>`;
        }).join('')}
      </div>
    </div>
    <div class="small greentxt" id="bingoSt">${hits.length}/${BINGO_LEFT.length} connections made</div>`;
}

function goS2b() { st.s2.sub = 1; save(); render(); }

// ╔══════════════════════════════════════════════════════════════╗
// ║  LEAFLET MAP                                                 ║
// ╚══════════════════════════════════════════════════════════════╝
let leafMap = null;

function initMap() {
  const el = document.getElementById('map');
  if (!el) return;
  if (leafMap) { leafMap.remove(); leafMap = null; }
  leafMap = L.map('map', { tap: false }).setView(MAP_CENTER, MAP_ZOOM);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19,
  }).addTo(leafMap);
  MARKERS.forEach((m, i) => {
    const answered = st.s2.dirs[i] !== undefined;
    const dir      = st.s2.dirs[i] || '';
    const icon = L.divIcon({
      html: `<div style="
        background:${answered ? '#00ff41' : '#ffb300'};
        color:#000;font-weight:bold;font-size:12px;
        width:30px;height:30px;border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        border:2px solid #000;font-family:monospace;
        box-shadow:0 0 6px rgba(0,255,65,.4);
      ">${i + 1}${answered ? '<span style="font-size:8px;position:absolute;bottom:-14px;left:50%;transform:translateX(-50%);color:#00ff41">' + dir + '</span>' : ''}</div>`,
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
    L.marker([m.lat, m.lng], { icon })
      .addTo(leafMap)
      .on('click', () => openModal(i));
  });
}

// ╔══════════════════════════════════════════════════════════════╗
// ║  MARKER MODAL                                                ║
// ╚══════════════════════════════════════════════════════════════╝
let curMarker = null, chosenDir = null;

function openModal(idx) {
  curMarker = idx;
  chosenDir = st.s2.dirs[idx] || null;
  const m = MARKERS[idx];
  document.getElementById('mTitle').textContent = `${m.name} — MARKER ${idx + 1}`;
  const img = document.getElementById('mImg');
  img.innerHTML = `<img src="./img/marker_${idx + 1}.jpg" alt="${m.name}" style="width:100%;height:100%;object-fit:cover;border-radius:2px;">`;
  document.querySelectorAll('.dir-btn[data-d]').forEach(b =>
    b.classList.toggle('sel', b.dataset.d === chosenDir)
  );
  document.getElementById('markerOverlay').classList.add('on');
}

function closeModal() {
  document.getElementById('markerOverlay').classList.remove('on');
  stopCompass();
  curMarker = null;
  chosenDir = null;
}

function pickDir(d) {
  if (d !== MARKERS[curMarker].dir) {
    const btn = document.querySelector(`.dir-btn[data-d="${d}"]`);
    if (btn) {
      btn.classList.add('sel-wrong');
      setTimeout(() => btn.classList.remove('sel-wrong'), 600);
    }
    chosenDir = null;
    return;
  }
  chosenDir = d;
  document.querySelectorAll('.dir-btn[data-d]').forEach(b =>
    b.classList.toggle('sel', b.dataset.d === d)
  );
}

function confirmMarker() {
  if (!chosenDir) { alert('Select a direction first.'); return; }
  st.s2.dirs[curMarker] = chosenDir;
  save();
  closeModal();
  const ans  = Object.keys(st.s2.dirs).length;
  const prog = document.getElementById('mapProg');
  if (prog) prog.textContent = `markers located: ${ans} / ${MARKERS.length}`;
  initMap();
  if (ans >= MARKERS.length) render();
}

// ╔══════════════════════════════════════════════════════════════╗
// ║  COMPASS  (Android-first, iOS fallback)                      ║
// ╚══════════════════════════════════════════════════════════════╝
let compassActive = false;

function startCompass() {
  if (typeof DeviceOrientationEvent === 'undefined') {
    setCompassLbl('not supported on this device');
    return;
  }
  // iOS 13+ requires explicit permission
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(s => {
        if (s === 'granted') enableCompass();
        else setCompassLbl('permission denied');
      })
      .catch(() => setCompassLbl('permission error'));
  } else {
    enableCompass();
  }
}

function enableCompass() {
  compassActive = true;
  const btn = document.getElementById('compassBtn');
  if (btn) btn.style.display = 'none';
  setCompassLbl('calibrating…');
  // Prefer absolute orientation (Chrome Android 67+)
  if ('ondeviceorientationabsolute' in window) {
    window.addEventListener('deviceorientationabsolute', onOrient, true);
  } else {
    window.addEventListener('deviceorientation', onOrient, true);
  }
}

function stopCompass() {
  compassActive = false;
  window.removeEventListener('deviceorientationabsolute', onOrient, true);
  window.removeEventListener('deviceorientation', onOrient, true);
}

function setCompassLbl(txt) {
  const l = document.getElementById('compassLbl');
  if (l) l.textContent = 'compass: ' + txt;
}

function onOrient(e) {
  if (!compassActive) return;
  const needle = document.getElementById('needle');
  if (!needle) return;

  // webkitCompassHeading (iOS) takes priority — it's already calibrated absolute heading
  let heading = e.webkitCompassHeading != null
    ? e.webkitCompassHeading
    : (e.absolute ? e.alpha : null);

  if (heading == null) {
    setCompassLbl('no heading data');
    return;
  }

  heading = (heading + 180) % 360;

  // Rotate needle opposite to heading so it always points magnetic North
  needle.style.transform = `rotate(${-heading}deg)`;

  const DIRS = ['N','NE','E','SE','S','SW','W','NW'];
  const label = DIRS[Math.round(heading / 45) % 8];
  setCompassLbl(`pointing: ${label} (${Math.round(heading)}°)`);
}

// ╔══════════════════════════════════════════════════════════════╗
// ║  BINGO LOGIC                                                 ║
// ╚══════════════════════════════════════════════════════════════╝
let bLeft = null, bRight = null;

function pickLeft(i) {
  if (st.s2.matches.some(m => m[0] === i)) return;
  clearWrong();
  bLeft = i;
  document.querySelectorAll('#bleft .bingo-item').forEach((el, j) => {
    if (!st.s2.matches.some(m => m[0] === j)) el.classList.toggle('sel', j === i);
  });
  if (bRight !== null) tryMatch();
}

function pickRight(i) {
  if (st.s2.matches.some(m => m[1] === i)) return;
  clearWrong();
  bRight = i;
  document.querySelectorAll('#bright .bingo-item').forEach((el, j) => {
    if (!st.s2.matches.some(m => m[1] === j)) el.classList.toggle('sel', j === i);
  });
  if (bLeft !== null) tryMatch();
}

function clearWrong() {
  document.querySelectorAll('.bingo-item.wrong').forEach(e => e.classList.remove('wrong'));
}

function tryMatch() {
  const l = bLeft, r = bRight;
  bLeft = null; bRight = null;
  const lEl = document.getElementById('bl' + l);
  const rEl = document.getElementById('br' + r);
  if (!lEl || !rEl) return;
  lEl.classList.remove('sel');
  rEl.classList.remove('sel');

  if (st.s2.shuffle[r] !== l) {
    lEl.classList.add('wrong');
    rEl.classList.add('wrong');
    setTimeout(() => { lEl.classList.remove('wrong'); rEl.classList.remove('wrong'); }, 600);
    return;
  }

  st.s2.matches.push([l, r]);
  save();

  const cls = st.s2.dirs[l] === MARKERS[l].dir ? 'floral' : 'wrong-dir';
  lEl.classList.add(cls);
  rEl.classList.add(cls);

  const stEl = document.getElementById('bingoSt');
  if (stEl) stEl.textContent = `${st.s2.matches.length}/${BINGO_LEFT.length} connections made`;

  if (st.s2.matches.length >= BINGO_LEFT.length) {
    setTimeout(() => { st.s2.sub = 2; save(); showRev2c(); }, 700);
  }
}

function showRev2c() { document.getElementById('rev2c').classList.add('on'); }
function pickGame(choice) { st.s2.gameChoice = choice; closeRev2c(); }
function closeRev2c() {
  document.getElementById('rev2c').classList.remove('on');
  st.s2.done = true; st._completedAt_2 = Date.now();
  save();
  render();
}

// ╔══════════════════════════════════════════════════════════════╗
// ║  STAGE 3 — TRAIL                                            ║
// ╚══════════════════════════════════════════════════════════════╝
function s3() {
  if (st.s3.done) return `<div class="badge">✓ fragment 3 restored ${heartSVG()} — trail complete</div>`;
  return `
    <div class="label">amersfoort centrum trail — ${st.s3.cur}/${STOPS.length} stops complete</div>
    ${STOPS.map((s, i) => stopHtml(s, i)).join('')}`;
}

function stopHtml(stop, i) {
  const done   = i < st.s3.cur;
  const active = i === st.s3.cur;
  const cls    = done ? 'stop done-stop' : (active ? 'stop active-stop' : 'stop locked-stop');
  const saved  = st.s3.answers[i] || [];

  let storyHtml = '';
  if (stop.story) {
    let tmpl = stop.story;
    stop.blanks.forEach((ph, bi) => {
      const val = saved[bi] || '';
      const fld = done
        ? `<span class="ambertxt">${val || '…'}</span>`
        : `<input class="inline-inp" id="s3-${i}-${bi}"
            value="${escHtml(val)}"
            placeholder="${escHtml(ph)}"
            oninput="saveBlank(${i},${bi},this.value)" />`;
      tmpl = tmpl.replace(`__${bi}__`, fld);
    });
    storyHtml = `<div class="fill-story">${tmpl}</div>`;
  }

  let photoHtml = '';
  if (stop.photo) {
    photoHtml = `
      <div class="photo-prompt">📸 Photo moment! Take a picture here.</div>
      <div class="fun-fact">${stop.fact}</div>`;
  }

  return `
    <div class="${cls}" id="stop${i}">
      ${done ? `<div class="small greentxt mb8">✓ we were here ${heartSVG(9)}</div>` : ''}
      <div class="stop-name">${i + 1}. ${stop.name}</div>
      ${stop.desc ? `<div class="stop-desc">${stop.desc}</div>` : ''}
      ${(active || done) ? `<a class="maps-link" href="${stop.maps}" target="_blank" rel="noopener">📍 open in maps →</a>` : ''}
      ${storyHtml}
      ${photoHtml}
      ${active ? `<button class="btn amber" onclick="confirmStop(${i})">we were here ✓</button>` : ''}
    </div>`;
}

function saveBlank(i, bi, v) {
  if (!st.s3.answers[i]) st.s3.answers[i] = [];
  st.s3.answers[i][bi] = v;
  save();
}

function confirmStop(i) {
  const stop = STOPS[i];
  stop.blanks.forEach((_, bi) => {
    const el = document.getElementById(`s3-${i}-${bi}`);
    if (el) saveBlank(i, bi, el.value);
  });
  st.s3.cur = i + 1;
  save();
  if (st.s3.cur >= STOPS.length) { st.s3.done = true; st._completedAt_3 = Date.now(); save(); }
  render();
}

// ╔══════════════════════════════════════════════════════════════╗
// ║  STAGE 4 — COUNTRY ELIMINATION                              ║
// ╚══════════════════════════════════════════════════════════════╝
function s4() {
  if (st.s4.done) return `<div class="badge">✓ fragment 4 restored ${heartSVG()} — dinner: ${RESTAURANT_NAME} 🍛</div>`;
  const elim = Object.values(st.s4.strikes).filter(v => v >= 2).length;
  return `
    <div class="label">country elimination // ${10 - elim} remaining — eliminate 9</div>
    <div class="small dimtxt mb14">strike a country twice to eliminate it. one must survive.</div>
    <div class="country-grid">${COUNTRIES.map(c => ccHtml(c)).join('')}</div>`;
}

function ccHtml(c) {
  const str  = st.s4.strikes[c.name] || 0;
  const elim = str >= 2;
  const s1v  = str >= 1;
  const s2v  = str >= 2;
  return `
    <div class="cc${elim ? ' elim' : ''}" id="cc-${c.name}">
      <div class="cc-flag">${c.flag}</div>
      <div class="cc-name">${c.name}</div>
      <div class="cc-bar">${str > 0 ? '▊'.repeat(str) : ''}${'░'.repeat(2 - Math.min(str, 2))} ${str}/2</div>
      <div class="cc-clue${s1v ? ' vis' : ''}">${s1v ? c.c1 : '[ clue locked ]'}</div>
      ${s2v ? `<div class="cc-clue vis">${c.c2}</div>` : ''}
      ${!elim ? `<button class="btn red small full" onclick="strikeC('${c.name}')">⚡ strike</button>` : ''}
    </div>`;
}

function strikeC(name) {
  if (name === 'India') {
    const el = document.getElementById('cc-India');
    if (!el) return;
    el.classList.add('glitch-anim');
    setTimeout(() => el.classList.remove('glitch-anim'), 700);
    if (!el.querySelector('.india-msg')) {
      const msg = document.createElement('div');
      msg.className = 'india-msg';
      msg.textContent = '…this one feels right';
      el.appendChild(msg);
    }
    return;
  }
  if (!st.s4.strikes[name]) st.s4.strikes[name] = 0;
  if (st.s4.strikes[name] >= 2) return;
  st.s4.strikes[name]++;
  save();
  const elim = Object.values(st.s4.strikes).filter(v => v >= 2).length;
  if (elim >= 9) { st.s4.done = true; st._completedAt_4 = Date.now(); save(); setTimeout(showRev4, 400); return; }
  render();
}

function showRev4() { document.getElementById('rev4').classList.add('on'); }
function closeRev4() { document.getElementById('rev4').classList.remove('on'); render(); }

// ╔══════════════════════════════════════════════════════════════╗
// ║  STAGE 5 — EVENING                                          ║
// ╚══════════════════════════════════════════════════════════════╝
function s5() {
  return `
    <div class="warm-body">${S5_MESSAGE}</div>
    <div class="warm-final">All fragments restored. Happy anniversary ❤️</div>
    ${!st.s5.done
      ? `<button class="btn pink full mt14" onclick="doneS5()">✨ finish</button>`
      : `<div class="tc mt14">${heartSVG(13)} ${heartSVG(10)} ${heartSVG(15)} ${heartSVG(10)} ${heartSVG(12)}</div>`}`;
}

function doneS5() { st.s5.done = true; st._completedAt_5 = Date.now(); save(); launchConfetti(); render(); }

// ╔══════════════════════════════════════════════════════════════╗
// ║  CONFETTI                                                    ║
// ╚══════════════════════════════════════════════════════════════╝
let confettiFired = false;

function launchConfetti() {
  if (confettiFired) return;
  confettiFired = true;
  const box  = document.getElementById('confetti');
  const cols = ['#ff7a9a','#ffcc44','#44ffaa','#44aaff','#ff44cc','#ffffff','#ffb300'];
  for (let i = 0; i < 100; i++) {
    const p = document.createElement('div');
    p.className = 'piece';
    p.style.left              = Math.random() * 100 + 'vw';
    p.style.background        = cols[Math.floor(Math.random() * cols.length)];
    p.style.width             = (Math.random() * 7 + 4) + 'px';
    p.style.height            = (Math.random() * 7 + 4) + 'px';
    p.style.borderRadius      = Math.random() > .5 ? '50%' : '2px';
    p.style.animationDuration = (Math.random() * 3 + 2.5) + 's';
    p.style.animationDelay    = (Math.random() * 2.5) + 's';
    box.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
  // Mix in heart confetti alongside the regular pieces
  for (let i = 0; i < 22; i++) {
    const sz = Math.round(Math.random() * 7 + 9);
    const h  = document.createElement('div');
    h.className = 'piece';
    h.style.cssText = `left:${Math.random()*100}vw;width:${sz}px;height:${Math.round(sz*0.9)}px;background:none;animation-duration:${(Math.random()*3+3).toFixed(1)}s;animation-delay:${(Math.random()*3).toFixed(1)}s`;
    h.innerHTML = `<svg viewBox="0 0 20 18" width="${sz}" height="${Math.round(sz*0.9)}" xmlns="http://www.w3.org/2000/svg"><path d="M10,16 C4,10 1,7 1,4.5 A4,4 0 0 1 10,3 A4,4 0 0 1 19,4.5 C19,7 16,10 10,16Z" fill="#e87898" opacity="0.88"/></svg>`;
    box.appendChild(h);
    h.addEventListener('animationend', () => h.remove());
  }
}

// ╔══════════════════════════════════════════════════════════════╗
// ║  DEV TOOLS                                                   ║
// ╚══════════════════════════════════════════════════════════════╝

// Complete one stage's state (without saving or rendering)
function _completeStage(n) {
  switch (n) {
    case 1:
      st.s1.solved = true;
      st.s1.done   = true;
      break;
    case 2: {
      MARKERS.forEach((m, i) => { st.s2.dirs[i] = m.dir; });
      const shuf = [...Array(BINGO_RIGHT.length).keys()].sort(() => Math.random() - .5);
      st.s2.shuffle = shuf;
      st.s2.matches = BINGO_LEFT.map((_, i) => [i, shuf.indexOf(i)]);
      st.s2.sub  = 2;
      st.s2.done = true;
      break;
    }
    case 3:
      STOPS.forEach((s, i) => {
        st.s3.answers[i] = s.blanks.map(() => '(skipped)');
      });
      st.s3.cur  = STOPS.length;
      st.s3.done = true;
      break;
    case 4:
      COUNTRIES.forEach(c => { if (c.name !== 'India') st.s4.strikes[c.name] = 2; });
      st.s4.done = true;
      break;
    case 5:
      st.s5.done = true;
      break;
  }
}

// Skip to stage n — completes all prerequisites automatically
function skipStage(n) {
  for (let i = 1; i <= n; i++) _completeStage(i);
  save();
  render();
}

function devReset() {
  if (!confirm('Reset ALL progress and start from scratch?')) return;
  localStorage.removeItem(SK);
  st = defaultState();
  confettiFired = false;
  render();
}

function devSkipAllDirs() {
  MARKERS.forEach((m, i) => { st.s2.dirs[i] = m.dir; });
  save();
  closeModal();
  render();
}

// Dev bar appended inside each card-body when DEV_MODE is active
function devBar(n) {
  if (!DEV_MODE) return '';
  const done = stageDone(n);
  return `
    <div class="dev-bar">
      <span class="dev-tag">DEV</span>
      ${done
        ? `<span class="dev-note">stage ${n} complete</span>`
        : `<button class="dev-btn" onclick="skipStage(${n})">⚡ skip to here</button>`
      }
    </div>`;
}

// Inject the dev header badge and reset button on boot
function devBoot() {
  if (!DEV_MODE) return;
  const hdr = document.querySelector('.hdr');
  const badge = document.createElement('div');
  badge.className = 'dev-hdr';
  badge.innerHTML = `<span class="dev-tag">DEV MODE</span> <button class="dev-btn" onclick="devReset()">↺ reset all</button>`;
  hdr.appendChild(badge);
  const skipBtn = document.getElementById('devDirSkip');
  if (skipBtn) skipBtn.style.display = '';
}

// ╔══════════════════════════════════════════════════════════════╗
// ║  UTILITIES                                                   ║
// ╚══════════════════════════════════════════════════════════════╝
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Deterministic pseudo-random (same char always corrupts the same way)
function _prand(seed) { const x = Math.sin(seed + 1) * 10000; return x - Math.floor(x); }

// Subtle character substitutions — looks like bit-rot, not leet-speak
const _SUBS = { a:'α', e:'ε', i:'ı', o:'ø', s:'ş', t:'τ', r:'г', n:'η', l:'ł', c:'ç' };
function corruptText(text, seed = 0) {
  return text.split('').map((ch, i) => {
    const key = ch.toLowerCase();
    if (_SUBS[key] && _prand(seed + i) < 0.07) {
      return ch === ch.toUpperCase() ? _SUBS[key].toUpperCase() : _SUBS[key];
    }
    return ch;
  }).join('');
}

// Unicode noise string — mixed block-drawing, maths, floral chars
const NOISE = '░▒▓│┤╣║╗╝╚╔╩╦╠═╬┐└┴┬├─┼█▄▌▐▀✿❀❁♥◆◇○●αβγδεζηθΦΩψΔ∞∑∏≡≈∫∂∇◉◎◐◑❃✾✽∮⊕⊗⊘⊙⊚⊛⊜⊝◈▣◉◎○●◐◑◒◓░▒▓│┤╣║╗╝╚╔╩╦╠═╬█▄▌▐▀✿❀❁♥◆◇αβγδεζηθΦΩψΔ∞∑∏≡≈∫∂∇❃✾✽◉◎◐◑░▒▓│┤╣╗╝╚╔╩╦╠═╬█▀✿❀♥◆○●αβγΦΩ∞∑≡≈∫∂░▒│╣║╗╚╔╩╦╠═╬▄▌▐✿❁♥◇○αεΦΩ∞∑∏≡∫∂∇◉◎◐◑';
function noiseDiv() {
  return `<div class="corrupt-noise" aria-hidden="true">${NOISE.repeat(12)}</div>`;
}

function heartSVG(sz = 10) {
  const h = Math.round(sz * 0.9);
  return `<svg class="inline-heart" viewBox="0 0 20 18" width="${sz}" height="${h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10,16 C4,10 1,7 1,4.5 A4,4 0 0 1 10,3 A4,4 0 0 1 19,4.5 C19,7 16,10 10,16Z" fill="#c8566e" opacity="0.65"/></svg>`;
}

// ╔══════════════════════════════════════════════════════════════╗
// ║  KEYBOARD — Enter to submit Stage 1                         ║
// ╚══════════════════════════════════════════════════════════════╝
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('s1inp') === document.activeElement) checkS1();
});

// Boot
initBgLayer();
devBoot();
render();
