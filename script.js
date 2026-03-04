// script.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth > 800 ? 800 : window.innerWidth;
canvas.height = window.innerHeight > 600 ? 600 : window.innerHeight;

const audio = document.getElementById('music');
const highScoreSpan = document.getElementById('highScore');
const menu = document.getElementById('menu');

// Colors - Purple scheme for Fairydust, customizable
let colors = {
    bg: '#320032',
    flash: '#960096',
    wave: '#c864c8',
    deco: '#643264',
    particle: '#ff96ff',
    fake: '#500050',
    glow: 'rgba(255, 150, 255, 0.5)'
};

// Wave class with authentic GD physics
class Wave {
    constructor(isDual = false) {
        this.posX = 100;
        this.posY = canvas.height / 2 + (isDual ? 150 : 0);
        this.size = 20;
        this.gravity = 1;
        this.velY = 0;
        this.acc = 1.2;
        this.maxVel = 18;
        this.isMini = false;
        this.particles = [];
        this.trail = [];
    }

    update(holding, autoMode = false, dt) {
        let direction = holding ? -1 : 1;
        if (autoMode) {
            const targetY = (currentTop + currentBottom) / 2 + (Math.sin(scrollX / 100) * 50);
            direction = (this.posY > targetY) ? -1 : 1;
        }
        this.velY += this.acc * direction * this.gravity * dt * 60;
        this.velY = Math.max(Math.min(this.velY, this.maxVel), -this.maxVel);
        this.posY += this.velY * dt * 60;

        this.trail.push({x: this.posX, y: this.posY});
        if (this.trail.length > 20) this.trail.shift();

        if (Math.random() < 0.1) {
            this.particles.push({x: this.posX, y: this.posY, life: Math.random() * 15 + 10, color: colors.particle, vx: Math.random() * 2 - 1, vy: Math.random() * 2 - 1});
        }
        this.particles = this.particles.filter(p => {
            p.x += p.vx * dt * 60;
            p.y += p.vy * dt * 60;
            p.life -= 1 * dt * 60;
            return p.life > 0;
        });
    }

    flipGravity() {
        this.gravity *= -1;
        this.velY *= -1;
        for (let i = 0; i < 15; i++) {
            this.particles.push({x: this.posX, y: this.posY, life: 20, color: '#ffffff', vx: Math.random() * 4 - 2, vy: Math.random() * 4 - 2});
        }
    }

    setMini(mini) {
        this.isMini = mini;
        this.size = mini ? 10 : 20;
        this.acc = mini ? 1.5 : 1.2;
        this.maxVel = mini ? 22 : 18;
    }

    checkCollision(bounds, noclip) {
        if (noclip) return false;
        const halfSize = this.size / 2 * 0.9;
        return this.posY - halfSize < bounds[0] || this.posY + halfSize > bounds[1];
    }

    draw() {
        ctx.beginPath();
        this.trail.forEach((point, i) => {
            if (i === 0) ctx.moveTo(Math.floor(point.x), Math.floor(point.y));
            else ctx.lineTo(Math.floor(point.x), Math.floor(point.y));
        });
        ctx.strokeStyle = colors.glow;
        ctx.lineWidth = this.size / 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(Math.floor(this.posX - this.size / 2), Math.floor(this.posY));
        ctx.lineTo(Math.floor(this.posX + this.size / 2), Math.floor(this.posY - this.size / 2 * this.gravity));
        ctx.lineTo(Math.floor(this.posX + this.size / 2), Math.floor(this.posY + this.size / 2 * this.gravity));
        ctx.closePath();
        ctx.fillStyle = colors.wave;
        ctx.fill();

        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        this.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.fillRect(Math.floor(p.x - p.life / 6), Math.floor(p.y - p.life / 6), p.life / 3, p.life / 3);
        });
    }
}

