// heal.js — Progressive world restoration
// Sets body[data-heal="0-4"] and manages bg-layer DOM.
// Called after every state change via applyHeal().

// ── FLOWER POSITIONS ──────────────────────────────────
// [left%, top%, size-px, minHeal, delay-ms]
const FLOWER_DEFS = [
  // Level 1 — first hints
  [84,  2,   80,  1,  300],
  [ 1, 82,   60,  1,  600],

  // Level 2 — growing
  [70, 64,   90,  2,  200],
  [10,  8,   70,  2,  500],
  [46, 82,   65,  2,  400],

  // Level 3 — spreading
  [-2, 32,   75,  3,  300],
  [87, 50,   85,  3,  500],
  [35,  0,   68,  3,  200],
  [20, 58,   60,  3,  700],
  [63, 16,   65,  3,  400],

  // Level 4 — full bloom (statement corners + scatter)
  [-8, -8,  145,  4,  100],
  [78, -6,  125,  4,  300],
  [-6, 74,  115,  4,  500],
  [82, 78,  125,  4,  200],
  [44, 42,   85,  4,  600],
  [26, 88,   75,  4,  400],
  [61, 90,   70,  4,  700],
  [52, -4,   60,  4,  900],
  [ 8, 48,   55,  4,  800],
  [78, 30,   58,  4, 1000],
];

const ROSE_HUES = [
  ['#c8566e', '#e8909e'],
  ['#b84060', '#dc7090'],
  ['#d4607a', '#f0a0b0'],
  ['#c05070', '#e08898'],
  ['#bf5878', '#dda0b4'],
];

// [left%, top%, size-px, minHeal, delay-ms]
const HEART_DEFS = [
  // Level 2 — first scattered hints
  [72, 22, 12, 2, 400],
  [18, 46, 10, 2, 700],
  [55, 72, 13, 2, 200],

  // Level 3 — blooming more
  [38, 14, 11, 3, 500],
  [88, 35, 12, 3, 300],
  [ 6, 67, 10, 3, 600],
  [64, 86, 11, 3, 100],
  [28, 78, 10, 3, 800],

  // Level 4 — full bloom
  [92, 12, 13, 4, 200],
  [14, 30, 11, 4, 400],
  [50, 52, 14, 4, 600],
  [76, 58, 11, 4, 100],
  [34, 92, 10, 4, 800],
  [82, 48, 12, 4, 300],
];

const HEART_FILLS = ['#c8566e', '#b84060', '#d4607a', '#c05070', '#bf5878'];

// SVG strings for particles
const PETAL_SVG = `<svg viewBox="0 0 14 22" width="14" height="22" xmlns="http://www.w3.org/2000/svg"><ellipse cx="7" cy="11" rx="6" ry="10" fill="#e890a0" opacity="0.7"/><ellipse cx="8.5" cy="8.5" rx="3.5" ry="6" fill="#f8c0cc" opacity="0.45"/></svg>`;
const HEART_SVG = `<svg viewBox="0 0 20 18" width="16" height="15" xmlns="http://www.w3.org/2000/svg"><path d="M10,16 C4,10 1,7 1,4.5 A4,4 0 0 1 10,3 A4,4 0 0 1 19,4.5 C19,7 16,10 10,16Z" fill="#e87898" opacity="0.6"/></svg>`;

let _particleTimer = null;
let _activeHeal    = -1;

// ── PUBLIC API ────────────────────────────────────────

function getHealLevel() {
  if (typeof st === 'undefined') return 0;
  if (st.s4 && st.s4.done) return 4;
  if (st.s3 && st.s3.done) return 3;
  if (st.s2 && st.s2.done) return 2;
  if (st.s1 && st.s1.done) return 1;
  return 0;
}

