/* ===============================================
   ART.JS — Ice Cracks · Freeze Transition · Mascot
   =============================================== */

/* ===================================================
   1. CARD ICE CRACKS
   =================================================== */

function drawCrackSegment(ctx, x, y, angle, length, depth) {
  if (depth <= 0 || length < 5) return;

  const ex = x + Math.cos(angle) * length;
  const ey = y + Math.sin(angle) * length;

  const mx = (x + ex) / 2 + (Math.random() - 0.5) * 7;
  const my = (y + ey) / 2 + (Math.random() - 0.5) * 7;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(mx, my, ex, ey);
  ctx.stroke();

  const branches = 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < branches; i++) {
    const a = angle + (Math.random() - 0.5) * 1.5;
    drawCrackSegment(ctx, ex, ey, a, length * (0.42 + Math.random() * 0.3), depth - 1);
  }
}

function generateIceCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');

  ctx.strokeStyle = 'rgba(180, 215, 255, 0.8)';
  ctx.lineWidth = 0.7;
  ctx.lineCap = 'round';

  const origins = 3 + Math.floor(Math.random() * 4);
  for (let i = 0; i < origins; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    drawCrackSegment(ctx, x, y, Math.random() * Math.PI * 2, 30 + Math.random() * 55, 4);
  }

  ctx.fillStyle = 'rgba(210, 235, 255, 0.9)';
  for (let i = 0; i < 14; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, 0.7 + Math.random() * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  return c;
}

function initCardIce() {
  const cards = document.querySelectorAll('.cs2wb-card, .sc-card, .social-card');

  cards.forEach(card => {
    const overlay = document.createElement('div');
    overlay.className = 'ice-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    const canvas = generateIceCanvas(420, 320);
    canvas.className = 'ice-crack-canvas';
    overlay.appendChild(canvas);
    card.appendChild(overlay);
  });
}


/* ===================================================
   2. SECTION FREEZE TRANSITION
   =================================================== */

function buildCrystalLines(W, H) {
  const lines = [];

  function branch(x, y, angle, length, depth, t) {
    if (depth <= 0 || length < 4) return;

    const ex = x + Math.cos(angle) * length;
    const ey = y + Math.sin(angle) * length;

    lines.push({ x1: x, y1: y, x2: ex, y2: ey, t });

    const tNext = t + (1 - t) * 0.28;
    branch(ex, ey, angle - Math.PI / 3,   length * 0.5,  depth - 1, tNext);
    branch(ex, ey, angle + Math.PI / 3,   length * 0.5,  depth - 1, tNext);
    if (Math.random() > 0.35) {
      branch(ex, ey, angle + (Math.random() - 0.5) * 0.5, length * 0.58, depth - 1, tNext);
    }
  }

  const seeds = [0, W * 0.22, W * 0.45, W * 0.68, W * 0.88, W];
  seeds.forEach(sx => {
    branch(sx, 0, Math.PI / 2, H * 0.75, 5, 0);
  });

  return lines;
}

function playFreezeTransition(section) {
  const canvas = document.createElement('canvas');
  canvas.className = 'freeze-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.width  = section.offsetWidth || window.innerWidth;
  canvas.height = 90;

  section.style.position = 'relative';
  section.insertBefore(canvas, section.firstChild);

  const ctx   = canvas.getContext('2d');
  const W     = canvas.width;
  const H     = canvas.height;
  const lines = buildCrystalLines(W, H);
  const GROW  = 600;
  const start = performance.now();

  ctx.strokeStyle = 'rgba(160, 208, 255, 0.85)';
  ctx.lineWidth   = 0.9;
  ctx.lineCap     = 'round';

  function frame(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / GROW, 1);
    const ease     = 1 - Math.pow(1 - progress, 2.8);

    ctx.clearRect(0, 0, W, H);

    lines.forEach(l => {
      if (l.t > ease) return;
      const alpha = Math.min((ease - l.t) / 0.12, 1) * 0.8;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();
    });

    ctx.globalAlpha = 1;

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      canvas.style.transition = 'opacity 0.45s ease';
      canvas.style.opacity    = '0';
      setTimeout(() => canvas.remove(), 460);
    }
  }

  requestAnimationFrame(frame);
}

