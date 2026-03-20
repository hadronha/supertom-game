// ============================================================
// SUPERTOM: A Jornada do Coração Elétrico — EDIÇÃO 16-BIT
// Engine principal - HTML5 Canvas Game (16-bit Upgrade)
// ============================================================

'use strict';

// ─── CONFIGURAÇÕES GLOBAIS (16-BIT) ───────────────────────────
const GAME_W = 480;
const GAME_H = 270;
const TILE = 32;
const GRAVITY = 0.35;
const JUMP_FORCE = -9.8;
const MOVE_SPEED = 3.8;
const MAX_FALL = 12;
const ATTACK_RANGE = 32;
const ATTACK_COOLDOWN = 14;

// ─── PALETA 16-BIT EXPANDIDA ──────────────────────────────────
const C = {
  // Fundos
  bg:       '#08081E', bgMid:    '#120A30', bgFar:    '#060614',
  bgDeep:   '#040410', bgNebula1:'#1A0840', bgNebula2:'#0A1848',
  // Cenário
  ground:   '#1E0A4E', platform: '#2D1B6E', platTop:  '#00FFFF',
  platShine:'#88FFFF', platDark: '#1A0E4A',
  wall:     '#150830', wallLine: '#3D1B8E', wallHi:   '#5533AA',
  // Neon
  cyan:     '#00FFFF', cyanDark: '#007799', cyanBright:'#AAFFFF',
  purple:   '#8B00FF', purpleDark:'#440088', purpleBright:'#CC88FF',
  magenta:  '#FF00FF', magentaDark:'#990066',
  // Quentes
  orange:   '#FF6600', orangeLight:'#FF9944',
  gold:     '#FFD700', goldLight:'#FFEE88', goldDark:'#AA8800',
  // Básicas
  white:    '#FFFFFF', offWhite: '#EEEEFF',
  red:      '#FF3333', redDark:  '#CC0000', redBright:'#FF6666',
  green:    '#00FF88', greenDark:'#009955',
  blue:     '#0066FF', blueDark: '#003399', blueLight:'#4499FF',
  darkBlue: '#0D0D2B',
  // Especiais
  heartRed: '#FF1744', heartGlow:'#FF6688',
  neonPink: '#FF0080', neonPinkDark:'#AA0055',
  star:     '#FFFACD', starBright:'#FFFFFF',
  electric: '#88FFFF', electricDark:'#44AACC',
  // UI
  uiBg:     'rgba(0,0,20,0.88)', uiBorder: '#00FFFF',
  btnBg:    'rgba(0,20,60,0.92)', btnBorder:'#00FFFF',
  btnActive:'rgba(0,80,160,0.92)',
  dialogBg: 'rgba(5,0,30,0.96)', dialogBorder:'#6600CC',
  shadow:   'rgba(0,0,0,0.7)',
};

// ─── CANVAS SETUP ─────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let scale = 1;

function resizeCanvas() {
  const ww = window.innerWidth, wh = window.innerHeight;
  scale = Math.min(ww / GAME_W, wh / GAME_H);
  canvas.width = GAME_W; canvas.height = GAME_H;
  canvas.style.width  = Math.floor(GAME_W * scale) + 'px';
  canvas.style.height = Math.floor(GAME_H * scale) + 'px';
  ctx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ─── UTILITÁRIOS ──────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function rnd(min, max) { return Math.random() * (max - min) + min; }
function rndInt(min, max) { return Math.floor(rnd(min, max + 1)); }
function rectOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}
function dist(x1, y1, x2, y2) { return Math.sqrt((x2-x1)**2 + (y2-y1)**2); }

