// ============================================================
// SUPERTOM: A Jornada do Coração Elétrico
// Engine principal - HTML5 Canvas Game
// ============================================================

'use strict';

// ─── CONFIGURAÇÕES GLOBAIS ──────────────────────────────────
const GAME_W = 480;
const GAME_H = 270;
const TILE = 32;
const GRAVITY = 0.45;
const JUMP_FORCE = -10.5;
const MOVE_SPEED = 3.2;
const MAX_FALL = 14;

// ─── PALETA DE CORES ────────────────────────────────────────
const C = {
  bg:       '#0D0D2B',
  bgMid:    '#1A0A3D',
  bgFar:    '#0A0A1E',
  ground:   '#1E0A4E',
  platform: '#2D1B6E',
  platTop:  '#00FFFF',
  wall:     '#150830',
  wallLine: '#3D1B8E',
  cyan:     '#00FFFF',
  purple:   '#8B00FF',
  magenta:  '#FF00FF',
  orange:   '#FF6600',
  gold:     '#FFD700',
  white:    '#FFFFFF',
  red:      '#FF3333',
  green:    '#00FF88',
  blue:     '#0066FF',
  darkBlue: '#0D0D2B',
  heartRed: '#FF1744',
  neonPink: '#FF0080',
  star:     '#FFFACD',
  uiBg:     'rgba(0,0,20,0.85)',
  uiBorder: '#00FFFF',
  btnBg:    'rgba(0,20,60,0.9)',
  btnBorder:'#00FFFF',
  btnActive:'rgba(0,80,160,0.9)',
  dialogBg: 'rgba(5,0,30,0.95)',
  shadow:   'rgba(0,0,0,0.7)',
};

// ─── CANVAS SETUP ───────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let scale = 1;