function applyHeal() {
  const level = getHealLevel();
  document.body.dataset.heal = level;

  const cl = document.getElementById('corruptLayer');
  const wl = document.getElementById('warmLayer');
  const clOp = [1, 0.7, 0.35, 0.07, 0][level];
  const wlOp = [0, 0.22, 0.52, 0.80, 1][level];
  console.log('[heal] level:', level, '| corrupt opacity:', clOp, '| warm opacity:', wlOp,
              '| corruptLayer el:', !!cl, '| warmLayer el:', !!wl);
  if (cl) cl.style.opacity = clOp;
  if (wl) wl.style.opacity = wlOp;

  // Show/hide flowers, hearts and vines
  document.querySelectorAll('.bg-flower, .bg-heart, .bg-vine').forEach(el => {
    const min = parseInt(el.dataset.minHeal || 0);
    el.style.opacity = level >= min ? '1' : '0';
    // Trigger vine drawing when it first appears
    if (level >= min && el.classList.contains('bg-vine') && !el.dataset.drawn) {
      el.dataset.drawn = '1';
      el.querySelectorAll('.vine-path').forEach(p => {
        const len = p.getTotalLength ? p.getTotalLength() : 1200;
        p.style.strokeDasharray  = len;
        p.style.strokeDashoffset = len;
        requestAnimationFrame(() => {
          p.style.transition = 'stroke-dashoffset 5s ease 0.8s';
          p.style.strokeDashoffset = '0';
        });
      });
    }
  });

  // Manage particle loop
  if (level !== _activeHeal) {
    _activeHeal = level;
    clearInterval(_particleTimer);
    _particleTimer = null;
    if (level >= 2) {
      const rate = [0, 0, 3200, 2000, 1200][level];
      _particleTimer = setInterval(() => _spawnParticle(level), rate);
    }
  }
}

// Called once on page load — builds all static bg-layer elements
function initBgLayer() {
  const root = document.getElementById('bgLayer');
  console.log('[heal] initBgLayer called. #bgLayer found:', !!root);
  if (!root || root.dataset.init) return;
  root.dataset.init = '1';

  _buildCorruption();
  _buildWarmBlobs();
  _buildFlowers();
  _buildHearts();
  _buildVines();
  console.log('[heal] initBgLayer complete. flowerLayer children:', document.getElementById('flowerLayer')?.children.length);
}

// ── PRIVATE: CORRUPTION LAYER ────────────────────────

function _buildCorruption() {
  const el = document.getElementById('corruptLayer');
  if (!el) return;
  // Positioned colour artifact blocks — opacities kept high so corruption is dramatic at level 0
  const blocks = [
    'width:38%;height:28%;top:16%;left:10%;background:rgba(0,210,222,0.62);transform:skewX(1.3deg) skewY(0.4deg)',
    'width:100%;height:14%;top:34%;left:0;background:rgba(212,0,192,0.42)',
    'width:26%;height:24%;top:2%;right:3%;background:rgba(5,0,38,0.68);border-radius:0 0 45% 0',
    'width:100%;height:7%;bottom:24%;left:0;background:rgba(88,222,28,0.38)',
    'width:16%;height:48%;top:24%;left:0;background:rgba(58,78,242,0.42);transform:skewY(-1.2deg)',
    'width:22%;height:16%;bottom:8%;right:14%;background:rgba(0,212,222,0.50);transform:skewX(-2.2deg)',
    'width:30%;height:20%;top:50%;right:0;background:rgba(212,0,192,0.36)',
  ];
  el.innerHTML = blocks.map(s => `<div class="c-block" style="${s}"></div>`).join('') +
    `<div class="c-noise"></div>`;
  console.log('[heal] corruption blocks built:', el.children.length);
}

// ── PRIVATE: WARM WATERCOLOUR BLOBS ─────────────────

function _buildWarmBlobs() {
  const el = document.getElementById('warmLayer');
  if (!el) return;
  const blobs = [
    'width:60%;height:50%;top:-12%;left:-8%;background:radial-gradient(ellipse,rgba(242,182,198,0.38) 0%,transparent 68%)',
    'width:55%;height:55%;bottom:-16%;right:-10%;background:radial-gradient(ellipse,rgba(222,178,212,0.34) 0%,transparent 68%)',
    'width:50%;height:44%;top:28%;left:25%;background:radial-gradient(ellipse,rgba(255,208,188,0.28) 0%,transparent 68%)',
    'width:38%;height:48%;bottom:4%;left:8%;background:radial-gradient(ellipse,rgba(208,222,188,0.22) 0%,transparent 68%)',
    'width:32%;height:38%;top:4%;right:18%;background:radial-gradient(ellipse,rgba(242,202,218,0.3) 0%,transparent 68%)',
    'width:25%;height:32%;top:50%;right:2%;background:radial-gradient(ellipse,rgba(255,218,198,0.24) 0%,transparent 68%)',
  ];
  el.innerHTML = blobs.map(s => `<div class="w-blob" style="${s}"></div>`).join('');
}