function initSectionFreeze() {
  const sections = document.querySelectorAll('.section');
  const seen     = new Set();

  sections.forEach(s => {
    const r = s.getBoundingClientRect();
    if (r.top < window.innerHeight) seen.add(s);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !seen.has(entry.target)) {
        seen.add(entry.target);
        playFreezeTransition(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  sections.forEach(s => observer.observe(s));
}


/* ===================================================
   3. SNOW MASCOT
   =================================================== */

const MASCOT_STATES = {
  IDLE:     'idle',
  SLEEPING: 'sleeping',
  DANCING:  'dancing',
  WAVING:   'waving',
  JUMPING:  'jumping',
};

const TOOLTIPS = [
  'Olá! 👋',
  'Brr, que frio!',
  'Vamos jogar?',
  'ズブージン! ❄️',
  'Tão gelado aqui...',
  'Click em mim!',
];

let mascotState = MASCOT_STATES.IDLE;
let sleepTimer  = null;
const SLEEP_MS  = 30000;

const MASCOT_SVG = `
<svg id="mascot-svg" viewBox="0 0 70 92" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="35" cy="90" rx="15" ry="3.5" fill="rgba(0,0,0,0.09)"/>
  <circle cx="35" cy="68" r="20" fill="white" stroke="#b4d2ff" stroke-width="1.4"/>
  <circle cx="35" cy="59" r="2" fill="#b4d2ff"/>
  <circle cx="35" cy="67" r="2" fill="#b4d2ff"/>
  <circle cx="35" cy="75" r="2" fill="#b4d2ff"/>
  <line x1="16" y1="64" x2="6"  y2="56" stroke="#8B6914" stroke-width="2"   stroke-linecap="round"/>
  <line x1="6"  y1="56" x2="2"  y2="50" stroke="#8B6914" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="6"  y1="56" x2="2"  y2="57" stroke="#8B6914" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="54" y1="64" x2="64" y2="56" stroke="#8B6914" stroke-width="2"   stroke-linecap="round"/>
  <line x1="64" y1="56" x2="68" y2="50" stroke="#8B6914" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="64" y1="56" x2="68" y2="57" stroke="#8B6914" stroke-width="1.5" stroke-linecap="round"/>
  <rect x="16" y="47" width="38" height="6" rx="3" fill="#187bff" opacity="0.9"/>
  <circle cx="35" cy="30" r="17" fill="white" stroke="#b4d2ff" stroke-width="1.4"/>
  <rect x="14" y="45" width="11" height="9" rx="2" fill="#0f62d6"/>
  <rect x="13" y="15" width="44" height="4" rx="2" fill="#0b1b2b"/>
  <rect x="19" y="2"  width="32" height="15" rx="3" fill="#0b1b2b"/>
  <rect x="19" y="12" width="32" height="3"  rx="1" fill="#187bff" opacity="0.75"/>
  <ellipse class="mascot-eye mascot-eye-left"  cx="27" cy="29" rx="2.5" ry="2.5" fill="#0b1b2b"/>
  <ellipse class="mascot-eye mascot-eye-right" cx="43" cy="29" rx="2.5" ry="2.5" fill="#0b1b2b"/>
  <circle cx="28.2" cy="27.8" r="0.85" fill="white"/>
  <circle cx="44.2" cy="27.8" r="0.85" fill="white"/>
  <polygon points="35,27 39,30 35,33" fill="#ff8c42"/>
  <path class="mascot-mouth" d="M28 36 Q35 41 42 36" stroke="#0b1b2b" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <g id="mascot-zzz" style="display:none">
    <text x="50" y="22" font-size="7"  fill="#b4d2ff" font-weight="800" font-family="Inter,sans-serif">z</text>
    <text x="55" y="14" font-size="9"  fill="#b4d2ff" font-weight="800" font-family="Inter,sans-serif">z</text>
    <text x="61" y="5"  font-size="11" fill="#b4d2ff" font-weight="800" font-family="Inter,sans-serif">Z</text>
  </g>
  <g id="mascot-note" style="display:none">
    <text x="50" y="20" font-size="15" fill="#187bff" font-family="Inter,sans-serif">♪</text>
  </g>
</svg>
`;

function setMascotState(state) {
  if (mascotState === state) return;
  mascotState = state;

  const wrapper = document.getElementById('snow-mascot');
  if (!wrapper) return;

  wrapper.className = `snow-mascot snow-mascot--${state}`;

  const eyeL  = wrapper.querySelector('.mascot-eye-left');
  const eyeR  = wrapper.querySelector('.mascot-eye-right');
  const mouth = wrapper.querySelector('.mascot-mouth');
  const zzz   = document.getElementById('mascot-zzz');
  const note  = document.getElementById('mascot-note');

  if (zzz)  zzz.style.display  = state === MASCOT_STATES.SLEEPING ? 'block' : 'none';
  if (note) note.style.display = state === MASCOT_STATES.DANCING  ? 'block' : 'none';

  if (eyeL && eyeR) {
    const ry = state === MASCOT_STATES.SLEEPING ? '0.7'
             : (state === MASCOT_STATES.DANCING || state === MASCOT_STATES.JUMPING) ? '3.2'
             : '2.5';
    eyeL.setAttribute('ry', ry);
    eyeR.setAttribute('ry', ry);
  }

  if (mouth) {
    const happy = state === MASCOT_STATES.DANCING || state === MASCOT_STATES.JUMPING || state === MASCOT_STATES.WAVING;
    mouth.setAttribute('d', happy ? 'M27 35 Q35 42 43 35' : 'M28 36 Q35 41 42 36');
  }
}

function resetSleepTimer() {
  if (mascotState === MASCOT_STATES.SLEEPING) setMascotState(MASCOT_STATES.IDLE);
  clearTimeout(sleepTimer);
  sleepTimer = setTimeout(() => {
    if (mascotState === MASCOT_STATES.IDLE) setMascotState(MASCOT_STATES.SLEEPING);
  }, SLEEP_MS);
}

function showTooltip(wrapper) {
  const tooltip = wrapper.querySelector('.mascot-tooltip');
  if (!tooltip) return;
  tooltip.textContent = TOOLTIPS[Math.floor(Math.random() * TOOLTIPS.length)];
  tooltip.classList.add('visible');
}

function hideTooltip(wrapper) {
  const tooltip = wrapper.querySelector('.mascot-tooltip');
  if (tooltip) tooltip.classList.remove('visible');
}

function createMascot() {
  const wrapper = document.createElement('div');
  wrapper.id        = 'snow-mascot';
  wrapper.className = 'snow-mascot snow-mascot--idle';
  wrapper.setAttribute('aria-hidden', 'true');

  wrapper.innerHTML = MASCOT_SVG + '<div class="mascot-tooltip"></div>';
  document.body.appendChild(wrapper);

  wrapper.addEventListener('mouseenter', () => {
    if (mascotState === MASCOT_STATES.SLEEPING) setMascotState(MASCOT_STATES.IDLE);
    setMascotState(MASCOT_STATES.WAVING);
    showTooltip(wrapper);
  });

  wrapper.addEventListener('mouseleave', () => {
    setTimeout(() => {
      if (mascotState === MASCOT_STATES.WAVING) setMascotState(MASCOT_STATES.IDLE);
    }, 700);
    hideTooltip(wrapper);
  });

  wrapper.addEventListener('click', () => {
    setMascotState(MASCOT_STATES.JUMPING);
    setTimeout(() => setMascotState(MASCOT_STATES.IDLE), 550);
  });
}

function checkSpotifyState() {
  const activityEl = document.getElementById('ds-activity');
  if (!activityEl) return;

  const isSpotify = activityEl.textContent.toLowerCase().startsWith('ouvindo:');

  if (isSpotify && mascotState === MASCOT_STATES.IDLE) {
    setMascotState(MASCOT_STATES.DANCING);
  } else if (!isSpotify && mascotState === MASCOT_STATES.DANCING) {
    setMascotState(MASCOT_STATES.IDLE);
  }
}


/* ===================================================
   INIT
   =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initCardIce();
  initSectionFreeze();
  createMascot();

  ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, resetSleepTimer, { passive: true });
  });
  resetSleepTimer();

  setInterval(checkSpotifyState, 5000);
});