function resizeCanvas() {
  const ww = window.innerWidth;
  const wh = window.innerHeight;
  scale = Math.min(ww / GAME_W, wh / GAME_H);
  canvas.width  = GAME_W;
  canvas.height = GAME_H;
  canvas.style.width  = Math.floor(GAME_W * scale) + 'px';
  canvas.style.height = Math.floor(GAME_H * scale) + 'px';
  ctx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ─── UTILITÁRIOS ────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function rnd(min, max) { return Math.random() * (max - min) + min; }
function rndInt(min, max) { return Math.floor(rnd(min, max + 1)); }
function rectOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

// ─── PIXEL FONT ─────────────────────────────────────────────
// Fonte pixel art manual (5x7 bitmap)
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
  'J':[[0,0,1],[0,0,1],[0,0,1],[1,0,1],[0,1,1]],
  'K':[[1,0,0,1],[1,0,1,0],[1,1,0,0],[1,0,1,0],[1,0,0,1]],
  'L':[[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,1,1,1]],
  'M':[[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'N':[[1,0,0,1],[1,1,0,1],[1,0,1,1],[1,0,0,1],[1,0,0,1]],
  'O':[[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  'P':[[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,0,0],[1,0,0,0]],
  'Q':[[0,1,1,0],[1,0,0,1],[1,0,1,1],[1,0,0,1],[0,1,1,1]],
  'R':[[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,1,0],[1,0,0,1]],
  'S':[[0,1,1,1],[1,0,0,0],[0,1,1,0],[0,0,0,1],[1,1,1,0]],
  'T':[[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  'U':[[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  'V':[[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,1,0,1,0],[0,0,1,0,0]],
  'W':[[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
  'X':[[1,0,0,1],[0,1,1,0],[0,0,0,0],[0,1,1,0],[1,0,0,1]],
  'Y':[[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  'Z':[[1,1,1,1],[0,0,1,0],[0,1,0,0],[1,0,0,0],[1,1,1,1]],
  '0':[[0,1,1,0],[1,0,1,1],[1,1,0,1],[1,0,0,1],[0,1,1,0]],
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
  '!':[[1],[1],[1],[0],[1]],
  '?':[[0,1,1,0],[1,0,0,1],[0,0,1,0],[0,0,0,0],[0,0,1,0]],
  '.':[[0],[0],[0],[0],[1]],
  ',':[[0],[0],[0],[0,1],[1,0]],
  '-':[[0,0,0],[0,0,0],[1,1,1],[0,0,0],[0,0,0]],
  ' ':[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
  'Ã':[[0,1,1,0],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
  'Ç':[[0,1,1,1],[1,0,0,0],[1,0,0,0],[1,0,0,0],[0,1,1,1]],
  'Ê':[[0,1,1,1,0],[1,0,0,0,0],[1,1,1,0,0],[1,0,0,0,0],[0,1,1,1,0]],
  'Ó':[[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  'Á':[[0,1,1,0],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
  'É':[[1,1,1,1],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,1,1,1]],
  'Í':[[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
  'Ú':[[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  'Ã':[[0,1,1,0],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
  'ã':[[0,1,1,0],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
  'ç':[[0,1,1,1],[1,0,0,0],[1,0,0,0],[1,0,0,0],[0,1,1,1]],
  'ê':[[0,1,1,1,0],[1,0,0,0,0],[1,1,1,0,0],[1,0,0,0,0],[0,1,1,1,0]],
  'ó':[[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  'á':[[0,1,1,0],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
  'é':[[1,1,1,1],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,1,1,1]],
  'í':[[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
  'ú':[[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
};

function drawPixelText(text, x, y, size, color, align) {
  const str = text.toUpperCase();
  const charW = size + 1;
  let totalW = 0;
  for (let c of str) {
    const d = FONT_DATA[c] || FONT_DATA[' '];
    totalW += (d[0].length * size) + charW;
  }
  let startX = x;
  if (align === 'center') startX = x - totalW / 2;
  else if (align === 'right') startX = x - totalW;

  ctx.fillStyle = color;
  let cx = startX;
  for (let c of str) {
    const d = FONT_DATA[c] || FONT_DATA[' '];
    for (let row = 0; row < d.length; row++) {
      for (let col = 0; col < d[row].length; col++) {
        if (d[row][col]) {
          ctx.fillRect(
            Math.floor(cx + col * size),
            Math.floor(y + row * size),
            size, size
          );
        }
      }
    }
    cx += d[0].length * size + charW;
  }
}

// ─── GERENCIADOR DE IMAGENS ─────────────────────────────────
const Images = {};
let imagesLoaded = 0;
let imagesToLoad = 0;

function loadImage(key, src) {
  imagesToLoad++;
  const img = new Image();
  img.onload = () => { imagesLoaded++; };
  img.onerror = () => { imagesLoaded++; }; // continua mesmo sem imagem
  img.src = src;
  Images[key] = img;
}

// ─── GERENCIADOR DE ÁUDIO ────────────────────────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
}

function playBeep(freq, dur, vol, type) {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioCtx.currentTime + dur);
    gain.gain.setValueAtTime((vol || 0.15), audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + dur);
  } catch(e) {}
}

function sfxJump()    { playBeep(380, 0.12, 0.1, 'square'); playBeep(520, 0.08, 0.08, 'square'); }
function sfxLand()    { playBeep(120, 0.07, 0.08, 'sawtooth'); }
function sfxCollect() { playBeep(880, 0.05, 0.12); playBeep(1100, 0.08, 0.1); playBeep(1400, 0.1, 0.08); }
function sfxHurt()    { playBeep(180, 0.15, 0.15, 'sawtooth'); playBeep(120, 0.2, 0.1, 'sawtooth'); }
function sfxDie()     { for(let i=0;i<5;i++) setTimeout(()=>playBeep(200-i*30,0.1,0.1,'sawtooth'),i*80); }
function sfxCheckpoint(){ playBeep(660,0.07,0.1); playBeep(880,0.07,0.1); playBeep(1100,0.12,0.1); }
function sfxLevelUp() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>playBeep(f,0.15,0.12),i*100)); }
function sfxInteract(){ playBeep(440, 0.05, 0.08); playBeep(550, 0.08, 0.08); }
function sfxMenu()    { playBeep(330, 0.06, 0.08, 'square'); }

// ─── PARTÍCULAS ─────────────────────────────────────────────
class Particle {
  constructor(x, y, vx, vy, color, life, size) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.color = color;
    this.life = life || 30;
    this.maxLife = this.life;
    this.size = size || 2;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1;
    this.vx *= 0.97;
    this.life--;
  }
  draw() {
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

const particles = [];
function spawnParticles(x, y, color, count, speed) {
  for (let i = 0; i < (count||8); i++) {
    const angle = rnd(0, Math.PI * 2);
    const spd = rnd(0.5, speed || 2.5);
    particles.push(new Particle(x, y,
      Math.cos(angle) * spd,
      Math.sin(angle) * spd - 1,
      color, rndInt(20, 40), rndInt(1, 3)
    ));
  }
}

// ─── ESTRELAS DO FUNDO ───────────────────────────────────────
const stars = [];
for (let i = 0; i < 80; i++) {
  stars.push({
    x: rnd(0, GAME_W),
    y: rnd(0, GAME_H * 0.6),
    size: rnd(0.5, 1.5),
    twinkle: rnd(0, Math.PI * 2),
    speed: rnd(0.02, 0.06)
  });
}

// ─── CÂMERA ─────────────────────────────────────────────────
const camera = { x: 0, y: 0, targetX: 0, targetY: 0 };

function updateCamera(player, levelW, levelH) {
  camera.targetX = player.x + player.w / 2 - GAME_W / 2;
  camera.targetY = player.y + player.h / 2 - GAME_H / 2;
  camera.targetX = clamp(camera.targetX, 0, Math.max(0, levelW - GAME_W));
  camera.targetY = clamp(camera.targetY, 0, Math.max(0, levelH - GAME_H));
  camera.x = lerp(camera.x, camera.targetX, 0.1);
  camera.y = lerp(camera.y, camera.targetY, 0.1);
}

// ─── INPUT ──────────────────────────────────────────────────
const keys = {};
const touch = { left: false, right: false, jump: false, interact: false };

window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Space') e.preventDefault();
  if (e.code === 'ArrowUp' || e.code === 'ArrowDown') e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function isLeft()     { return keys['ArrowLeft']  || keys['KeyA'] || touch.left; }
function isRight()    { return keys['ArrowRight'] || keys['KeyD'] || touch.right; }
function isJump()     { return keys['ArrowUp'] || keys['Space'] || keys['KeyW'] || touch.jump; }
function isInteract() { return keys['KeyE'] || keys['Enter'] || touch.interact; }

// ─── CONTROLES TOUCH ────────────────────────────────────────
let jumpPressed = false;
let interactPressed = false;

// Botões virtuais (coordenadas em espaço de jogo)
const BTN = {
  left:     { x: 12,  y: GAME_H - 58, w: 44, h: 44 },
  right:    { x: 62,  y: GAME_H - 58, w: 44, h: 44 },
  jump:     { x: GAME_W - 60, y: GAME_H - 58, w: 44, h: 44 },
  interact: { x: GAME_W - 112, y: GAME_H - 58, w: 44, h: 44 },
};

function getGamePos(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) / scale,
    y: (clientY - rect.top)  / scale,
  };
}

function checkBtn(btn, gx, gy) {
  return gx >= btn.x && gx <= btn.x + btn.w &&
         gy >= btn.y && gy <= btn.y + btn.h;
}

function updateTouchState(touches) {
  touch.left = false;
  touch.right = false;
  touch.jump = false;
  touch.interact = false;
  for (let t of touches) {
    const p = getGamePos(t.clientX, t.clientY);
    if (checkBtn(BTN.left, p.x, p.y))     touch.left = true;
    if (checkBtn(BTN.right, p.x, p.y))    touch.right = true;
    if (checkBtn(BTN.jump, p.x, p.y))     touch.jump = true;
    if (checkBtn(BTN.interact, p.x, p.y)) touch.interact = true;
  }
}

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  initAudio();
  updateTouchState(e.touches);
}, { passive: false });
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  updateTouchState(e.touches);
}, { passive: false });
canvas.addEventListener('touchend', e => {
  e.preventDefault();
  updateTouchState(e.touches);
}, { passive: false });
canvas.addEventListener('click', () => initAudio());

// ─── JOGADOR ────────────────────────────────────────────────
class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 18; this.h = 28;
    this.vx = 0; this.vy = 0;
    this.onGround = false;
    this.facing = 1; // 1 = direita, -1 = esquerda
    this.hp = 5; this.maxHp = 5;
    this.orions = 0;
    this.invincible = 0;
    this.animFrame = 0;
    this.animTimer = 0;
    this.state = 'idle'; // idle, walk, jump, hurt, dead
    this.jumpBuffer = 0;
    this.coyoteTime = 0;
    this.wasOnGround = false;
    this.heartPulse = 0;
    this.interactCooldown = 0;
  }

  update(platforms, enemies) {
    // Física
    this.vy += GRAVITY;
    if (this.vy > MAX_FALL) this.vy = MAX_FALL;

    // Movimento horizontal
    let moving = false;
    if (this.state !== 'dead') {
      if (isLeft())  { this.vx = -MOVE_SPEED; this.facing = -1; moving = true; }
      if (isRight()) { this.vx =  MOVE_SPEED; this.facing =  1; moving = true; }
      if (!isLeft() && !isRight()) this.vx *= 0.75;
    } else {
      this.vx *= 0.8;
    }

    // Pulo com coyote time e jump buffer
    if (this.onGround) this.coyoteTime = 8;
    else if (this.coyoteTime > 0) this.coyoteTime--;

    if (isJump()) this.jumpBuffer = 8;
    else if (this.jumpBuffer > 0) this.jumpBuffer--;

    if (this.jumpBuffer > 0 && this.coyoteTime > 0 && this.state !== 'dead') {
      this.vy = JUMP_FORCE;
      this.coyoteTime = 0;
      this.jumpBuffer = 0;
      sfxJump();
    }

    // Movimento X
    this.x += this.vx;
    this.x = clamp(this.x, 0, game.currentLevel.width - this.w);

    // Colisão horizontal com plataformas
    for (const p of platforms) {
      if (rectOverlap(this, p)) {
        if (this.vx > 0) this.x = p.x - this.w;
        else if (this.vx < 0) this.x = p.x + p.w;
        this.vx = 0;
      }
    }

    // Movimento Y
    this.wasOnGround = this.onGround;
    this.onGround = false;
    this.y += this.vy;

    // Colisão vertical com plataformas
    for (const p of platforms) {
      if (rectOverlap(this, p)) {
        if (this.vy > 0) {
          this.y = p.y - this.h;
          this.vy = 0;
          if (!this.wasOnGround) sfxLand();
          this.onGround = true;
        } else if (this.vy < 0) {
          this.y = p.y + p.h;
          this.vy = 0;
        }
      }
    }

    // Morte por queda
    if (this.y > game.currentLevel.height + 100) {
      this.takeDamage(1);
      this.x = game.currentLevel.spawnX;
      this.y = game.currentLevel.spawnY;
      this.vx = 0; this.vy = 0;
    }

    // Invencibilidade
    if (this.invincible > 0) this.invincible--;
    if (this.interactCooldown > 0) this.interactCooldown--;

    // Animação
    this.heartPulse = (this.heartPulse + 0.1) % (Math.PI * 2);
    this.animTimer++;
    if (this.state === 'dead') {
      this.state = 'dead';
    } else if (!this.onGround) {
      this.state = 'jump';
      this.animFrame = 0;
    } else if (moving) {
      this.state = 'walk';
      if (this.animTimer % 8 === 0) this.animFrame = (this.animFrame + 1) % 4;
    } else {
      this.state = 'idle';
      if (this.animTimer % 20 === 0) this.animFrame = (this.animFrame + 1) % 2;
    }
  }

  takeDamage(amount) {
    if (this.invincible > 0 || this.state === 'dead') return;
    this.hp = Math.max(0, this.hp - amount);
    this.invincible = 90;
    this.vy = -5;
    sfxHurt();
    spawnParticles(this.x + this.w/2, this.y + this.h/2, C.red, 10, 3);
    if (this.hp <= 0) {
      this.state = 'dead';
      sfxDie();
      setTimeout(() => game.respawn(), 2000);
    }
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    spawnParticles(this.x + this.w/2, this.y, C.green, 12, 2);
  }

  draw() {
    const px = Math.floor(this.x - camera.x);
    const py = Math.floor(this.y - camera.y);

    // Piscar quando invencível
    if (this.invincible > 0 && Math.floor(this.invincible / 4) % 2 === 0) return;

    ctx.save();
    ctx.translate(px + this.w / 2, py + this.h / 2);
    if (this.facing === -1) ctx.scale(-1, 1);

    this.drawSprite();

    ctx.restore();
  }

  drawSprite() {
    const hw = this.w / 2;
    const hh = this.h / 2;
    const pulse = 0.7 + Math.sin(this.heartPulse) * 0.3;

    // Sombra no chão
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(-hw + 2, hh - 1, this.w - 4, 3);

    // ── PERNAS
    if (this.state === 'walk') {
      const legSwing = Math.sin(this.animFrame * Math.PI / 2) * 4;
      ctx.fillStyle = '#223366';
      ctx.fillRect(-hw + 2, hh - 10, 6, 10 + legSwing);
      ctx.fillRect(hw - 8, hh - 10, 6, 10 - legSwing);
      // Sapatos animados
      ctx.fillStyle = '#442211';
      ctx.fillRect(-hw + 1, hh - 3 + legSwing, 8, 3);
      ctx.fillRect(hw - 9, hh - 3 - legSwing, 8, 3);
    } else if (this.state === 'jump') {
      ctx.fillStyle = '#223366';
      ctx.fillRect(-hw + 2, hh - 8, 6, 8);
      ctx.fillRect(hw - 8, hh - 12, 6, 12);
      ctx.fillStyle = '#442211';
      ctx.fillRect(-hw + 1, hh - 3, 8, 3);
      ctx.fillRect(hw - 9, hh - 3, 8, 3);
    } else {
      ctx.fillStyle = '#223366';
      ctx.fillRect(-hw + 2, hh - 10, 6, 10);
      ctx.fillRect(hw - 8, hh - 10, 6, 10);
      ctx.fillStyle = '#442211';
      ctx.fillRect(-hw + 1, hh - 3, 8, 3);
      ctx.fillRect(hw - 9, hh - 3, 8, 3);
    }

    // ── CORPO: jaleco branco
    ctx.fillStyle = '#D8D8EE';
    ctx.fillRect(-hw + 1, -hh + 8, this.w - 2, this.h - 18);
    // Lapelas
    ctx.fillStyle = '#BBBBDD';
    ctx.fillRect(-hw + 1, -hh + 8, 4, 10);
    ctx.fillRect(hw - 5, -hh + 8, 4, 10);
    // Camisa azul
    ctx.fillStyle = '#1155AA';
    ctx.fillRect(-hw + 5, -hh + 10, this.w - 10, 8);

    // Coração elétrico pulsante
    ctx.globalAlpha = pulse;
    ctx.fillStyle = C.cyan;
    ctx.fillRect(-2, -hh + 11, 4, 3);
    ctx.fillRect(-3, -hh + 10, 2, 2);
    ctx.fillRect(1, -hh + 10, 2, 2);
    ctx.fillRect(-1, -hh + 14, 2, 1);
    // Glow do coração
    ctx.globalAlpha = pulse * 0.3;
    ctx.fillStyle = '#88FFFF';
    ctx.fillRect(-5, -hh + 8, 10, 10);
    ctx.globalAlpha = 1;

    // ── BRAÇOS
    if (this.state === 'walk') {
      const armSwing = Math.sin(this.animFrame * Math.PI / 2) * 3;
      ctx.fillStyle = '#D8D8EE';
      ctx.fillRect(-hw - 2, -hh + 9, 4, 9 + armSwing);
      ctx.fillRect(hw - 2, -hh + 9, 4, 9 - armSwing);
      ctx.fillStyle = '#FFCC99';
      ctx.fillRect(-hw - 2, -hh + 16 + armSwing, 4, 4);
      ctx.fillRect(hw - 2, -hh + 16 - armSwing, 4, 4);
    } else if (this.state === 'jump') {
      ctx.fillStyle = '#D8D8EE';
      ctx.fillRect(-hw - 3, -hh + 7, 4, 7);
      ctx.fillRect(hw - 1, -hh + 7, 4, 7);
      ctx.fillStyle = '#FFCC99';
      ctx.fillRect(-hw - 3, -hh + 13, 4, 4);
      ctx.fillRect(hw - 1, -hh + 13, 4, 4);
    } else {
      ctx.fillStyle = '#D8D8EE';
      ctx.fillRect(-hw - 2, -hh + 9, 4, 8);
      ctx.fillRect(hw - 2, -hh + 9, 4, 8);
      ctx.fillStyle = '#FFCC99';
      ctx.fillRect(-hw - 2, -hh + 16, 4, 4);
      ctx.fillRect(hw - 2, -hh + 16, 4, 4);
    }

    // ── CABEÇA
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(-hw + 3, -hh, this.w - 6, 9);
    // Cabelo castanho avermelhado
    ctx.fillStyle = '#7B3A1A';
    ctx.fillRect(-hw + 3, -hh, this.w - 6, 4);
    ctx.fillRect(-hw + 3, -hh + 4, 2, 3);
    ctx.fillRect(hw - 5, -hh + 4, 2, 2);
    // Topete
    ctx.fillRect(-2, -hh - 2, 6, 3);
    // Olhos azuis
    ctx.fillStyle = '#1155CC';
    ctx.fillRect(-4, -hh + 4, 3, 2);
    ctx.fillRect(1, -hh + 4, 3, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-3, -hh + 4, 1, 1);
    ctx.fillRect(2, -hh + 4, 1, 1);
    // Sobrancelha
    ctx.fillStyle = '#5A2A0A';
    ctx.fillRect(-4, -hh + 3, 4, 1);
    ctx.fillRect(0, -hh + 3, 4, 1);
    // Boca
    ctx.fillStyle = '#CC5533';
    ctx.fillRect(-3, -hh + 7, 6, 1);

    // Efeito de dano
    if (this.state === 'dead') {
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(-hw, -hh, this.w, this.h);
      ctx.globalAlpha = 1;
    }
  }
}

// ─── INIMIGO ─────────────────────────────────────────────────
class Enemy {
  constructor(x, y, type, patrolLeft, patrolRight) {
    this.x = x; this.y = y;
    this.w = 20; this.h = 20;
    this.type = type || 'drone';
    this.vx = 1; this.vy = 0;
    this.onGround = false;
    this.patrolLeft = patrolLeft || x - 60;
    this.patrolRight = patrolRight || x + 60;
    this.animTimer = 0;
    this.animFrame = 0;
    this.alive = true;
    this.hp = type === 'heavy' ? 3 : 1;
  }

  update(platforms) {
    if (!this.alive) return;

    this.vy += GRAVITY;
    if (this.vy > MAX_FALL) this.vy = MAX_FALL;

    this.x += this.vx;
    if (this.x <= this.patrolLeft)  { this.x = this.patrolLeft;  this.vx = Math.abs(this.vx); }
    if (this.x >= this.patrolRight) { this.x = this.patrolRight; this.vx = -Math.abs(this.vx); }

    this.onGround = false;
    this.y += this.vy;
    for (const p of platforms) {
      if (rectOverlap(this, p)) {
        if (this.vy > 0) { this.y = p.y - this.h; this.vy = 0; this.onGround = true; }
        else if (this.vy < 0) { this.y = p.y + p.h; this.vy = 0; }
      }
    }

    this.animTimer++;
    if (this.animTimer % 6 === 0) this.animFrame = (this.animFrame + 1) % 4;
  }

  draw() {
    if (!this.alive) return;
    const ex = Math.floor(this.x - camera.x);
    const ey = Math.floor(this.y - camera.y);

    if (this.type === 'drone') {
      // Drone voador - mais detalhado
      const bob = Math.sin(this.animTimer * 0.12) * 3;
      const wingFlap = Math.sin(this.animTimer * 0.3) * 2;

      // Corpo principal - esfera roxa escura
      ctx.fillStyle = '#2A0A44';
      ctx.fillRect(ex + 2, ey + 3 + bob, this.w - 4, this.h - 6);
      ctx.fillStyle = '#5500AA';
      ctx.fillRect(ex + 4, ey + 5 + bob, this.w - 8, this.h - 10);
      // Olho vermelho brilhante
      ctx.fillStyle = '#CC0000';
      ctx.fillRect(ex + 7, ey + 7 + bob, 6, 5);
      ctx.fillStyle = '#FF3333';
      ctx.fillRect(ex + 8, ey + 8 + bob, 4, 3);
      ctx.fillStyle = '#FF8888';
      ctx.fillRect(ex + 9, ey + 8 + bob, 2, 1);
      // Glow do olho
      ctx.globalAlpha = 0.4 + Math.sin(this.animTimer * 0.2) * 0.3;
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(ex + 5, ey + 5 + bob, 10, 9);
      ctx.globalAlpha = 1;
      // Asas (hélices)
      ctx.fillStyle = '#888899';
      ctx.fillRect(ex - 6, ey + 2 + bob + wingFlap, 7, 2);
      ctx.fillRect(ex + this.w - 1, ey + 2 + bob - wingFlap, 7, 2);
      ctx.fillStyle = '#AAAACC';
      ctx.fillRect(ex - 5, ey + 1 + bob + wingFlap, 5, 1);
      ctx.fillRect(ex + this.w, ey + 1 + bob - wingFlap, 5, 1);
      // Antena
      ctx.fillStyle = '#AA44FF';
      ctx.fillRect(ex + 9, ey + bob, 2, 4);
      ctx.fillRect(ex + 8, ey - 1 + bob, 4, 2);
      // Brilho inferior
      ctx.globalAlpha = 0.3 + Math.sin(this.animTimer * 0.15) * 0.2;
      ctx.fillStyle = C.purple;
      ctx.fillRect(ex + 3, ey + this.h - 4 + bob, this.w - 6, 3);
      ctx.globalAlpha = 1;
    } else {
      // Robô pesado - mais imponente
      const step = Math.sin(this.animTimer * 0.1) * 2;

      // Pernas
      ctx.fillStyle = '#223344';
      ctx.fillRect(ex + 2, ey + this.h - 6, 6, 6 + step);
      ctx.fillRect(ex + this.w - 8, ey + this.h - 6, 6, 6 - step);
      // Pés
      ctx.fillStyle = '#1A2233';
      ctx.fillRect(ex + 1, ey + this.h + step, 8, 3);
      ctx.fillRect(ex + this.w - 9, ey + this.h - step, 8, 3);

      // Corpo principal
      ctx.fillStyle = '#1E2D3D';
      ctx.fillRect(ex, ey + 4, this.w, this.h - 10);
      ctx.fillStyle = '#2A3D52';
      ctx.fillRect(ex + 2, ey + 6, this.w - 4, this.h - 14);
      // Detalhe lateral
      ctx.fillStyle = '#334466';
      ctx.fillRect(ex, ey + 6, 3, this.h - 14);
      ctx.fillRect(ex + this.w - 3, ey + 6, 3, this.h - 14);

      // Cabeça
      ctx.fillStyle = '#1E2D3D';
      ctx.fillRect(ex + 1, ey, this.w - 2, 8);
      ctx.fillStyle = '#2A3D52';
      ctx.fillRect(ex + 3, ey + 1, this.w - 6, 6);

      // Visor vermelho (olhos)
      ctx.fillStyle = '#880000';
      ctx.fillRect(ex + 3, ey + 2, this.w - 6, 4);
      ctx.fillStyle = '#CC0000';
      ctx.fillRect(ex + 4, ey + 2, this.w - 8, 3);
      ctx.fillStyle = '#FF3333';
      ctx.fillRect(ex + 4, ey + 2, 4, 2);
      ctx.fillRect(ex + this.w - 8, ey + 2, 4, 2);
      // Glow do visor
      ctx.globalAlpha = 0.35 + Math.sin(this.animTimer * 0.15) * 0.2;
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(ex + 2, ey + 1, this.w - 4, 6);
      ctx.globalAlpha = 1;

      // Cruz vermelha no peito
      ctx.fillStyle = '#CC0000';
      ctx.fillRect(ex + 8, ey + 8, 4, 8);
      ctx.fillRect(ex + 6, ey + 10, 8, 4);

      // Braços
      ctx.fillStyle = '#1E2D3D';
      ctx.fillRect(ex - 4, ey + 5, 5, 10);
      ctx.fillRect(ex + this.w - 1, ey + 5, 5, 10);
      // Punhos
      ctx.fillStyle = '#2A3D52';
      ctx.fillRect(ex - 5, ey + 13, 6, 5);
      ctx.fillRect(ex + this.w - 1, ey + 13, 6, 5);
    }
  }

  hit() {
    this.hp--;
    spawnParticles(this.x + this.w/2, this.y + this.h/2, C.purple, 8, 3);
    if (this.hp <= 0) {
      this.alive = false;
      spawnParticles(this.x + this.w/2, this.y + this.h/2, C.orange, 15, 4);
      sfxCollect();
    }
  }
}

// ─── NPC ────────────────────────────────────────────────────
class NPC {
  constructor(x, y, type, dialogues) {
    this.x = x; this.y = y;
    this.w = 18; this.h = 28;
    this.type = type; // 'vivi', 'botop'
    this.dialogues = dialogues || [];
    this.dialogIndex = 0;
    this.talking = false;
    this.talkTimer = 0;
    this.animTimer = 0;
    this.interacted = false;
  }

  update(player) {
    this.animTimer++;
    if (this.talking) {
      this.talkTimer--;
      if (this.talkTimer <= 0) this.talking = false;
    }
  }

  interact(player) {
    if (this.type === 'botop' && !this.interacted) {
      player.heal(2);
      sfxInteract();
    }
    this.talking = true;
    this.talkTimer = 300;
    this.interacted = true;
    sfxInteract();
  }

  draw() {
    const nx = Math.floor(this.x - camera.x);
    const ny = Math.floor(this.y - camera.y);
    const bob = Math.sin(this.animTimer * 0.05) * 1;

    if (this.type === 'vivi') {
      this.drawVivi(nx, ny + bob);
    } else if (this.type === 'botop') {
      this.drawBotop(nx, ny + bob);
    }

    // Indicador de interação
    if (!this.interacted || this.type === 'vivi') {
      const pulse = 0.6 + Math.sin(this.animTimer * 0.1) * 0.4;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = C.cyan;
      drawPixelText('E', nx + this.w/2 - 3, ny - 14, 2, C.cyan, 'left');
      ctx.globalAlpha = 1;
    }

    // Diálogo
    if (this.talking && this.dialogues.length > 0) {
      this.drawDialogue(nx, ny);
    }
  }

  drawVivi(x, y) {
    const t = this.animTimer;
    const breathe = Math.sin(t * 0.06) * 1;

    // Pernas
    ctx.fillStyle = '#0A1428';
    ctx.fillRect(x + 3, y + this.h - 9, 5, 9);
    ctx.fillRect(x + this.w - 8, y + this.h - 9, 5, 9);
    // Botas com detalhe
    ctx.fillStyle = '#001133';
    ctx.fillRect(x + 2, y + this.h - 3, 7, 3);
    ctx.fillRect(x + this.w - 9, y + this.h - 3, 7, 3);
    ctx.fillStyle = '#0033AA';
    ctx.fillRect(x + 2, y + this.h - 1, 7, 1);
    ctx.fillRect(x + this.w - 9, y + this.h - 1, 7, 1);

    // Bodysuit azul escuro com detalhes
    ctx.fillStyle = '#0D1A33';
    ctx.fillRect(x + 2, y + 8 + breathe, this.w - 4, this.h - 17);
    // Linhas de circuito
    ctx.fillStyle = '#0066AA';
    ctx.fillRect(x + 4, y + 10 + breathe, 2, 7);
    ctx.fillRect(x + this.w - 6, y + 10 + breathe, 2, 7);
    ctx.fillRect(x + 6, y + 15 + breathe, this.w - 12, 1);
    // Detalhe no peito
    ctx.fillStyle = C.cyan;
    ctx.globalAlpha = 0.7 + Math.sin(t * 0.1) * 0.3;
    ctx.fillRect(x + 7, y + 11 + breathe, 4, 3);
    ctx.globalAlpha = 1;

    // Braços
    ctx.fillStyle = '#0D1A33';
    ctx.fillRect(x - 1, y + 9 + breathe, 4, 9);
    ctx.fillRect(x + this.w - 3, y + 9 + breathe, 4, 9);
    // Mãos
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(x - 1, y + 17 + breathe, 3, 3);
    ctx.fillRect(x + this.w - 2, y + 17 + breathe, 3, 3);

    // Cabeça
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(x + 3, y, this.w - 6, 9);
    // Cabelo roxo longo
    ctx.fillStyle = '#220044';
    ctx.fillRect(x + 3, y, this.w - 6, 3);
    ctx.fillStyle = '#330066';
    ctx.fillRect(x + 2, y + 3, 3, 6);
    ctx.fillRect(x + this.w - 5, y + 3, 3, 6);
    // Mechas caindo
    ctx.fillStyle = '#440088';
    ctx.fillRect(x + 1, y + 5, 2, 12);
    ctx.fillRect(x + this.w - 3, y + 5, 2, 12);
    // Olhos roxos brilhantes
    ctx.fillStyle = '#8833CC';
    ctx.fillRect(x + 5, y + 4, 3, 2);
    ctx.fillRect(x + this.w - 8, y + 4, 3, 2);
    ctx.fillStyle = '#CC88FF';
    ctx.fillRect(x + 5, y + 4, 1, 1);
    ctx.fillRect(x + this.w - 8, y + 4, 1, 1);
    // Nariz
    ctx.fillStyle = '#CC9966';
    ctx.fillRect(x + 8, y + 6, 1, 1);
    // Sorriso
    ctx.fillStyle = '#CC5533';
    ctx.fillRect(x + 6, y + 7, 6, 1);
    ctx.fillRect(x + 5, y + 6, 2, 1);
    ctx.fillRect(x + 11, y + 6, 2, 1);

    // Aura mágica
    ctx.globalAlpha = 0.1 + Math.sin(t * 0.07) * 0.05;
    ctx.fillStyle = C.purple;
    ctx.fillRect(x - 3, y - 2, this.w + 6, this.h + 4);
    ctx.globalAlpha = 1;
  }

  drawBotop(x, y) {
    const t = this.animTimer;
    const hover = Math.sin(t * 0.08) * 1.5;

    // Pernas robóticas
    ctx.fillStyle = '#AAAACC';
    ctx.fillRect(x + 3, y + this.h - 8, 5, 8);
    ctx.fillRect(x + this.w - 8, y + this.h - 8, 5, 8);
    // Pés
    ctx.fillStyle = '#8888AA';
    ctx.fillRect(x + 2, y + this.h - 2, 7, 2);
    ctx.fillRect(x + this.w - 9, y + this.h - 2, 7, 2);

    // Corpo principal branco
    ctx.fillStyle = '#CCCCEE';
    ctx.fillRect(x + 1, y + 9 + hover, this.w - 2, this.h - 17);
    ctx.fillStyle = '#DDDDFF';
    ctx.fillRect(x + 3, y + 11 + hover, this.w - 6, this.h - 21);
    // Cruz médica no peito
    ctx.fillStyle = '#CC0000';
    ctx.fillRect(x + 7, y + 12 + hover, 4, 8);
    ctx.fillRect(x + 5, y + 15 + hover, 8, 3);
    ctx.fillStyle = '#FF3333';
    ctx.fillRect(x + 8, y + 13 + hover, 2, 6);
    ctx.fillRect(x + 6, y + 16 + hover, 6, 1);

    // Braços robóticos
    ctx.fillStyle = '#AAAACC';
    ctx.fillRect(x - 2, y + 10 + hover, 4, 8);
    ctx.fillRect(x + this.w - 2, y + 10 + hover, 4, 8);
    // Mãos
    ctx.fillStyle = '#9999BB';
    ctx.fillRect(x - 3, y + 17 + hover, 5, 4);
    ctx.fillRect(x + this.w - 2, y + 17 + hover, 5, 4);

    // Cabeça redonda
    ctx.fillStyle = '#DDDDFF';
    ctx.fillRect(x + 1, y + hover, this.w - 2, 10);
    ctx.fillStyle = '#EEEEFF';
    ctx.fillRect(x + 2, y + 1 + hover, this.w - 4, 8);
    // Cruz na cabeça
    ctx.fillStyle = '#CC0000';
    ctx.fillRect(x + 7, y + 2 + hover, 4, 6);
    ctx.fillRect(x + 5, y + 4 + hover, 8, 2);
    // Olhos azuis brilhantes
    ctx.fillStyle = '#0044CC';
    ctx.fillRect(x + 3, y + 3 + hover, 4, 3);
    ctx.fillRect(x + this.w - 7, y + 3 + hover, 4, 3);
    ctx.fillStyle = C.cyan;
    ctx.fillRect(x + 4, y + 4 + hover, 2, 2);
    ctx.fillRect(x + this.w - 6, y + 4 + hover, 2, 2);
    // Brilho dos olhos
    ctx.globalAlpha = 0.5 + Math.sin(t * 0.12) * 0.3;
    ctx.fillStyle = '#88FFFF';
    ctx.fillRect(x + 2, y + 2 + hover, 5, 5);
    ctx.fillRect(x + this.w - 7, y + 2 + hover, 5, 5);
    ctx.globalAlpha = 1;
    // Óculos/visor
    ctx.fillStyle = '#334466';
    ctx.fillRect(x + 2, y + 7 + hover, this.w - 4, 2);

    // Brilho geral
    ctx.globalAlpha = 0.15 + Math.sin(t * 0.08) * 0.08;
    ctx.fillStyle = C.cyan;
    ctx.fillRect(x, y + hover, this.w, this.h - 8);
    ctx.globalAlpha = 1;
  }

  drawDialogue(x, y) {
    const text = this.dialogues[this.dialogIndex % this.dialogues.length];
    const maxW = 160;
    const bx = clamp(x - 60, 5, GAME_W - maxW - 5);
    const by = y - 42;

    // Caixa de diálogo
    ctx.fillStyle = C.dialogBg;
    ctx.fillRect(bx, by, maxW, 34);
    ctx.strokeStyle = C.cyan;
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, maxW, 34);

    // Triângulo apontando para o NPC
    ctx.fillStyle = C.cyan;
    ctx.fillRect(x + 4, by + 34, 2, 4);

    // Texto
    const words = text.split(' ');
    let line = '';
    let lineY = by + 6;
    for (const word of words) {
      const test = line + (line ? ' ' : '') + word;
      if (test.length > 22 && line) {
        drawPixelText(line, bx + 6, lineY, 1, C.white);
        line = word;
        lineY += 9;
      } else {
        line = test;
      }
    }
    if (line) drawPixelText(line, bx + 6, lineY, 1, C.white);
  }
}

// ─── COLETÁVEL ORION ─────────────────────────────────────────
class Orion {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 14; this.h = 14;
    this.collected = false;
    this.animTimer = 0;
    this.baseY = y;
  }

  update() {
    this.animTimer++;
    this.y = this.baseY + Math.sin(this.animTimer * 0.08) * 3;
  }

  draw() {
    if (this.collected) return;
    const ox = Math.floor(this.x - camera.x);
    const oy = Math.floor(this.y - camera.y);
    const pulse = 0.6 + Math.sin(this.animTimer * 0.14) * 0.4;
    const rot = this.animTimer * 0.05;

    // Halo externo grande
    ctx.globalAlpha = pulse * 0.15;
    ctx.fillStyle = C.gold;
    ctx.fillRect(ox - 6, oy - 6, this.w + 12, this.h + 12);
    ctx.globalAlpha = 1;

    // Halo médio
    ctx.globalAlpha = pulse * 0.25;
    ctx.fillStyle = C.cyan;
    ctx.fillRect(ox - 3, oy - 3, this.w + 6, this.h + 6);
    ctx.globalAlpha = 1;

    // Anéis cósmicos orbitando
    const r1x = Math.sin(rot) * 7;
    const r1y = Math.cos(rot) * 3;
    ctx.globalAlpha = 0.5 + Math.sin(this.animTimer * 0.1) * 0.3;
    ctx.fillStyle = C.cyan;
    ctx.fillRect(ox + 7 + r1x, oy + 7 + r1y, 2, 2);
    ctx.fillRect(ox + 7 - r1x, oy + 7 - r1y, 2, 2);
    ctx.fillStyle = C.gold;
    ctx.fillRect(ox + 7 + r1y, oy + 7 - r1x, 2, 2);
    ctx.fillRect(ox + 7 - r1y, oy + 7 + r1x, 2, 2);
    ctx.globalAlpha = 1;

    // Estrela dourada de 4 pontas
    ctx.fillStyle = '#CC9900';
    ctx.fillRect(ox + 4, oy + 1, 6, 12);
    ctx.fillRect(ox + 1, oy + 4, 12, 6);
    ctx.fillStyle = C.gold;
    ctx.fillRect(ox + 5, oy + 2, 4, 10);
    ctx.fillRect(ox + 2, oy + 5, 10, 4);
    // Pontas diagonais
    ctx.fillRect(ox + 3, oy + 3, 3, 3);
    ctx.fillRect(ox + 8, oy + 3, 3, 3);
    ctx.fillRect(ox + 3, oy + 8, 3, 3);
    ctx.fillRect(ox + 8, oy + 8, 3, 3);

    // Núcleo brilhante
    ctx.fillStyle = '#FFFACD';
    ctx.globalAlpha = pulse;
    ctx.fillRect(ox + 6, oy + 4, 2, 6);
    ctx.fillRect(ox + 4, oy + 6, 6, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(ox + 7, oy + 6, 1, 2);
    ctx.fillRect(ox + 6, oy + 7, 2, 1);
    ctx.globalAlpha = 1;
  }
}

// ─── CHECKPOINT ──────────────────────────────────────────────
class Checkpoint {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 12; this.h = 24;
    this.activated = false;
    this.animTimer = 0;
  }

  update() { this.animTimer++; }

  activate() {
    if (!this.activated) {
      this.activated = true;
      sfxCheckpoint();
      spawnParticles(this.x + 6, this.y, C.cyan, 20, 3);
    }
  }

  draw() {
    const cx = Math.floor(this.x - camera.x);
    const cy = Math.floor(this.y - camera.y);

    // Poste
    ctx.fillStyle = '#556688';
    ctx.fillRect(cx + 5, cy, 2, this.h);

    // Bandeira
    const color = this.activated ? C.cyan : '#446688';
    const wave = this.activated ? Math.sin(this.animTimer * 0.15) * 2 : 0;
    ctx.fillStyle = color;
    ctx.fillRect(cx + 7, cy + wave, 8, 6);

    // Coração na bandeira
    if (this.activated) {
      ctx.fillStyle = C.heartRed;
      ctx.fillRect(cx + 9, cy + 1 + wave, 2, 2);
      ctx.fillRect(cx + 11, cy + 1 + wave, 2, 2);
      ctx.fillRect(cx + 8, cy + 2 + wave, 6, 2);
      ctx.fillRect(cx + 9, cy + 4 + wave, 4, 1);
    }

    // Brilho quando ativado
    if (this.activated) {
      ctx.globalAlpha = 0.3 + Math.sin(this.animTimer * 0.1) * 0.2;
      ctx.fillStyle = C.cyan;
      ctx.fillRect(cx - 4, cy - 4, this.w + 8, this.h + 8);
      ctx.globalAlpha = 1;
    }
  }
}

// ─── PORTAL (saída de fase) ──────────────────────────────────
class Portal {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 24; this.h = 36;
    this.animTimer = 0;
    this.active = false;
  }

  update() { this.animTimer++; }

  draw() {
    const px = Math.floor(this.x - camera.x);
    const py = Math.floor(this.y - camera.y);
    const pulse = Math.sin(this.animTimer * 0.08) * 0.3;

    // Moldura
    ctx.fillStyle = '#220044';
    ctx.fillRect(px, py, this.w, this.h);

    // Interior pulsante
    const colors = [C.purple, C.cyan, C.magenta];
    const ci = Math.floor(this.animTimer / 10) % 3;
    ctx.fillStyle = colors[ci];
    ctx.globalAlpha = 0.6 + pulse;
    ctx.fillRect(px + 2, py + 2, this.w - 4, this.h - 4);
    ctx.globalAlpha = 1;

    // Borda neon
    ctx.strokeStyle = C.cyan;
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, this.w, this.h);

    // Texto
    ctx.globalAlpha = 0.8 + pulse;
    drawPixelText('SAIDA', px + this.w/2 - 12, py + this.h/2 - 3, 1, C.white);
    ctx.globalAlpha = 1;
  }
}

// ─── PLATAFORMA ──────────────────────────────────────────────
function drawPlatform(p) {
  const px = Math.floor(p.x - camera.x);
  const py = Math.floor(p.y - camera.y);

  if (p.type === 'ground') {
    // Chão principal
    ctx.fillStyle = '#1A0A3D';
    ctx.fillRect(px, py, p.w, p.h);
    // Borda superior neon
    ctx.fillStyle = C.cyan;
    ctx.fillRect(px, py, p.w, 2);
    // Padrão de circuito
    ctx.fillStyle = '#2D1B6E';
    for (let i = 0; i < p.w; i += 16) {
      ctx.fillRect(px + i, py + 4, 8, 2);
      ctx.fillRect(px + i + 4, py + 6, 2, 4);
    }
  } else if (p.type === 'platform') {
    // Plataforma flutuante
    ctx.fillStyle = '#2D1B6E';
    ctx.fillRect(px, py, p.w, p.h);
    ctx.fillStyle = C.cyan;
    ctx.fillRect(px, py, p.w, 2);
    ctx.fillStyle = '#4422AA';
    ctx.fillRect(px + 2, py + 2, p.w - 4, p.h - 4);
    // Brilho inferior
    ctx.fillStyle = C.purple;
    ctx.globalAlpha = 0.4;
    ctx.fillRect(px + 2, py + p.h - 2, p.w - 4, 2);
    ctx.globalAlpha = 1;
  } else if (p.type === 'wall') {
    ctx.fillStyle = '#150830';
    ctx.fillRect(px, py, p.w, p.h);
    ctx.fillStyle = '#3D1B8E';
    for (let j = 0; j < p.h; j += 8) {
      ctx.fillRect(px, py + j, p.w, 1);
    }
  }
}

// ─── FUNDO PARALLAX ─────────────────────────────────────────
function drawBackground(levelW) {
  // Céu profundo
  const grad = ctx.createLinearGradient(0, 0, 0, GAME_H);
  grad.addColorStop(0, '#050510');
  grad.addColorStop(0.5, '#0D0D2B');
  grad.addColorStop(1, '#1A0A3D');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, GAME_W, GAME_H);

  // Estrelas (parallax lento)
  const t = Date.now() * 0.001;
  for (const s of stars) {
    s.twinkle += s.speed;
    const alpha = 0.4 + Math.sin(s.twinkle) * 0.4;
    const sx = ((s.x - camera.x * 0.05) % GAME_W + GAME_W) % GAME_W;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = C.star;
    ctx.fillRect(sx, s.y, s.size, s.size);
  }
  ctx.globalAlpha = 1;

  // Nebulosa
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = C.purple;
  ctx.fillRect(GAME_W * 0.2 - camera.x * 0.02, 20, 120, 80);
  ctx.fillStyle = C.cyan;
  ctx.fillRect(GAME_W * 0.6 - camera.x * 0.03, 10, 90, 60);
  ctx.globalAlpha = 1;

  // Prédios ao fundo (parallax médio)
  const bx = -((camera.x * 0.15) % (GAME_W + 200));
  drawCityBuildings(bx, GAME_H - 80, 0.4);
  drawCityBuildings(bx + GAME_W + 200, GAME_H - 80, 0.4);

  // Prédios mais próximos (parallax mais rápido)
  const bx2 = -((camera.x * 0.3) % (GAME_W + 300));
  drawCityBuildings(bx2, GAME_H - 55, 0.7);
  drawCityBuildings(bx2 + GAME_W + 300, GAME_H - 55, 0.7);
}

function drawCityBuildings(startX, groundY, alpha) {
  ctx.globalAlpha = alpha * 0.6;
  const buildings = [
    { w: 30, h: 70 }, { w: 20, h: 50 }, { w: 40, h: 90 }, { w: 25, h: 60 },
    { w: 35, h: 80 }, { w: 15, h: 40 }, { w: 45, h: 100 }, { w: 20, h: 55 },
    { w: 30, h: 65 }, { w: 25, h: 75 }, { w: 40, h: 85 }, { w: 20, h: 45 },
  ];
  let bx = startX;
  for (const b of buildings) {
    ctx.fillStyle = '#0A0520';
    ctx.fillRect(bx, groundY - b.h, b.w, b.h);
    // Janelas neon
    ctx.fillStyle = alpha > 0.5 ? C.cyan : '#004466';
    for (let wy = groundY - b.h + 5; wy < groundY - 5; wy += 8) {
      for (let wx = bx + 3; wx < bx + b.w - 3; wx += 6) {
        if (Math.random() > 0.4) {
          ctx.fillRect(wx, wy, 3, 4);
        }
      }
    }
    bx += b.w + 3;
  }
  ctx.globalAlpha = 1;
}

// ─── DEFINIÇÃO DAS FASES ─────────────────────────────────────
const LEVELS = [
  // FASE 1: Cidade Neon
  {
    name: 'FASE 1: CIDADE NEON',
    width: 1600,
    height: 270,
    spawnX: 30,
    spawnY: 180,
    bgColor: '#0D0D2B',
    platforms: [
      // Chão principal
      { x: 0,    y: 230, w: 400,  h: 40, type: 'ground' },
      { x: 450,  y: 230, w: 300,  h: 40, type: 'ground' },
      { x: 800,  y: 230, w: 400,  h: 40, type: 'ground' },
      { x: 1250, y: 230, w: 350,  h: 40, type: 'ground' },
      // Plataformas flutuantes
      { x: 120,  y: 190, w: 80,   h: 12, type: 'platform' },
      { x: 240,  y: 160, w: 80,   h: 12, type: 'platform' },
      { x: 360,  y: 175, w: 60,   h: 12, type: 'platform' },
      { x: 480,  y: 155, w: 80,   h: 12, type: 'platform' },
      { x: 600,  y: 185, w: 70,   h: 12, type: 'platform' },
      { x: 700,  y: 160, w: 60,   h: 12, type: 'platform' },
      { x: 820,  y: 190, w: 90,   h: 12, type: 'platform' },
      { x: 950,  y: 165, w: 80,   h: 12, type: 'platform' },
      { x: 1080, y: 185, w: 70,   h: 12, type: 'platform' },
      { x: 1180, y: 155, w: 80,   h: 12, type: 'platform' },
      { x: 1320, y: 180, w: 90,   h: 12, type: 'platform' },
      { x: 1450, y: 160, w: 80,   h: 12, type: 'platform' },
      // Paredes
      { x: 400,  y: 180, w: 50,   h: 50, type: 'wall' },
      { x: 750,  y: 180, w: 50,   h: 50, type: 'wall' },
      { x: 1200, y: 180, w: 50,   h: 50, type: 'wall' },
    ],
    enemies: [
      { x: 200,  y: 200, type: 'drone',  pl: 150, pr: 280 },
      { x: 500,  y: 200, type: 'drone',  pl: 460, pr: 600 },
      { x: 650,  y: 200, type: 'drone',  pl: 600, pr: 740 },
      { x: 900,  y: 200, type: 'heavy',  pl: 820, pr: 1000 },
      { x: 1050, y: 200, type: 'drone',  pl: 1000, pr: 1150 },
      { x: 1350, y: 200, type: 'heavy',  pl: 1280, pr: 1450 },
    ],
    orions: [
      { x: 150, y: 175 }, { x: 265, y: 145 }, { x: 490, y: 140 },
      { x: 620, y: 170 }, { x: 710, y: 145 }, { x: 960, y: 150 },
      { x: 1090, y: 170 }, { x: 1195, y: 140 }, { x: 1460, y: 145 },
    ],
    npcs: [
      {
        x: 60, y: 202, type: 'botop',
        dialogues: [
          'Ola SuperTom! Eu sou Botop. Colete as estrelas Orion e chegue ao portal!',
          'Use os botoes na tela para mover e pular. Boa sorte!',
        ]
      },
      {
        x: 760, y: 202, type: 'vivi',
        dialogues: [
          'Tom! Cuidado com os drones. Eles patrulham a cidade.',
          'Siga em frente. Eu acredito em voce!',
        ]
      },
    ],
    checkpoints: [
      { x: 430, y: 206 },
      { x: 830, y: 206 },
      { x: 1260, y: 206 },
    ],
    portal: { x: 1540, y: 194 },
  },

  // FASE 2: Labirinto Elétrico
  {
    name: 'FASE 2: LABIRINTO ELETRICO',
    width: 1800,
    height: 270,
    spawnX: 30,
    spawnY: 180,
    bgColor: '#050520',
    platforms: [
      // Chão
      { x: 0,    y: 230, w: 300,  h: 40, type: 'ground' },
      { x: 350,  y: 230, w: 200,  h: 40, type: 'ground' },
      { x: 600,  y: 230, w: 250,  h: 40, type: 'ground' },
      { x: 900,  y: 230, w: 300,  h: 40, type: 'ground' },
      { x: 1250, y: 230, w: 250,  h: 40, type: 'ground' },
      { x: 1550, y: 230, w: 250,  h: 40, type: 'ground' },
      // Plataformas em escada
      { x: 80,   y: 200, w: 70,   h: 12, type: 'platform' },
      { x: 180,  y: 175, w: 70,   h: 12, type: 'platform' },
      { x: 280,  y: 150, w: 70,   h: 12, type: 'platform' },
      { x: 380,  y: 125, w: 70,   h: 12, type: 'platform' },
      { x: 480,  y: 150, w: 70,   h: 12, type: 'platform' },
      { x: 580,  y: 175, w: 70,   h: 12, type: 'platform' },
      // Seção do meio - mais difícil
      { x: 680,  y: 200, w: 50,   h: 12, type: 'platform' },
      { x: 760,  y: 175, w: 50,   h: 12, type: 'platform' },
      { x: 840,  y: 150, w: 50,   h: 12, type: 'platform' },
      { x: 920,  y: 175, w: 50,   h: 12, type: 'platform' },
      { x: 1000, y: 200, w: 50,   h: 12, type: 'platform' },
      { x: 1080, y: 175, w: 50,   h: 12, type: 'platform' },
      { x: 1160, y: 150, w: 50,   h: 12, type: 'platform' },
      // Final
      { x: 1300, y: 190, w: 80,   h: 12, type: 'platform' },
      { x: 1420, y: 165, w: 80,   h: 12, type: 'platform' },
      { x: 1560, y: 185, w: 80,   h: 12, type: 'platform' },
      { x: 1680, y: 160, w: 80,   h: 12, type: 'platform' },
      // Paredes
      { x: 300,  y: 150, w: 50,   h: 80, type: 'wall' },
      { x: 550,  y: 150, w: 50,   h: 80, type: 'wall' },
      { x: 850,  y: 150, w: 50,   h: 80, type: 'wall' },
      { x: 1200, y: 150, w: 50,   h: 80, type: 'wall' },
      { x: 1500, y: 150, w: 50,   h: 80, type: 'wall' },
    ],
    enemies: [
      { x: 150,  y: 200, type: 'drone', pl: 80,   pr: 280 },
      { x: 400,  y: 200, type: 'drone', pl: 350,  pr: 540 },
      { x: 650,  y: 200, type: 'heavy', pl: 600,  pr: 840 },
      { x: 780,  y: 200, type: 'drone', pl: 680,  pr: 840 },
      { x: 960,  y: 200, type: 'heavy', pl: 900,  pr: 1100 },
      { x: 1100, y: 200, type: 'drone', pl: 1000, pr: 1200 },
      { x: 1350, y: 200, type: 'heavy', pl: 1250, pr: 1490 },
      { x: 1600, y: 200, type: 'drone', pl: 1550, pr: 1780 },
    ],
    orions: [
      { x: 100, y: 185 }, { x: 200, y: 160 }, { x: 300, y: 135 },
      { x: 400, y: 110 }, { x: 500, y: 135 }, { x: 600, y: 160 },
      { x: 700, y: 185 }, { x: 800, y: 160 }, { x: 900, y: 160 },
      { x: 1000, y: 185 }, { x: 1100, y: 160 }, { x: 1200, y: 135 },
      { x: 1320, y: 175 }, { x: 1440, y: 150 }, { x: 1700, y: 145 },
    ],
    npcs: [
      {
        x: 60, y: 202, type: 'botop',
        dialogues: [
          'Fase 2! O labirinto eletrico e mais perigoso.',
          'Pule com precisao e evite os inimigos pesados!',
        ]
      },
      {
        x: 1260, y: 202, type: 'vivi',
        dialogues: [
          'Voce chegou longe, Tom! Estou orgulhosa.',
          'O portal esta perto. Nao desista!',
        ]
      },
    ],
    checkpoints: [
      { x: 380, y: 206 },
      { x: 900, y: 206 },
      { x: 1280, y: 206 },
    ],
    portal: { x: 1740, y: 194 },
  },

  // FASE 3: Coração Cósmico (fase final)
  {
    name: 'FASE 3: CORACAO COSMICO',
    width: 2000,
    height: 270,
    spawnX: 30,
    spawnY: 180,
    bgColor: '#020010',
    platforms: [
      // Chão fragmentado
      { x: 0,    y: 230, w: 200,  h: 40, type: 'ground' },
      { x: 250,  y: 230, w: 150,  h: 40, type: 'ground' },
      { x: 450,  y: 230, w: 200,  h: 40, type: 'ground' },
      { x: 700,  y: 230, w: 150,  h: 40, type: 'ground' },
      { x: 900,  y: 230, w: 200,  h: 40, type: 'ground' },
      { x: 1150, y: 230, w: 200,  h: 40, type: 'ground' },
      { x: 1400, y: 230, w: 200,  h: 40, type: 'ground' },
      { x: 1650, y: 230, w: 350,  h: 40, type: 'ground' },
      // Plataformas desafiadoras
      { x: 80,   y: 195, w: 60,   h: 12, type: 'platform' },
      { x: 170,  y: 165, w: 60,   h: 12, type: 'platform' },
      { x: 260,  y: 195, w: 60,   h: 12, type: 'platform' },
      { x: 350,  y: 165, w: 60,   h: 12, type: 'platform' },
      { x: 460,  y: 195, w: 60,   h: 12, type: 'platform' },
      { x: 560,  y: 165, w: 60,   h: 12, type: 'platform' },
      { x: 660,  y: 140, w: 60,   h: 12, type: 'platform' },
      { x: 760,  y: 165, w: 60,   h: 12, type: 'platform' },
      { x: 860,  y: 140, w: 60,   h: 12, type: 'platform' },
      { x: 960,  y: 165, w: 60,   h: 12, type: 'platform' },
      { x: 1060, y: 140, w: 60,   h: 12, type: 'platform' },
      { x: 1160, y: 165, w: 60,   h: 12, type: 'platform' },
      { x: 1260, y: 140, w: 60,   h: 12, type: 'platform' },
      { x: 1360, y: 165, w: 60,   h: 12, type: 'platform' },
      { x: 1460, y: 140, w: 60,   h: 12, type: 'platform' },
      { x: 1560, y: 165, w: 60,   h: 12, type: 'platform' },
      { x: 1680, y: 185, w: 80,   h: 12, type: 'platform' },
      { x: 1800, y: 165, w: 80,   h: 12, type: 'platform' },
      { x: 1900, y: 185, w: 80,   h: 12, type: 'platform' },
    ],
    enemies: [
      { x: 150,  y: 200, type: 'drone', pl: 80,   pr: 230 },
      { x: 300,  y: 200, type: 'heavy', pl: 250,  pr: 400 },
      { x: 500,  y: 200, type: 'drone', pl: 450,  pr: 640 },
      { x: 650,  y: 200, type: 'heavy', pl: 600,  pr: 840 },
      { x: 800,  y: 200, type: 'drone', pl: 700,  pr: 880 },
      { x: 950,  y: 200, type: 'heavy', pl: 900,  pr: 1100 },
      { x: 1100, y: 200, type: 'drone', pl: 1050, pr: 1200 },
      { x: 1250, y: 200, type: 'heavy', pl: 1150, pr: 1390 },
      { x: 1450, y: 200, type: 'drone', pl: 1400, pr: 1600 },
      { x: 1700, y: 200, type: 'heavy', pl: 1650, pr: 1850 },
      { x: 1850, y: 200, type: 'drone', pl: 1800, pr: 1980 },
    ],
    orions: [
      { x: 100, y: 180 }, { x: 185, y: 150 }, { x: 275, y: 180 },
      { x: 365, y: 150 }, { x: 475, y: 180 }, { x: 575, y: 150 },
      { x: 675, y: 125 }, { x: 775, y: 150 }, { x: 875, y: 125 },
      { x: 975, y: 150 }, { x: 1075, y: 125 }, { x: 1175, y: 150 },
      { x: 1275, y: 125 }, { x: 1375, y: 150 }, { x: 1475, y: 125 },
      { x: 1575, y: 150 }, { x: 1695, y: 170 }, { x: 1815, y: 150 },
      { x: 1915, y: 170 },
    ],
    npcs: [
      {
        x: 60, y: 202, type: 'botop',
        dialogues: [
          'Fase final! O coracao cosmico aguarda.',
          'Colete todos os Orions para completar a jornada!',
        ]
      },
      {
        x: 1000, y: 202, type: 'vivi',
        dialogues: [
          'Tom! Estamos quase la. Eu sempre soube que voce conseguiria.',
          'O portal final esta perto. Vai com tudo!',
        ]
      },
    ],
    checkpoints: [
      { x: 460, y: 206 },
      { x: 920, y: 206 },
      { x: 1420, y: 206 },
    ],
    portal: { x: 1950, y: 194 },
  },
];

// ─── GERENCIADOR DO JOGO ─────────────────────────────────────
const game = {
  state: 'title', // title, playing, paused, gameover, win, levelcomplete
  currentLevelIndex: 0,
  currentLevel: null,
  player: null,
  platforms: [],
  enemies: [],
  orions: [],
  npcs: [],
  checkpoints: [],
  portal: null,
  score: 0,
  totalOrions: 0,
  collectedOrions: 0,
  titleTimer: 0,
  levelCompleteTimer: 0,
  gameOverTimer: 0,
  winTimer: 0,
  checkpointX: 0,
  checkpointY: 0,
  lastCheckpoint: null,
  messageText: '',
  messageTimer: 0,

  loadLevel(index) {
    this.currentLevelIndex = index;
    const lvl = LEVELS[index];
    this.currentLevel = lvl;

    this.platforms = lvl.platforms.map(p => ({ ...p }));
    this.enemies = lvl.enemies.map(e => new Enemy(e.x, e.y, e.type, e.pl, e.pr));
    this.orions = lvl.orions.map(o => new Orion(o.x, o.y));
    this.npcs = lvl.npcs.map(n => new NPC(n.x, n.y, n.type, n.dialogues));
    this.checkpoints = lvl.checkpoints.map(c => new Checkpoint(c.x, c.y));
    this.portal = new Portal(lvl.portal.x, lvl.portal.y);

    this.totalOrions = this.orions.length;
    this.collectedOrions = 0;

    if (!this.player) {
      this.player = new Player(lvl.spawnX, lvl.spawnY);
    } else {
      this.player.x = lvl.spawnX;
      this.player.y = lvl.spawnY;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.hp = this.player.maxHp;
      this.player.state = 'idle';
      this.player.invincible = 0;
    }

    this.checkpointX = lvl.spawnX;
    this.checkpointY = lvl.spawnY;
    this.lastCheckpoint = null;

    camera.x = 0;
    camera.y = 0;
  },

  respawn() {
    if (!this.player) return;
    this.player.x = this.checkpointX;
    this.player.y = this.checkpointY;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.hp = this.player.maxHp;
    this.player.state = 'idle';
    this.player.invincible = 60;
    // Recriar inimigos mortos
    const lvl = LEVELS[this.currentLevelIndex];
    this.enemies = lvl.enemies.map(e => new Enemy(e.x, e.y, e.type, e.pl, e.pr));
  },

  showMessage(text, duration) {
    this.messageText = text;
    this.messageTimer = duration || 180;
  },

  update() {
    if (this.state === 'title') {
      this.titleTimer++;
      return;
    }
    if (this.state !== 'playing') return;

    const p = this.player;
    if (!p) return;

    // Atualizar partículas
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      if (particles[i].life <= 0) particles.splice(i, 1);
    }

    // Atualizar inimigos
    for (const e of this.enemies) {
      e.update(this.platforms);

      // Colisão jogador-inimigo
      if (e.alive && rectOverlap(p, e)) {
        // Pular em cima do inimigo
        if (p.vy > 0 && p.y + p.h < e.y + e.h * 0.5) {
          e.hit();
          p.vy = JUMP_FORCE * 0.7;
          this.score += 50;
        } else {
          p.takeDamage(1);
        }
      }
    }

    // Atualizar coletáveis
    for (const o of this.orions) {
      o.update();
      if (!o.collected && rectOverlap(p, o)) {
        o.collected = true;
        this.collectedOrions++;
        p.orions++;
        this.score += 100;
        sfxCollect();
        spawnParticles(o.x + 7, o.y + 7, C.gold, 12, 3);
        this.showMessage('+100 ORION!', 60);
      }
    }

    // Atualizar NPCs
    for (const npc of this.npcs) {
      npc.update(p);
      // Interação com NPC
      if (rectOverlap(p, { x: npc.x - 20, y: npc.y, w: npc.w + 40, h: npc.h })) {
        if (isInteract() && p.interactCooldown <= 0) {
          npc.interact(p);
          p.interactCooldown = 30;
        }
      }
    }

    // Atualizar checkpoints
    for (const cp of this.checkpoints) {
      cp.update();
      if (!cp.activated && rectOverlap(p, cp)) {
        cp.activate();
        this.checkpointX = cp.x;
        this.checkpointY = cp.y - p.h;
        this.lastCheckpoint = cp;
        this.showMessage('CHECKPOINT!', 120);
      }
    }

    // Atualizar portal
    this.portal.update();
    if (rectOverlap(p, this.portal)) {
      this.state = 'levelcomplete';
      this.levelCompleteTimer = 180;
      sfxLevelUp();
    }

    // Atualizar jogador
    p.update(this.platforms, this.enemies);

    // Câmera
    updateCamera(p, this.currentLevel.width, this.currentLevel.height);

    // Mensagem temporária
    if (this.messageTimer > 0) this.messageTimer--;
  },

  draw() {
    ctx.clearRect(0, 0, GAME_W, GAME_H);

    if (this.state === 'title') {
      this.drawTitle();
      return;
    }
    if (this.state === 'gameover') {
      this.drawGameOver();
      return;
    }
    if (this.state === 'win') {
      this.drawWin();
      return;
    }

    // Fundo
    drawBackground(this.currentLevel ? this.currentLevel.width : GAME_W);

    // Plataformas
    for (const p of this.platforms) {
      const px = p.x - camera.x;
      const py = p.y - camera.y;
      if (px > -TILE * 2 && px < GAME_W + TILE * 2) {
        drawPlatform(p);
      }
    }

    // Portal
    if (this.portal) this.portal.draw();

    // Checkpoints
    for (const cp of this.checkpoints) cp.draw();

    // Coletáveis
    for (const o of this.orions) {
      if (!o.collected) {
        const ox = o.x - camera.x;
        if (ox > -20 && ox < GAME_W + 20) o.draw();
      }
    }

    // NPCs
    for (const npc of this.npcs) {
      const nx = npc.x - camera.x;
      if (nx > -40 && nx < GAME_W + 40) npc.draw();
    }

    // Inimigos
    for (const e of this.enemies) {
      const ex = e.x - camera.x;
      if (ex > -40 && ex < GAME_W + 40) e.draw();
    }

    // Jogador
    if (this.player) this.player.draw();

    // Partículas
    for (const pt of particles) pt.draw();

    // HUD
    this.drawHUD();

    // Controles virtuais
    this.drawControls();

    // Tela de level complete
    if (this.state === 'levelcomplete') {
      this.drawLevelComplete();
    }

    // Mensagem temporária
    if (this.messageTimer > 0) {
      const alpha = Math.min(1, this.messageTimer / 20);
      ctx.globalAlpha = alpha;
      drawPixelText(this.messageText, GAME_W / 2, 40, 2, C.gold, 'center');
      ctx.globalAlpha = 1;
    }
  },

  drawHUD() {
    // Barra de vida
    const hudX = 8;
    const hudY = 8;

    // Fundo HUD
    ctx.fillStyle = C.uiBg;
    ctx.fillRect(hudX - 2, hudY - 2, 90, 20);
    ctx.strokeStyle = C.uiBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(hudX - 2, hudY - 2, 90, 20);

    // Ícone coração
    ctx.fillStyle = C.heartRed;
    ctx.fillRect(hudX, hudY + 4, 4, 4);
    ctx.fillRect(hudX + 4, hudY + 4, 4, 4);
    ctx.fillRect(hudX - 1, hudY + 5, 10, 4);
    ctx.fillRect(hudX, hudY + 9, 8, 2);
    ctx.fillRect(hudX + 1, hudY + 11, 6, 2);
    ctx.fillRect(hudX + 2, hudY + 13, 4, 2);
    ctx.fillRect(hudX + 3, hudY + 15, 2, 2);

    // Barras de vida
    for (let i = 0; i < this.player.maxHp; i++) {
      const bx = hudX + 14 + i * 14;
      ctx.fillStyle = '#222244';
      ctx.fillRect(bx, hudY + 4, 12, 8);
      if (i < this.player.hp) {
        ctx.fillStyle = i < 2 ? C.red : C.green;
        ctx.fillRect(bx + 1, hudY + 5, 10, 6);
      }
    }

    // Contador de Orions
    const orionX = 8;
    const orionY = 32;
    ctx.fillStyle = C.uiBg;
    ctx.fillRect(orionX - 2, orionY - 2, 70, 16);
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 1;
    ctx.strokeRect(orionX - 2, orionY - 2, 70, 16);

    ctx.fillStyle = C.gold;
    ctx.fillRect(orionX + 1, orionY + 3, 6, 6);
    ctx.fillRect(orionX, orionY + 4, 8, 4);

    drawPixelText(
      this.collectedOrions + '/' + this.totalOrions,
      orionX + 12, orionY + 2, 2, C.gold
    );

    // Score
    const scoreX = GAME_W - 8;
    const scoreY = 8;
    const scoreStr = 'SCORE:' + String(this.score).padStart(6, '0');
    ctx.fillStyle = C.uiBg;
    const sw = scoreStr.length * 7 + 8;
    ctx.fillRect(scoreX - sw, scoreY - 2, sw, 14);
    ctx.strokeStyle = C.cyan;
    ctx.lineWidth = 1;
    ctx.strokeRect(scoreX - sw, scoreY - 2, sw, 14);
    drawPixelText(scoreStr, scoreX - 4, scoreY + 1, 1, C.cyan, 'right');

    // Nome da fase
    const lvlName = this.currentLevel ? this.currentLevel.name : '';
    ctx.fillStyle = C.uiBg;
    const lw = lvlName.length * 6 + 8;
    ctx.fillRect(GAME_W/2 - lw/2, 4, lw, 12);
    drawPixelText(lvlName, GAME_W / 2, 6, 1, C.white, 'center');
  },

  drawControls() {
    const alpha = 0.7;
    ctx.globalAlpha = alpha;

    // Botão ESQUERDA
    this.drawBtn(BTN.left, '◄', touch.left);
    // Botão DIREITA
    this.drawBtn(BTN.right, '►', touch.right);
    // Botão PULO
    this.drawBtn(BTN.jump, 'A', touch.jump, C.cyan);
    // Botão INTERAÇÃO
    this.drawBtn(BTN.interact, 'E', touch.interact, C.gold);

    ctx.globalAlpha = 1;
  },

  drawBtn(btn, label, active, color) {
    const bx = btn.x;
    const by = btn.y;
    const bw = btn.w;
    const bh = btn.h;
    const r = 6;

    ctx.fillStyle = active ? C.btnActive : C.btnBg;
    ctx.beginPath();
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + bw - r, by);
    ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
    ctx.lineTo(bx + bw, by + bh - r);
    ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
    ctx.lineTo(bx + r, by + bh);
    ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
    ctx.lineTo(bx, by + r);
    ctx.quadraticCurveTo(bx, by, bx + r, by);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = active ? (color || C.cyan) : C.btnBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label
    const lc = active ? (color || C.cyan) : C.white;
    const fontSize = label.length === 1 ? 3 : 2;
    drawPixelText(label, bx + bw/2 - (label.length * (fontSize+1))/2, by + bh/2 - 7, fontSize, lc);
  },

  drawTitle() {
    const t = this.titleTimer;

    // ── FUNDO: gradiente cósmico profundo
    const grad = ctx.createLinearGradient(0, 0, 0, GAME_H);
    grad.addColorStop(0, '#010008');
    grad.addColorStop(0.35, '#060018');
    grad.addColorStop(0.7, '#0D0D2B');
    grad.addColorStop(1, '#1A0A3D');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    // Nebulosa de fundo
    ctx.globalAlpha = 0.08 + Math.sin(t * 0.02) * 0.03;
    ctx.fillStyle = C.purple;
    ctx.fillRect(30, 10, 160, 100);
    ctx.fillStyle = C.cyan;
    ctx.fillRect(280, 5, 120, 80);
    ctx.fillStyle = C.magenta;
    ctx.fillRect(150, 40, 100, 60);
    ctx.globalAlpha = 1;

    // Estrelas com twinkle
    for (const s of stars) {
      s.twinkle += s.speed;
      const alpha = 0.3 + Math.sin(s.twinkle) * 0.5;
      ctx.globalAlpha = Math.max(0, alpha);
      // Algumas estrelas são coloridas
      const colors = [C.star, C.cyan, C.gold, '#FFAAFF'];
      ctx.fillStyle = colors[Math.floor(s.x * 7 + s.y * 3) % 4];
      const sz = s.size * (1 + Math.sin(s.twinkle * 0.5) * 0.3);
      ctx.fillRect(s.x, s.y, sz, sz);
    }
    ctx.globalAlpha = 1;

    // Montanhas ao fundo (silhueta)
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#08041A';
    const mts = [[0,80,60],[50,60,80],[110,70,50],[160,55,90],[220,65,70],[290,50,80],[360,60,60],[410,70,50],[440,55,80]];
    for (const [mx, mh, mw] of mts) {
      ctx.fillRect(mx, GAME_H - 50 - mh, mw, mh + 50);
    }
    ctx.globalAlpha = 1;

    // Prédios da cidade (silhueta)
    drawCityBuildings(-((t * 0.1) % (GAME_W + 200)), GAME_H - 28, 0.55);
    drawCityBuildings(GAME_W - ((t * 0.1) % (GAME_W + 200)), GAME_H - 28, 0.55);

    // Chao
    ctx.globalAlpha = 0.5;
    const floorGrad = ctx.createLinearGradient(0, GAME_H - 22, 0, GAME_H);
    floorGrad.addColorStop(0, '#0A0530');
    floorGrad.addColorStop(1, '#050218');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, GAME_H - 22, GAME_W, 22);
    // Linha neon no chão
    ctx.globalAlpha = 0.6 + Math.sin(t * 0.05) * 0.2;
    ctx.fillStyle = C.cyan;
    ctx.fillRect(0, GAME_H - 22, GAME_W, 1);
    ctx.globalAlpha = 1;

    // Personagens na tela de título
    this.drawTitleCharacters();

    // ── TÍTULO SUPERTOM
    const titleY = 22 + Math.sin(t * 0.025) * 2;

    // Glow atrás do título
    ctx.globalAlpha = 0.15 + Math.sin(t * 0.04) * 0.08;
    ctx.fillStyle = C.orange;
    ctx.fillRect(GAME_W / 2 - 120, titleY - 4, 240, 38);
    ctx.globalAlpha = 1;

    // Sombra do título
    ctx.globalAlpha = 0.6;
    drawPixelText('SUPERTOM', GAME_W / 2 + 2, titleY + 2, 5, '#330000', 'center');
    ctx.globalAlpha = 1;

    // Título principal - laranja vibrante
    drawPixelText('SUPERTOM', GAME_W / 2, titleY, 5, C.orange, 'center');
    // Camada dourada brilhante
    ctx.globalAlpha = 0.5 + Math.sin(t * 0.06) * 0.2;
    drawPixelText('SUPERTOM', GAME_W / 2, titleY, 5, C.gold, 'center');
    ctx.globalAlpha = 1;

    // Subtítulo com brilho
    ctx.globalAlpha = 0.8 + Math.sin(t * 0.05) * 0.2;
    drawPixelText('A JORNADA DO CORACAO ELETRICO', GAME_W / 2, titleY + 36, 1, C.cyan, 'center');
    ctx.globalAlpha = 1;

    // Linhas decorativas
    const lineAlpha = 0.4 + Math.sin(t * 0.04) * 0.2;
    ctx.globalAlpha = lineAlpha;
    ctx.fillStyle = C.cyan;
    ctx.fillRect(GAME_W / 2 - 110, titleY + 44, 90, 1);
    ctx.fillRect(GAME_W / 2 + 20, titleY + 44, 90, 1);
    // Losango central
    ctx.fillRect(GAME_W / 2 - 4, titleY + 42, 8, 1);
    ctx.fillRect(GAME_W / 2 - 2, titleY + 43, 4, 1);
    ctx.fillRect(GAME_W / 2 - 4, titleY + 45, 8, 1);
    ctx.globalAlpha = 1;

    // ── PRESS START piscando
    const blink = Math.floor(t / 18) % 2 === 0;
    if (blink) {
      // Glow atrás
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = C.gold;
      ctx.fillRect(GAME_W / 2 - 90, GAME_H - 32, 180, 14);
      ctx.globalAlpha = 1;
      drawPixelText('TOQUE PARA INICIAR', GAME_W / 2, GAME_H - 30, 2, C.gold, 'center');
    }

    // Créditos
    drawPixelText('V1.0  2025', GAME_W / 2, GAME_H - 12, 1, '#334455', 'center');
  },

  drawTitleCharacters() {
    const t = this.titleTimer;

    // ── SuperTom (esquerda) ──────────────────────────────────
    const tx = GAME_W / 2 - 80;
    const ty = GAME_H - 110;
    const bob = Math.sin(t * 0.04) * 3;
    const B = bob; // alias

    // Sombra no chão
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#000000';
    ctx.fillRect(tx - 2, GAME_H - 22, 36, 6);
    ctx.globalAlpha = 1;

    // Jaleco branco (corpo)
    ctx.fillStyle = '#D8D8EE';
    ctx.fillRect(tx + 2, ty + 12 + B, 28, 38);
    // Lapelas do jaleco
    ctx.fillStyle = '#BBBBDD';
    ctx.fillRect(tx + 2, ty + 12 + B, 6, 16);
    ctx.fillRect(tx + 24, ty + 12 + B, 6, 16);
    // Camisa azul por baixo
    ctx.fillStyle = '#1155AA';
    ctx.fillRect(tx + 8, ty + 14 + B, 16, 14);
    // Coração elétrico pulsante
    const hpulse = 0.7 + Math.sin(t * 0.12) * 0.3;
    ctx.globalAlpha = hpulse;
    ctx.fillStyle = C.cyan;
    ctx.fillRect(tx + 13, ty + 16 + B, 6, 4);
    ctx.fillRect(tx + 12, ty + 15 + B, 2, 2);
    ctx.fillRect(tx + 18, ty + 15 + B, 2, 2);
    ctx.fillRect(tx + 13, ty + 20 + B, 4, 2);
    ctx.fillRect(tx + 14, ty + 22 + B, 2, 2);
    ctx.globalAlpha = 0.5 * hpulse;
    ctx.fillStyle = '#88FFFF';
    ctx.fillRect(tx + 10, ty + 13 + B, 12, 12);
    ctx.globalAlpha = 1;
    // Calça azul escura
    ctx.fillStyle = '#223366';
    ctx.fillRect(tx + 4, ty + 38 + B, 24, 20);
    // Divisão das pernas
    ctx.fillStyle = '#1A2855';
    ctx.fillRect(tx + 15, ty + 40 + B, 2, 18);
    // Sapatos
    ctx.fillStyle = '#442211';
    ctx.fillRect(tx + 3, ty + 56 + B, 12, 5);
    ctx.fillRect(tx + 17, ty + 56 + B, 12, 5);
    ctx.fillStyle = '#331100';
    ctx.fillRect(tx + 2, ty + 59 + B, 13, 2);
    ctx.fillRect(tx + 17, ty + 59 + B, 13, 2);
    // Cabeça
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(tx + 6, ty + B, 20, 13);
    // Cabelo castanho avermelhado
    ctx.fillStyle = '#7B3A1A';
    ctx.fillRect(tx + 6, ty + B, 20, 5);
    ctx.fillRect(tx + 6, ty + 5 + B, 3, 4);
    ctx.fillRect(tx + 23, ty + 5 + B, 3, 3);
    // Topete
    ctx.fillRect(tx + 12, ty - 3 + B, 8, 4);
    // Olhos azuis
    ctx.fillStyle = '#1155CC';
    ctx.fillRect(tx + 9, ty + 5 + B, 3, 3);
    ctx.fillRect(tx + 20, ty + 5 + B, 3, 3);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(tx + 10, ty + 5 + B, 1, 1);
    ctx.fillRect(tx + 21, ty + 5 + B, 1, 1);
    // Sobrancelhas
    ctx.fillStyle = '#5A2A0A';
    ctx.fillRect(tx + 9, ty + 4 + B, 4, 1);
    ctx.fillRect(tx + 19, ty + 4 + B, 4, 1);
    // Nariz
    ctx.fillStyle = '#CC9966';
    ctx.fillRect(tx + 15, ty + 8 + B, 2, 2);
    // Boca sorrindo
    ctx.fillStyle = '#CC5533';
    ctx.fillRect(tx + 10, ty + 11 + B, 12, 2);
    ctx.fillRect(tx + 9, ty + 10 + B, 2, 2);
    ctx.fillRect(tx + 21, ty + 10 + B, 2, 2);
    // Braços
    ctx.fillStyle = '#D8D8EE';
    const armSwing = Math.sin(t * 0.04) * 4;
    ctx.fillRect(tx - 4, ty + 14 + B, 7, 16 + armSwing);
    ctx.fillRect(tx + 29, ty + 14 + B, 7, 16 - armSwing);
    // Mãos
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(tx - 4, ty + 28 + B + armSwing, 6, 5);
    ctx.fillRect(tx + 30, ty + 28 + B - armSwing, 6, 5);
    // Brilho cósmico ao redor do Tom
    ctx.globalAlpha = 0.15 + Math.sin(t * 0.07) * 0.08;
    ctx.fillStyle = C.cyan;
    ctx.fillRect(tx - 8, ty - 5 + B, 48, 70);
    ctx.globalAlpha = 1;

    // ── Vivi (direita) ───────────────────────────────────────
    const vx = GAME_W / 2 + 44;
    const vy = GAME_H - 110;
    const vbob = Math.sin(t * 0.04 + 1.2) * 3;
    const VB = vbob;

    // Sombra
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#000000';
    ctx.fillRect(vx - 2, GAME_H - 22, 34, 6);
    ctx.globalAlpha = 1;

    // Bodysuit azul escuro com detalhes
    ctx.fillStyle = '#0D1A33';
    ctx.fillRect(vx + 2, vy + 12 + VB, 26, 36);
    // Detalhes do bodysuit - linhas cyan
    ctx.fillStyle = '#0088AA';
    ctx.fillRect(vx + 4, vy + 14 + VB, 2, 20);
    ctx.fillRect(vx + 22, vy + 14 + VB, 2, 20);
    ctx.fillRect(vx + 6, vy + 26 + VB, 18, 2);
    // Detalhe no peito
    ctx.fillStyle = C.cyan;
    ctx.globalAlpha = 0.7 + Math.sin(t * 0.09) * 0.3;
    ctx.fillRect(vx + 11, vy + 16 + VB, 8, 6);
    ctx.globalAlpha = 1;
    // Pernas
    ctx.fillStyle = '#0A1428';
    ctx.fillRect(vx + 4, vy + 44 + VB, 9, 16);
    ctx.fillRect(vx + 17, vy + 44 + VB, 9, 16);
    // Botas
    ctx.fillStyle = '#001133';
    ctx.fillRect(vx + 3, vy + 56 + VB, 11, 5);
    ctx.fillRect(vx + 16, vy + 56 + VB, 11, 5);
    ctx.fillStyle = '#0033AA';
    ctx.fillRect(vx + 3, vy + 59 + VB, 11, 2);
    ctx.fillRect(vx + 16, vy + 59 + VB, 11, 2);
    // Cabeça
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(vx + 4, vy + VB, 22, 13);
    // Cabelo roxo escuro longo
    ctx.fillStyle = '#220044';
    ctx.fillRect(vx + 4, vy + VB, 22, 4);
    ctx.fillRect(vx + 4, vy + 4 + VB, 3, 8);
    ctx.fillRect(vx + 23, vy + 4 + VB, 3, 8);
    // Mechas caindo
    ctx.fillStyle = '#330066';
    ctx.fillRect(vx + 2, vy + 6 + VB, 4, 20);
    ctx.fillRect(vx + 24, vy + 6 + VB, 4, 20);
    // Olhos roxos
    ctx.fillStyle = '#AA44FF';
    ctx.fillRect(vx + 8, vy + 5 + VB, 4, 3);
    ctx.fillRect(vx + 18, vy + 5 + VB, 4, 3);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(vx + 9, vy + 5 + VB, 1, 1);
    ctx.fillRect(vx + 19, vy + 5 + VB, 1, 1);
    // Sobrancelhas
    ctx.fillStyle = '#110022';
    ctx.fillRect(vx + 7, vy + 4 + VB, 5, 1);
    ctx.fillRect(vx + 17, vy + 4 + VB, 5, 1);
    // Nariz
    ctx.fillStyle = '#CC9966';
    ctx.fillRect(vx + 14, vy + 8 + VB, 2, 2);
    // Sorriso suave
    ctx.fillStyle = '#CC5533';
    ctx.fillRect(vx + 10, vy + 11 + VB, 10, 1);
    ctx.fillRect(vx + 9, vy + 10 + VB, 2, 2);
    ctx.fillRect(vx + 19, vy + 10 + VB, 2, 2);
    // Braços
    ctx.fillStyle = '#0D1A33';
    const varmSwing = Math.sin(t * 0.04 + 1.2) * 3;
    ctx.fillRect(vx - 3, vy + 14 + VB, 6, 14 + varmSwing);
    ctx.fillRect(vx + 27, vy + 14 + VB, 6, 14 - varmSwing);
    // Mãos
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(vx - 3, vy + 26 + VB + varmSwing, 5, 5);
    ctx.fillRect(vx + 28, vy + 26 + VB - varmSwing, 5, 5);
    // Aura mágica da Vivi
    ctx.globalAlpha = 0.12 + Math.sin(t * 0.06 + 2) * 0.06;
    ctx.fillStyle = C.purple;
    ctx.fillRect(vx - 6, vy - 4 + VB, 44, 68);
    ctx.globalAlpha = 1;

    // ── Orion flutuando entre eles ───────────────────────────
    const ox = GAME_W / 2 - 9;
    const oy = GAME_H - 95 + Math.sin(t * 0.07) * 6;
    const opulse = 0.6 + Math.sin(t * 0.15) * 0.4;

    // Halo externo
    ctx.globalAlpha = opulse * 0.25;
    ctx.fillStyle = C.gold;
    ctx.fillRect(ox - 6, oy - 6, 30, 30);
    ctx.globalAlpha = 1;

    // Anel cósmico girando
    ctx.globalAlpha = opulse * 0.7;
    ctx.fillStyle = C.cyan;
    ctx.fillRect(ox - 3, oy + 7, 24, 3);
    ctx.fillRect(ox + 7, oy - 3, 3, 24);
    ctx.globalAlpha = 1;

    // Estrela dourada 4 pontas
    ctx.fillStyle = C.gold;
    ctx.fillRect(ox + 5, oy, 8, 18);
    ctx.fillRect(ox, oy + 5, 18, 8);
    ctx.fillRect(ox + 3, oy + 3, 3, 3);
    ctx.fillRect(ox + 12, oy + 3, 3, 3);
    ctx.fillRect(ox + 3, oy + 12, 3, 3);
    ctx.fillRect(ox + 12, oy + 12, 3, 3);
    // Brilho central
    ctx.fillStyle = '#FFFACD';
    ctx.globalAlpha = opulse;
    ctx.fillRect(ox + 8, oy + 6, 2, 6);
    ctx.fillRect(ox + 6, oy + 8, 6, 2);
    ctx.globalAlpha = 1;

    // Partículas de energia ao redor do Orion
    const pa = [[-8,-4],[10,-8],[-10,8],[12,6],[-6,14],[10,14]];
    for (let i = 0; i < pa.length; i++) {
      const px2 = ox + 9 + pa[i][0] + Math.sin(t * 0.08 + i) * 3;
      const py2 = oy + 9 + pa[i][1] + Math.cos(t * 0.08 + i) * 3;
      ctx.globalAlpha = 0.4 + Math.sin(t * 0.1 + i) * 0.3;
      ctx.fillStyle = i % 2 === 0 ? C.gold : C.cyan;
      ctx.fillRect(px2, py2, 2, 2);
    }
    ctx.globalAlpha = 1;

    // Linha de conexão entre Tom e Vivi (energia)
    const lineAlpha = 0.15 + Math.sin(t * 0.05) * 0.1;
    ctx.globalAlpha = lineAlpha;
    ctx.fillStyle = C.cyan;
    for (let lx = tx + 32; lx < vx - 2; lx += 6) {
      ctx.fillRect(lx, GAME_H - 60 + Math.sin(lx * 0.1 + t * 0.05) * 3, 3, 1);
    }
    ctx.globalAlpha = 1;
  },

  drawLevelComplete() {
    const alpha = Math.min(1, (180 - this.levelCompleteTimer) / 30);
    ctx.globalAlpha = alpha * 0.85;
    ctx.fillStyle = C.dialogBg;
    ctx.fillRect(GAME_W / 2 - 100, GAME_H / 2 - 40, 200, 80);
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 2;
    ctx.strokeRect(GAME_W / 2 - 100, GAME_H / 2 - 40, 200, 80);
    ctx.globalAlpha = alpha;

    drawPixelText('FASE COMPLETA!', GAME_W / 2, GAME_H / 2 - 28, 2, C.gold, 'center');
    drawPixelText('ORIONS: ' + this.collectedOrions + '/' + this.totalOrions,
      GAME_W / 2, GAME_H / 2 - 10, 2, C.cyan, 'center');
    drawPixelText('SCORE: ' + this.score,
      GAME_W / 2, GAME_H / 2 + 8, 2, C.white, 'center');

    if (this.levelCompleteTimer < 60) {
      const blink = Math.floor(this.levelCompleteTimer / 10) % 2 === 0;
      if (blink) drawPixelText('TOQUE PARA CONTINUAR', GAME_W / 2, GAME_H / 2 + 26, 1, C.gold, 'center');
    }

    ctx.globalAlpha = 1;

    this.levelCompleteTimer--;
    if (this.levelCompleteTimer <= 0) {
      // Avançar para próxima fase
      if (this.currentLevelIndex < LEVELS.length - 1) {
        this.loadLevel(this.currentLevelIndex + 1);
        this.state = 'playing';
      } else {
        this.state = 'win';
        this.winTimer = 600;
      }
    }
  },

  drawGameOver() {
    const grad = ctx.createLinearGradient(0, 0, 0, GAME_H);
    grad.addColorStop(0, '#1A0000');
    grad.addColorStop(1, '#0D0D2B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    for (const s of stars) {
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = C.star;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }
    ctx.globalAlpha = 1;

    drawPixelText('GAME OVER', GAME_W / 2, GAME_H / 2 - 30, 4, C.red, 'center');
    drawPixelText('SCORE: ' + this.score, GAME_W / 2, GAME_H / 2 + 10, 2, C.white, 'center');

    const blink = Math.floor(Date.now() / 500) % 2 === 0;
    if (blink) drawPixelText('TOQUE PARA TENTAR NOVAMENTE', GAME_W / 2, GAME_H / 2 + 30, 1, C.gold, 'center');
  },

  drawWin() {
    const t = this.winTimer;
    const grad = ctx.createLinearGradient(0, 0, 0, GAME_H);
    grad.addColorStop(0, '#020010');
    grad.addColorStop(0.5, '#0D0D2B');
    grad.addColorStop(1, '#1A0A3D');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    for (const s of stars) {
      s.twinkle += s.speed * 2;
      const alpha = 0.5 + Math.sin(s.twinkle) * 0.5;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = C.star;
      ctx.fillRect(s.x, s.y, s.size * 1.5, s.size * 1.5);
    }
    ctx.globalAlpha = 1;

    // Partículas de vitória
    if (Math.random() > 0.7) {
      spawnParticles(rnd(0, GAME_W), rnd(0, GAME_H * 0.5),
        [C.gold, C.cyan, C.magenta][rndInt(0, 2)], 3, 2);
    }
    for (const pt of particles) { pt.update(); pt.draw(); }

    drawPixelText('PARABENS!', GAME_W / 2, 35, 4, C.gold, 'center');
    drawPixelText('VOCE COMPLETOU A JORNADA!', GAME_W / 2, 72, 1, C.cyan, 'center');
    drawPixelText('DO CORACAO ELETRICO', GAME_W / 2, 82, 1, C.cyan, 'center');

    // Coração pulsante
    const pulse = 0.8 + Math.sin(t * 0.1) * 0.2;
    ctx.globalAlpha = pulse;
    const hx = GAME_W / 2 - 12;
    const hy = GAME_H / 2 - 15;
    ctx.fillStyle = C.heartRed;
    ctx.fillRect(hx + 4, hy, 8, 8);
    ctx.fillRect(hx + 12, hy, 8, 8);
    ctx.fillRect(hx, hy + 4, 24, 12);
    ctx.fillRect(hx + 2, hy + 16, 20, 4);
    ctx.fillRect(hx + 4, hy + 20, 16, 4);
    ctx.fillRect(hx + 6, hy + 24, 12, 4);
    ctx.fillRect(hx + 8, hy + 28, 8, 4);
    ctx.fillRect(hx + 10, hy + 32, 4, 4);
    ctx.globalAlpha = 1;

    drawPixelText('SCORE FINAL: ' + this.score, GAME_W / 2, GAME_H - 50, 2, C.white, 'center');
    drawPixelText('ORIONS: ' + this.player.orions, GAME_W / 2, GAME_H - 35, 2, C.gold, 'center');

    const blink = Math.floor(Date.now() / 600) % 2 === 0;
    if (blink) drawPixelText('TOQUE PARA JOGAR NOVAMENTE', GAME_W / 2, GAME_H - 15, 1, C.cyan, 'center');

    if (this.winTimer > 0) this.winTimer--;
  },

  handleTap() {
    initAudio();
    sfxMenu();
    if (this.state === 'title') {
      this.loadLevel(0);
      this.state = 'playing';
    } else if (this.state === 'gameover') {
      this.loadLevel(this.currentLevelIndex);
      this.score = 0;
      this.state = 'playing';
    } else if (this.state === 'win') {
      this.loadLevel(0);
      this.score = 0;
      this.state = 'playing';
    } else if (this.state === 'levelcomplete' && this.levelCompleteTimer < 60) {
      this.levelCompleteTimer = 0;
    }
  },
};

// ─── EVENTOS DE TOQUE/CLIQUE PARA NAVEGAÇÃO ─────────────────
canvas.addEventListener('touchstart', e => {
  if (game.state !== 'playing') {
    game.handleTap();
  }
}, { passive: false });

canvas.addEventListener('click', e => {
  if (game.state !== 'playing') {
    game.handleTap();
  }
});

window.addEventListener('keydown', e => {
  if (e.code === 'Enter' || e.code === 'Space') {
    if (game.state !== 'playing') {
      game.handleTap();
    }
  }
});

// ─── LOOP PRINCIPAL ──────────────────────────────────────────
let lastTime = 0;
let accumulator = 0;
const FIXED_STEP = 1000 / 60;

function gameLoop(timestamp) {
  const delta = Math.min(timestamp - lastTime, 50);
  lastTime = timestamp;
  accumulator += delta;

  while (accumulator >= FIXED_STEP) {
    game.update();
    accumulator -= FIXED_STEP;
  }

  game.draw();
  requestAnimationFrame(gameLoop);
}

// ─── INICIALIZAÇÃO ───────────────────────────────────────────
game.state = 'title';
requestAnimationFrame(gameLoop);
