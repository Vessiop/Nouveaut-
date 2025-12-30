// Récupération des éléments DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startOverlay = document.getElementById('startOverlay');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const score1Element = document.getElementById('score1');
const score2Element = document.getElementById('score2');

// Constantes du jeu
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const PADDLE_SPEED = 6;
const INITIAL_BALL_SPEED = 5;

// État du jeu
let gameState = 'start'; // 'start', 'playing', 'paused'
let animationId = null;

// Scores
let scores = {
    player1: 0,
    player2: 0
};

// Positions des joueurs
let player1Y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
let player2Y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;

// Position et vitesse de la balle
let ballX = CANVAS_WIDTH / 2;
let ballY = CANVAS_HEIGHT / 2;
let ballSpeedX = INITIAL_BALL_SPEED;
let ballSpeedY = INITIAL_BALL_SPEED * 0.7;

// État des touches
const keys = {};

// Gestion des événements clavier
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Démarrer avec espace
    if (e.key === ' ' && gameState === 'start') {
        startGame();
    }
    
    // Empêcher le scroll avec les flèches
    if (['ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Boutons
startBtn.addEventListener('click', () => {
    if (gameState === 'playing') {
        pauseGame();
    } else {
        startGame();
    }
});

resetBtn.addEventListener('click', resetGame);

// Fonction pour réinitialiser la balle
function resetBall(directionRight = true) {
    ballX = CANVAS_WIDTH / 2;
    ballY = CANVAS_HEIGHT / 2;
    ballSpeedX = (directionRight ? 1 : -1) * INITIAL_BALL_SPEED;
    ballSpeedY = (Math.random() - 0.5) * INITIAL_BALL_SPEED * 1.5;
}

// Fonction de dessin
function draw() {
    // Effacer le canvas
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Dessiner la grille de fond
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    // Lignes verticales
    for (let i = 0; i < CANVAS_WIDTH; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_HEIGHT);
        ctx.stroke();
    }
    
    // Lignes horizontales
    for (let i = 0; i < CANVAS_HEIGHT; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_WIDTH, i);
        ctx.stroke();
    }
    
    // Ligne centrale en pointillés
    ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Dessiner les raquettes
    drawPaddle(20, player1Y, '#00ffff');
    drawPaddle(CANVAS_WIDTH - 20 - PADDLE_WIDTH, player2Y, '#ff00ff');
    
    // Dessiner la balle
    drawBall();
}

// Fonction pour dessiner une raquette avec effet de lueur
function drawPaddle(x, y, color) {
    // Effet de lueur
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.shadowBlur = 0;
    
    // Reflet intérieur
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x + 2, y + 2, PADDLE_WIDTH - 4, PADDLE_HEIGHT - 4);
}

// Fonction pour dessiner la balle avec effet de lueur
function drawBall() {
    // Effet de lueur
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#ffff00';
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_SIZE, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Reflet intérieur
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(ballX - 2, ballY - 2, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
}

// Fonction de mise à jour de la logique du jeu
function update() {
    // Déplacer le joueur 1 (W/S)
    if (keys['w'] && player1Y > 0) {
        player1Y -= PADDLE_SPEED;
    }
    if (keys['s'] && player1Y < CANVAS_HEIGHT - PADDLE_HEIGHT) {
        player1Y += PADDLE_SPEED;
    }
    
    // Déplacer le joueur 2 (Flèches)
    if (keys['ArrowUp'] && player2Y > 0) {
        player2Y -= PADDLE_SPEED;
    }
    if (keys['ArrowDown'] && player2Y < CANVAS_HEIGHT - PADDLE_HEIGHT) {
        player2Y += PADDLE_SPEED;
    }
    
    // Déplacer la balle
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    
    // Collision avec le haut et le bas
    if (ballY - BALL_SIZE < 0 || ballY + BALL_SIZE > CANVAS_HEIGHT) {
        ballSpeedY = -ballSpeedY;
    }
    
    // Collision avec la raquette du joueur 1
    if (
        ballX - BALL_SIZE < 20 + PADDLE_WIDTH &&
        ballX + BALL_SIZE > 20 &&
        ballY > player1Y &&
        ballY < player1Y + PADDLE_HEIGHT
    ) {
        ballSpeedX = Math.abs(ballSpeedX) * 1.05; // Accélération
        const relativeIntersectY = (player1Y + PADDLE_HEIGHT / 2) - ballY;
        ballSpeedY = -relativeIntersectY * 0.15;
    }
    
    // Collision avec la raquette du joueur 2
    if (
        ballX + BALL_SIZE > CANVAS_WIDTH - 20 - PADDLE_WIDTH &&
        ballX - BALL_SIZE < CANVAS_WIDTH - 20 &&
        ballY > player2Y &&
        ballY < player2Y + PADDLE_HEIGHT
    ) {
        ballSpeedX = -Math.abs(ballSpeedX) * 1.05; // Accélération
        const relativeIntersectY = (player2Y + PADDLE_HEIGHT / 2) - ballY;
        ballSpeedY = -relativeIntersectY * 0.15;
    }
    
    // Balle sort à gauche - Point pour le joueur 2
    if (ballX < 0) {
        scores.player2++;
        updateScores();
        resetBall(true);
    }
    
    // Balle sort à droite - Point pour le joueur 1
    if (ballX > CANVAS_WIDTH) {
        scores.player1++;
        updateScores();
        resetBall(false);
    }
}

// Boucle de jeu principale
function gameLoop() {
    update();
    draw();
    
    if (gameState === 'playing') {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Démarrer le jeu
function startGame() {
    gameState = 'playing';
    startOverlay.classList.add('hidden');
    startBtn.textContent = 'PAUSE';
    gameLoop();
}

// Mettre en pause
function pauseGame() {
    gameState = 'paused';
    startOverlay.classList.remove('hidden');
    startBtn.textContent = 'START';
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
}

// Réinitialiser le jeu
function resetGame() {
    gameState = 'start';
    scores.player1 = 0;
    scores.player2 = 0;
    updateScores();
    player1Y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    player2Y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    resetBall(true);
    startOverlay.classList.remove('hidden');
    startBtn.textContent = 'START';
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    draw();
}

// Mettre à jour l'affichage des scores
function updateScores() {
    score1Element.textContent = scores.player1;
    score2Element.textContent = scores.player2;
}

// Dessiner l'état initial
draw();