// ── PRIVATE: FLOWERS ─────────────────────────────────

function _buildFlowers() {
  const layer = document.getElementById('flowerLayer');
  if (!layer) return;
  FLOWER_DEFS.forEach(([lx, ty, sz, minH, dly], i) => {
    const [r, s] = ROSE_HUES[i % ROSE_HUES.length];
    const div = document.createElement('div');
    div.className = 'bg-flower';
    div.dataset.minHeal = minH;
    div.style.cssText = `left:${lx}%;top:${ty}%;width:${sz}px;height:${sz}px;transition-delay:${dly}ms`;
    div.innerHTML = _roseSVG(sz, r, s);
    layer.appendChild(div);
  });
}

// ── PRIVATE: HEARTS ──────────────────────────────────

function _buildHearts() {
  const layer = document.getElementById('flowerLayer');
  if (!layer) return;
  HEART_DEFS.forEach(([lx, ty, sz, minH, dly], i) => {
    const fill = HEART_FILLS[i % HEART_FILLS.length];
    const dur  = (3.4 + (i % 6) * 0.38).toFixed(2);
    const div  = document.createElement('div');
    div.className = 'bg-heart';
    div.dataset.minHeal = minH;
    div.style.cssText = `left:${lx}%;top:${ty}%;width:${sz}px;height:${sz}px;transition-delay:${dly}ms;--pulse-dur:${dur}s`;
    div.innerHTML = _heartBgSVG(sz, fill);
    layer.appendChild(div);
  });
}

function _heartBgSVG(sz, fill) {
  const h = Math.round(sz * 0.9);
  return `<svg viewBox="0 0 20 18" width="${sz}" height="${h}" xmlns="http://www.w3.org/2000/svg"><path d="M10,16 C4,10 1,7 1,4.5 A4,4 0 0 1 10,3 A4,4 0 0 1 19,4.5 C19,7 16,10 10,16Z" fill="${fill}" opacity="0.48"/><path d="M10,14 C5.5,9.5 2.5,7.5 2.5,5 A2.8,2.8 0 0 1 10,4 A2.8,2.8 0 0 1 17.5,5 C17.5,7.5 14.5,9.5 10,14Z" fill="#fde8ec" opacity="0.22"/></svg>`;
}

// ── PRIVATE: ROSES ────────────────────────────────────

function _roseSVG(sz, r1, r2) {
  const c = sz / 2;
  const f = n => n.toFixed(2);
  let p = '';
  // Outer petals (8)
  for (let i = 0; i < 8; i++) {
    const a = i * 45;
    p += `<ellipse cx="${f(c)}" cy="${f(c - sz*0.27)}" rx="${f(sz*0.1)}" ry="${f(sz*0.22)}" fill="${r1}" opacity="0.38" transform="rotate(${a} ${f(c)} ${f(c)})"/>`;
  }
  // Inner petals (6, rotated 22.5° offset)
  for (let i = 0; i < 6; i++) {
    const a = i * 60 + 22;
    p += `<ellipse cx="${f(c)}" cy="${f(c - sz*0.19)}" rx="${f(sz*0.086)}" ry="${f(sz*0.155)}" fill="${r1}" opacity="0.54" transform="rotate(${a} ${f(c)} ${f(c)})"/>`;
  }
  // Centre
  p += `<circle cx="${f(c)}" cy="${f(c)}" r="${f(sz*0.12)}" fill="${r2}" opacity="0.65"/>`;
  p += `<circle cx="${f(c)}" cy="${f(c)}" r="${f(sz*0.065)}" fill="#fde8ec" opacity="0.8"/>`;
  // Leaves
  const lx1 = c - sz*0.32, ly1 = c + sz*0.27;
  const lx2 = c + sz*0.28, ly2 = c + sz*0.33;
  p += `<ellipse cx="${f(lx1)}" cy="${f(ly1)}" rx="${f(sz*0.2)}" ry="${f(sz*0.08)}" fill="#6a8050" opacity="0.46" transform="rotate(-38 ${f(lx1)} ${f(ly1)})"/>`;
  p += `<ellipse cx="${f(lx2)}" cy="${f(ly2)}" rx="${f(sz*0.17)}" ry="${f(sz*0.07)}" fill="#6a8050" opacity="0.42" transform="rotate(27 ${f(lx2)} ${f(ly2)})"/>`;
  return `<svg viewBox="0 0 ${sz} ${sz}" width="${sz}" height="${sz}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;filter:drop-shadow(0 3px 8px rgba(180,80,100,0.18))">${p}</svg>`;
}