// Level data for different circles levels
const levels = {
    fairydust: {
        sections: [
            [0, 1400, 150, 450, false, false, false, false],
            [1400, 2100, 120, 480, true, false, false, false],
            [2100, 2800, 100, 500, false, false, true, false],
            [2800, 3500, 80, 520, false, true, false, false],
            [3500, 4200, 60, 540, true, false, false, false],
            [4200, 4900, 50, 550, false, false, true, false],
            [4900, 5600, 60, 540, true, false, false, false],
            [5600, 7000, 80, 520, false, false, true, false],
            [7000, 7700, 100, 500, false, false, false, true],
            [7700, 8400, 120, 480, true, false, false, false],
            [8400, 9100, 140, 460, false, false, true, false],
            [9100, 10150, 50, 550, false, false, false, false],
            [10150, 11200, 80, 520, true, false, true, false],
            [11200, 11900, 100, 500, false, true, false, false],
            [11900, 12600, 120, 480, true, false, false, false],
            [12600, 13300, 140, 460, false, false, true, false],
            [13300, 14000, 160, 440, true, true, false, false]
        ],
        fakes: [
            {x: 500, y: 200, w: 50, h: 50, type: 'block'},
            {x: 1500, y: 300, w: 40, h: 40, type: 'block'},
            {x: 3000, y: 250, w: 60, h: 60, type: 'block'},
            {x: 4500, y: 350, w: 50, h: 50, type: 'block'},
            {x: 6000, y: 100, w: 70, h: 70, type: 'block'},
            {x: 7500, y: 400, w: 50, h: 50, type: 'block'},
            {x: 9000, y: 200, w: 60, h: 60, type: 'block'},
            {x: 10500, y: 300, w: 50, h: 50, type: 'block'},
            {x: 1000, y: 450, w: 30, h: 30, type: 'spike'},
            {x: 2000, y: 150, w: 30, h: 30, type: 'spike'},
            {x: 3500, y: 400, w: 30, h: 30, type: 'spike'},
            {x: 5000, y: 200, w: 30, h: 30, type: 'spike'},
            {x: 6500, y: 350, w: 30, h: 30, type: 'spike'},
            {x: 8000, y: 250, w: 30, h: 30, type: 'spike'},
            {x: 9500, y: 450, w: 30, h: 30, type: 'spike'},
            {x: 1200, y: 100, w: 60, h: 40, type: 'trapezoid'},
            {x: 2200, y: 500, w: 50, h: 30, type: 'trapezoid'},
            {x: 3700, y: 200, w: 70, h: 50, type: 'trapezoid'},
            {x: 5200, y: 400, w: 60, h: 40, type: 'trapezoid'},
            {x: 6700, y: 150, w: 50, h: 30, type: 'trapezoid'},
            {x: 8200, y: 450, w: 70, h: 50, type: 'trapezoid'},
            {x: 9700, y: 250, w: 60, h: 40, type: 'trapezoid'},
            {x: 11200, y: 350, w: 50, h: 30, type: 'trapezoid'}
        ],
        decos: [
            {x: 300, y: 300, type: 'arrow'},
            {x: 1800, y: 300, type: 'arrow'},
            {x: 3300, y: 300, type: 'arrow'},
            {x: 4800, y: 300, type: 'arrow'},
            {x: 6300, y: 300, type: 'arrow'},
            {x: 7800, y: 300, type: 'arrow'},
            {x: 9300, y: 300, type: 'arrow'},
            {x: 10800, y: 300, type: 'arrow'},
            {x: 12300, y: 300, type: 'arrow'},
            {x: 800, y: 300, type: 'pulse', radius: 50},
            {x: 2300, y: 300, type: 'pulse', radius: 60},
            {x: 3800, y: 300, type: 'pulse', radius: 50},
            {x: 5300, y: 300, type: 'pulse', radius: 70},
            {x: 6800, y: 300, type: 'pulse', radius: 50},
            {x: 8300, y: 300, type: 'pulse', radius: 60},
            {x: 9800, y: 300, type: 'pulse', radius: 50},
            {x: 11300, y: 300, type: 'pulse', radius: 70}
        ],
        stars: Array.from({length: 50}, () => ({x: Math.random() * 14000, y: Math.random() * canvas.height, size: Math.random() * 2 + 1})),
        music: 'fairydust.mp3' // Assume same music or change if needed
    },
    jawbreaker: {
        sections: [
            [0, 1200, 140, 460, false, false, false, false],
            [1200, 1800, 110, 490, true, false, false, false],
            [1800, 2400, 90, 510, false, false, true, false],
            [2400, 3000, 70, 530, false, true, false, false],
            [3000, 3600, 50, 550, true, false, false, false],
            [3600, 4200, 40, 560, false, false, true, false],
            [4200, 4800, 50, 550, true, false, false, false],
            [4800, 6000, 70, 530, false, false, true, false],
            [6000, 6600, 90, 510, false, false, false, true],
            [6600, 7200, 110, 490, true, false, false, false],
            [7200, 7800, 130, 470, false, false, true, false],
            [7800, 9000, 40, 560, false, false, false, false],
            [9000, 9600, 70, 530, true, false, true, false],
            [9600, 10200, 90, 510, false, true, false, false],
            [10200, 10800, 110, 490, true, false, false, false],
            [10800, 11400, 130, 470, false, false, true, false],
            [11400, 14000, 150, 450, true, true, false, false]
        ],
        fakes: [
            {x: 400, y: 180, w: 60, h: 60, type: 'block'},
            {x: 1300, y: 320, w: 50, h: 50, type: 'block'},
            {x: 2500, y: 220, w: 70, h: 70, type: 'block'},
            {x: 3700, y: 380, w: 60, h: 60, type: 'block'},
            {x: 4900, y: 120, w: 80, h: 80, type: 'block'},
            {x: 6100, y: 420, w: 60, h: 60, type: 'block'},
            {x: 7300, y: 220, w: 70, h: 70, type: 'block'},
            {x: 8500, y: 320, w: 60, h: 60, type: 'block'},
            {x: 900, y: 480, w: 40, h: 40, type: 'spike'},
            {x: 1900, y: 180, w: 40, h: 40, type: 'spike'},
            {x: 3100, y: 420, w: 40, h: 40, type: 'spike'},
            {x: 4300, y: 220, w: 40, h: 40, type: 'spike'},
            {x: 5500, y: 380, w: 40, h: 40, type: 'spike'},
            {x: 6700, y: 280, w: 40, h: 40, type: 'spike'},
            {x: 7900, y: 480, w: 40, h: 40, type: 'spike'},
            {x: 1100, y: 120, w: 70, h: 50, type: 'trapezoid'},
            {x: 2100, y: 520, w: 60, h: 40, type: 'trapezoid'},
            {x: 3600, y: 220, w: 80, h: 60, type: 'trapezoid'},
            {x: 5100, y: 420, w: 70, h: 50, type: 'trapezoid'},
            {x: 6600, y: 170, w: 60, h: 40, type: 'trapezoid'},
            {x: 8100, y: 470, w: 80, h: 60, type: 'trapezoid'},
            {x: 9600, y: 270, w: 70, h: 50, type: 'trapezoid'},
            {x: 11100, y: 370, w: 60, h: 40, type: 'trapezoid'}
        ],
        decos: [
            {x: 200, y: 300, type: 'arrow'},
            {x: 1700, y: 300, type: 'arrow'},
            {x: 3200, y: 300, type: 'arrow'},
            {x: 4700, y: 300, type: 'arrow'},
            {x: 6200, y: 300, type: 'arrow'},
            {x: 7700, y: 300, type: 'arrow'},
            {x: 9200, y: 300, type: 'arrow'},
            {x: 10700, y: 300, type: 'arrow'},
            {x: 12200, y: 300, type: 'arrow'},
            {x: 700, y: 300, type: 'pulse', radius: 50},
            {x: 2200, y: 300, type: 'pulse', radius: 60},
            {x: 3700, y: 300, type: 'pulse', radius: 50},
            {x: 5200, y: 300, type: 'pulse', radius: 70},
            {x: 6700, y: 300, type: 'pulse', radius: 50},
            {x: 8200, y: 300, type: 'pulse', radius: 60},
            {x: 9700, y: 300, type: 'pulse', radius: 50},
            {x: 11200, y: 300, type: 'pulse', radius: 70}
        ],
        stars: Array.from({length: 50}, () => ({x: Math.random() * 14000, y: Math.random() * canvas.height, size: Math.random() * 2 + 1})),
        music: 'fairydust.mp3' // Placeholder, change if specific music
    },
    ninecircles: {
        sections: [
            [0, 1300, 160, 440, false, false, false, false],
            [1300, 1900, 130, 470, true, false, false, false],
            [1900, 2500, 110, 490, false, false, true, false],
            [2500, 3100, 90, 510, false, true, false, false],
            [3100, 3700, 70, 530, true, false, false, false],
            [3700, 4300, 60, 540, false, false, true, false],
            [4300, 4900, 70, 530, true, false, false, false],
            [4900, 6100, 90, 510, false, false, true, false],
            [6100, 6700, 110, 490, false, false, false, true],
            [6700, 7300, 130, 470, true, false, false, false],
            [7300, 7900, 150, 450, false, false, true, false],
            [7900, 9100, 60, 540, false, false, false, false],
            [9100, 9700, 90, 510, true, false, true, false],
            [9700, 10300, 110, 490, false, true, false, false],
            [10300, 10900, 130, 470, true, false, false, false],
            [10900, 11500, 150, 450, false, false, true, false],
            [11500, 14000, 170, 430, true, true, false, false]
        ],
        fakes: [
            {x: 300, y: 160, w: 70, h: 70, type: 'block'},
            {x: 1200, y: 340, w: 60, h: 60, type: 'block'},
            {x: 2400, y: 240, w: 80, h: 80, type: 'block'},
            {x: 3600, y: 400, w: 70, h: 70, type: 'block'},
            {x: 4800, y: 140, w: 90, h: 90, type: 'block'},
            {x: 6000, y: 440, w: 70, h: 70, type: 'block'},
            {x: 7200, y: 240, w: 80, h: 80, type: 'block'},
            {x: 8400, y: 340, w: 70, h: 70, type: 'block'},
            {x: 800, y: 500, w: 50, h: 50, type: 'spike'},
            {x: 1800, y: 200, w: 50, h: 50, type: 'spike'},
            {x: 3000, y: 440, w: 50, h: 50, type: 'spike'},
            {x: 4200, y: 240, w: 50, h: 50, type: 'spike'},
            {x: 5400, y: 400, w: 50, h: 50, type: 'spike'},
            {x: 6600, y: 300, w: 50, h: 50, type: 'spike'},
            {x: 7800, y: 500, w: 50, h: 50, type: 'spike'},
            {x: 1000, y: 140, w: 80, h: 60, type: 'trapezoid'},
            {x: 2000, y: 540, w: 70, h: 50, type: 'trapezoid'},
            {x: 3500, y: 240, w: 90, h: 70, type: 'trapezoid'},
            {x: 5000, y: 440, w: 80, h: 60, type: 'trapezoid'},
            {x: 6500, y: 190, w: 70, h: 50, type: 'trapezoid'},
            {x: 8000, y: 490, w: 90, h: 70, type: 'trapezoid'},
            {x: 9500, y: 290, w: 80, h: 60, type: 'trapezoid'},
            {x: 11000, y: 390, w: 70, h: 50, type: 'trapezoid'}
        ],
        decos: [
            {x: 100, y: 300, type: 'arrow'},
            {x: 1600, y: 300, type: 'arrow'},
            {x: 3100, y: 300, type: 'arrow'},
            {x: 4600, y: 300, type: 'arrow'},
            {x: 6100, y: 300, type: 'arrow'},
            {x: 7600, y: 300, type: 'arrow'},
            {x: 9100, y: 300, type: 'arrow'},
            {x: 10600, y: 300, type: 'arrow'},
            {x: 12100, y: 300, type: 'arrow'},
            {x: 600, y: 300, type: 'pulse', radius: 50},
            {x: 2100, y: 300, type: 'pulse', radius: 60},
            {x: 3600, y: 300, type: 'pulse', radius: 50},
            {x: 5100, y: 300, type: 'pulse', radius: 70},
            {x: 6600, y: 300, type: 'pulse', radius: 50},
            {x: 8100, y: 300, type: 'pulse', radius: 60},
            {x: 9600, y: 300, type: 'pulse', radius: 50},
            {x: 11100, y: 300, type: 'pulse', radius: 70}
        ],
        stars: Array.from({length: 50}, () => ({x: Math.random() * 14000, y: Math.random() * canvas.height, size: Math.random() * 2 + 1})),
        music: 'fairydust.mp3' // Placeholder
    },
    sonicwave: {
        sections: [
            [0, 1100, 130, 470, false, false, false, false],
            [1100, 1700, 100, 500, true, false, false, false],
            [1700, 2300, 80, 520, false, false, true, false],
            [2300, 2900, 60, 540, false, true, false, false],
            [2900, 3500, 40, 560, true, false, false, false],
            [3500, 4100, 30, 570, false, false, true, false],
            [4100, 4700, 40, 560, true, false, false, false],
            [4700, 5900, 60, 540, false, false, true, false],
            [5900, 6500, 80, 520, false, false, false, true],
            [6500, 7100, 100, 500, true, false, false, false],
            [7100, 7700, 120, 480, false, false, true, false],
            [7700, 8900, 30, 570, false, false, false, false],
            [8900, 9500, 60, 540, true, false, true, false],
            [9500, 10100, 80, 520, false, true, false, false],
            [10100, 10700, 100, 500, true, false, false, false],
            [10700, 11300, 120, 480, false, false, true, false],
            [11300, 14000, 140, 460, true, true, false, false]
        ],
        fakes: [
            {x: 200, y: 140, w: 80, h: 80, type: 'block'},
            {x: 1100, y: 360, w: 70, h: 70, type: 'block'},
            {x: 2300, y: 260, w: 90, h: 90, type: 'block'},
            {x: 3500, y: 420, w: 80, h: 80, type: 'block'},
            {x: 4700, y: 160, w: 100, h: 100, type: 'block'},
            {x: 5900, y: 460, w: 80, h: 80, type: 'block'},
            {x: 7100, y: 260, w: 90, h: 90, type: 'block'},
            {x: 8300, y: 360, w: 80, h: 80, type: 'block'},
            {x: 700, y: 520, w: 60, h: 60, type: 'spike'},
            {x: 1700, y: 220, w: 60, h: 60, type: 'spike'},
            {x: 2900, y: 460, w: 60, h: 60, type: 'spike'},
            {x: 4100, y: 260, w: 60, h: 60, type: 'spike'},
            {x: 5300, y: 420, w: 60, h: 60, type: 'spike'},
            {x: 6500, y: 320, w: 60, h: 60, type: 'spike'},
            {x: 7700, y: 520, w: 60, h: 60, type: 'spike'},
            {x: 900, y: 160, w: 90, h: 70, type: 'trapezoid'},
            {x: 1900, y: 560, w: 80, h: 60, type: 'trapezoid'},
            {x: 3400, y: 260, w: 100, h: 80, type: 'trapezoid'},
            {x: 4900, y: 460, w: 90, h: 70, type: 'trapezoid'},
            {x: 6400, y: 210, w: 80, h: 60, type: 'trapezoid'},
            {x: 7900, y: 510, w: 100, h: 80, type: 'trapezoid'},
            {x: 9400, y: 310, w: 90, h: 70, type: 'trapezoid'},
            {x: 10900, y: 410, w: 80, h: 60, type: 'trapezoid'}
        ],
        decos: [
            {x: 0, y: 300, type: 'arrow'},
            {x: 1500, y: 300, type: 'arrow'},
            {x: 3000, y: 300, type: 'arrow'},
            {x: 4500, y: 300, type: 'arrow'},
            {x: 6000, y: 300, type: 'arrow'},
            {x: 7500, y: 300, type: 'arrow'},
            {x: 9000, y: 300, type: 'arrow'},
            {x: 10500, y: 300, type: 'arrow'},
            {x: 12000, y: 300, type: 'arrow'},
            {x: 500, y: 300, type: 'pulse', radius: 50},
            {x: 2000, y: 300, type: 'pulse', radius: 60},
            {x: 3500, y: 300, type: 'pulse', radius: 50},
            {x: 5000, y: 300, type: 'pulse', radius: 70},
            {x: 6500, y: 300, type: 'pulse', radius: 50},
            {x: 8000, y: 300, type: 'pulse', radius: 60},
            {x: 9500, y: 300, type: 'pulse', radius: 50},
            {x: 11000, y: 300, type: 'pulse', radius: 70}
        ],
        stars: Array.from({length: 50}, () => ({x: Math.random() * 14000, y: Math.random() * canvas.height, size: Math.random() * 2 + 1})),
        music: 'fairydust.mp3' // Placeholder
    }
};

