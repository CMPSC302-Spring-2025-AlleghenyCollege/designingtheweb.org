const dino = document.getElementById('dino');
const gameContainer = document.querySelector('.game-container');
const gameOverMessage = document.querySelector('.game-over-message');
const scoreElement = document.getElementById('scoreValue');
const highScoreElement = document.getElementById('highScoreValue');
const instructionsOverlay = document.querySelector('.instructions-overlay');
const scoreDisplay = document.querySelector('.score');
const highScoreDisplay = document.querySelector('.high-score');

// Game state variables
let isJumping = false;
let position = 0;
let isGameOver = false;
let score = 0;
let highScore = parseInt(localStorage.getItem('dinoHighScore')) || 0;
let isGameActive = false;
let currentCactusInterval = null;
let gameSpeed = 5;

// Initialize high score display
highScoreElement.textContent = highScore;

// Debug logging
console.log('Game elements:', {
    dino: dino,
    gameContainer: gameContainer,
    gameOverMessage: gameOverMessage,
    scoreElement: scoreElement,
    instructionsOverlay: instructionsOverlay,
    scoreDisplay: scoreDisplay,
    highScoreDisplay: highScoreDisplay
});

// Listen for the SPACE key to trigger a jump
function control(e) {
    console.log('Key pressed:', e.code);
    if ((e.code === 'Space' || e.key === ' ') && !isJumping && isGameActive) {
        e.preventDefault(); // Prevent page scrolling
        jump();
    }
}

function jump() {
    console.log('Jump triggered');
    if (isJumping) return;

    let timerId = null;
    let jumpCount = 0;
    const jumpHeight = 150;
    isJumping = true;

    function moveUp() {
        position += 20;
        dino.style.bottom = position + 'px';

        if (position >= jumpHeight) {
            clearInterval(timerId);
            setTimeout(() => {
                let downTimerId = setInterval(() => {
                    if (position <= 0) {
                        clearInterval(downTimerId);
                        isJumping = false;
                        position = 0;
                        dino.style.bottom = '0';
                    } else {
                        position -= 10;
                        dino.style.bottom = position + 'px';
                    }
                }, 20);
            }, 200);
        }
    }

    timerId = setInterval(moveUp, 20);
}

function updateScore() {
    score++;
    scoreElement.textContent = score;
    
    // Animate score update
    scoreDisplay.classList.remove('score-updated');
    void scoreDisplay.offsetWidth; // Trigger reflow
    scoreDisplay.classList.add('score-updated');

    // Check for new high score
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('dinoHighScore', highScore);
        
        // Animate high score update
        highScoreDisplay.classList.remove('new-high-score');
        void highScoreDisplay.offsetWidth; // Trigger reflow
        highScoreDisplay.classList.add('new-high-score');
    }

    // Increase game speed gradually
    if (score % 5 === 0) {
        gameSpeed += 0.5;
    }
}

function generateCactus() {
    if (!isGameActive) return;
    console.log('Generating cactus');

    const cactus = document.createElement('div');
    cactus.classList.add('cactus');
    gameContainer.appendChild(cactus);

    let cactusPosition = 1000;
    
    function moveCactus() {
        if (isGameOver) {
            cactus.remove();
            return;
        }

        cactusPosition -= gameSpeed;
        cactus.style.left = cactusPosition + 'px';

        // Collision detection
        if (cactusPosition > 0 && cactusPosition < 90 && position < 90) {
            endGame();
            return;
        }

        if (cactusPosition < -60) {
            cactus.remove();
            updateScore();
        } else {
            requestAnimationFrame(moveCactus);
        }
    }

    requestAnimationFrame(moveCactus);

    // Generate next cactus after a random delay
    if (isGameActive) {
        const randomDelay = Math.floor(Math.random() * (2000 - 1000 + 1) + 1000);
        setTimeout(generateCactus, randomDelay);
    }
}

function startGame() {
    console.log('Starting game');
    isGameActive = true;
    isGameOver = false;
    score = 0;
    position = 0;
    gameSpeed = 5;
    scoreElement.textContent = '0';
    gameOverMessage.style.display = 'none';
    
    // Reset score animations
    scoreDisplay.classList.remove('score-updated');
    highScoreDisplay.classList.remove('new-high-score');
    
    // Add animation classes
    gameContainer.classList.add('game-started');
    instructionsOverlay.classList.add('fade-out');

    // Remove any existing cactuses
    const cactuses = document.querySelectorAll('.cactus');
    cactuses.forEach(c => c.remove());

    // Start generating cactuses
    generateCactus();
}

function endGame() {
    console.log('Game over');
    isGameActive = false;
    isGameOver = true;
    
    // Remove animation classes
    gameContainer.classList.remove('game-started');
    instructionsOverlay.classList.remove('fade-out');
    
    gameOverMessage.style.display = 'block';
    instructionsOverlay.style.display = 'block';

    // Remove all cactuses
    const cactuses = document.querySelectorAll('.cactus');
    cactuses.forEach(c => c.remove());
}

// Event Listeners
document.addEventListener('keydown', control);
document.addEventListener('touchstart', function() {
    console.log('Touch detected');
    if (isGameActive && !isJumping) {
        jump();
    }
});

gameContainer.addEventListener('click', function(e) {
    console.log('Game container clicked');
    if (!isGameActive && !isGameOver) {
        startGame();
    } else if (isGameOver) {
        startGame();
    }
});

// Initialize game state
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    isGameActive = false;
    isGameOver = false;
    instructionsOverlay.style.display = 'block';
});