// ── PRIVATE: VINES ────────────────────────────────────

function _buildVines() {
  const layer = document.getElementById('flowerLayer');
  if (!layer) return;

  const vineData = [
    // left edge
    {
      style: 'left:0;top:0;width:50px;height:100vh',
      viewBox: '0 0 50 800',
      path: 'M25,0 Q8,80 32,160 Q50,240 18,320 Q2,400 28,480 Q48,560 16,640 Q4,720 26,800',
      roses: [[32,160],[18,320],[28,480],[16,640]],
    },
    // right edge
    {
      style: 'right:0;top:0;width:50px;height:100vh',
      viewBox: '0 0 50 800',
      path: 'M25,0 Q42,80 18,160 Q2,240 32,320 Q48,400 22,480 Q5,560 34,640 Q46,720 24,800',
      roses: [[18,160],[32,320],[22,480],[34,640]],
    },
    // top edge
    {
      style: 'top:0;left:0;width:100vw;height:50px',
      viewBox: '0 0 800 50',
      path: 'M0,25 Q80,8 160,32 Q240,48 320,18 Q400,2 480,28 Q560,46 640,16 Q720,4 800,26',
      roses: [[160,32],[320,18],[480,28],[640,16]],
      isHoriz: true,
    },
  ];

  vineData.forEach(v => {
    const wrap = document.createElement('div');
    wrap.className = 'bg-vine';
    wrap.dataset.minHeal = 3;
    wrap.style.cssText = `position:fixed;${v.style};pointer-events:none;opacity:0;transition:opacity 2.5s ease;overflow:visible`;

    const roseMarkup = v.roses.map(([rx, ry]) =>
      `<circle cx="${rx}" cy="${ry}" r="7" fill="#c8566e" opacity="0.48"/>
       <circle cx="${rx}" cy="${ry}" r="4.5" fill="#e890a0" opacity="0.55"/>
       <circle cx="${rx}" cy="${ry}" r="2" fill="#f8c0c8" opacity="0.7"/>`
    ).join('');

    wrap.innerHTML = `<svg viewBox="${v.viewBox}" width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <path class="vine-path" d="${v.path}" stroke="#c87878" stroke-width="1.8" fill="none" opacity="0.55"/>
      ${roseMarkup}
    </svg>`;

    layer.appendChild(wrap);
  });
}

// ── PRIVATE: PARTICLES ────────────────────────────────

function _spawnParticle(level) {
  const layer = document.getElementById('particleLayer');
  if (!layer) return;
  const heartChance = level >= 4 ? 0.50 : 0.28;
  const isHeart = level >= 3 && Math.random() < heartChance;
  const el = document.createElement('div');
  el.className = 'bg-particle';
  el.style.left = (Math.random() * 100) + 'vw';
  el.style.animationDuration = (Math.random() * 10 + 10) + 's';
  el.style.animationDelay    = (Math.random() * 2) + 's';
  el.style.setProperty('--op',      (Math.random() * 0.35 + 0.2).toFixed(2));
  el.style.setProperty('--end-rot', Math.round(Math.random() * 500 + 200) + 'deg');
  el.style.setProperty('--sway',    (Math.random() * 40 - 20) + 'px');
  el.innerHTML = isHeart ? HEART_SVG : PETAL_SVG;
  layer.appendChild(el);
  el.addEventListener('animationend', () => el.remove(), { once: true });
}
