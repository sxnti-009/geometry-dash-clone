// ============================================
// MI PRIMER JUEGO TIPO GEOMETRY DASH
// ============================================

// --- PASO 1: Conectar con la pantalla del juego (canvas) ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Elementos de texto en la página
const scoreElement = document.getElementById("score");
const messageElement = document.getElementById("message");

// --- PASO 2: Variables del juego ---
let score = 0;
let gameOver = false;
let gameSpeed = 4;

// El jugador (cubo que salta)
const player = {
    x: 100,
    y: 300,
    width: 40,
    height: 40,
    color: "#00ff88",
    velocityY: 0,
    isJumping: false
};

// Física: gravedad tira hacia abajo, salto empuja hacia arriba
const gravity = 0.8;
const jumpForce = -15;
const groundY = 340;

// Obstáculos (triángulos como pinchos)
let obstacles = [];
const obstacleWidth = 30;
const obstacleHeight = 50;

// --- PASO 3: Controles (teclado y ratón) ---
function jump() {
    if (gameOver) {
        restartGame();
        return;
    }

    // Solo saltar si el cubo está en el suelo
    if (!player.isJumping) {
        player.velocityY = jumpForce;
        player.isJumping = true;
    }
}

document.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
        event.preventDefault();
        jump();
    }
});

canvas.addEventListener("click", jump);

// --- PASO 4: Crear obstáculos ---
function createObstacle() {
    obstacles.push({
        x: canvas.width,
        y: groundY - obstacleHeight,
        width: obstacleWidth,
        height: obstacleHeight,
        color: "#ff6b6b"
    });
}

// --- PASO 5: Dibujar cosas en pantalla ---
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawGround() {
    ctx.fillStyle = "#0f3460";
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
}

function drawObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];

        ctx.fillStyle = obs.color;
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y + obs.height);
        ctx.lineTo(obs.x + obs.width / 2, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.closePath();
        ctx.fill();
    }
}

function clearScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// --- PASO 6: Actualizar la lógica cada frame ---
function updatePlayer() {
    player.velocityY += gravity;
    player.y += player.velocityY;

    if (player.y + player.height >= groundY) {
        player.y = groundY - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= gameSpeed;

        if (obstacles[i].x + obstacleWidth < 0) {
            obstacles.splice(i, 1);
            score += 1;
            scoreElement.textContent = "Puntos: " + score;
        }
    }
}

function checkCollision() {
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];

        const hitX = player.x < obs.x + obs.width && player.x + player.width > obs.x;
        const hitY = player.y + player.height > obs.y + 10;

        if (hitX && hitY) {
            gameOver = true;
            messageElement.textContent = "¡Perdiste! Presiona ESPACIO para reiniciar";
        }
    }
}

// --- PASO 7: El bucle del juego (corazón del juego) ---
let frameCount = 0;

function gameLoop() {
    clearScreen();
    drawGround();

    if (!gameOver) {
        updatePlayer();
        updateObstacles();

        frameCount += 1;
        if (frameCount % 90 === 0) {
            createObstacle();
        }

        checkCollision();
    }

    drawPlayer();
    drawObstacles();

    requestAnimationFrame(gameLoop);
}

function restartGame() {
    score = 0;
    gameOver = false;
    frameCount = 0;
    obstacles = [];
    player.y = groundY - player.height;
    player.velocityY = 0;
    player.isJumping = false;
    scoreElement.textContent = "Puntos: 0";
    messageElement.textContent = "";
}

// --- PASO 8: Arrancar el juego ---
gameLoop();
