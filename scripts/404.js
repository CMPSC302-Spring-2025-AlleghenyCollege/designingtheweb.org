const dino = document.getElementById('dino');
const gameContainer = document.querySelector('.game-container');
const gameOverMessage = document.querySelector('.game-over-message');
const scoreElement = document.getElementById('scoreValue');
const instructionsOverlay = document.querySelector('.instructions-overlay');

// Game state variables
let isJumping = false;
let position = 0;
let isGameOver = false;
let score = 0;
let isGameActive = false;
let currentCactusInterval = null;

// Listen for the SPACE key to trigger a jump
function control(e) {
    if (e.code === 'Space' && !isJumping && isGameActive) {
        e.preventDefault(); // Prevent page scrolling
        jump();
    }
}

function jump() {
    if (isJumping) return;

    isJumping = true;
    let count = 0;
    const jumpHeight = 337.5;
    const jumpSpeed = 20;
    const jumpInterval = setInterval(() => {
        if (count === 15) {
            clearInterval(jumpInterval);
            const fallInterval = setInterval(() => {
                if (count === 0) {
                    clearInterval(fallInterval);
                    isJumping = false;
                }
                position -= 11.25;
                count--;
                if (position < 0) position = 0;
                dino.style.bottom = `${position}px`;
            }, jumpSpeed);
        }
        position += 11.25;
        count++;
        if (position > jumpHeight) position = jumpHeight;
        dino.style.bottom = `${position}px`;
    }, jumpSpeed);
}

function generateCactus() {
    if (isGameOver || !isGameActive) return;

    const cactus = document.createElement('div');
    cactus.classList.add('cactus');
    gameContainer.appendChild(cactus);

    let cactusPosition = 1200;
    const cactusSpeed = 20;
    const cactusInterval = setInterval(() => {
        if (cactusPosition > -45) {
            cactusPosition -= 11.25;
            cactus.style.left = `${cactusPosition}px`;

            // Collision detection: if cactus is near and dino is too low, end game
            if (cactusPosition > 75 && cactusPosition < 165 && position < 90) {
                clearInterval(cactusInterval);
                endGame();
            }
        } else {
            clearInterval(cactusInterval);
            if (gameContainer.contains(cactus)) {
                gameContainer.removeChild(cactus);
            }
            if (isGameActive) {
                score++;
                scoreElement.textContent = score;
            }
        }
    }, cactusSpeed);

    if (isGameActive) {
        currentCactusInterval = setTimeout(generateCactus, Math.random() * 4000 + 1000);
    }
}

function startGame() {
    isGameActive = true;
    isGameOver = false;
    score = 0;
    position = 0;
    scoreElement.textContent = '0';
    gameOverMessage.style.display = 'none';
    instructionsOverlay.style.display = 'none';
    dino.style.bottom = '0';

    // Remove any existing cactuses
    const cactuses = document.querySelectorAll('.cactus');
    cactuses.forEach(c => c.remove());

    generateCactus();
}

function endGame() {
    isGameActive = false;
    isGameOver = true;
    gameOverMessage.style.display = 'block';
    instructionsOverlay.style.display = 'block';

    // Remove all cactuses from the game container
    const cactuses = document.querySelectorAll('.cactus');
    cactuses.forEach(c => c.remove());

    clearTimeout(currentCactusInterval);
}

function resetGame() {
    endGame();
    startGame();
}

// Event Listeners
document.addEventListener('keydown', control);

gameContainer.addEventListener('click', function() {
    if (!isGameActive && !isGameOver) {
        startGame();
    } else if (isGameOver) {
        resetGame();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    isGameActive = false;
    isGameOver = false;
    instructionsOverlay.style.display = 'block';
});