// ─── PIXEL FONT 16-BIT (mais detalhada) ──────────────────────
const FONT_DATA = {
  'A':[[0,1,1,0],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
  'B':[[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,0,1],[1,1,1,0]],
  'C':[[0,1,1,1],[1,0,0,0],[1,0,0,0],[1,0,0,0],[0,1,1,1]],
  'D':[[1,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,1,0]],
  'E':[[1,1,1,1],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,1,1,1]],
  'F':[[1,1,1,1],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,0,0,0]],
  'G':[[0,1,1,1],[1,0,0,0],[1,0,1,1],[1,0,0,1],[0,1,1,1]],
  'H':[[1,0,0,1],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
  'I':[[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
  'J':[[0,0,1],[0,0,1],[0,0,1],[1,0,1],[0,1,0]],
  'K':[[1,0,0,1],[1,0,1,0],[1,1,0,0],[1,0,1,0],[1,0,0,1]],
  'L':[[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,1,1,1]],
  'M':[[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'N':[[1,0,0,1],[1,1,0,1],[1,0,1,1],[1,0,0,1],[1,0,0,1]],
  'O':[[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  'P':[[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,0,0],[1,0,0,0]],
  'Q':[[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,1,0],[0,1,0,1]],
  'R':[[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,1,0],[1,0,0,1]],
  'S':[[0,1,1,1],[1,0,0,0],[0,1,1,0],[0,0,0,1],[1,1,1,0]],
  'T':[[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  'U':[[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  'V':[[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,1,0,1,0],[0,0,1,0,0]],
  'W':[[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
  'X':[[1,0,0,1],[0,1,1,0],[0,1,1,0],[0,1,1,0],[1,0,0,1]],
  'Y':[[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  'Z':[[1,1,1,1],[0,0,1,0],[0,1,0,0],[1,0,0,0],[1,1,1,1]],
  '0':[[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  '1':[[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
  '2':[[0,1,1,0],[1,0,0,1],[0,0,1,0],[0,1,0,0],[1,1,1,1]],
  '3':[[1,1,1,0],[0,0,0,1],[0,1,1,0],[0,0,0,1],[1,1,1,0]],
  '4':[[1,0,0,1],[1,0,0,1],[1,1,1,1],[0,0,0,1],[0,0,0,1]],
  '5':[[1,1,1,1],[1,0,0,0],[1,1,1,0],[0,0,0,1],[1,1,1,0]],
  '6':[[0,1,1,0],[1,0,0,0],[1,1,1,0],[1,0,0,1],[0,1,1,0]],
  '7':[[1,1,1,1],[0,0,0,1],[0,0,1,0],[0,1,0,0],[0,1,0,0]],
  '8':[[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[0,1,1,0]],
  '9':[[0,1,1,0],[1,0,0,1],[0,1,1,1],[0,0,0,1],[0,1,1,0]],
  ':':[[0],[1],[0],[1],[0]],
  '/':[[0,0,1],[0,0,1],[0,1,0],[1,0,0],[1,0,0]],
  '.':[[0],[0],[0],[0],[1]],
  '!':[[1],[1],[1],[0],[1]],
  '?':[[0,1,1,0],[1,0,0,1],[0,0,1,0],[0,0,0,0],[0,0,1,0]],
  '-':[[0,0,0],[0,0,0],[1,1,1],[0,0,0],[0,0,0]],
  ' ':[[0,0],[0,0],[0,0],[0,0],[0,0]],
  ',':[[0],[0],[0],[0,1],[1,0]],
  '+':[[0,0,0],[0,1,0],[1,1,1],[0,1,0],[0,0,0]],
};

function drawPixelText(text, x, y, size, color, align) {
  const str = String(text).toUpperCase();
  let totalW = 0;
  for (const ch of str) {
    const d = FONT_DATA[ch];
    totalW += d ? d[0].length * size + size : 3 * size;
  }
  let cx = align === 'center' ? x - totalW / 2 : align === 'right' ? x - totalW : x;
  // Sombra do texto (16-bit style)
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  let sx = cx;
  for (const ch of str) {
    const d = FONT_DATA[ch];
    if (!d) { sx += 3 * size; continue; }
    for (let r = 0; r < d.length; r++)
      for (let c = 0; c < d[r].length; c++)
        if (d[r][c]) ctx.fillRect(sx + c * size + 1, y + r * size + 1, size, size);
    sx += d[0].length * size + size;
  }
  // Texto principal
  ctx.fillStyle = color;
  for (const ch of str) {
    const d = FONT_DATA[ch];
    if (!d) { cx += 3 * size; continue; }
    for (let r = 0; r < d.length; r++)
      for (let c = 0; c < d[r].length; c++)
        if (d[r][c]) ctx.fillRect(cx + c * size, y + r * size, size, size);
    cx += d[0].length * size + size;
  }
}

// Texto com gradiente (16-bit style)
function drawGradientText(text, x, y, size, color1, color2, align) {
  const str = String(text).toUpperCase();
  let totalW = 0;
  for (const ch of str) {
    const d = FONT_DATA[ch];
    totalW += d ? d[0].length * size + size : 3 * size;
  }
  let cx = align === 'center' ? x - totalW / 2 : align === 'right' ? x - totalW : x;
  // Sombra
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  let sx = cx;
  for (const ch of str) {
    const d = FONT_DATA[ch];
    if (!d) { sx += 3 * size; continue; }
    for (let r = 0; r < d.length; r++)
      for (let c = 0; c < d[r].length; c++)
        if (d[r][c]) ctx.fillRect(sx + c * size + 1, y + r * size + 1, size, size);
    sx += d[0].length * size + size;
  }
  // Texto com gradiente vertical
  for (const ch of str) {
    const d = FONT_DATA[ch];
    if (!d) { cx += 3 * size; continue; }
    for (let r = 0; r < d.length; r++) {
      const t = r / (d.length - 1);
      const rr = Math.round(parseInt(color1.slice(1,3),16) * (1-t) + parseInt(color2.slice(1,3),16) * t);
      const gg = Math.round(parseInt(color1.slice(3,5),16) * (1-t) + parseInt(color2.slice(3,5),16) * t);
      const bb = Math.round(parseInt(color1.slice(5,7),16) * (1-t) + parseInt(color2.slice(5,7),16) * t);
      ctx.fillStyle = `rgb(${rr},${gg},${bb})`;
      for (let c = 0; c < d[r].length; c++)
        if (d[r][c]) ctx.fillRect(cx + c * size, y + r * size, size, size);
    }
    cx += d[0].length * size + size;
  }
}

// ─── SISTEMA DE ÁUDIO 16-BIT ─────────────────────────────────
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playBeep(freq, dur, vol, type) {
  try {
    const a = getAudioCtx();
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type || 'square';
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol || 0.1, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    o.connect(g); g.connect(a.destination);
    o.start(); o.stop(a.currentTime + dur);
  } catch(e) {}
}

// SFX 16-bit (mais ricos com múltiplos canais)
function sfxJump() {
  playBeep(220, 0.08, 0.08, 'triangle');
  playBeep(440, 0.12, 0.06, 'sine');
  setTimeout(() => playBeep(660, 0.06, 0.04, 'sine'), 40);
}
function sfxLand() { playBeep(110, 0.06, 0.05, 'triangle'); }
function sfxCollect() {
  playBeep(880, 0.08, 0.08, 'sine');
  setTimeout(() => playBeep(1100, 0.08, 0.06, 'sine'), 50);
  setTimeout(() => playBeep(1320, 0.12, 0.08, 'sine'), 100);
}
function sfxHit() {
  playBeep(120, 0.15, 0.12, 'sawtooth');
  playBeep(80, 0.2, 0.08, 'square');
}
function sfxAttack() {
  playBeep(300, 0.06, 0.08, 'sawtooth');
  setTimeout(() => playBeep(500, 0.08, 0.06, 'triangle'), 30);
}
function sfxCheckpoint() {
  [523, 659, 784, 1047].forEach((f, i) =>
    setTimeout(() => playBeep(f, 0.12, 0.08, 'sine'), i * 80));
}
function sfxLevelUp() {
  [523, 659, 784, 1047, 1320].forEach((f, i) =>
    setTimeout(() => playBeep(f, 0.15, 0.1, 'sine'), i * 90));
}
function sfxInteract() {
  playBeep(440, 0.05, 0.06, 'sine');
  playBeep(550, 0.08, 0.06, 'triangle');
}
function sfxMenu() { playBeep(330, 0.06, 0.06, 'square'); }
function sfxBossHit() {
  playBeep(80, 0.2, 0.12, 'sawtooth');
  playBeep(60, 0.3, 0.1, 'square');
  setTimeout(() => playBeep(120, 0.15, 0.08, 'triangle'), 80);
}
function sfxVictory() {
  const notes = [523, 659, 784, 1047, 784, 1047, 1320];
  notes.forEach((f, i) => setTimeout(() => playBeep(f, 0.2, 0.1, 'sine'), i * 120));
}

// ─── SISTEMA DE MÚSICA (MP3) ─────────────────────────────────
const musicSystem = {
  intro: null,
  fase1: null,
  current: null,
  volume: 0.35,
  fadeInterval: null,
  unlocked: false,
  pendingTrack: null,

  init() {
    this.intro = new Audio('music_intro_chip.mp3');
    this.intro.loop = true;
    this.intro.volume = 0;
    this.intro.preload = 'auto';

    this.fase1 = new Audio('music_fase1_chip.mp3');
    this.fase1.loop = true;
    this.fase1.volume = 0;
    this.fase1.preload = 'auto';

    // Desbloquear áudio na primeira interação do usuário
    const unlock = () => {
      if (!this.unlocked) {
        this.unlocked = true;
        // Se há uma track pendente, tocar agora
        if (this.pendingTrack) {
          const track = this.pendingTrack;
          this.pendingTrack = null;
          this.current = null; // Reset para permitir play
          this.play(track);
        }
      }
    };
    ['click', 'touchstart', 'keydown', 'pointerdown'].forEach(evt => {
      document.addEventListener(evt, unlock, { once: false });
    });
  },

  play(track) {
    if (this.current === track) return;
    this.stopAll();
    this.current = track;
    const audio = this[track];
    if (!audio) return;
    audio.currentTime = 0;
    audio.volume = 0;
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.then(() => {
        this._fadeIn(audio);
      }).catch(() => {
        // Autoplay bloqueado - guardar track pendente
        this.pendingTrack = track;
      });
    }
  },

  stopAll() {
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    ['intro', 'fase1'].forEach(t => {
      const a = this[t];
      if (a) { a.pause(); a.currentTime = 0; a.volume = 0; }
    });
    this.current = null;
  },

  fadeOut(callback) {
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    const audio = this.current ? this[this.current] : null;
    if (!audio || audio.paused) { if (callback) callback(); return; }
    this.fadeInterval = setInterval(() => {
      if (audio.volume > 0.02) {
        audio.volume = Math.max(0, audio.volume - 0.02);
      } else {
        audio.volume = 0;
        audio.pause();
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        this.current = null;
        if (callback) callback();
      }
    }, 30);
  },

  _fadeIn(audio) {
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    this.fadeInterval = setInterval(() => {
      if (audio.volume < this.volume - 0.02) {
        audio.volume = Math.min(this.volume, audio.volume + 0.02);
      } else {
        audio.volume = this.volume;
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      }
    }, 30);
  }
};

musicSystem.init();

// ─── SISTEMA DE PARTÍCULAS 16-BIT ────────────────────────────
const particles = [];
class Particle {
  constructor(x, y, vx, vy, color, life, size, type) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.color = color;
    this.life = life; this.maxLife = life;
    this.size = size || 2;
    this.type = type || 'square'; // square, circle, spark, star
    this.gravity = 0.05;
    this.friction = 0.98;
    this.rotation = rnd(0, Math.PI * 2);
    this.rotSpeed = rnd(-0.2, 0.2);
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    this.vy += this.gravity;
    this.vx *= this.friction;
    this.life--;
    this.rotation += this.rotSpeed;
  }
  draw() {
    const alpha = this.life / this.maxLife;
    const px = this.x - camera.x;
    const py = this.y - camera.y;
    if (px < -10 || px > GAME_W + 10 || py < -10 || py > GAME_H + 10) return;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    const s = this.size * (0.5 + alpha * 0.5);
    if (this.type === 'circle') {
      ctx.beginPath();
      ctx.arc(px, py, s, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'spark') {
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(this.rotation);
      ctx.fillRect(-s * 2, -0.5, s * 4, 1);
      ctx.fillRect(-0.5, -s * 2, 1, s * 4);
      ctx.restore();
    } else if (this.type === 'star') {
      drawMiniStar(px, py, s, this.color, alpha);
    } else {
      ctx.fillRect(px - s/2, py - s/2, s, s);
    }
    ctx.globalAlpha = 1;
  }
}

function drawMiniStar(x, y, s, color, alpha) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x - s/2, y - s*1.5, s, s*3);
  ctx.fillRect(x - s*1.5, y - s/2, s*3, s);
}

function spawnParticles(x, y, color, count, speed, type, life, size) {
  for (let i = 0; i < count; i++) {
    const angle = rnd(0, Math.PI * 2);
    const spd = rnd(0.5, speed || 3);
    particles.push(new Particle(
      x, y,
      Math.cos(angle) * spd, Math.sin(angle) * spd,
      color, life || rndInt(15, 35), size || rnd(1, 3), type || 'square'
    ));
  }
}

function spawnTrail(x, y, color, dir) {
  particles.push(new Particle(
    x + rnd(-2, 2), y + rnd(-1, 1),
    -dir * rnd(0.5, 1.5), rnd(-0.5, 0.5),
    color, rndInt(8, 15), rnd(1, 2.5), 'circle'
  ));
}

// ─── CÂMERA COM SHAKE 16-BIT ─────────────────────────────────
const camera = { x: 0, y: 0, shakeX: 0, shakeY: 0, shakeDur: 0, shakeIntensity: 0 };

function updateCamera(player, levelW, levelH) {
  const tx = player.x + player.w / 2 - GAME_W / 2;
  const ty = player.y + player.h / 2 - GAME_H / 2;
  camera.x = lerp(camera.x, tx, 0.08);
  camera.y = lerp(camera.y, ty, 0.06);
  camera.x = clamp(camera.x, 0, Math.max(0, levelW - GAME_W));
  camera.y = clamp(camera.y, 0, Math.max(0, levelH - GAME_H));
  // Camera shake
  if (camera.shakeDur > 0) {
    camera.shakeX = rnd(-camera.shakeIntensity, camera.shakeIntensity);
    camera.shakeY = rnd(-camera.shakeIntensity, camera.shakeIntensity);
    camera.shakeDur--;
    camera.shakeIntensity *= 0.9;
  } else {
    camera.shakeX = 0; camera.shakeY = 0;
  }
}

function cameraShake(intensity, duration) {
  camera.shakeIntensity = intensity;
  camera.shakeDur = duration;
}

// ─── ESTRELAS DO FUNDO (16-bit com mais variedade) ───────────
const stars = [];
for (let i = 0; i < 120; i++) {
  stars.push({
    x: rnd(0, GAME_W * 3), y: rnd(0, GAME_H),
    size: rnd(0.5, 2.5), speed: rnd(0.1, 0.5),
    twinkle: rnd(0, Math.PI * 2),
    color: ['#FFFFFF', '#AACCFF', '#FFDDAA', '#FFAACC', '#AAFFCC'][rndInt(0, 4)]
  });
}


// ─── INPUT & TOUCH UNIFICADO ────────────────────────────────
const keys = {};
window.addEventListener('keydown', e => { keys[e.code] = true; e.preventDefault(); });
window.addEventListener('keyup',   e => { keys[e.code] = false; });

let isTouching = false;
const touch = { left: false, right: false, jump: false, interact: false, attack: false };

function isLeft()     { return keys['ArrowLeft']  || keys['KeyA'] || touch.left; }
function isRight()    { return keys['ArrowRight'] || keys['KeyD'] || touch.right; }
function isJump()     { return keys['ArrowUp'] || keys['Space'] || keys['KeyW'] || touch.jump; }
function isInteract() { return keys['KeyE'] || keys['Enter'] || touch.interact; }
function isAttack()   { return keys['KeyX'] || keys['KeyJ'] || touch.attack; }

const touchBtns = [
  { id: 'left',     x: 10,  y: GAME_H - 52, w: 44, h: 44, label: '\u25C4', color: '#334466' },
  { id: 'right',    x: 60,  y: GAME_H - 52, w: 44, h: 44, label: '\u25BA', color: '#334466' },
  { id: 'interact', x: GAME_W - 100, y: GAME_H - 52, w: 44, h: 44, label: 'E', color: '#664433' },
  { id: 'attack',   x: GAME_W - 100, y: GAME_H - 100, w: 44, h: 44, label: 'Z', color: '#663322' },
  { id: 'jump',     x: GAME_W - 52,  y: GAME_H - 52, w: 44, h: 44, label: 'A', color: '#223366' },
];

function getGamePos(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (clientX - r.left) / (r.width / GAME_W),
    y: (clientY - r.top) / (r.height / GAME_H)
  };
}
function checkBtn(btn, gx, gy) {
  return gx >= btn.x && gx <= btn.x + btn.w && gy >= btn.y && gy <= btn.y + btn.h;
}
function updateTouchState(touches) {
  touch.left = false; touch.right = false;
  touch.jump = false; touch.interact = false; touch.attack = false;
  for (let i = 0; i < touches.length; i++) {
    const p = getGamePos(touches[i].clientX, touches[i].clientY);
    for (const btn of touchBtns) {
      if (checkBtn(btn, p.x, p.y)) touch[btn.id] = true;
    }
  }
}
canvas.addEventListener('touchstart', e => { e.preventDefault(); isTouching = true; updateTouchState(e.touches); }, { passive: false });
canvas.addEventListener('touchmove',  e => { e.preventDefault(); updateTouchState(e.touches); }, { passive: false });
canvas.addEventListener('touchend',   e => { e.preventDefault(); updateTouchState(e.touches); }, { passive: false });
canvas.addEventListener('touchcancel',e => { e.preventDefault(); updateTouchState(e.touches); }, { passive: false });

// Mouse (desktop testing)
canvas.addEventListener('mousedown', e => {
  isTouching = true;
  const p = getGamePos(e.clientX, e.clientY);
  for (const btn of touchBtns) {
    if (checkBtn(btn, p.x, p.y)) touch[btn.id] = true;
  }
});
canvas.addEventListener('mouseup', () => {
  for (const key in touch) touch[key] = false;
});


// ─── JOGADOR 16-BIT ──────────────────────────────────────────
class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 20; this.h = 36;
    this.vx = 0; this.vy = 0;
    this.dir = 1; this.onGround = false;
    this.hp = 5; this.maxHp = 5;
    this.orions = 0; this.score = 0;
    this.invincible = 0;
    this.coyoteTime = 0;
    this.jumpBuffer = 0;
    this.wasOnGround = false;
    // 16-bit additions
    this.attacking = false;
    this.attackTimer = 0;
    this.attackCooldown = 0;
    this.animFrame = 0;
    this.animTimer = 0;
    this.state = 'idle'; // idle, run, jump, fall, attack, hurt
    this.runDust = 0;
    this.landSquash = 0;
    this.heartPulse = 0;
    this.trailTimer = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.electricAura = 0;
  }

  update(platforms, enemies, orions, checkpoints, portals, npcs) {
    const prevState = this.state;
    // Invincibility
    if (this.invincible > 0) this.invincible--;
    // Attack cooldown
    if (this.attackCooldown > 0) this.attackCooldown--;
    // Combo timer
    if (this.comboTimer > 0) { this.comboTimer--; } else { this.comboCount = 0; }
    // Heart pulse
    this.heartPulse += 0.08;
    this.electricAura += 0.05;

    // ── ATTACK
    if (isAttack() && this.attackCooldown <= 0 && !this.attacking) {
      this.attacking = true;
      this.attackTimer = 12;
      this.attackCooldown = ATTACK_COOLDOWN;
      sfxAttack();
      // Spawn attack particles
      const ax = this.x + this.w/2 + this.dir * 16;
      const ay = this.y + this.h/2;
      spawnParticles(ax, ay, C.electric, 6, 3, 'spark', 12, 2);
      // Check enemy hits
      for (const e of enemies) {
        if (e.dead) continue;
        const ebox = { x: e.x, y: e.y, w: e.w, h: e.h };
        const abox = { x: ax - 14, y: ay - 14, w: 28, h: 28 };
        if (rectOverlap(abox, ebox)) {
          e.hp--;
          e.hitFlash = 8;
          this.comboCount++;
          this.comboTimer = 60;
          this.score += 100 * this.comboCount;
          cameraShake(3, 6);
          spawnParticles(e.x + e.w/2, e.y + e.h/2, C.cyan, 10, 4, 'spark', 18, 2);
          if (e.hp <= 0) {
            e.dead = true;
            e.deathTimer = 30;
            this.score += 500;
            sfxBossHit();
            cameraShake(5, 10);
            spawnParticles(e.x + e.w/2, e.y + e.h/2, C.orange, 20, 5, 'star', 25, 3);
          } else {
            sfxHit();
          }
        }
      }
    }
    if (this.attackTimer > 0) { this.attackTimer--; }
    else { this.attacking = false; }

    // ── MOVEMENT
    let accel = 0;
    if (isLeft())  { accel = -MOVE_SPEED; this.dir = -1; }
    if (isRight()) { accel =  MOVE_SPEED; this.dir =  1; }
    this.vx = lerp(this.vx, accel, this.onGround ? 0.38 : 0.25);
    if (Math.abs(this.vx) < 0.08) this.vx = 0;

    // Run dust particles
    if (this.onGround && Math.abs(this.vx) > 1.5) {
      this.runDust++;
      if (this.runDust % 4 === 0) {
        spawnTrail(this.x + this.w/2, this.y + this.h, 'rgba(100,80,150,0.5)', this.dir);
      }
    }

    // ── COYOTE TIME & JUMP BUFFER
    if (this.onGround) { this.coyoteTime = 8; }
    else { this.coyoteTime--; }
    if (isJump()) { this.jumpBuffer = 8; }
    else { this.jumpBuffer--; }

    // ── JUMP
    if (this.jumpBuffer > 0 && this.coyoteTime > 0) {
      this.vy = JUMP_FORCE;
      this.coyoteTime = 0;
      this.jumpBuffer = 0;
      sfxJump();
      spawnParticles(this.x + this.w/2, this.y + this.h, C.cyan, 5, 2, 'circle', 12, 2);
    }

    // ── VARIABLE JUMP HEIGHT (soltar = pulo menor)
    if (!isJump() && this.vy < -2) {
      this.vy *= 0.65;
    }

    // ── GRAVITY
    this.vy += GRAVITY;
    if (this.vy > MAX_FALL) this.vy = MAX_FALL;

    // ── COLLISION X
    this.x += this.vx;
    for (const p of platforms) {
      if (rectOverlap(this, p)) {
        if (this.vx > 0) this.x = p.x - this.w;
        else if (this.vx < 0) this.x = p.x + p.w;
        this.vx = 0;
      }
    }

    // ── COLLISION Y
    this.wasOnGround = this.onGround;
    this.onGround = false;
    this.y += this.vy;
    for (const p of platforms) {
      if (rectOverlap(this, p)) {
        if (this.vy > 0) {
          this.y = p.y - this.h;
          if (!this.wasOnGround && this.vy > 3) {
            this.landSquash = 6;
            sfxLand();
            spawnParticles(this.x + this.w/2, this.y + this.h, C.purple, 4, 2, 'circle', 10, 1.5);
          }
          this.onGround = true;
        } else if (this.vy < 0) {
          this.y = p.y + p.h;
        }
        this.vy = 0;
      }
    }

    // ── FALL DEATH
    if (this.y > 800) {
      this.hp--;
      if (this.hp > 0) {
        this.x = game.checkpointX || game.currentLevel.playerStart.x;
        this.y = game.checkpointY || game.currentLevel.playerStart.y;
        this.vy = 0; this.vx = 0;
        this.invincible = 60;
        cameraShake(4, 8);
      }
    }

    // ── ENEMY COLLISION
    for (const e of enemies) {
      if (e.dead || this.invincible > 0) continue;
      if (rectOverlap(this, { x: e.x, y: e.y, w: e.w, h: e.h })) {
        this.hp--;
        this.invincible = 60;
        this.vx = (this.x < e.x ? -1 : 1) * 4;
        this.vy = -5;
        sfxHit();
        cameraShake(5, 10);
        spawnParticles(this.x + this.w/2, this.y + this.h/2, C.red, 12, 4, 'spark', 20, 2);
      }
    }

    // ── COLLECT ORIONS
    for (const o of orions) {
      if (o.collected) continue;
      if (rectOverlap(this, { x: o.x - 8, y: o.y - 8, w: 16, h: 16 })) {
        o.collected = true;
        this.orions++;
        this.score += 50;
        sfxCollect();
        spawnParticles(o.x, o.y, C.gold, 15, 4, 'star', 25, 2.5);
        spawnParticles(o.x, o.y, C.orange, 8, 3, 'circle', 18, 1.5);
      }
    }

    // ── CHECKPOINTS
    for (const cp of checkpoints) {
      if (cp.active) continue;
      if (rectOverlap(this, { x: cp.x, y: cp.y, w: cp.w, h: cp.h })) {
        cp.active = true;
        game.checkpointX = cp.x;
        game.checkpointY = cp.y - 10;
        sfxCheckpoint();
        spawnParticles(cp.x + cp.w/2, cp.y, C.green, 20, 5, 'star', 30, 3);
      }
    }

    // ── PORTAL
    for (const pt of portals) {
      if (rectOverlap(this, { x: pt.x, y: pt.y, w: pt.w, h: pt.h })) {
        game.nextLevel();
      }
    }

    // ── STATE MACHINE (16-bit animation states)
    if (this.attacking) { this.state = 'attack'; }
    else if (this.invincible > 0 && this.invincible > 50) { this.state = 'hurt'; }
    else if (!this.onGround && this.vy < 0) { this.state = 'jump'; }
    else if (!this.onGround && this.vy > 0) { this.state = 'fall'; }
    else if (Math.abs(this.vx) > 0.5) { this.state = 'run'; }
    else { this.state = 'idle'; }

    // Animation frame counter
    this.animTimer++;
    const frameSpeed = this.state === 'run' ? 5 : this.state === 'idle' ? 10 : 6;
    if (this.animTimer >= frameSpeed) {
      this.animTimer = 0;
      this.animFrame++;
    }

    // Land squash
    if (this.landSquash > 0) this.landSquash--;

    // Trail when moving fast
    this.trailTimer++;
    if (Math.abs(this.vx) > 2.5 && this.trailTimer % 2 === 0) {
      spawnTrail(this.x + this.w/2 - this.dir * 8, this.y + this.h * 0.6, C.cyanDark, this.dir);
    }
  }

  draw() {
    if (this.invincible > 0 && this.invincible % 4 < 2) return;

    const px = this.x - camera.x + camera.shakeX;
    const py = this.y - camera.y + camera.shakeY;
    const d = this.dir;
    const f = this.animFrame;
    const t = game.ticks;

    // Squash/stretch
    let scaleX = 1, scaleY = 1;
    if (this.landSquash > 0) {
      scaleX = 1.15; scaleY = 0.85;
    } else if (this.state === 'jump' && this.vy < -5) {
      scaleX = 0.85; scaleY = 1.15;
    }

    ctx.save();
    ctx.translate(px + this.w/2, py + this.h);
    ctx.scale(d * scaleX, scaleY);
    ctx.translate(-this.w/2, -this.h);

    // ── SOMBRA NO CHÃO (16-bit: elipse com gradiente)
    if (this.onGround) {
      const sg = ctx.createRadialGradient(this.w/2, this.h + 1, 0, this.w/2, this.h + 1, 14);
      sg.addColorStop(0, 'rgba(0,0,30,0.5)');
      sg.addColorStop(1, 'rgba(0,0,30,0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.ellipse(this.w/2, this.h + 1, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── AURA ELÉTRICA (16-bit: quando combo > 2)
    if (this.comboCount >= 2) {
      const auraAlpha = 0.15 + Math.sin(this.electricAura) * 0.1;
      ctx.fillStyle = `rgba(0,255,255,${auraAlpha})`;
      ctx.beginPath();
      ctx.ellipse(this.w/2, this.h/2, this.w/2 + 6, this.h/2 + 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── PERNAS 16-bit (com animação de corrida em 6 frames)
    const legAnim = this.state === 'run' ? Math.sin(f * 1.2) * 5 : 0;
    const legAnim2 = this.state === 'run' ? Math.sin(f * 1.2 + Math.PI) * 5 : 0;
    const jumpLeg = this.state === 'jump' ? -2 : this.state === 'fall' ? 2 : 0;

    // Perna esquerda
    ctx.fillStyle = '#1A1A4A'; // calça escura
    ctx.fillRect(4, this.h - 14 + legAnim + jumpLeg, 6, 10);
    ctx.fillStyle = '#222255';
    ctx.fillRect(5, this.h - 14 + legAnim + jumpLeg, 4, 9); // highlight
    // Sapato esquerdo
    ctx.fillStyle = '#333366';
    ctx.fillRect(3, this.h - 5 + legAnim + jumpLeg, 8, 5);
    ctx.fillStyle = '#EEEEFF'; // sola
    ctx.fillRect(3, this.h - 1 + legAnim + jumpLeg, 8, 1);
    ctx.fillStyle = '#4444AA'; // detalhe
    ctx.fillRect(4, this.h - 4 + legAnim + jumpLeg, 2, 1);

    // Perna direita
    ctx.fillStyle = '#1A1A4A';
    ctx.fillRect(10, this.h - 14 + legAnim2 + jumpLeg, 6, 10);
    ctx.fillStyle = '#222255';
    ctx.fillRect(11, this.h - 14 + legAnim2 + jumpLeg, 4, 9);
    // Sapato direito
    ctx.fillStyle = '#333366';
    ctx.fillRect(9, this.h - 5 + legAnim2 + jumpLeg, 8, 5);
    ctx.fillStyle = '#EEEEFF';
    ctx.fillRect(9, this.h - 1 + legAnim2 + jumpLeg, 8, 1);
    ctx.fillStyle = '#4444AA';
    ctx.fillRect(14, this.h - 4 + legAnim2 + jumpLeg, 2, 1);

    // Costura lateral calça
    ctx.fillStyle = '#3333AA';
    ctx.fillRect(3, this.h - 13 + legAnim, 1, 8);
    ctx.fillRect(16, this.h - 13 + legAnim2, 1, 8);

    // ── CORPO: JALECO 16-bit (com gradiente e volume)
    const bodyY = 6;
    // Jaleco base com gradiente
    const jg = ctx.createLinearGradient(0, bodyY, this.w, bodyY + 18);
    jg.addColorStop(0, '#DDDDFF');
    jg.addColorStop(0.3, '#FFFFFF');
    jg.addColorStop(0.7, '#FFFFFF');
    jg.addColorStop(1, '#CCCCEE');
    ctx.fillStyle = jg;
    ctx.fillRect(1, bodyY, 18, 18);

    // Sombra do jaleco (lado)
    ctx.fillStyle = 'rgba(100,100,180,0.3)';
    ctx.fillRect(1, bodyY, 3, 18);
    ctx.fillRect(16, bodyY, 3, 18);

    // Camisa interna azul
    ctx.fillStyle = '#1A3366';
    ctx.fillRect(7, bodyY + 1, 6, 16);
    ctx.fillStyle = '#224488';
    ctx.fillRect(8, bodyY + 2, 4, 14);

    // Lapelas do jaleco
    ctx.fillStyle = '#EEEEFF';
    ctx.fillRect(5, bodyY, 3, 10);
    ctx.fillRect(12, bodyY, 3, 10);
    ctx.fillStyle = '#BBBBDD';
    ctx.fillRect(5, bodyY + 10, 3, 1);
    ctx.fillRect(12, bodyY + 10, 3, 1);

    // Bolso esquerdo
    ctx.fillStyle = '#CCCCEE';
    ctx.fillRect(2, bodyY + 10, 4, 4);
    ctx.fillStyle = '#AAAACC';
    ctx.fillRect(2, bodyY + 10, 4, 1);
    // Caneta no bolso
    ctx.fillStyle = '#0066FF';
    ctx.fillRect(3, bodyY + 8, 1, 4);

    // Bolso direito
    ctx.fillStyle = '#CCCCEE';
    ctx.fillRect(14, bodyY + 10, 4, 4);
    ctx.fillStyle = '#AAAACC';
    ctx.fillRect(14, bodyY + 10, 4, 1);

    // Estetoscópio
    ctx.fillStyle = '#666688';
    ctx.fillRect(6, bodyY + 2, 1, 6);
    ctx.fillStyle = '#888899';
    ctx.fillRect(5, bodyY + 7, 3, 2);
    ctx.fillRect(6, bodyY + 8, 1, 1);

    // ── CORAÇÃO ELÉTRICO 16-bit (com glow pulsante e raios)
    const pulse = Math.sin(this.heartPulse) * 0.3 + 0.7;
    const hx = 8, hy = bodyY + 4;

    // Glow externo
    const hglow = ctx.createRadialGradient(hx + 2, hy + 2, 0, hx + 2, hy + 2, 8 * pulse);
    hglow.addColorStop(0, `rgba(0,255,255,${0.3 * pulse})`);
    hglow.addColorStop(0.5, `rgba(0,200,255,${0.15 * pulse})`);
    hglow.addColorStop(1, 'rgba(0,100,200,0)');
    ctx.fillStyle = hglow;
    ctx.beginPath();
    ctx.arc(hx + 2, hy + 2, 8 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Coração pixel art
    ctx.fillStyle = `rgba(255,23,68,${pulse})`;
    ctx.fillRect(hx, hy, 1, 2);
    ctx.fillRect(hx + 1, hy - 1, 1, 3);
    ctx.fillRect(hx + 2, hy, 1, 3);
    ctx.fillRect(hx + 3, hy - 1, 1, 3);
    ctx.fillRect(hx + 4, hy, 1, 2);

    // Raios elétricos (16-bit style)
    if (pulse > 0.8) {
      ctx.fillStyle = C.electric;
      const rx = hx + 2 + Math.sin(t * 0.3) * 3;
      const ry = hy + Math.cos(t * 0.4) * 2;
      ctx.fillRect(rx - 3, ry, 2, 1);
      ctx.fillRect(rx + 3, ry + 1, 2, 1);
      ctx.fillRect(rx, ry - 3, 1, 2);
    }

    // ── BRAÇOS 16-bit (com animação de ataque e corrida)
    const armSwing = this.state === 'run' ? Math.sin(f * 1.2) * 4 : 0;
    const attackSwing = this.attacking ? 8 : 0;

    // Braço traseiro (mais escuro)
    ctx.fillStyle = '#BBBBDD';
    ctx.fillRect(-2, bodyY + 2 - armSwing, 4, 10);
    ctx.fillStyle = '#DDBB88'; // mão
    ctx.fillRect(-2, bodyY + 11 - armSwing, 3, 3);

    // Braço frontal
    ctx.fillStyle = '#DDDDFF';
    ctx.fillRect(this.w - 2, bodyY + 2 + armSwing + attackSwing, 4, 10);
    ctx.fillStyle = '#EECCAA'; // mão
    ctx.fillRect(this.w - 2, bodyY + 11 + armSwing + attackSwing, 3, 3);

    // ── EFEITO DE ATAQUE (16-bit: arco de energia)
    if (this.attacking && this.attackTimer > 4) {
      const aProgress = 1 - (this.attackTimer - 4) / 8;
      ctx.strokeStyle = `rgba(0,255,255,${1 - aProgress})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.w/2 + 12, this.h/2 - 4, 14 + aProgress * 6, -Math.PI * 0.6, Math.PI * 0.4);
      ctx.stroke();
      // Partículas de energia no arco
      ctx.fillStyle = `rgba(136,255,255,${0.8 - aProgress})`;
      const aAngle = -Math.PI * 0.6 + aProgress * Math.PI;
      ctx.fillRect(this.w/2 + 12 + Math.cos(aAngle) * 16, this.h/2 - 4 + Math.sin(aAngle) * 16, 2, 2);
    }

    // ── PESCOÇO
    ctx.fillStyle = '#EECCAA';
    ctx.fillRect(7, bodyY - 2, 6, 4);
    ctx.fillStyle = '#DDBB99';
    ctx.fillRect(7, bodyY - 2, 1, 3); // sombra lateral

    // ── CABEÇA 16-bit (maior, mais detalhada)
    const headY = -8;
    // Forma da cabeça
    ctx.fillStyle = '#EECCAA';
    ctx.fillRect(3, headY, 14, 12);
    // Sombreamento lateral
    ctx.fillStyle = '#DDBB99';
    ctx.fillRect(3, headY, 2, 12);
    ctx.fillRect(15, headY, 2, 12);
    // Sombreamento inferior (queixo)
    ctx.fillStyle = '#DDBB88';
    ctx.fillRect(5, headY + 10, 10, 2);

    // Bochechas rosadas
    ctx.fillStyle = 'rgba(255,120,120,0.35)';
    ctx.fillRect(4, headY + 6, 3, 2);
    ctx.fillRect(13, headY + 6, 3, 2);

    // Olhos 16-bit (com íris, pupila e brilho)
    // Olho esquerdo
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, headY + 3, 4, 4);
    ctx.fillStyle = '#2244AA'; // íris
    ctx.fillRect(6, headY + 4, 2, 3);
    ctx.fillStyle = '#112266'; // pupila
    ctx.fillRect(6, headY + 5, 2, 2);
    ctx.fillStyle = '#FFFFFF'; // brilho
    ctx.fillRect(7, headY + 4, 1, 1);

    // Olho direito
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(11, headY + 3, 4, 4);
    ctx.fillStyle = '#2244AA';
    ctx.fillRect(12, headY + 4, 2, 3);
    ctx.fillStyle = '#112266';
    ctx.fillRect(12, headY + 5, 2, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(13, headY + 4, 1, 1);

    // Sobrancelhas (expressivas)
    ctx.fillStyle = '#553322';
    if (this.attacking) {
      ctx.fillRect(5, headY + 2, 4, 1);
      ctx.fillRect(11, headY + 2, 4, 1);
    } else {
      ctx.fillRect(5, headY + 2, 4, 1);
      ctx.fillRect(11, headY + 2, 4, 1);
    }

    // Nariz
    ctx.fillStyle = '#DDAA88';
    ctx.fillRect(9, headY + 6, 2, 2);

    // Boca (muda com estado)
    if (this.attacking) {
      ctx.fillStyle = '#CC4444';
      ctx.fillRect(7, headY + 9, 6, 1); // boca aberta
      ctx.fillStyle = '#881111';
      ctx.fillRect(8, headY + 9, 4, 1);
    } else if (this.state === 'hurt') {
      ctx.fillStyle = '#CC6644';
      ctx.fillRect(8, headY + 9, 4, 2);
    } else {
      ctx.fillStyle = '#CC8866';
      ctx.fillRect(8, headY + 9, 4, 1); // sorriso
      ctx.fillStyle = '#DDAA88';
      ctx.fillRect(8, headY + 8, 4, 1);
    }

    // Orelhas
    ctx.fillStyle = '#DDBB99';
    ctx.fillRect(2, headY + 4, 2, 3);
    ctx.fillRect(16, headY + 4, 2, 3);
    ctx.fillStyle = '#CC9977';
    ctx.fillRect(2, headY + 5, 1, 1);
    ctx.fillRect(17, headY + 5, 1, 1);

    // ── CABELO 16-bit (topete volumoso com gradiente)
    // Base do cabelo
    ctx.fillStyle = '#774422';
    ctx.fillRect(3, headY - 3, 14, 5);
    // Topete com volume
    ctx.fillStyle = '#885533';
    ctx.fillRect(5, headY - 5, 8, 4);
    ctx.fillStyle = '#996644';
    ctx.fillRect(6, headY - 6, 6, 3);
    ctx.fillStyle = '#AA7755';
    ctx.fillRect(7, headY - 7, 5, 2);
    // Highlight do cabelo
    ctx.fillStyle = '#BB8866';
    ctx.fillRect(8, headY - 6, 3, 1);
    ctx.fillRect(7, headY - 4, 2, 1);
    // Laterais do cabelo
    ctx.fillStyle = '#663311';
    ctx.fillRect(2, headY - 1, 2, 4);
    ctx.fillRect(16, headY - 1, 2, 4);

    ctx.restore();
  }
}


// ─── INIMIGO 16-BIT ─────────────────────────────────────────
class Enemy {
  constructor(x, y, type, patrolW) {
    this.x = x; this.y = y;
    this.type = type || 'drone';
    this.w = type === 'heavy' ? 24 : 18;
    this.h = type === 'heavy' ? 26 : 16;
    this.hp = type === 'heavy' ? 3 : 2;
    this.maxHp = this.hp;
    this.startX = x; this.patrolW = patrolW || 80;
    this.dir = 1; this.speed = type === 'heavy' ? 0.5 : 0.9;
    this.dead = false; this.deathTimer = 0;
    this.hitFlash = 0;
    this.animFrame = 0; this.animTimer = 0;
    this.alertState = 'patrol'; // patrol, alert, chase
    this.alertTimer = 0;
    this.sightRange = type === 'heavy' ? 80 : 90;
    this.floatY = 0;
  }

  update(player) {
    if (this.dead) {
      this.deathTimer--;
      if (this.deathTimer > 0) {
        spawnParticles(this.x + this.w/2, this.y + this.h/2,
          this.type === 'heavy' ? C.orange : C.magenta, 1, 2, 'spark', 8, 1.5);
      }
      return;
    }
    if (this.hitFlash > 0) this.hitFlash--;
    this.animTimer++;
    if (this.animTimer >= 6) { this.animTimer = 0; this.animFrame++; }
    this.floatY = Math.sin(this.animFrame * 0.3) * 2;

    // 16-bit AI: detect player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (this.alertState === 'patrol') {
      // Patrol movement
      this.x += this.speed * this.dir;
      if (this.x > this.startX + this.patrolW) this.dir = -1;
      if (this.x < this.startX) this.dir = 1;
      // Detect player
      if (distance < this.sightRange) {
        this.alertState = 'alert';
        this.alertTimer = 30;
      }
    } else if (this.alertState === 'alert') {
      this.alertTimer--;
      if (this.alertTimer <= 0) {
        this.alertState = 'chase';
      }
    } else if (this.alertState === 'chase') {
      // Chase player
      const chaseSpeed = this.speed * 1.2;
      if (dx > 5) { this.x += chaseSpeed; this.dir = 1; }
      else if (dx < -5) { this.x -= chaseSpeed; this.dir = -1; }
      // Return to patrol if player is far
      if (distance > this.sightRange * 2) {
        this.alertState = 'patrol';
      }
    }
  }

  draw() {
    if (this.dead && this.deathTimer <= 0) return;
    const px = this.x - camera.x + camera.shakeX;
    const py = this.y - camera.y + camera.shakeY + this.floatY;
    if (px < -30 || px > GAME_W + 30) return;

    if (this.dead) {
      ctx.globalAlpha = this.deathTimer / 30;
    }
    if (this.hitFlash > 0 && this.hitFlash % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    ctx.save();
    ctx.translate(px + this.w/2, py + this.h/2);
    ctx.scale(this.dir, 1);
    ctx.translate(-this.w/2, -this.h/2);

    if (this.type === 'drone') {
      this.drawDrone16();
    } else {
      this.drawHeavy16();
    }

    ctx.restore();
    ctx.globalAlpha = 1;

    // Alert indicator
    if (this.alertState === 'alert' && !this.dead) {
      ctx.fillStyle = C.red;
      drawPixelText('!', px + this.w/2, py - 12, 2, C.red, 'center');
    }
    if (this.alertState === 'chase' && !this.dead) {
      ctx.fillStyle = C.red;
      drawPixelText('!!', px + this.w/2, py - 12, 2, C.red, 'center');
    }

    // HP bar (16-bit style)
    if (!this.dead && this.hp < this.maxHp) {
      const barW = this.w + 4;
      const barX = px - 2;
      const barY = py - 8 + this.floatY;
      ctx.fillStyle = '#220000';
      ctx.fillRect(barX, barY, barW, 3);
      ctx.fillStyle = C.red;
      ctx.fillRect(barX, barY, barW * (this.hp / this.maxHp), 3);
      ctx.fillStyle = C.redBright;
      ctx.fillRect(barX, barY, barW * (this.hp / this.maxHp), 1);
    }
  }

  drawDrone16() {
    const w = this.w, h = this.h;
    // Corpo do drone (16-bit com gradiente)
    ctx.fillStyle = '#2A0044';
    ctx.fillRect(2, 4, w - 4, h - 6);
    ctx.fillStyle = '#3D0066';
    ctx.fillRect(3, 5, w - 6, h - 8);
    // Highlight superior
    ctx.fillStyle = '#5500AA';
    ctx.fillRect(3, 5, w - 6, 2);

    // Olho vermelho com glow
    const eyeGlow = ctx.createRadialGradient(w/2, h/2 - 1, 0, w/2, h/2 - 1, 6);
    eyeGlow.addColorStop(0, '#FF4444');
    eyeGlow.addColorStop(0.5, '#FF000088');
    eyeGlow.addColorStop(1, '#FF000000');
    ctx.fillStyle = eyeGlow;
    ctx.beginPath();
    ctx.arc(w/2, h/2 - 1, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(w/2 - 2, h/2 - 3, 4, 4);
    ctx.fillStyle = '#FF6666';
    ctx.fillRect(w/2 - 1, h/2 - 2, 1, 1);

    // Hélices animadas
    const hRot = this.animFrame * 0.8;
    ctx.fillStyle = '#8866CC';
    ctx.fillRect(1 + Math.sin(hRot) * 2, 1, 5, 2);
    ctx.fillRect(w - 6 + Math.cos(hRot) * 2, 1, 5, 2);
    // Eixos das hélices
    ctx.fillStyle = '#666688';
    ctx.fillRect(3, 2, 2, 3);
    ctx.fillRect(w - 5, 2, 2, 3);

    // Antena
    ctx.fillStyle = '#8866CC';
    ctx.fillRect(w/2, 0, 1, 4);
    ctx.fillStyle = this.alertState === 'chase' ? '#FF0000' : '#00FF88';
    ctx.fillRect(w/2 - 1, 0, 3, 1);

    // Brilho inferior (motor)
    ctx.fillStyle = `rgba(255,0,100,${0.3 + Math.sin(this.animFrame * 0.5) * 0.2})`;
    ctx.fillRect(4, h - 3, w - 8, 2);
  }

  drawHeavy16() {
    const w = this.w, h = this.h;
    // Corpo do robô pesado (16-bit)
    // Pernas
    const legAnim = Math.sin(this.animFrame * 0.4) * 2;
    ctx.fillStyle = '#333355';
    ctx.fillRect(3, h - 8 + legAnim, 6, 8);
    ctx.fillRect(w - 9, h - 8 - legAnim, 6, 8);
    ctx.fillStyle = '#444477';
    ctx.fillRect(4, h - 7 + legAnim, 4, 6);
    ctx.fillRect(w - 8, h - 7 - legAnim, 4, 6);
    // Pés
    ctx.fillStyle = '#555588';
    ctx.fillRect(2, h - 2, 8, 2);
    ctx.fillRect(w - 10, h - 2, 8, 2);

    // Torso com armadura
    ctx.fillStyle = '#2A2A55';
    ctx.fillRect(2, 6, w - 4, h - 14);
    ctx.fillStyle = '#333377';
    ctx.fillRect(3, 7, w - 6, h - 16);
    // Highlight
    ctx.fillStyle = '#4444AA';
    ctx.fillRect(3, 7, w - 6, 2);

    // Cruz vermelha no peito
    ctx.fillStyle = '#CC0000';
    ctx.fillRect(w/2 - 1, 9, 2, 6);
    ctx.fillRect(w/2 - 3, 11, 6, 2);
    ctx.fillStyle = '#FF3333';
    ctx.fillRect(w/2 - 1, 10, 2, 1);

    // Visor vermelho
    const visorGlow = ctx.createRadialGradient(w/2, 3, 0, w/2, 3, 5);
    visorGlow.addColorStop(0, '#FF4444');
    visorGlow.addColorStop(1, '#FF000000');
    ctx.fillStyle = visorGlow;
    ctx.beginPath();
    ctx.arc(w/2, 3, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#880000';
    ctx.fillRect(4, 1, w - 8, 5);
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(5, 2, w - 10, 3);
    ctx.fillStyle = '#FF6666';
    ctx.fillRect(6, 2, 2, 1);

    // Braços robustos
    ctx.fillStyle = '#2A2A55';
    ctx.fillRect(-2, 8, 4, 10);
    ctx.fillRect(w - 2, 8, 4, 10);
    ctx.fillStyle = '#444477';
    ctx.fillRect(-1, 9, 2, 8);
    ctx.fillRect(w - 1, 9, 2, 8);
    // Punhos
    ctx.fillStyle = '#555588';
    ctx.fillRect(-3, 16, 5, 4);
    ctx.fillRect(w - 2, 16, 5, 4);

    // Antena
    ctx.fillStyle = '#666688';
    ctx.fillRect(w/2, -3, 1, 4);
    ctx.fillStyle = this.alertState === 'chase' ? '#FF0000' : '#FFAA00';
    ctx.fillRect(w/2 - 1, -3, 3, 2);
  }
}

// ─── BOSS 16-BIT ────────────────────────────────────────────
class Boss {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 40; this.h = 48;
    this.hp = 10; this.maxHp = 10;
    this.dir = -1; this.speed = 1;
    this.dead = false; this.deathTimer = 0;
    this.hitFlash = 0;
    this.phase = 1; // 1, 2, 3
    this.animFrame = 0; this.animTimer = 0;
    this.attackPattern = 0;
    this.attackTimer = 0;
    this.floatY = 0;
    this.chargeTimer = 0;
    this.charging = false;
    this.projectiles = [];
  }

  update(player) {
    if (this.dead) {
      this.deathTimer--;
      if (this.deathTimer > 0 && this.deathTimer % 3 === 0) {
        spawnParticles(
          this.x + rnd(0, this.w), this.y + rnd(0, this.h),
          [C.orange, C.red, C.gold, C.magenta][rndInt(0, 3)],
          5, 4, 'star', 20, 3
        );
        cameraShake(3, 4);
      }
      return;
    }
    if (this.hitFlash > 0) this.hitFlash--;
    this.animTimer++;
    if (this.animTimer >= 5) { this.animTimer = 0; this.animFrame++; }
    this.floatY = Math.sin(this.animFrame * 0.15) * 3;

    // Phase transitions
    if (this.hp <= this.maxHp * 0.66 && this.phase === 1) {
      this.phase = 2; this.speed = 1.5;
      cameraShake(6, 15);
      spawnParticles(this.x + this.w/2, this.y + this.h/2, C.magenta, 25, 5, 'star', 30, 3);
    }
    if (this.hp <= this.maxHp * 0.33 && this.phase === 2) {
      this.phase = 3; this.speed = 2;
      cameraShake(8, 20);
      spawnParticles(this.x + this.w/2, this.y + this.h/2, C.red, 30, 6, 'star', 35, 4);
    }

    // Movement: track player
    const dx = player.x - this.x;
    if (dx > 10) { this.x += this.speed; this.dir = 1; }
    else if (dx < -10) { this.x -= this.speed; this.dir = -1; }

    // Attack patterns
    this.attackTimer++;
    const attackInterval = this.phase === 1 ? 120 : this.phase === 2 ? 80 : 55;
    if (this.attackTimer >= attackInterval) {
      this.attackTimer = 0;
      // Spawn projectile
      this.projectiles.push({
        x: this.x + this.w/2,
        y: this.y + this.h/2,
        vx: (dx > 0 ? 1 : -1) * (2 + this.phase),
        vy: rnd(-1, 1),
        life: 120,
        size: 3 + this.phase
      });
      sfxAttack();
    }

    // Update projectiles
    for (const p of this.projectiles) {
      p.x += p.vx; p.y += p.vy;
      p.life--;
      // Hit player
      if (player.invincible <= 0 && rectOverlap(
        { x: p.x - p.size, y: p.y - p.size, w: p.size * 2, h: p.size * 2 },
        player
      )) {
        player.hp--;
        player.invincible = 60;
        player.vx = (player.x < p.x ? -1 : 1) * 4;
        player.vy = -4;
        p.life = 0;
        sfxHit();
        cameraShake(4, 8);
        spawnParticles(player.x + player.w/2, player.y + player.h/2, C.red, 10, 4, 'spark', 15, 2);
      }
    }
    this.projectiles = this.projectiles.filter(p => p.life > 0);
  }

  draw() {
    if (this.dead && this.deathTimer <= 0) return;
    const px = this.x - camera.x + camera.shakeX;
    const py = this.y - camera.y + camera.shakeY + this.floatY;
    if (px < -50 || px > GAME_W + 50) return;

    if (this.dead) ctx.globalAlpha = this.deathTimer / 60;
    if (this.hitFlash > 0 && this.hitFlash % 2 === 0) ctx.globalAlpha = 0.5;

    ctx.save();
    ctx.translate(px + this.w/2, py + this.h/2);
    ctx.scale(this.dir, 1);
    ctx.translate(-this.w/2, -this.h/2);

    // Aura do boss (muda com fase)
    const auraColor = this.phase === 1 ? 'rgba(139,0,255,' : this.phase === 2 ? 'rgba(255,0,128,' : 'rgba(255,0,0,';
    const auraSize = 30 + this.phase * 5 + Math.sin(this.animFrame * 0.2) * 5;
    const ag = ctx.createRadialGradient(this.w/2, this.h/2, 0, this.w/2, this.h/2, auraSize);
    ag.addColorStop(0, auraColor + '0.2)');
    ag.addColorStop(1, auraColor + '0)');
    ctx.fillStyle = ag;
    ctx.beginPath();
    ctx.arc(this.w/2, this.h/2, auraSize, 0, Math.PI * 2);
    ctx.fill();

    // Corpo do boss — grande robô sombrio
    // Pernas
    const legA = Math.sin(this.animFrame * 0.3) * 3;
    ctx.fillStyle = '#1A0033';
    ctx.fillRect(6, this.h - 16 + legA, 10, 16);
    ctx.fillRect(this.w - 16, this.h - 16 - legA, 10, 16);
    ctx.fillStyle = '#2A0055';
    ctx.fillRect(7, this.h - 15 + legA, 8, 14);
    ctx.fillRect(this.w - 15, this.h - 15 - legA, 8, 14);
    // Pés
    ctx.fillStyle = '#3A0077';
    ctx.fillRect(4, this.h - 2, 14, 2);
    ctx.fillRect(this.w - 18, this.h - 2, 14, 2);

    // Torso
    ctx.fillStyle = '#1A0033';
    ctx.fillRect(4, 10, this.w - 8, this.h - 26);
    ctx.fillStyle = '#2A0055';
    ctx.fillRect(5, 11, this.w - 10, this.h - 28);
    ctx.fillStyle = '#3A0077';
    ctx.fillRect(5, 11, this.w - 10, 3);

    // Núcleo de energia (muda com fase)
    const coreColor = this.phase === 1 ? '#8B00FF' : this.phase === 2 ? '#FF0080' : '#FF0000';
    const corePulse = Math.sin(this.animFrame * 0.3) * 0.3 + 0.7;
    const cg = ctx.createRadialGradient(this.w/2, 22, 0, this.w/2, 22, 8);
    cg.addColorStop(0, coreColor);
    cg.addColorStop(0.5, coreColor + '88');
    cg.addColorStop(1, coreColor + '00');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(this.w/2, 22, 8 * corePulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = coreColor;
    ctx.fillRect(this.w/2 - 3, 19, 6, 6);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(this.w/2 - 1, 20, 2, 2);

    // Cabeça
    ctx.fillStyle = '#1A0033';
    ctx.fillRect(8, 0, this.w - 16, 12);
    ctx.fillStyle = '#2A0055';
    ctx.fillRect(9, 1, this.w - 18, 10);
    // Olhos
    ctx.fillStyle = coreColor;
    ctx.fillRect(12, 4, 4, 3);
    ctx.fillRect(this.w - 16, 4, 4, 3);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(13, 4, 1, 1);
    ctx.fillRect(this.w - 15, 4, 1, 1);
    // Chifres
    ctx.fillStyle = '#3A0077';
    ctx.fillRect(6, -4, 3, 6);
    ctx.fillRect(this.w - 9, -4, 3, 6);
    ctx.fillStyle = coreColor;
    ctx.fillRect(6, -4, 3, 2);
    ctx.fillRect(this.w - 9, -4, 3, 2);

    // Braços
    ctx.fillStyle = '#1A0033';
    ctx.fillRect(-4, 12, 8, 18);
    ctx.fillRect(this.w - 4, 12, 8, 18);
    ctx.fillStyle = '#2A0055';
    ctx.fillRect(-3, 13, 6, 16);
    ctx.fillRect(this.w - 3, 13, 6, 16);
    // Punhos com glow
    ctx.fillStyle = '#3A0077';
    ctx.fillRect(-5, 28, 9, 6);
    ctx.fillRect(this.w - 4, 28, 9, 6);
    ctx.fillStyle = coreColor + '88';
    ctx.fillRect(-4, 29, 7, 1);
    ctx.fillRect(this.w - 3, 29, 7, 1);

    ctx.restore();
    ctx.globalAlpha = 1;

    // Draw projectiles
    for (const p of this.projectiles) {
      const ppx = p.x - camera.x + camera.shakeX;
      const ppy = p.y - camera.y + camera.shakeY;
      const pg = ctx.createRadialGradient(ppx, ppy, 0, ppx, ppy, p.size * 2);
      const pColor = this.phase === 1 ? '#8B00FF' : this.phase === 2 ? '#FF0080' : '#FF0000';
      pg.addColorStop(0, '#FFFFFF');
      pg.addColorStop(0.3, pColor);
      pg.addColorStop(1, pColor + '00');
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(ppx, ppy, p.size * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = pColor;
      ctx.fillRect(ppx - p.size/2, ppy - p.size/2, p.size, p.size);
    }

    // Boss HP bar
    if (!this.dead) {
      const barW = 60;
      const barX = px + this.w/2 - barW/2;
      const barY = py - 14;
      ctx.fillStyle = '#220022';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, 6);
      ctx.fillStyle = '#440044';
      ctx.fillRect(barX, barY, barW, 4);
      const hpRatio = this.hp / this.maxHp;
      const hpColor = hpRatio > 0.5 ? C.purple : hpRatio > 0.25 ? C.magenta : C.red;
      ctx.fillStyle = hpColor;
      ctx.fillRect(barX, barY, barW * hpRatio, 4);
      ctx.fillStyle = '#FFFFFF44';
      ctx.fillRect(barX, barY, barW * hpRatio, 1);
    }
  }
}

// ─── NPC 16-BIT ─────────────────────────────────────────────
class NPC {
  constructor(x, y, type, dialog) {
    this.x = x; this.y = y;
    this.type = type; // 'botop' or 'vivi'
    this.w = 20; this.h = 36;
    this.dialog = dialog || [];
    this.dialogIndex = 0;
    this.showDialog = false;
    this.interacted = false;
    this.animFrame = 0; this.animTimer = 0;
    this.floatOffset = rnd(0, Math.PI * 2);
  }

  update(player) {
    this.animTimer++;
    if (this.animTimer >= 8) { this.animTimer = 0; this.animFrame++; }

    const dx = Math.abs(player.x - this.x);
    const dy = Math.abs(player.y - this.y);
    const near = dx < 40 && dy < 40;

    if (near && isInteract() && !this.interacted) {
      this.interacted = true;
      this.showDialog = true;
      this.dialogIndex = 0;
      sfxInteract();
      if (this.type === 'botop') {
        player.hp = Math.min(player.hp + 1, player.maxHp);
        spawnParticles(player.x + player.w/2, player.y, C.green, 10, 3, 'star', 20, 2);
      }
    }
    if (this.showDialog && isInteract() && this.interacted) {
      // Advance dialog on next press
    }
    if (!near) {
      this.interacted = false;
      this.showDialog = false;
    }
  }

  draw() {
    const px = this.x - camera.x + camera.shakeX;
    const py = this.y - camera.y + camera.shakeY;
    if (px < -30 || px > GAME_W + 30) return;

    if (this.type === 'vivi') this.drawVivi16(px, py);
    else this.drawBotop16(px, py);

    // Interaction prompt
    const player = game.player;
    if (player) {
      const dx = Math.abs(player.x - this.x);
      const dy = Math.abs(player.y - this.y);
      if (dx < 40 && dy < 40 && !this.showDialog) {
        const promptY = py - 16 + Math.sin(game.ticks * 0.08) * 2;
        drawPixelText('E', px + this.w/2, promptY, 2, C.gold, 'center');
      }
    }

    // Dialog box (16-bit style)
    if (this.showDialog && this.dialog.length > 0) {
      const dw = 200, dh = 50;
      const dx = GAME_W / 2 - dw / 2;
      const dy = GAME_H - 70;
      // Box background with gradient
      ctx.fillStyle = C.dialogBg;
      ctx.fillRect(dx, dy, dw, dh);
      // Border (double line 16-bit style)
      ctx.strokeStyle = C.dialogBorder;
      ctx.lineWidth = 1;
      ctx.strokeRect(dx + 1, dy + 1, dw - 2, dh - 2);
      ctx.strokeStyle = C.uiBorder;
      ctx.strokeRect(dx, dy, dw, dh);
      // Name tag
      const name = this.type === 'vivi' ? 'VIVI' : 'BOTOP';
      const nameColor = this.type === 'vivi' ? C.purple : C.cyan;
      ctx.fillStyle = 'rgba(0,0,30,0.9)';
      ctx.fillRect(dx + 6, dy - 5, name.length * 6 + 8, 10);
      drawPixelText(name, dx + 10, dy - 4, 1, nameColor, 'left');
      // Dialog text
      const text = this.dialog[this.dialogIndex % this.dialog.length];
      drawPixelText(text, dx + 8, dy + 10, 1, C.white, 'left');
      // Continue indicator
      if (game.ticks % 40 < 20) {
        drawPixelText('...', dx + dw - 20, dy + dh - 12, 1, C.cyan, 'left');
      }
    }
  }

  drawVivi16(px, py) {
    const t = game.ticks;
    const f = this.animFrame;

    // ── AURA MÁGICA 16-bit (3 camadas pulsantes)
    for (let layer = 3; layer >= 1; layer--) {
      const auraSize = 20 + layer * 6 + Math.sin(t * 0.04 + layer) * 3;
      const auraAlpha = 0.06 + (4 - layer) * 0.03;
      const ag = ctx.createRadialGradient(px + this.w/2, py + this.h/2, 0, px + this.w/2, py + this.h/2, auraSize);
      ag.addColorStop(0, `rgba(139,0,255,${auraAlpha})`);
      ag.addColorStop(0.6, `rgba(100,0,200,${auraAlpha * 0.5})`);
      ag.addColorStop(1, 'rgba(80,0,160,0)');
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.arc(px + this.w/2, py + this.h/2, auraSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6 partículas mágicas orbitando
    for (let i = 0; i < 6; i++) {
      const angle = t * 0.03 + i * (Math.PI * 2 / 6);
      const radius = 16 + Math.sin(t * 0.05 + i) * 4;
      const mx = px + this.w/2 + Math.cos(angle) * radius;
      const my = py + this.h/2 + Math.sin(angle) * radius;
      const pColor = i % 2 === 0 ? C.purple : C.cyan;
      ctx.fillStyle = pColor;
      ctx.fillRect(mx - 1, my - 1, 2, 2);
      ctx.fillStyle = pColor + '44';
      ctx.fillRect(mx - 2, my - 2, 4, 4);
    }

    // ── SOMBRA
    const sg = ctx.createRadialGradient(px + this.w/2, py + this.h + 1, 0, px + this.w/2, py + this.h + 1, 12);
    sg.addColorStop(0, 'rgba(80,0,120,0.4)');
    sg.addColorStop(1, 'rgba(80,0,120,0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.ellipse(px + this.w/2, py + this.h + 1, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── PERNAS com botas de combate
    const breathe = Math.sin(f * 0.3) * 0.5;
    ctx.fillStyle = '#1A0044';
    ctx.fillRect(px + 4, py + this.h - 14, 5, 10);
    ctx.fillRect(px + 11, py + this.h - 14, 5, 10);
    ctx.fillStyle = '#2A0066';
    ctx.fillRect(px + 5, py + this.h - 13, 3, 8);
    ctx.fillRect(px + 12, py + this.h - 13, 3, 8);
    // Botas
    ctx.fillStyle = '#220055';
    ctx.fillRect(px + 3, py + this.h - 5, 7, 5);
    ctx.fillRect(px + 10, py + this.h - 5, 7, 5);
    ctx.fillStyle = '#00AAFF';
    ctx.fillRect(px + 3, py + this.h - 1, 7, 1);
    ctx.fillRect(px + 10, py + this.h - 1, 7, 1);

    // ── BODYSUIT 16-bit com circuitos
    const bodyY = py + 6;
    ctx.fillStyle = '#1A0044';
    ctx.fillRect(px + 2, bodyY, 16, 18);
    ctx.fillStyle = '#2A0066';
    ctx.fillRect(px + 3, bodyY + 1, 14, 16);
    // Circuitos luminosos
    ctx.fillStyle = `rgba(0,200,255,${0.4 + Math.sin(t * 0.06) * 0.2})`;
    ctx.fillRect(px + 5, bodyY + 3, 1, 12);
    ctx.fillRect(px + 14, bodyY + 3, 1, 12);
    ctx.fillRect(px + 5, bodyY + 8, 10, 1);
    // Nós brilhantes
    ctx.fillStyle = C.cyan;
    ctx.fillRect(px + 5, bodyY + 3, 2, 2);
    ctx.fillRect(px + 13, bodyY + 3, 2, 2);
    ctx.fillRect(px + 9, bodyY + 7, 2, 2);

    // Cristal de energia no peito
    const crystalPulse = Math.sin(t * 0.08) * 0.3 + 0.7;
    const cg = ctx.createRadialGradient(px + this.w/2, bodyY + 5, 0, px + this.w/2, bodyY + 5, 5);
    cg.addColorStop(0, `rgba(139,0,255,${crystalPulse})`);
    cg.addColorStop(1, 'rgba(139,0,255,0)');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(px + this.w/2, bodyY + 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.purple;
    ctx.fillRect(px + 8, bodyY + 3, 4, 4);
    ctx.fillStyle = '#CC88FF';
    ctx.fillRect(px + 9, bodyY + 4, 1, 1);

    // ── BRAÇOS
    ctx.fillStyle = '#1A0044';
    ctx.fillRect(px - 1, bodyY + 2, 4, 12);
    ctx.fillRect(px + this.w - 3, bodyY + 2, 4, 12);
    ctx.fillStyle = '#2A0066';
    ctx.fillRect(px, bodyY + 3, 2, 10);
    ctx.fillRect(px + this.w - 2, bodyY + 3, 2, 10);
    // Luvas
    ctx.fillStyle = '#DDBBEE';
    ctx.fillRect(px - 1, bodyY + 13, 3, 3);
    ctx.fillRect(px + this.w - 2, bodyY + 13, 3, 3);

    // ── PESCOÇO
    ctx.fillStyle = '#EECCDD';
    ctx.fillRect(px + 7, bodyY - 2, 6, 3);

    // ── CABEÇA 16-bit
    const headY = py - 8;
    ctx.fillStyle = '#EECCDD';
    ctx.fillRect(px + 3, headY, 14, 12);
    ctx.fillStyle = '#DDBBCC';
    ctx.fillRect(px + 3, headY, 2, 12);
    ctx.fillRect(px + 15, headY, 2, 12);

    // Bochechas
    ctx.fillStyle = 'rgba(200,100,180,0.3)';
    ctx.fillRect(px + 4, headY + 6, 3, 2);
    ctx.fillRect(px + 13, headY + 6, 3, 2);

    // Olhos roxos 16-bit
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(px + 5, headY + 3, 4, 4);
    ctx.fillRect(px + 11, headY + 3, 4, 4);
    ctx.fillStyle = '#8800CC';
    ctx.fillRect(px + 6, headY + 4, 2, 3);
    ctx.fillRect(px + 12, headY + 4, 2, 3);
    ctx.fillStyle = '#440066';
    ctx.fillRect(px + 6, headY + 5, 2, 2);
    ctx.fillRect(px + 12, headY + 5, 2, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(px + 7, headY + 4, 1, 1);
    ctx.fillRect(px + 13, headY + 4, 1, 1);

    // Boca
    ctx.fillStyle = '#CC88AA';
    ctx.fillRect(px + 8, headY + 9, 4, 1);

    // ── CABELO ROXO LONGO 16-bit (com onda e gradiente)
    const hairWave = Math.sin(t * 0.04) * 2;
    // Base
    ctx.fillStyle = '#440088';
    ctx.fillRect(px + 2, headY - 3, 16, 6);
    // Franja
    ctx.fillStyle = '#5500AA';
    ctx.fillRect(px + 3, headY - 4, 14, 4);
    ctx.fillStyle = '#6600CC';
    ctx.fillRect(px + 5, headY - 5, 10, 3);
    // Highlight
    ctx.fillStyle = '#8833DD';
    ctx.fillRect(px + 6, headY - 4, 4, 1);

    // Mechas longas caindo
    for (let i = 0; i < 5; i++) {
      const mx = px + 1 + i * 1.5;
      const wave = Math.sin(t * 0.03 + i * 0.5) * 2;
      const grad = i < 2 ? '#440088' : i < 4 ? '#5500AA' : '#6600CC';
      ctx.fillStyle = grad;
      ctx.fillRect(mx + wave, headY + 2, 2, 20 + i * 2);
      // Ponta brilhante
      ctx.fillStyle = '#8833DD';
      ctx.fillRect(mx + wave, headY + 20 + i * 2, 2, 2);
    }
    // Mechas do outro lado
    for (let i = 0; i < 5; i++) {
      const mx = px + 12 + i * 1.5;
      const wave = Math.sin(t * 0.03 + i * 0.5 + Math.PI) * 2;
      const grad = i < 2 ? '#6600CC' : i < 4 ? '#5500AA' : '#440088';
      ctx.fillStyle = grad;
      ctx.fillRect(mx + wave, headY + 2, 2, 20 + (4 - i) * 2);
      ctx.fillStyle = '#8833DD';
      ctx.fillRect(mx + wave, headY + 18 + (4 - i) * 2, 2, 2);
    }
  }

  drawBotop16(px, py) {
    const t = game.ticks;
    const hover = Math.sin(t * 0.05) * 2;

    // ── SOMBRA
    const sg = ctx.createRadialGradient(px + this.w/2, py + this.h + 1, 0, px + this.w/2, py + this.h + 1, 12);
    sg.addColorStop(0, 'rgba(0,100,120,0.3)');
    sg.addColorStop(1, 'rgba(0,100,120,0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.ellipse(px + this.w/2, py + this.h + 1, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    const by = py + hover;

    // ── CORPO DO ROBÔ 16-bit
    // Pernas (hover jets)
    ctx.fillStyle = '#556688';
    ctx.fillRect(px + 5, by + this.h - 10, 4, 8);
    ctx.fillRect(px + 11, by + this.h - 10, 4, 8);
    // Jet glow
    ctx.fillStyle = `rgba(0,200,255,${0.4 + Math.sin(t * 0.1) * 0.3})`;
    ctx.fillRect(px + 5, by + this.h - 3, 4, 3);
    ctx.fillRect(px + 11, by + this.h - 3, 4, 3);

    // Torso
    ctx.fillStyle = '#778899';
    ctx.fillRect(px + 2, by + 8, 16, 16);
    ctx.fillStyle = '#8899AA';
    ctx.fillRect(px + 3, by + 9, 14, 14);
    // Highlight
    ctx.fillStyle = '#99AABB';
    ctx.fillRect(px + 3, by + 9, 14, 2);

    // Cruz vermelha (médico)
    ctx.fillStyle = '#CC0000';
    ctx.fillRect(px + 8, by + 11, 4, 8);
    ctx.fillRect(px + 6, by + 13, 8, 4);
    ctx.fillStyle = '#FF3333';
    ctx.fillRect(px + 9, by + 12, 2, 1);

    // Braços
    ctx.fillStyle = '#778899';
    ctx.fillRect(px - 2, by + 10, 5, 10);
    ctx.fillRect(px + this.w - 3, by + 10, 5, 10);
    ctx.fillStyle = '#8899AA';
    ctx.fillRect(px - 1, by + 11, 3, 8);
    ctx.fillRect(px + this.w - 2, by + 11, 3, 8);
    // Mãos
    ctx.fillStyle = '#99AABB';
    ctx.fillRect(px - 2, by + 19, 4, 3);
    ctx.fillRect(px + this.w - 2, by + 19, 4, 3);

    // ── CABEÇA
    ctx.fillStyle = '#AABBCC';
    ctx.fillRect(px + 3, by, 14, 10);
    ctx.fillStyle = '#BBCCDD';
    ctx.fillRect(px + 4, by + 1, 12, 8);
    // Highlight
    ctx.fillStyle = '#CCDDEE';
    ctx.fillRect(px + 4, by + 1, 12, 2);

    // Olhos cyan brilhantes
    const eyeGlow = ctx.createRadialGradient(px + 7, by + 5, 0, px + 7, by + 5, 4);
    eyeGlow.addColorStop(0, '#00FFFF');
    eyeGlow.addColorStop(1, '#00FFFF00');
    ctx.fillStyle = eyeGlow;
    ctx.beginPath();
    ctx.arc(px + 7, by + 5, 4, 0, Math.PI * 2);
    ctx.fill();
    eyeGlow.addColorStop(0, '#00FFFF');
    const eyeGlow2 = ctx.createRadialGradient(px + 13, by + 5, 0, px + 13, by + 5, 4);
    eyeGlow2.addColorStop(0, '#00FFFF');
    eyeGlow2.addColorStop(1, '#00FFFF00');
    ctx.fillStyle = eyeGlow2;
    ctx.beginPath();
    ctx.arc(px + 13, by + 5, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#003344';
    ctx.fillRect(px + 5, by + 3, 4, 4);
    ctx.fillRect(px + 11, by + 3, 4, 4);
    ctx.fillStyle = '#00FFFF';
    ctx.fillRect(px + 6, by + 4, 2, 2);
    ctx.fillRect(px + 12, by + 4, 2, 2);
    ctx.fillStyle = '#AAFFFF';
    ctx.fillRect(px + 6, by + 4, 1, 1);
    ctx.fillRect(px + 12, by + 4, 1, 1);

    // Antena
    ctx.fillStyle = '#778899';
    ctx.fillRect(px + this.w/2, by - 4, 1, 5);
    ctx.fillStyle = '#00FF88';
    ctx.fillRect(px + this.w/2 - 1, by - 4, 3, 2);

    // Cruz no topo
    ctx.fillStyle = '#CC0000';
    ctx.fillRect(px + this.w/2 - 1, by - 7, 2, 5);
    ctx.fillRect(px + this.w/2 - 2, by - 6, 4, 2);
  }
}

// ─── ORION COLETÁVEL 16-BIT ─────────────────────────────────
class Orion {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.collected = false;
    this.animFrame = 0;
    this.floatOffset = rnd(0, Math.PI * 2);
  }

  draw() {
    if (this.collected) return;
    const t = game.ticks;
    const floatY = Math.sin(t * 0.06 + this.floatOffset) * 3;
    const px = this.x - camera.x + camera.shakeX;
    const py = this.y - camera.y + camera.shakeY + floatY;
    if (px < -20 || px > GAME_W + 20) return;

    const pulse = Math.sin(t * 0.08 + this.floatOffset) * 0.3 + 0.7;
    const rot = t * 0.04 + this.floatOffset;

    // Glow externo triplo
    for (let i = 3; i >= 1; i--) {
      const gs = 8 + i * 4 + pulse * 3;
      const ga = 0.05 + (4 - i) * 0.03;
      const gg = ctx.createRadialGradient(px, py, 0, px, py, gs);
      gg.addColorStop(0, `rgba(255,200,0,${ga})`);
      gg.addColorStop(0.5, `rgba(255,150,0,${ga * 0.5})`);
      gg.addColorStop(1, 'rgba(255,100,0,0)');
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(px, py, gs, 0, Math.PI * 2);
      ctx.fill();
    }

    // Anéis orbitando
    for (let i = 0; i < 3; i++) {
      const angle = rot + i * (Math.PI * 2 / 3);
      const rx = px + Math.cos(angle) * 8;
      const ry = py + Math.sin(angle) * 4;
      ctx.fillStyle = `rgba(255,220,100,${0.6 + Math.sin(t * 0.1 + i) * 0.3})`;
      ctx.fillRect(rx - 1, ry - 1, 2, 2);
    }

    // Corpo da estrela (5 pontas pixel art)
    ctx.fillStyle = C.gold;
    // Centro
    ctx.fillRect(px - 2, py - 2, 4, 4);
    // Pontas
    ctx.fillRect(px - 1, py - 5, 2, 3); // topo
    ctx.fillRect(px - 1, py + 2, 2, 3); // baixo
    ctx.fillRect(px - 5, py - 1, 3, 2); // esquerda
    ctx.fillRect(px + 2, py - 1, 3, 2); // direita
    // Diagonais
    ctx.fillRect(px - 3, py - 3, 2, 2);
    ctx.fillRect(px + 1, py - 3, 2, 2);
    ctx.fillRect(px - 3, py + 1, 2, 2);
    ctx.fillRect(px + 1, py + 1, 2, 2);

    // Highlight central
    ctx.fillStyle = '#FFFFAA';
    ctx.fillRect(px - 1, py - 1, 2, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(px, py, 1, 1);
  }
}

// ─── CHECKPOINT 16-BIT ──────────────────────────────────────
class Checkpoint {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 12; this.h = 24;
    this.active = false;
    this.animTimer = 0;
  }

  draw() {
    const px = this.x - camera.x + camera.shakeX;
    const py = this.y - camera.y + camera.shakeY;
    if (px < -20 || px > GAME_W + 20) return;
    const t = game.ticks;

    // Poste
    ctx.fillStyle = '#556677';
    ctx.fillRect(px + 4, py, 4, this.h);
    ctx.fillStyle = '#667788';
    ctx.fillRect(px + 5, py, 2, this.h);

    // Base
    ctx.fillStyle = '#445566';
    ctx.fillRect(px, py + this.h - 3, 12, 3);

    if (this.active) {
      // Bandeira ativa (verde com glow)
      const wave = Math.sin(t * 0.08) * 2;
      ctx.fillStyle = '#00CC44';
      ctx.fillRect(px + 7, py + 2, 8 + wave, 6);
      ctx.fillStyle = '#00FF66';
      ctx.fillRect(px + 7, py + 3, 6 + wave, 2);
      // Glow
      const fg = ctx.createRadialGradient(px + 10, py + 5, 0, px + 10, py + 5, 12);
      fg.addColorStop(0, 'rgba(0,255,100,0.3)');
      fg.addColorStop(1, 'rgba(0,255,100,0)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(px + 10, py + 5, 12, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Bandeira inativa (cinza)
      ctx.fillStyle = '#667788';
      ctx.fillRect(px + 7, py + 2, 8, 6);
      ctx.fillStyle = '#778899';
      ctx.fillRect(px + 7, py + 3, 6, 2);
    }
  }
}

// ─── PORTAL 16-BIT ──────────────────────────────────────────
class Portal {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 20; this.h = 32;
  }

  draw() {
    const px = this.x - camera.x + camera.shakeX;
    const py = this.y - camera.y + camera.shakeY;
    if (px < -30 || px > GAME_W + 30) return;
    const t = game.ticks;

    // Portal frame
    ctx.fillStyle = '#222244';
    ctx.fillRect(px, py, this.w, this.h);
    ctx.fillStyle = '#333366';
    ctx.fillRect(px + 1, py + 1, this.w - 2, this.h - 2);

    // Portal energy (swirling)
    for (let i = 0; i < 5; i++) {
      const angle = t * 0.05 + i * (Math.PI * 2 / 5);
      const radius = 6 + Math.sin(t * 0.03 + i) * 2;
      const ex = px + this.w/2 + Math.cos(angle) * radius;
      const ey = py + this.h/2 + Math.sin(angle) * radius * 1.5;
      ctx.fillStyle = [C.cyan, C.purple, C.electric, C.magenta, C.gold][i];
      ctx.fillRect(ex - 1, ey - 1, 3, 3);
    }

    // Central glow
    const pg = ctx.createRadialGradient(px + this.w/2, py + this.h/2, 0, px + this.w/2, py + this.h/2, 14);
    pg.addColorStop(0, 'rgba(0,255,255,0.4)');
    pg.addColorStop(0.5, 'rgba(139,0,255,0.2)');
    pg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(px + this.w/2, py + this.h/2, 14, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBackground16(levelIndex) {
  const t = game.ticks;
  const cx = camera.x;

  // ── CAMADA 0: Céu com gradiente profundo
  const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME_H);
  if (levelIndex === 0) {
    skyGrad.addColorStop(0, '#050515');
    skyGrad.addColorStop(0.3, '#0A0A30');
    skyGrad.addColorStop(0.6, '#151545');
    skyGrad.addColorStop(1, '#1A1A55');
  } else if (levelIndex === 1) {
    skyGrad.addColorStop(0, '#0A0520');
    skyGrad.addColorStop(0.3, '#150A40');
    skyGrad.addColorStop(0.6, '#200F55');
    skyGrad.addColorStop(1, '#2A1466');
  } else {
    skyGrad.addColorStop(0, '#050510');
    skyGrad.addColorStop(0.3, '#0A0A25');
    skyGrad.addColorStop(0.6, '#0F0F3A');
    skyGrad.addColorStop(1, '#15154A');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, GAME_W, GAME_H);

  // ── Nebulosas animadas
  for (let i = 0; i < 3; i++) {
    const nx = (i * 120 + t * 0.02) % (GAME_W + 80) - 40;
    const ny = 20 + i * 40;
    const ns = 40 + i * 20;
    const nColors = ['rgba(139,0,255,0.06)', 'rgba(0,100,255,0.05)', 'rgba(255,0,128,0.04)'];
    const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, ns);
    ng.addColorStop(0, nColors[i]);
    ng.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ng;
    ctx.beginPath();
    ctx.arc(nx, ny, ns, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Estrelas (3 camadas de profundidade)
  for (let layer = 0; layer < 3; layer++) {
    const speed = 0.02 + layer * 0.01;
    const count = 30 - layer * 8;
    const size = 1 + (2 - layer) * 0.5;
    for (let i = 0; i < count; i++) {
      const seed = layer * 100 + i * 37;
      const sx = ((seed * 7.3) % GAME_W + cx * speed) % GAME_W;
      const sy = (seed * 13.7) % (GAME_H * 0.6);
      const twinkle = Math.sin(t * 0.05 + seed) * 0.4 + 0.6;
      const colors = ['#FFFFFF', '#88CCFF', '#FFCC88', '#FF88CC', '#88FFCC'];
      ctx.fillStyle = colors[i % 5];
      ctx.globalAlpha = twinkle;
      ctx.fillRect(sx, sy, size, size);
      if (size > 1 && twinkle > 0.8) {
        ctx.fillRect(sx - 1, sy, size + 2, 1);
        ctx.fillRect(sx, sy - 1, 1, size + 2);
      }
    }
  }
  ctx.globalAlpha = 1;

  // ── CAMADA 1: Montanhas distantes (parallax 0.1)
  const mOffset = cx * 0.1;
  ctx.fillStyle = '#0A0A30';
  for (let i = 0; i < 12; i++) {
    const mx = i * 50 - (mOffset % 50) - 25;
    const mh = 30 + Math.sin(i * 1.5 + 0.5) * 20;
    ctx.beginPath();
    ctx.moveTo(mx, GAME_H);
    ctx.lineTo(mx + 25, GAME_H - mh);
    ctx.lineTo(mx + 50, GAME_H);
    ctx.fill();
  }
  // Mountain highlight
  ctx.fillStyle = '#151540';
  for (let i = 0; i < 12; i++) {
    const mx = i * 50 - (mOffset % 50) - 25;
    const mh = 30 + Math.sin(i * 1.5 + 0.5) * 20;
    ctx.beginPath();
    ctx.moveTo(mx + 10, GAME_H);
    ctx.lineTo(mx + 25, GAME_H - mh + 3);
    ctx.lineTo(mx + 30, GAME_H);
    ctx.fill();
  }

  // ── CAMADA 2: Prédios distantes (parallax 0.25)
  const bOffset = cx * 0.25;
  for (let i = 0; i < 20; i++) {
    const bx = i * 30 - (bOffset % 30) - 15;
    const bh = 40 + ((i * 17) % 30);
    ctx.fillStyle = '#0F0F35';
    ctx.fillRect(bx, GAME_H - bh, 22, bh);
    ctx.fillStyle = '#141445';
    ctx.fillRect(bx + 1, GAME_H - bh + 1, 20, bh - 1);
    // Janelas
    for (let wy = 0; wy < bh - 8; wy += 8) {
      for (let wx = 0; wx < 16; wx += 6) {
        const lit = ((i * 7 + wy + wx + Math.floor(t * 0.01)) % 5) < 2;
        ctx.fillStyle = lit ? '#FFAA3344' : '#0A0A2A';
        ctx.fillRect(bx + 3 + wx, GAME_H - bh + 4 + wy, 3, 4);
      }
    }
  }

  // ── CAMADA 3: Prédios próximos (parallax 0.5)
  const cOffset = cx * 0.5;
  for (let i = 0; i < 15; i++) {
    const bx = i * 40 - (cOffset % 40) - 20;
    const bh = 50 + ((i * 23) % 40);
    ctx.fillStyle = '#0A0A25';
    ctx.fillRect(bx, GAME_H - bh, 32, bh);
    ctx.fillStyle = '#101035';
    ctx.fillRect(bx + 1, GAME_H - bh + 1, 30, bh - 1);
    // Highlight topo
    ctx.fillStyle = '#181850';
    ctx.fillRect(bx + 1, GAME_H - bh + 1, 30, 2);
    // Janelas maiores
    for (let wy = 0; wy < bh - 10; wy += 10) {
      for (let wx = 0; wx < 24; wx += 8) {
        const lit = ((i * 11 + wy + wx + Math.floor(t * 0.008)) % 4) < 2;
        if (lit) {
          const wc = ['#FFAA33', '#00CCFF', '#FF66AA', '#88FF66'][((i + wx) * 3) % 4];
          ctx.fillStyle = wc + '55';
          ctx.fillRect(bx + 4 + wx, GAME_H - bh + 6 + wy, 4, 6);
          // Window glow
          ctx.fillStyle = wc + '22';
          ctx.fillRect(bx + 3 + wx, GAME_H - bh + 5 + wy, 6, 8);
        } else {
          ctx.fillStyle = '#080820';
          ctx.fillRect(bx + 4 + wx, GAME_H - bh + 6 + wy, 4, 6);
        }
      }
    }
    // Neon signs
    if (i % 3 === 0) {
      const neonColor = ['#FF0066', '#00FFAA', '#FFAA00'][i % 3];
      ctx.fillStyle = neonColor + '88';
      ctx.fillRect(bx + 5, GAME_H - bh - 4, 20, 3);
      ctx.fillStyle = neonColor + '33';
      ctx.fillRect(bx + 3, GAME_H - bh - 6, 24, 7);
    }
  }

  // ── Linha de horizonte neon
  ctx.fillStyle = `rgba(0,200,255,${0.15 + Math.sin(t * 0.03) * 0.05})`;
  ctx.fillRect(0, GAME_H - 2, GAME_W, 2);
}

// ─── DESENHAR PLATAFORMAS 16-BIT ────────────────────────────
function drawPlatform16(p) {
  const px = p.x - camera.x + camera.shakeX;
  const py = p.y - camera.y + camera.shakeY;
  if (px > GAME_W + 10 || px + p.w < -10) return;

  // Corpo da plataforma com gradiente
  const pg = ctx.createLinearGradient(px, py, px, py + p.h);
  pg.addColorStop(0, '#2A2A55');
  pg.addColorStop(0.3, '#222244');
  pg.addColorStop(1, '#1A1A33');
  ctx.fillStyle = pg;
  ctx.fillRect(px, py, p.w, p.h);

  // Borda superior (highlight)
  ctx.fillStyle = '#3A3A77';
  ctx.fillRect(px, py, p.w, 2);
  ctx.fillStyle = '#4A4A88';
  ctx.fillRect(px + 1, py, p.w - 2, 1);

  // Borda inferior (sombra)
  ctx.fillStyle = '#111122';
  ctx.fillRect(px, py + p.h - 1, p.w, 1);

  // Textura de tiles
  for (let tx = 0; tx < p.w; tx += 16) {
    ctx.fillStyle = '#1A1A3A';
    ctx.fillRect(px + tx, py + 2, 1, p.h - 3);
  }
  for (let ty = 0; ty < p.h; ty += 8) {
    ctx.fillStyle = '#1A1A3A';
    ctx.fillRect(px, py + ty, p.w, 1);
  }

  // Circuitos neon na plataforma
  if (p.w > 30) {
    const neonPulse = Math.sin(game.ticks * 0.05 + p.x * 0.1) * 0.3 + 0.5;
    ctx.fillStyle = `rgba(0,200,255,${neonPulse * 0.4})`;
    ctx.fillRect(px + 4, py + 3, p.w - 8, 1);
    // Nós
    for (let nx = 8; nx < p.w - 8; nx += 16) {
      ctx.fillStyle = `rgba(0,255,255,${neonPulse * 0.6})`;
      ctx.fillRect(px + nx, py + 2, 2, 3);
    }
  }
}


// ─── HUD 16-BIT ─────────────────────────────────────────────
function drawHUD16() {
  const p = game.player;
  if (!p) return;

  // Fundo semi-transparente do HUD
  ctx.fillStyle = 'rgba(0,0,20,0.6)';
  ctx.fillRect(0, 0, GAME_W, 18);
  ctx.fillStyle = 'rgba(0,100,200,0.15)';
  ctx.fillRect(0, 17, GAME_W, 1);

  // ── Vida (corações 16-bit com gradiente)
  for (let i = 0; i < p.maxHp; i++) {
    const hx = 4 + i * 14;
    const hy = 3;
    if (i < p.hp) {
      // Coração cheio com glow
      const hGlow = ctx.createRadialGradient(hx + 5, hy + 4, 0, hx + 5, hy + 4, 7);
      hGlow.addColorStop(0, 'rgba(255,50,80,0.3)');
      hGlow.addColorStop(1, 'rgba(255,50,80,0)');
      ctx.fillStyle = hGlow;
      ctx.beginPath();
      ctx.arc(hx + 5, hy + 4, 7, 0, Math.PI * 2);
      ctx.fill();
      // Coração pixel
      ctx.fillStyle = '#FF2244';
      ctx.fillRect(hx + 1, hy, 3, 2);
      ctx.fillRect(hx + 5, hy, 3, 2);
      ctx.fillRect(hx, hy + 1, 9, 3);
      ctx.fillRect(hx + 1, hy + 4, 7, 2);
      ctx.fillRect(hx + 2, hy + 6, 5, 1);
      ctx.fillRect(hx + 3, hy + 7, 3, 1);
      ctx.fillRect(hx + 4, hy + 8, 1, 1);
      // Highlight
      ctx.fillStyle = '#FF6688';
      ctx.fillRect(hx + 2, hy + 1, 2, 1);
    } else {
      // Coração vazio
      ctx.fillStyle = '#333355';
      ctx.fillRect(hx + 1, hy, 3, 2);
      ctx.fillRect(hx + 5, hy, 3, 2);
      ctx.fillRect(hx, hy + 1, 9, 3);
      ctx.fillRect(hx + 1, hy + 4, 7, 2);
      ctx.fillRect(hx + 2, hy + 6, 5, 1);
      ctx.fillRect(hx + 3, hy + 7, 3, 1);
      ctx.fillRect(hx + 4, hy + 8, 1, 1);
    }
  }

  // ── Orions coletados
  // Mini estrela
  const ox = 80;
  ctx.fillStyle = C.gold;
  ctx.fillRect(ox, 4, 1, 5);
  ctx.fillRect(ox - 2, 6, 5, 1);
  ctx.fillRect(ox - 1, 5, 3, 3);
  ctx.fillStyle = '#FFFFAA';
  ctx.fillRect(ox, 6, 1, 1);
  drawPixelText('x' + p.orions, ox + 5, 4, 1, C.gold, 'left');

  // ── Score
  drawPixelText('SCORE', GAME_W - 70, 2, 1, C.cyan, 'left');
  drawPixelText(String(p.score).padStart(6, '0'), GAME_W - 70, 10, 1, C.white, 'left');

  // ── Fase
  const levelName = ['CIDADE NEON', 'LABIRINTO', 'CORACAO'][game.levelIndex] || 'FASE';
  drawPixelText(levelName, GAME_W / 2, 4, 1, C.purple, 'center');

  // ── Combo indicator
  if (p.comboCount >= 2) {
    const comboAlpha = Math.min(1, p.comboTimer / 30);
    const comboScale = 1 + (p.comboCount - 1) * 0.2;
    drawPixelText('COMBO x' + p.comboCount, GAME_W / 2, 22, comboScale, C.electric, 'center');
  }
}

// ─── ÁUDIO 16-BIT (mais canais, mais rico) ──────────────────
function drawTitleScreen16() {
  const t = game.ticks;

  // Fundo cósmico profundo
  const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME_H);
  skyGrad.addColorStop(0, '#020210');
  skyGrad.addColorStop(0.3, '#050530');
  skyGrad.addColorStop(0.5, '#0A0A45');
  skyGrad.addColorStop(0.7, '#150A55');
  skyGrad.addColorStop(1, '#1A0A60');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, GAME_W, GAME_H);

  // Nebulosas
  for (let i = 0; i < 4; i++) {
    const nx = GAME_W * 0.2 + i * GAME_W * 0.2 + Math.sin(t * 0.01 + i) * 20;
    const ny = GAME_H * 0.25 + Math.cos(t * 0.008 + i * 2) * 15;
    const ns = 50 + i * 10;
    const nc = ['rgba(139,0,255,', 'rgba(0,100,255,', 'rgba(255,0,128,', 'rgba(0,200,200,'][i];
    const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, ns);
    ng.addColorStop(0, nc + '0.08)');
    ng.addColorStop(1, nc + '0)');
    ctx.fillStyle = ng;
    ctx.beginPath();
    ctx.arc(nx, ny, ns, 0, Math.PI * 2);
    ctx.fill();
  }

  // Estrelas
  for (let i = 0; i < 80; i++) {
    const sx = (i * 41.3) % GAME_W;
    const sy = (i * 27.7) % (GAME_H * 0.65);
    const twinkle = Math.sin(t * 0.04 + i * 1.7) * 0.4 + 0.6;
    const colors = ['#FFFFFF', '#88CCFF', '#FFCC88', '#FF88CC', '#88FFCC'];
    ctx.fillStyle = colors[i % 5];
    ctx.globalAlpha = twinkle;
    const sz = (i % 3 === 0) ? 2 : 1;
    ctx.fillRect(sx, sy, sz, sz);
    if (sz > 1 && twinkle > 0.85) {
      ctx.fillRect(sx - 1, sy + 0.5, sz + 2, 1);
      ctx.fillRect(sx + 0.5, sy - 1, 1, sz + 2);
    }
  }
  ctx.globalAlpha = 1;

  // Montanhas
  ctx.fillStyle = '#0A0A30';
  for (let i = 0; i < 10; i++) {
    const mx = i * 45 - 20;
    const mh = 25 + Math.sin(i * 1.8) * 15;
    ctx.beginPath();
    ctx.moveTo(mx, GAME_H);
    ctx.lineTo(mx + 22, GAME_H - mh);
    ctx.lineTo(mx + 45, GAME_H);
    ctx.fill();
  }

  // Cidade silhueta
  for (let i = 0; i < 18; i++) {
    const bx = i * 22 - 10 + Math.sin(t * 0.005 + i) * 1;
    const bh = 30 + ((i * 19) % 35);
    ctx.fillStyle = '#0F0F35';
    ctx.fillRect(bx, GAME_H - bh, 18, bh);
    // Janelas
    for (let wy = 4; wy < bh - 6; wy += 7) {
      for (let wx = 2; wx < 14; wx += 5) {
        const lit = ((i * 7 + wy + wx + Math.floor(t * 0.015)) % 6) < 2;
        ctx.fillStyle = lit ? '#FFAA3344' : '#0A0A2A';
        ctx.fillRect(bx + wx, GAME_H - bh + wy, 3, 4);
      }
    }
  }

  // Linha neon no chão
  ctx.fillStyle = `rgba(0,200,255,${0.3 + Math.sin(t * 0.04) * 0.15})`;
  ctx.fillRect(0, GAME_H - 2, GAME_W, 2);

  // ── PERSONAGENS na tela inicial
  // SuperTom (esquerda)
  const tomX = GAME_W * 0.3;
  const tomY = GAME_H - 50;
  drawTitleTom(tomX, tomY, t);

  // Vivi (direita)
  const viviX = GAME_W * 0.7;
  const viviY = GAME_H - 48;
  drawTitleVivi(viviX, viviY, t);

  // Orion flutuando entre eles
  const orionX = GAME_W * 0.5;
  const orionY = GAME_H - 70 + Math.sin(t * 0.05) * 8;
  drawTitleOrion(orionX, orionY, t);

  // ── TÍTULO "SUPERTOM"
  const titleY = 20 + Math.sin(t * 0.03) * 2;
  // Sombra do título
  drawPixelText('SUPERTOM', GAME_W / 2 + 1, titleY + 1, 3, '#000000', 'center');
  // Glow
  const titleGlow = ctx.createLinearGradient(GAME_W/2 - 60, titleY, GAME_W/2 + 60, titleY + 20);
  titleGlow.addColorStop(0, '#FF6600');
  titleGlow.addColorStop(0.5, '#FFAA00');
  titleGlow.addColorStop(1, '#FF6600');
  drawPixelText('SUPERTOM', GAME_W / 2, titleY, 3, titleGlow, 'center');

  // Subtítulo
  drawPixelText('A JORNADA DO CORACAO ELETRICO', GAME_W / 2, titleY + 24, 1, C.cyan, 'center');

  // ── "TOQUE PARA INICIAR" piscando
  if (t % 50 < 35) {
    drawPixelText('TOQUE PARA INICIAR', GAME_W / 2, GAME_H - 16, 1.2, C.gold, 'center');
  }

  // Versão
  drawPixelText('v2.0 - 16-BIT', 4, GAME_H - 8, 0.8, '#555577', 'left');
}

function drawTitleTom(x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  // Sombra
  ctx.fillStyle = 'rgba(0,0,30,0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 38, 12, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Corpo simplificado
  // Pernas
  ctx.fillStyle = '#1A1A4A';
  ctx.fillRect(-6, 24, 5, 12);
  ctx.fillRect(1, 24, 5, 12);
  ctx.fillStyle = '#333366';
  ctx.fillRect(-7, 34, 7, 4);
  ctx.fillRect(0, 34, 7, 4);
  // Jaleco
  const jg = ctx.createLinearGradient(-8, 6, 8, 24);
  jg.addColorStop(0, '#FFFFFF');
  jg.addColorStop(1, '#CCCCEE');
  ctx.fillStyle = jg;
  ctx.fillRect(-8, 6, 16, 18);
  ctx.fillStyle = '#1A3366';
  ctx.fillRect(-2, 7, 4, 16);
  // Coração elétrico
  const pulse = Math.sin(t * 0.08) * 0.3 + 0.7;
  const hg = ctx.createRadialGradient(0, 14, 0, 0, 14, 8 * pulse);
  hg.addColorStop(0, `rgba(0,255,255,${0.4 * pulse})`);
  hg.addColorStop(1, 'rgba(0,255,255,0)');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.arc(0, 14, 8 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FF2244';
  ctx.fillRect(-2, 12, 4, 4);
  // Braços
  ctx.fillStyle = '#DDDDFF';
  ctx.fillRect(-12, 8, 5, 12);
  ctx.fillRect(7, 8, 5, 12);
  ctx.fillStyle = '#EECCAA';
  ctx.fillRect(-12, 19, 4, 3);
  ctx.fillRect(8, 19, 4, 3);
  // Cabeça
  ctx.fillStyle = '#EECCAA';
  ctx.fillRect(-6, -8, 12, 12);
  ctx.fillStyle = '#2244AA';
  ctx.fillRect(-4, -3, 3, 3);
  ctx.fillRect(1, -3, 3, 3);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-3, -3, 1, 1);
  ctx.fillRect(2, -3, 1, 1);
  ctx.fillStyle = '#CC8866';
  ctx.fillRect(-1, 0, 2, 1);
  // Cabelo
  ctx.fillStyle = '#885533';
  ctx.fillRect(-6, -12, 12, 6);
  ctx.fillStyle = '#996644';
  ctx.fillRect(-4, -14, 8, 4);
  ctx.fillStyle = '#AA7755';
  ctx.fillRect(-2, -15, 6, 3);
  ctx.restore();
}

function drawTitleVivi(x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  // Aura
  const ag = ctx.createRadialGradient(0, 10, 0, 0, 10, 25);
  ag.addColorStop(0, 'rgba(139,0,255,0.15)');
  ag.addColorStop(1, 'rgba(139,0,255,0)');
  ctx.fillStyle = ag;
  ctx.beginPath();
  ctx.arc(0, 10, 25, 0, Math.PI * 2);
  ctx.fill();
  // Sombra
  ctx.fillStyle = 'rgba(80,0,120,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 36, 10, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Pernas
  ctx.fillStyle = '#1A0044';
  ctx.fillRect(-5, 22, 4, 12);
  ctx.fillRect(1, 22, 4, 12);
  ctx.fillStyle = '#220055';
  ctx.fillRect(-6, 32, 6, 4);
  ctx.fillRect(0, 32, 6, 4);
  ctx.fillStyle = '#00AAFF';
  ctx.fillRect(-6, 35, 6, 1);
  ctx.fillRect(0, 35, 6, 1);
  // Bodysuit
  ctx.fillStyle = '#1A0044';
  ctx.fillRect(-7, 4, 14, 18);
  ctx.fillStyle = '#2A0066';
  ctx.fillRect(-6, 5, 12, 16);
  // Circuitos
  ctx.fillStyle = `rgba(0,200,255,${0.4 + Math.sin(t * 0.06) * 0.2})`;
  ctx.fillRect(-4, 7, 1, 10);
  ctx.fillRect(3, 7, 1, 10);
  // Cristal
  ctx.fillStyle = C.purple;
  ctx.fillRect(-2, 10, 4, 4);
  ctx.fillStyle = '#CC88FF';
  ctx.fillRect(-1, 11, 1, 1);
  // Braços
  ctx.fillStyle = '#1A0044';
  ctx.fillRect(-10, 6, 4, 12);
  ctx.fillRect(6, 6, 4, 12);
  ctx.fillStyle = '#DDBBEE';
  ctx.fillRect(-10, 17, 3, 3);
  ctx.fillRect(7, 17, 3, 3);
  // Cabeça
  ctx.fillStyle = '#EECCDD';
  ctx.fillRect(-6, -8, 12, 11);
  ctx.fillStyle = '#8800CC';
  ctx.fillRect(-4, -4, 2, 3);
  ctx.fillRect(2, -4, 2, 3);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-3, -4, 1, 1);
  ctx.fillRect(3, -4, 1, 1);
  // Cabelo roxo longo
  ctx.fillStyle = '#440088';
  ctx.fillRect(-7, -12, 14, 6);
  ctx.fillStyle = '#5500AA';
  ctx.fillRect(-5, -14, 10, 4);
  // Mechas
  for (let i = 0; i < 4; i++) {
    const wave = Math.sin(t * 0.03 + i * 0.7) * 2;
    ctx.fillStyle = '#5500AA';
    ctx.fillRect(-8 + wave, -4 + i * 2, 2, 22 - i * 2);
    ctx.fillRect(6 + wave, -4 + i * 2, 2, 22 - i * 2);
  }
  ctx.restore();
}

function drawTitleOrion(x, y, t) {
  const rot = t * 0.04;
  // Glow
  const og = ctx.createRadialGradient(x, y, 0, x, y, 16);
  og.addColorStop(0, 'rgba(255,200,0,0.3)');
  og.addColorStop(0.5, 'rgba(255,150,0,0.1)');
  og.addColorStop(1, 'rgba(255,100,0,0)');
  ctx.fillStyle = og;
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.fill();
  // Anéis
  for (let i = 0; i < 4; i++) {
    const angle = rot + i * (Math.PI / 2);
    const rx = x + Math.cos(angle) * 10;
    const ry = y + Math.sin(angle) * 5;
    ctx.fillStyle = C.gold;
    ctx.fillRect(rx - 1, ry - 1, 2, 2);
  }
  // Estrela
  ctx.fillStyle = C.gold;
  ctx.fillRect(x - 3, y - 1, 6, 2);
  ctx.fillRect(x - 1, y - 3, 2, 6);
  ctx.fillRect(x - 2, y - 2, 4, 4);
  ctx.fillStyle = '#FFFFAA';
  ctx.fillRect(x - 1, y - 1, 2, 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x, y, 1, 1);
  // Raios
  const rayAlpha = Math.sin(t * 0.1) * 0.3 + 0.5;
  ctx.fillStyle = `rgba(255,255,100,${rayAlpha})`;
  ctx.fillRect(x - 6, y, 2, 1);
  ctx.fillRect(x + 4, y, 2, 1);
  ctx.fillRect(x, y - 6, 1, 2);
  ctx.fillRect(x, y + 4, 1, 2);
}

const LEVELS = [
  { // FASE 1: Cidade Neon
    name: 'CIDADE NEON',
    width: 2400, height: 300,
    playerStart: { x: 30, y: 200 },
    platforms: [
      // Chão principal (gaps menores, plataformas mais largas)
      { x: 0, y: 260, w: 320, h: 40 },
      { x: 350, y: 260, w: 230, h: 40 },
      { x: 610, y: 260, w: 270, h: 40 },
      { x: 910, y: 260, w: 320, h: 40 },
      { x: 1260, y: 260, w: 220, h: 40 },
      { x: 1510, y: 260, w: 320, h: 40 },
      { x: 1860, y: 260, w: 320, h: 40 },
      { x: 2210, y: 260, w: 200, h: 40 },
      // Plataformas elevadas (mais largas para facilitar pouso)
      { x: 110, y: 210, w: 70, h: 10 },
      { x: 210, y: 180, w: 65, h: 10 },
      { x: 370, y: 200, w: 80, h: 10 },
      { x: 490, y: 170, w: 70, h: 10 },
      { x: 640, y: 200, w: 90, h: 10 },
      { x: 770, y: 170, w: 70, h: 10 },
      { x: 840, y: 140, w: 65, h: 10 },
      { x: 940, y: 190, w: 80, h: 10 },
      { x: 1040, y: 160, w: 70, h: 10 },
      { x: 1140, y: 200, w: 90, h: 10 },
      { x: 1290, y: 180, w: 70, h: 10 },
      { x: 1390, y: 150, w: 65, h: 10 },
      { x: 1540, y: 200, w: 80, h: 10 },
      { x: 1690, y: 170, w: 70, h: 10 },
      { x: 1790, y: 140, w: 65, h: 10 },
      { x: 1940, y: 190, w: 80, h: 10 },
      { x: 2090, y: 160, w: 70, h: 10 },
    ],
    enemies: [
      { x: 400, y: 240, type: 'drone', patrol: 80 },
      { x: 650, y: 180, type: 'drone', patrol: 60 },
      { x: 900, y: 240, type: 'heavy', patrol: 60 },
      { x: 1100, y: 240, type: 'drone', patrol: 80 },
      { x: 1350, y: 240, type: 'drone', patrol: 70 },
      { x: 1600, y: 240, type: 'heavy', patrol: 50 },
      { x: 1900, y: 240, type: 'drone', patrol: 80 },
      { x: 2100, y: 240, type: 'drone', patrol: 60 },
    ],
    orions: [
      { x: 140, y: 200 }, { x: 240, y: 170 }, { x: 400, y: 190 },
      { x: 520, y: 160 }, { x: 670, y: 190 }, { x: 800, y: 160 },
      { x: 870, y: 130 }, { x: 970, y: 180 }, { x: 1070, y: 150 },
      { x: 1170, y: 190 }, { x: 1320, y: 170 }, { x: 1420, y: 140 },
      { x: 1570, y: 190 }, { x: 1720, y: 160 }, { x: 1820, y: 130 },
    ],
    checkpoints: [
      { x: 600, y: 236 },
      { x: 1200, y: 236 },
      { x: 1800, y: 236 },
    ],
    npcs: [
      { x: 60, y: 224, type: 'botop', dialog: ['Bem-vindo, Tom!', 'Sua energia vital', 'esta restaurada.', 'Siga em frente!'] },
      { x: 1000, y: 224, type: 'vivi', dialog: ['Tom! Voce veio!', 'O Coracao Eletrico', 'pulsa mais forte', 'perto de voce...'] },
    ],
    portal: { x: 2300, y: 228 },
    boss: null,
  },
  { // FASE 2: Labirinto Elétrico
    name: 'LABIRINTO ELETRICO',
    width: 2600, height: 350,
    playerStart: { x: 30, y: 250 },
    platforms: [
      { x: 0, y: 310, w: 270, h: 40 },
      { x: 300, y: 310, w: 220, h: 40 },
      { x: 550, y: 310, w: 180, h: 40 },
      { x: 760, y: 310, w: 270, h: 40 },
      { x: 1060, y: 310, w: 220, h: 40 },
      { x: 1310, y: 310, w: 320, h: 40 },
      { x: 1660, y: 310, w: 220, h: 40 },
      { x: 1910, y: 310, w: 270, h: 40 },
      { x: 2210, y: 310, w: 200, h: 40 },
      // Plataformas (mais largas)
      { x: 90, y: 260, w: 65, h: 10 },
      { x: 190, y: 230, w: 70, h: 10 },
      { x: 320, y: 250, w: 65, h: 10 },
      { x: 420, y: 220, w: 70, h: 10 },
      { x: 555, y: 260, w: 80, h: 10 },
      { x: 670, y: 230, w: 65, h: 10 },
      { x: 775, y: 250, w: 70, h: 10 },
      { x: 870, y: 200, w: 65, h: 10 },
      { x: 970, y: 170, w: 70, h: 10 },
      { x: 1070, y: 240, w: 80, h: 10 },
      { x: 1190, y: 210, w: 65, h: 10 },
      { x: 1340, y: 250, w: 70, h: 10 },
      { x: 1440, y: 220, w: 65, h: 10 },
      { x: 1540, y: 190, w: 70, h: 10 },
      { x: 1690, y: 250, w: 80, h: 10 },
      { x: 1840, y: 220, w: 65, h: 10 },
      { x: 1940, y: 190, w: 70, h: 10 },
      { x: 2040, y: 160, w: 65, h: 10 },
      { x: 2140, y: 240, w: 80, h: 10 },
      { x: 2290, y: 200, w: 70, h: 10 },
    ],
    enemies: [
      { x: 350, y: 290, type: 'drone', patrol: 70 },
      { x: 580, y: 240, type: 'drone', patrol: 60 },
      { x: 800, y: 290, type: 'heavy', patrol: 70 },
      { x: 1000, y: 290, type: 'drone', patrol: 80 },
      { x: 1200, y: 290, type: 'heavy', patrol: 60 },
      { x: 1400, y: 290, type: 'drone', patrol: 70 },
      { x: 1700, y: 290, type: 'heavy', patrol: 60 },
      { x: 1950, y: 290, type: 'drone', patrol: 80 },
      { x: 2200, y: 290, type: 'drone', patrol: 60 },
    ],
    orions: [
      { x: 120, y: 250 }, { x: 220, y: 220 }, { x: 350, y: 240 },
      { x: 450, y: 210 }, { x: 580, y: 250 }, { x: 700, y: 220 },
      { x: 800, y: 240 }, { x: 900, y: 190 }, { x: 1000, y: 160 },
      { x: 1100, y: 230 }, { x: 1220, y: 200 }, { x: 1370, y: 240 },
      { x: 1470, y: 210 }, { x: 1570, y: 180 },
    ],
    checkpoints: [
      { x: 550, y: 286 },
      { x: 1300, y: 286 },
      { x: 1900, y: 286 },
    ],
    npcs: [
      { x: 750, y: 274, type: 'botop', dialog: ['O labirinto testa', 'sua coragem, Tom.', 'Confie no pulso', 'do seu coracao.'] },
      { x: 1650, y: 274, type: 'vivi', dialog: ['Estou sentindo...', 'a energia do Orion!', 'Estamos perto,', 'Tom!'] },
    ],
    portal: { x: 2400, y: 278 },
    boss: null,
  },
  { // FASE 3: Coração Cósmico (com BOSS!)
    name: 'CORACAO COSMICO',
    width: 2800, height: 350,
    playerStart: { x: 30, y: 250 },
    platforms: [
      { x: 0, y: 310, w: 320, h: 40 },
      { x: 350, y: 310, w: 230, h: 40 },
      { x: 610, y: 310, w: 270, h: 40 },
      { x: 910, y: 310, w: 320, h: 40 },
      { x: 1260, y: 310, w: 220, h: 40 },
      { x: 1510, y: 310, w: 320, h: 40 },
      { x: 1860, y: 310, w: 220, h: 40 },
      { x: 2110, y: 310, w: 320, h: 40 },
      { x: 2460, y: 310, w: 350, h: 40 },
      // Plataformas (mais largas)
      { x: 110, y: 260, w: 70, h: 10 },
      { x: 240, y: 230, w: 65, h: 10 },
      { x: 370, y: 250, w: 70, h: 10 },
      { x: 490, y: 220, w: 65, h: 10 },
      { x: 640, y: 250, w: 80, h: 10 },
      { x: 790, y: 220, w: 65, h: 10 },
      { x: 940, y: 250, w: 70, h: 10 },
      { x: 1040, y: 200, w: 65, h: 10 },
      { x: 1140, y: 170, w: 70, h: 10 },
      { x: 1290, y: 250, w: 80, h: 10 },
      { x: 1440, y: 220, w: 65, h: 10 },
      { x: 1540, y: 250, w: 70, h: 10 },
      { x: 1690, y: 200, w: 65, h: 10 },
      { x: 1840, y: 250, w: 80, h: 10 },
      { x: 1990, y: 220, w: 65, h: 10 },
      { x: 2140, y: 250, w: 70, h: 10 },
      { x: 2290, y: 200, w: 65, h: 10 },
    ],
    enemies: [
      { x: 400, y: 290, type: 'drone', patrol: 80 },
      { x: 650, y: 230, type: 'drone', patrol: 60 },
      { x: 900, y: 290, type: 'heavy', patrol: 70 },
      { x: 1100, y: 290, type: 'drone', patrol: 80 },
      { x: 1300, y: 290, type: 'heavy', patrol: 60 },
      { x: 1550, y: 290, type: 'drone', patrol: 70 },
      { x: 1850, y: 290, type: 'heavy', patrol: 60 },
      { x: 2100, y: 290, type: 'drone', patrol: 80 },
    ],
    orions: [
      { x: 140, y: 250 }, { x: 270, y: 220 }, { x: 400, y: 240 },
      { x: 520, y: 210 }, { x: 670, y: 240 }, { x: 820, y: 210 },
      { x: 970, y: 240 }, { x: 1070, y: 190 }, { x: 1170, y: 160 },
      { x: 1320, y: 240 }, { x: 1470, y: 210 }, { x: 1570, y: 240 },
      { x: 1720, y: 190 }, { x: 1870, y: 240 },
    ],
    checkpoints: [
      { x: 600, y: 286 },
      { x: 1250, y: 286 },
      { x: 2100, y: 286 },
    ],
    npcs: [
      { x: 60, y: 274, type: 'botop', dialog: ['Esta e a batalha', 'final, Tom.', 'O Coracao Cosmico', 'espera por voce!'] },
      { x: 2200, y: 274, type: 'vivi', dialog: ['Tom! O boss esta', 'logo a frente!', 'Use seu ataque!', 'Eu acredito!'] },
    ],
    portal: null,
    boss: { x: 2600, y: 262 },
  }
];


// ─── FUNÇÕES DE PARTÍCULAS ──────────────────────────────────
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    if (particles[i].life <= 0) particles.splice(i, 1);
  }
}
function drawParticles() {
  for (const p of particles) p.draw();
}
// Trails são partículas normais, mesmas funções
function updateTrails() {} // integrado em updateParticles
function drawTrails() {}   // integrado em drawParticles

// ─── GAME MANAGER ───────────────────────────────────────────
const game = {
  state: 'title', // title, playing, gameover, victory, transition
  ticks: 0,
  levelIndex: 0,
  currentLevel: null,
  player: null,
  enemies: [],
  orions: [],
  checkpoints: [],
  npcs: [],
  portals: [],
  boss: null,
  checkpointX: 0,
  checkpointY: 0,
  transitionTimer: 0,
  transitionType: '',

  loadLevel(index) {
    if (index >= LEVELS.length) { this.state = 'victory'; return; }
    this.levelIndex = index;
    const lvl = LEVELS[index];
    this.currentLevel = lvl;
    this.player = new Player(lvl.playerStart.x, lvl.playerStart.y);
    // Preserve score and orions from previous level
    if (this._prevScore) { this.player.score = this._prevScore; this.player.orions = this._prevOrions; }
    this.enemies = lvl.enemies.map(e => new Enemy(e.x, e.y, e.type, e.patrol));
    this.orions = lvl.orions.map(o => new Orion(o.x, o.y));
    this.checkpoints = lvl.checkpoints.map(c => new Checkpoint(c.x, c.y));
    this.npcs = lvl.npcs.map(n => new NPC(n.x, n.y, n.type, n.dialog));
    this.portals = lvl.portal ? [new Portal(lvl.portal.x, lvl.portal.y)] : [];
    this.boss = lvl.boss ? new Boss(lvl.boss.x, lvl.boss.y) : null;
    this.checkpointX = lvl.playerStart.x;
    this.checkpointY = lvl.playerStart.y;
    camera.x = this.player.x - GAME_W/2;
    camera.y = this.player.y - GAME_H/2;
  },

  nextLevel() {
    this._prevScore = this.player.score;
    this._prevOrions = this.player.orions;
    this.transitionType = 'next';
    this.transitionTimer = 60;
    this.state = 'transition';
  },

  start() {
    this._prevScore = 0;
    this._prevOrions = 0;
    this.loadLevel(0);
    this.state = 'playing';
    musicSystem.fadeOut(() => musicSystem.play('fase1'));
  },

  update() {
    this.ticks++;
    updateParticles();
    updateTrails();

    // Tocar música da intro na tela título
    if (this.state === 'title' && musicSystem.current !== 'intro') {
      musicSystem.play('intro');
    }

    if (this.state === 'title') {
      if (isTouching || keys['Enter'] || keys['Space'] || false) {
        this.start();
        isTouching = false;
      }
    }
    else if (this.state === 'playing') {
      const p = this.player;
      const lvl = this.currentLevel;
      p.update(lvl.platforms, this.enemies, this.orions, this.checkpoints, this.portals, this.npcs);
      for (const e of this.enemies) e.update(p);
      for (const n of this.npcs) n.update(p);
      if (this.boss) {
        this.boss.update(p);
        if (this.boss.dead && this.boss.deathTimer <= 0) {
          this.state = 'victory';
          musicSystem.fadeOut();
        }
      }
      updateCamera(p, lvl.width, lvl.height);
      if (p.hp <= 0) {
        this.state = 'gameover';
        musicSystem.fadeOut();
        cameraShake(8, 20);
      }
    }
    else if (this.state === 'transition') {
      this.transitionTimer--;
      if (this.transitionTimer <= 0) {
        this.loadLevel(this.levelIndex + 1);
        this.state = 'playing';
      }
    }
    else if (this.state === 'gameover' || this.state === 'victory') {
      if (isTouching || keys['Enter'] || keys['Space'] || false) {
        this.state = 'title';
        musicSystem.stopAll();
        isTouching = false;
      }
    }
  },

  draw() {
    ctx.clearRect(0, 0, GAME_W, GAME_H);

    if (this.state === 'title') {
      drawTitleScreen16();
    }
    else if (this.state === 'playing' || this.state === 'transition') {
      drawBackground16(this.levelIndex);
      // Plataformas
      for (const p of this.currentLevel.platforms) drawPlatform16(p);
      // Orions
      for (const o of this.orions) o.draw();
      // Checkpoints
      for (const c of this.checkpoints) c.draw();
      // Portals
      for (const p of this.portals) p.draw();
      // NPCs
      for (const n of this.npcs) n.draw();
      // Enemies
      for (const e of this.enemies) e.draw();
      // Boss
      if (this.boss) this.boss.draw();
      // Player
      this.player.draw();
      // Particles & trails
      drawTrails();
      drawParticles();
      // HUD
      drawHUD16();
      // Transition overlay
      if (this.state === 'transition') {
        const progress = 1 - this.transitionTimer / 60;
        ctx.fillStyle = `rgba(0,0,0,${progress < 0.5 ? progress * 2 : 2 - progress * 2})`;
        ctx.fillRect(0, 0, GAME_W, GAME_H);
        if (progress > 0.3 && progress < 0.7) {
          const nextName = LEVELS[this.levelIndex + 1] ? LEVELS[this.levelIndex + 1].name : 'VITORIA';
          drawPixelText(nextName, GAME_W/2, GAME_H/2, 2, C.cyan, 'center');
        }
      }
    }
    else if (this.state === 'gameover') {
      drawBackground16(this.levelIndex);
      ctx.fillStyle = 'rgba(20,0,0,0.7)';
      ctx.fillRect(0, 0, GAME_W, GAME_H);
      drawPixelText('GAME OVER', GAME_W/2, GAME_H/2 - 20, 3, C.red, 'center');
      drawPixelText('SCORE: ' + (this.player ? this.player.score : 0), GAME_W/2, GAME_H/2 + 10, 1.5, C.gold, 'center');
      if (this.ticks % 50 < 35) {
        drawPixelText('TOQUE PARA RECOMECAR', GAME_W/2, GAME_H/2 + 35, 1, C.white, 'center');
      }
    }
    else if (this.state === 'victory') {
      drawVictoryScreen();
    }

    // Controles mobile
    drawMobileControls16();
  }
};

// ─── TELA DE VITÓRIA 16-BIT ─────────────────────────────────
function drawVictoryScreen() {
  const t = game.ticks;
  // Fundo cósmico
  const vg = ctx.createLinearGradient(0, 0, 0, GAME_H);
  vg.addColorStop(0, '#050520');
  vg.addColorStop(0.5, '#0A0A40');
  vg.addColorStop(1, '#150A55');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, GAME_W, GAME_H);
  // Estrelas
  for (let i = 0; i < 60; i++) {
    const sx = (i * 41.3) % GAME_W;
    const sy = (i * 27.7) % GAME_H;
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = Math.sin(t * 0.05 + i) * 0.4 + 0.6;
    ctx.fillRect(sx, sy, 1, 1);
  }
  ctx.globalAlpha = 1;
  // Partículas de celebração
  for (let i = 0; i < 20; i++) {
    const px = (t * 1.5 + i * 50) % GAME_W;
    const py = (t * 0.8 + i * 30) % GAME_H;
    ctx.fillStyle = [C.gold, C.cyan, C.purple, C.magenta, C.green][i % 5];
    ctx.fillRect(px, py, 2, 2);
  }
  // Texto
  drawPixelText('VITORIA!', GAME_W/2, 30, 3, C.gold, 'center');
  drawPixelText('O CORACAO ELETRICO', GAME_W/2, 60, 1.5, C.cyan, 'center');
  drawPixelText('PULSA ETERNAMENTE', GAME_W/2, 76, 1.5, C.cyan, 'center');
  drawPixelText('SCORE FINAL', GAME_W/2, 100, 1, C.white, 'center');
  drawPixelText(String(game.player ? game.player.score : 0), GAME_W/2, 115, 2, C.gold, 'center');
  drawPixelText('ORIONS: ' + (game.player ? game.player.orions : 0), GAME_W/2, 138, 1, C.orange, 'center');
  if (t % 50 < 35) {
    drawPixelText('TOQUE PARA RECOMECAR', GAME_W/2, GAME_H - 20, 1, C.white, 'center');
  }
}

// ─── CONTROLES MOBILE 16-BIT ────────────────────────────────
function drawMobileControls16() {
  if (game.state !== 'playing') return;
  for (const btn of touchBtns) {
    const pressed = touch[btn.id];
    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(btn.x + 1, btn.y + 1, btn.w, btn.h);
    // Botão com gradiente
    const bg = ctx.createLinearGradient(btn.x, btn.y, btn.x, btn.y + btn.h);
    if (pressed) {
      bg.addColorStop(0, btn.color);
      bg.addColorStop(1, '#111122');
    } else {
      bg.addColorStop(0, btn.color + 'CC');
      bg.addColorStop(1, btn.color + '88');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
    // Borda
    ctx.strokeStyle = pressed ? C.cyan : '#556688';
    ctx.lineWidth = 1;
    ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
    // Highlight superior
    if (!pressed) {
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(btn.x + 1, btn.y + 1, btn.w - 2, 2);
    }
    // Label
    const labelColor = pressed ? C.cyan : '#AABBCC';
    drawPixelText(btn.label, btn.x + btn.w/2, btn.y + btn.h/2 - 3, 1.2, labelColor, 'center');
  }
}


// ─── GAME LOOP ──────────────────────────────────────────────
function gameLoop() {
  game.update();
  game.draw();
  requestAnimationFrame(gameLoop);
}

// ─── START ──────────────────────────────────────────────────
gameLoop();
console.log('SuperTom 16-bit v2.0 - A Jornada do Coração Elétrico');
