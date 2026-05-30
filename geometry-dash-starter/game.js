// ============================================
// GEOMETRY DASH - Versión con gráficos mejorados
// ============================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const messageElement = document.getElementById("message");

// --- Variables del juego ---
let score = 0;
let gameOver = false;
let gameSpeed = 5;
let frameCount = 0;
let bgOffset = 0;
let gridOffset = 0;
let screenShake = 0;
let deathFlash = 0;

const player = {
    x: 120,
    y: 300,
    width: 42,
    height: 42,
    velocityY: 0,
    isJumping: false,
    rotation: 0
};

const gravity = 0.85;
const jumpForce = -15.5;
const groundY = 340;

let obstacles = [];
let particles = [];
let stars = [];

const obstacleWidth = 36;
const obstacleHeight = 52;

// Crear estrellas de fondo (una sola vez)
function initStars() {
    stars = [];
    for (let i = 0; i < 80; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * groundY * 0.85,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.3 + 0.1,
            brightness: Math.random()
        });
    }
}

initStars();

// --- Controles ---
function jump() {
    if (gameOver) {
        restartGame();
        return;
    }

    if (!player.isJumping) {
        player.velocityY = jumpForce;
        player.isJumping = true;
        spawnJumpParticles();
    }
}

document.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
        event.preventDefault();
        jump();
    }
});

canvas.addEventListener("click", jump);

// --- Partículas ---
function spawnJumpParticles() {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: player.x + player.width / 2,
            y: player.y + player.height,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * -3 - 1,
            life: 1,
            color: "#00ffcc",
            size: Math.random() * 4 + 2
        });
    }
}

function spawnDeathParticles() {
    for (let i = 0; i < 25; i++) {
        particles.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1,
            color: Math.random() > 0.5 ? "#00ffcc" : "#ff4466",
            size: Math.random() * 5 + 2
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life -= 0.03;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

// --- Obstáculos ---
function createObstacle() {
    obstacles.push({
        x: canvas.width + 20,
        y: groundY - obstacleHeight,
        width: obstacleWidth,
        height: obstacleHeight
    });
}

// --- Dibujo del fondo ---
function drawSky() {
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, "#0d0221");
    sky.addColorStop(0.4, "#1a0a3e");
    sky.addColorStop(0.7, "#2d1b69");
    sky.addColorStop(1, "#1a1040");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, groundY);
}

function drawStars() {
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.x -= star.speed * (gameSpeed * 0.15);
        if (star.x < 0) {
            star.x = canvas.width;
        }

        const twinkle = 0.4 + Math.sin(frameCount * 0.05 + star.brightness * 10) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    }
}

function drawMountains() {
    const layers = [
        { color: "#12082a", speed: 0.2, height: 80, yOffset: 40 },
        { color: "#1a1040", speed: 0.4, height: 60, yOffset: 60 },
        { color: "#251550", speed: 0.7, height: 45, yOffset: 80 }
    ];

    for (let l = 0; l < layers.length; l++) {
        const layer = layers[l];
        const offset = (bgOffset * layer.speed) % canvas.width;

        ctx.fillStyle = layer.color;
        ctx.beginPath();
        ctx.moveTo(0, groundY);

        for (let x = -offset; x < canvas.width + 100; x += 80) {
            const peak = groundY - layer.height - layer.yOffset - Math.sin(x * 0.02) * 15;
            ctx.lineTo(x, peak);
            ctx.lineTo(x + 40, groundY - layer.yOffset);
        }

        ctx.lineTo(canvas.width, groundY);
        ctx.closePath();
        ctx.fill();
    }
}

function drawGround() {
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, canvas.height);
    groundGrad.addColorStop(0, "#0a1628");
    groundGrad.addColorStop(1, "#050a14");
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    // Línea brillante en el borde del suelo
    ctx.strokeStyle = "#00ffcc";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#00ffcc";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Cuadrícula que se mueve (estilo Geometry Dash)
    ctx.strokeStyle = "rgba(0, 255, 200, 0.08)";
    ctx.lineWidth = 1;

    const cellSize = 40;
    const offsetX = gridOffset % cellSize;

    for (let x = -offsetX; x < canvas.width; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = groundY; y < canvas.height; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawVignette() {
    const vignette = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.height * 0.3,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.7
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// --- Jugador estilo Geometry Dash ---
function drawPlayer() {
    if (gameOver && deathFlash > 0.5) {
        return;
    }

    const cx = player.x + player.width / 2;
    const cy = player.y + player.height / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(player.rotation);

    // Sombra bajo el cubo
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.ellipse(0, player.height / 2 + 4, player.width / 2, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Resplandor exterior
    ctx.shadowColor = "#00ffcc";
    ctx.shadowBlur = 20;

    // Cubo con gradiente
    const cubeGrad = ctx.createLinearGradient(-player.width / 2, -player.height / 2, player.width / 2, player.height / 2);
    cubeGrad.addColorStop(0, "#66ffee");
    cubeGrad.addColorStop(0.5, "#00ccaa");
    cubeGrad.addColorStop(1, "#008866");
    ctx.fillStyle = cubeGrad;
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);

    ctx.shadowBlur = 0;

    // Borde del cubo
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(-player.width / 2, -player.height / 2, player.width, player.height);

    // Brillo superior
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.fillRect(-player.width / 2 + 4, -player.height / 2 + 4, player.width - 8, 8);

    // Ojos (como Geometry Dash)
    const eyeY = -4;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-10, eyeY, 8, 10);
    ctx.fillRect(4, eyeY, 8, 10);

    ctx.fillStyle = "#0a0a18";
    ctx.fillRect(-8, eyeY + 2, 5, 6);
    ctx.fillRect(6, eyeY + 2, 5, 6);

    ctx.restore();

    // Estela de movimiento
    if (!gameOver) {
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = "#00ffcc";
        ctx.fillRect(player.x - 8, player.y + 4, 6, player.height - 8);
        ctx.globalAlpha = 1;
    }
}

// --- Obstáculos con estilo 3D ---
function drawObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        const x = obs.x;
        const y = obs.y;
        const w = obs.width;
        const h = obs.height;

        // Sombra
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.moveTo(x + 4, y + h);
        ctx.lineTo(x + w / 2 + 4, y + 4);
        ctx.lineTo(x + w + 4, y + h);
        ctx.closePath();
        ctx.fill();

        // Resplandor rojo
        ctx.shadowColor = "#ff2244";
        ctx.shadowBlur = 15;

        // Pincho principal
        const spikeGrad = ctx.createLinearGradient(x, y, x + w, y + h);
        spikeGrad.addColorStop(0, "#ff6688");
        spikeGrad.addColorStop(0.5, "#ff2244");
        spikeGrad.addColorStop(1, "#aa1133");
        ctx.fillStyle = spikeGrad;

        ctx.beginPath();
        ctx.moveTo(x, y + h);
        ctx.lineTo(x + w / 2, y);
        ctx.lineTo(x + w, y + h);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;

        // Borde brillante
        ctx.strokeStyle = "#ffaaaa";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Base del obstáculo
        ctx.fillStyle = "#331122";
        ctx.fillRect(x - 2, y + h - 4, w + 4, 8);
        ctx.strokeStyle = "#ff4466";
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 2, y + h - 4, w + 4, 8);
    }
}