// Game vars
let currentLevel = 'fairydust';
let levelData = levels[currentLevel];
let player = new Wave();
let dualPlayer = null;
let scrollX = 0;
let baseSpeed = 12;
let currentSpeed = baseSpeed;
let flashTimer = 0;
let flashInterval = 20;
let checkpoint = 0;
let highScore = localStorage.getItem('fairydustHighScore') ? parseInt(localStorage.getItem('fairydustHighScore')) : 0;
highScoreSpan.textContent = Math.floor(highScore);
let crashed = false;
let crashParticles = [];
let keys = {};
let mouseDown = false;
let noclip = false;
let autoMode = false;
let godMode = false;
let pulseTimer = 0;
let currentSection = -1;
let paused = false;

// Functions
function loadLevel(levelName) {
    currentLevel = levelName;
    levelData = levels[currentLevel];
    // Reload music if different
    audio.src = levelData.music;
    audio.load();
    audio.play().catch(() => {});
    // Restart game
    scrollX = 0;
    player = new Wave();
    dualPlayer = null;
    crashed = false;
    currentSection = -1;
    menu.style.display = 'none';
    paused = false;
}

window.loadLevel = loadLevel; // For button onclick

function closeMenu() {
    menu.style.display = 'none';
    paused = false;
}

window.closeMenu = closeMenu;

