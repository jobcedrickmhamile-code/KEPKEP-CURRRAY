const bombImage = new Image();
bombImage.src = "CURIEIMGS/bomb.jpg";
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const sliceSound = new Audio("SOUNDS/FART.mp3");
const bombSound = new Audio("SOUNDS/BOMBACLAT.mp3");

// UI
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const scoreText = document.getElementById("score");
const comboText = document.getElementById("combo");
const finalScore = document.getElementById("finalScore");

const playBtn = document.getElementById("playBtn");
const restartBtn = document.getElementById("restartBtn");

// GAME STATE
let running = false;
let score = 0;
let combo = 1;

let objects = [];
let particles = [];
let trail = [];

const friendImages = [
    "CURIEIMGS/VSGAB.jpg",
    "CURIEIMGS/VS.jpg",
    "CURIEIMGS/TULO.jpg",
    "CURIEIMGS/SILA.jpg",
    "CURIEIMGS/MAXENE.gif",
    "CURIEIMGS/LYRA.gif",
    "CURIEIMGS/HAHA.jpg",
    "CURIEIMGS/GAEA.gif",
    "CURIEIMGS/ELICA.gif",
    "CURIEIMGS/DUHAAA.gif",
    "CURIEIMGS/DUHAA.gif",
    "CURIEIMGS/DUHA.jpg",
    "CURIEIMGS/AKO.jpg"
];


// INPUT
let mouse = { x: 0, y: 0, down: false };

// =========================
// INPUT EVENTS (REAL SLICING)
// =========================

canvas.addEventListener("mousedown", () => mouse.down = true);
canvas.addEventListener("mouseup", () => {
    mouse.down = false;
    trail = [];
});

canvas.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();

    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;

    if (mouse.down) {
        trail.push({ x: mouse.x, y: mouse.y });
        if (trail.length > 12) trail.shift();
    }
});

// MOBILE SUPPORT
canvas.addEventListener("touchmove", (e) => {
    const r = canvas.getBoundingClientRect();
    const t = e.touches[0];

    mouse.x = t.clientX - r.left;
    mouse.y = t.clientY - r.top;

    trail.push({ x: mouse.x, y: mouse.y });
    if (trail.length > 12) trail.shift();
});

// =========================
// START GAME
// =========================

playBtn.onclick = startGame;
restartBtn.onclick = startGame;

function startGame() {
    score = 0;
    combo = 1;
    objects = [];
    particles = [];
    trail = [];

    running = true;

    startScreen.style.display = "none";
    gameOverScreen.style.display = "none";

    loop();
}

// =========================
// OBJECT
// =========================

class Fruit {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 50;

        this.width = 130;
        this.height = 130;
        this.size = 130;

        this.vx = (Math.random() - 0.5) * 6;
        this.vy = Math.random() * -12 - 8;

        this.gravity = 0.25;

        this.type = Math.random() < 0.85 ? "fruit" : "bomb";

        if (this.type === "fruit") {
            this.img = new Image();
            this.img.src = friendImages[Math.floor(Math.random() * friendImages.length)];
        } else {
            this.img = bombImage;
        }
    }

    update() {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        if (this.y > canvas.height + 100) {
            this.dead = true;
            combo = 1;
        }
    }

    draw() {

    if (this.img && this.img.complete) {

        ctx.drawImage(
            this.img,
            this.x,
            this.y,
            this.size,
            this.size
        );

        ctx.lineWidth = 4;

        if (this.type === "bomb") {
            ctx.strokeStyle = "red";
        } else {
            ctx.strokeStyle = "green";
        }

        ctx.strokeRect(
            this.x,
            this.y,
            this.size,
            this.size
        );
    }

}
}

// =========================
// PARTICLES
// =========================

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;

        this.alpha = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 0.03;
    }

    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, 4, 4);
        ctx.globalAlpha = 1;
    }
}

// =========================
// SLICING (REAL TRAIL HIT)
// =========================

function isSliced(obj) {
    for (let p of trail) {
        if (
            p.x > obj.x &&
            p.x < obj.x + obj.size &&
            p.y > obj.y &&
            p.y < obj.y + obj.size
        ) {
            return true;
        }
    }
    return false;
}

// =========================
// SPAWN
// =========================

function spawn() {
    if (Math.random() < 0.04) {
        objects.push(new Fruit());
    }
}

// =========================
// UPDATE
// =========================

function update() {

    spawn();

    for (let i = objects.length - 1; i >= 0; i--) {

        let o = objects[i];

        o.update();

        if (isSliced(o)) {

    o.dead = true;

    // Bomb hit
    if (o.type === "bomb") {

        new Audio(bombSound.src).play();

        endGame();
        return;
    }

    // Friend hit
    new Audio(sliceSound.src).play();

    score += 10 * combo;
    combo++;

    for (let j = 0; j < 10; j++) {
        particles.push(new Particle(o.x, o.y));
    }
}

        if (o.dead) {
            objects.splice(i, 1);
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        }
    }

    scoreText.innerText = "Score : " + score;
    comboText.innerText = "Combo x" + combo;
}

// =========================
// DRAW
// =========================

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // FRUITS
    for (let o of objects) {
        o.draw();
    }

    // PARTICLES
    for (let p of particles) {
        p.draw();
    }

    // BLADES
    if (trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);

        for (let i = 1; i < trail.length; i++) {
            ctx.lineTo(trail[i].x, trail[i].y);
        }

        ctx.strokeStyle = "cyan";
        ctx.lineWidth = 4;
        ctx.stroke();
    }
}

// =========================
// GAME LOOP
// =========================

function loop() {
    if (!running) return;

    update();
    draw();

    requestAnimationFrame(loop);
}

// =========================
// GAME OVER
// =========================

function endGame() {
    running = false;

    gameOverScreen.style.display = "flex";
    finalScore.innerText = "Score : " + score;
}