function drawGameOverOverlay() {
    if (!gameOver) {
        return;
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "900 36px Orbitron, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ff4466";
    ctx.shadowColor = "#ff2244";
    ctx.shadowBlur = 20;
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 10);
    ctx.shadowBlur = 0;

    ctx.font = "400 14px Orbitron, sans-serif";
    ctx.fillStyle = "#8899aa";
    ctx.fillText("Presiona ESPACIO para reiniciar", canvas.width / 2, canvas.height / 2 + 25);
    ctx.textAlign = "left";
}

function drawScoreOnCanvas() {
    ctx.font = "700 18px Orbitron, sans-serif";
    ctx.fillStyle = "rgba(0, 255, 200, 0.9)";
    ctx.shadowColor = "#00ffcc";
    ctx.shadowBlur = 10;
    ctx.fillText(String(score).padStart(3, "0"), canvas.width - 70, 35);
    ctx.shadowBlur = 0;
}

// --- Lógica ---
function updatePlayer() {
    player.velocityY += gravity;
    player.y += player.velocityY;

    if (player.y + player.height >= groundY) {
        player.y = groundY - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }

    // Rotación: gira en el aire, vuelve recto en el suelo
    if (player.isJumping) {
        player.rotation += 0.12;
    } else {
        const snap = Math.round(player.rotation / (Math.PI / 2)) * (Math.PI / 2);
        player.rotation += (snap - player.rotation) * 0.2;
    }
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= gameSpeed;

        if (obstacles[i].x + obstacleWidth < 0) {
            obstacles.splice(i, 1);
            score += 1;
            scoreElement.textContent = "Puntos: " + score;

            if (score % 5 === 0) {
                gameSpeed += 0.3;
            }
        }
    }
}

function checkCollision() {
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        const hitX = player.x + 6 < obs.x + obs.width - 6 && player.x + player.width - 6 > obs.x + 6;
        const hitY = player.y + player.height > obs.y + 14;

        if (hitX && hitY) {
            gameOver = true;
            screenShake = 15;
            deathFlash = 1;
            spawnDeathParticles();
            messageElement.textContent = "¡Perdiste! Presiona ESPACIO para reiniciar";
        }
    }
}

function drawBackground() {
    drawSky();
    drawStars();
    drawMountains();
    drawGround();
}

function gameLoop() {
    ctx.save();

    if (screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * screenShake;
        const shakeY = (Math.random() - 0.5) * screenShake;
        ctx.translate(shakeX, shakeY);
        screenShake *= 0.85;
        if (screenShake < 0.5) {
            screenShake = 0;
        }
    }

    drawBackground();

    if (!gameOver) {
        updatePlayer();
        updateObstacles();
        bgOffset += gameSpeed;
        gridOffset += gameSpeed;

        frameCount += 1;
        if (frameCount % 85 === 0) {
            createObstacle();
        }

        checkCollision();
    }

    updateParticles();
    drawObstacles();
    drawParticles();
    drawPlayer();
    drawScoreOnCanvas();
    drawVignette();
    drawGameOverOverlay();

    if (deathFlash > 0) {
        ctx.fillStyle = `rgba(255, 50, 80, ${deathFlash * 0.3})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        deathFlash -= 0.03;
    }

    ctx.restore();

    requestAnimationFrame(gameLoop);
}

function restartGame() {
    score = 0;
    gameOver = false;
    gameSpeed = 5;
    frameCount = 0;
    bgOffset = 0;
    gridOffset = 0;
    screenShake = 0;
    deathFlash = 0;
    obstacles = [];
    particles = [];
    player.y = groundY - player.height;
    player.velocityY = 0;
    player.isJumping = false;
    player.rotation = 0;
    scoreElement.textContent = "Puntos: 0";
    messageElement.textContent = "";
}

gameLoop();