// Events
window.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === 'Escape') {
        paused = !paused;
        menu.style.display = paused ? 'block' : 'none';
    }
    if (e.key === 'f' || e.key === 'F') canvas.requestFullscreen();
    if (e.key === 'n' || e.key === 'N') noclip = !noclip;
    if (e.key === 'a' || e.key === 'A') autoMode = !autoMode;
    if (e.key === 'g' || e.key === 'G') godMode = true;
    if (e.key === 'c' || e.key === 'C') {
        colors.wave = '#' + Math.floor(Math.random()*16777215).toString(16);
    }
});
window.addEventListener('keyup', e => keys[e.key] = false);
canvas.addEventListener('mousedown', () => mouseDown = true);
canvas.addEventListener('mouseup', () => mouseDown = false);
canvas.addEventListener('touchstart', () => mouseDown = true);
canvas.addEventListener('touchend', () => mouseDown = false);

// Music
audio.play().catch(() => {});

let currentTop = 50;
let currentBottom = canvas.height - 50;
let inSpam = false;

let lastTime = 0;

function update(dt) {
    if (paused) return;

    if (keys['p'] || keys['P']) {
        checkpoint = scrollX;
        keys['p'] = keys['P'] = false;
    }
    if (keys['r'] || keys['R']) {
        scrollX = checkpoint;
        player = new Wave();
        dualPlayer = null;
        crashed = false;
        currentSection = -1;
        keys['r'] = keys['R'] = false;
    }
    if (keys['1']) currentSpeed = 6;
    if (keys['2']) currentSpeed = 12;
    if (keys['3']) currentSpeed = 18;
    if (keys['4']) currentSpeed = 24;
    if (keys['m'] || keys['M']) {
        audio.muted = !audio.muted;
        keys['m'] = keys['M'] = false;
    }

    if (crashed) {
        crashParticles = crashParticles.filter(p => {
            p.x += p.vx * dt * 60;
            p.y += p.vy * dt * 60;
            p.life -= 1 * dt * 60;
            return p.life > 0;
        });
        if (crashParticles.length === 0 || keys[' '] || keys['ArrowUp'] || mouseDown) {
            scrollX = 0;
            player = new Wave();
            dualPlayer = null;
            crashed = false;
            currentSection = -1;
        }
    } else {
        const holding = keys[' '] || keys['ArrowUp'] || mouseDown;
        player.update(holding, autoMode, dt);
        if (dualPlayer) dualPlayer.update(holding, autoMode, dt);

        scrollX += currentSpeed * dt * 60;
        if (godMode) scrollX += 20 * dt * 60;

        let sectionFound = false;
        for (let i = 0; i < levelData.sections.length; i++) {
            const section = levelData.sections[i];
            if (section[0] <= scrollX && scrollX < section[1]) {
                currentTop = section[2];
                currentBottom = section[3];
                if (currentSection !== i) {
                    currentSection = i;
                    if (section[4]) {
                        player.flipGravity();
                        if (dualPlayer) dualPlayer.flipGravity();
                    }
                    player.setMini(section[5]);
                    if (dualPlayer) dualPlayer.setMini(section[5]);
                    if (section[7] && !dualPlayer) dualPlayer = new Wave(true);
                    else if (!section[7] && dualPlayer) dualPlayer = null;
                }
                inSpam = section[6];
                sectionFound = true;
                break;
            }
        }
        if (!sectionFound) {
            currentTop = 50;
            currentBottom = canvas.height - 50;
            inSpam = false;
            if (currentSection !== -1) currentSection = -1;
        }

        if (inSpam) {
            currentTop += Math.floor(Math.random() * 30) - 15;
            currentBottom += Math.floor(Math.random() * 30) - 15;
            currentTop = Math.max(0, currentTop);
            currentBottom = Math.min(canvas.height, currentBottom);
        }

        if (player.checkCollision([currentTop, currentBottom], noclip) || (dualPlayer && dualPlayer.checkCollision([currentTop, currentBottom], noclip))) {
            crashed = true;
            const crashY = dualPlayer && Math.random() < 0.5 ? dualPlayer.posY : player.posY;
            for (let i = 0; i < 50; i++) {
                crashParticles.push({x: player.posX, y: crashY, life: 30, color: colors.particle, vx: Math.random() * 6 - 3, vy: Math.random() * 6 - 3});
            }
        }

        highScore = Math.max(highScore, scrollX);
        highScoreSpan.textContent = Math.floor(highScore);
        localStorage.setItem('fairydustHighScore', Math.floor(highScore));
    }

    pulseTimer += 0.05 * dt * 60;
    flashTimer += dt * 60;
}

function draw() {
    ctx.fillStyle = (flashTimer % flashInterval < flashInterval / 2) ? colors.flash : colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    levelData.stars.forEach(star => {
        const adjX = Math.floor(star.x - scrollX * 0.5);
        if (adjX > 0 && adjX < canvas.width) {
            ctx.fillStyle = colors.deco;
            ctx.fillRect(adjX - star.size / 2, star.y - star.size / 2, star.size, star.size);
        }
    });

    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 8;
    levelData.fakes.forEach(fake => {
        const adjX = Math.floor(fake.x - scrollX);
        if (adjX > -fake.w && adjX < canvas.width) {
            ctx.fillStyle = colors.fake;
            if (fake.type === 'block') {
                ctx.fillRect(adjX, fake.y, fake.w, fake.h);
            } else if (fake.type === 'spike') {
                ctx.beginPath();
                ctx.moveTo(adjX, fake.y + fake.h);
                ctx.lineTo(adjX + fake.w / 2, fake.y);
                ctx.lineTo(adjX + fake.w, fake.y + fake.h);
                ctx.closePath();
                ctx.fill();
            } else if (fake.type === 'trapezoid') {
                ctx.beginPath();
                ctx.moveTo(adjX, fake.y + fake.h);
                ctx.lineTo(adjX + fake.w / 4, fake.y);
                ctx.lineTo(adjX + fake.w * 3 / 4, fake.y);
                ctx.lineTo(adjX + fake.w, fake.y + fake.h);
                ctx.closePath();
                ctx.fill();
            }
        }
    });
    ctx.shadowBlur = 0;

    levelData.decos.forEach(deco => {
        const adjX = Math.floor(deco.x - scrollX);
        if (adjX > -50 && adjX < canvas.width) {
            if (deco.type === 'arrow') {
                ctx.beginPath();
                ctx.moveTo(adjX, deco.y);
                ctx.lineTo(adjX + 30, deco.y - 15);
                ctx.lineTo(adjX + 30, deco.y + 15);
                ctx.closePath();
                ctx.fillStyle = colors.deco;
                ctx.fill();
            } else if (deco.type === 'pulse') {
                const pulseSize = deco.radius * (1 + Math.sin(pulseTimer) * 0.3);
                ctx.beginPath();
                ctx.arc(adjX, deco.y, pulseSize, 0, Math.PI * 2);
                ctx.strokeStyle = colors.glow;
                ctx.lineWidth = 5;
                ctx.stroke();
            }
        }
    });

    ctx.strokeStyle = colors.deco;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, currentTop);
    ctx.lineTo(canvas.width, currentTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, currentBottom);
    ctx.lineTo(canvas.width, currentBottom);
    ctx.stroke();
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = colors.deco;
    ctx.beginPath();
    ctx.moveTo(0, currentTop);
    ctx.lineTo(canvas.width, currentTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, currentBottom);
    ctx.lineTo(canvas.width, currentBottom);
    ctx.stroke();
    ctx.shadowBlur = 0;

    player.draw();
    if (dualPlayer) dualPlayer.draw();

    if (crashed) {
        crashParticles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.fillRect(Math.floor(p.x - p.life / 6), Math.floor(p.y - p.life / 6), p.life / 3, p.life / 3);
        });
    }

    if (scrollX > 14000 || godMode) {
        ctx.font = '40px Arial';
        ctx.fillStyle = '#ffff00';
        ctx.fillText('Complete! Exact GD ' + currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1) + ' Wave!', canvas.width / 2 - 250, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText(`Distance: ${Math.floor(scrollX)} | High: ${Math.floor(highScore)}`, canvas.width / 2 - 150, canvas.height / 2 + 50);
    }
}

function gameLoop(time) {
    if (!lastTime) lastTime = time;
    const dt = (time - lastTime) / 1000;
    lastTime = time;

    update(dt);
    if (!paused) draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth > 800 ? 800 : window.innerWidth;
    canvas.height = window.innerHeight > 600 ? 600 : window.innerHeight;
    player.posY = canvas.height / 2;
    if (dualPlayer) dualPlayer.posY = canvas.height / 2 + 150;
});
