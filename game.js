const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreValue');
const livesElement = document.getElementById('livesValue');

canvas.width = 1200;
canvas.height = 800;

let invaderSpeed = 1;
let invaderSpeedIncrease = 0.2;

class Player {
    constructor() {
        this.width = 80;
        this.height = 60;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 20;
        this.speed = 8;
        this.color = '#30f030';
        this.isMovingLeft = false;
        this.isMovingRight = false;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#87CEFA';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + 20, 15, 20, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    move() {
        if (this.isMovingLeft) this.x = Math.max(0, this.x - this.speed);
        if (this.isMovingRight) this.x = Math.min(canvas.width - this.width, this.x + this.speed);
    }
}

class Rocket {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 25;
        this.speed = 7;
    }

    draw() {
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.width / 2, this.y - 8);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height + 15);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        this.y -= this.speed;
    }
}

class Invader {
    constructor(x, y) {
        this.width = 60;
        this.height = 40;
        this.x = x;
        this.y = y;
        this.speed = invaderSpeed;
        this.color = 'purple';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x + 10, this.y + 10, 10, 10);
        ctx.fillRect(this.x + 40, this.y + 10, 10, 10);
        ctx.fillRect(this.x + 10, this.y + 25, 40, 5);
    }

    update() {
        this.x += this.speed;
    }

    reverse() {
        this.speed *= -1;
        this.y += 10;
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 15;
        this.speed = 5;
    }

    draw() {
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.speed;
    }
}

class UFO {
    constructor() {
        this.width = 100;
        this.height = 50;
        this.x = canvas.width;
        this.y = 50;
        this.speed = 3;
        this.message = '';
    }

    draw() {
        ctx.fillStyle = '#800080';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 4, this.height / 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw message
        if (this.message) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.message, this.x + this.width / 2, this.y - 10);
        }
    }

    update() {
        if (this.x > canvas.width / 2 - this.width / 2) {
            this.x -= this.speed;
        }
    }
}

const player = new Player();
let rockets = [];
let invaders = [];
let score = 0;
let lives = 3;
let bullets = [];
let lastShotTime = Date.now();
let ufo = null;
let gameOver = false;
let restartButton;

function createInvaders() {
    invaders = [];
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 10; x++) {
            invaders.push(new Invader(x * 100 + 100, y * 80 + 50));
        }
    }
}

function drawStars() {
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 100; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function gameLoop() {
    if (gameOver) return;

    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars();
    player.draw();
    player.move();

    rockets.forEach((rocket, index) => {
        rocket.draw();
        rocket.update();
        if (rocket.y < 0) rockets.splice(index, 1);
    });

    let reverseInvaders = false;
    invaders.forEach((invader, index) => {
        invader.draw();
        invader.update();
        if (invader.x <= 0 || invader.x + invader.width >= canvas.width) {
            reverseInvaders = true;
        }
        rockets.forEach((rocket, rocketIndex) => {
            if (
                rocket.x < invader.x + invader.width &&
                rocket.x + rocket.width > invader.x &&
                rocket.y < invader.y + invader.height &&
                rocket.y + rocket.height > invader.y
            ) {
                invaders.splice(index, 1);
                rockets.splice(rocketIndex, 1);
                score += 10;
                scoreElement.textContent = score;
            }
        });
    });

    if (reverseInvaders) {
        invaders.forEach(invader => invader.reverse());
    }

    let currentTime = Date.now();
    if (currentTime - lastShotTime > 1000) { // Shoot every second
        invaders.forEach((invader) => {
            if (Math.random() < 0.1) { // 10% chance for each invader to shoot
                bullets.push(new Bullet(invader.x + invader.width / 2, invader.y + invader.height));
            }
        });
        lastShotTime = currentTime;
    }

    bullets.forEach((bullet, index) => {
        bullet.draw();
        bullet.update();
        if (bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }

        // Check collision with player
        if (
            bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y
        ) {
            bullets.splice(index, 1);
            lives--;
            livesElement.textContent = lives;
            if (lives <= 0) {
                endGame("Game Over!");
            }
        }
    });

    if (invaders.length === 0) {
        if (!ufo) {
            ufo = new UFO();
        }
        ufo.draw();
        ufo.update();

        if (ufo.x + ufo.width < 0) {
            rebuildInvaders();
        }

        // Check collision with UFO
        rockets.forEach((rocket, index) => {
            if (
                rocket.x < ufo.x + ufo.width &&
                rocket.x + rocket.width > ufo.x &&
                rocket.y < ufo.y + ufo.height &&
                rocket.y + rocket.height > ufo.y
            ) {
                rockets.splice(index, 1);
                score += 50;
                scoreElement.textContent = score;
                rebuildInvaders();
            }
        });
    }

    requestAnimationFrame(gameLoop);
}

function rebuildInvaders() {
    invaderSpeed += invaderSpeedIncrease;
    createInvaders();
    ufo = null;
}

function endGame(message) {
    gameOver = true;
    ufo = new UFO();
    ufo.message = message;

    function gameOverLoop() {
        ctx.fillStyle = '#000033';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawStars();
        ufo.draw();
        ufo.update();

        if (ufo.x <= canvas.width / 2 - ufo.width / 2) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Your Score: ${score}`, canvas.width / 2, canvas.height / 2 + 50);

            // Create restart button
            if (!restartButton) {
                restartButton = document.createElement('button');
                restartButton.textContent = 'Restart Game';
                restartButton.style.position = 'absolute';
                restartButton.style.left = '50%';
                restartButton.style.top = '70%';
                restartButton.style.transform = 'translate(-50%, -50%)';
                restartButton.style.padding = '10px 20px';
                restartButton.style.fontSize = '24px';
                restartButton.addEventListener('click', restartGame);
                document.body.appendChild(restartButton);
            }
        }

        if (gameOver) {
            requestAnimationFrame(gameOverLoop);
        }
    }

    gameOverLoop();
}

function restartGame() {
    // Remove restart button
    if (restartButton) {
        document.body.removeChild(restartButton);
        restartButton = null;
    }

    // Reset game variables
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - player.height - 20;
    rockets = [];
    bullets = [];
    score = 0;
    lives = 3;
    gameOver = false;
    ufo = null;

    // Reset invader speed
    invaderSpeed = 2;

    // Update score and lives display
    scoreElement.textContent = score;
    livesElement.textContent = lives;

    // Recreate invaders
    createInvaders();

    // Restart game loop
    requestAnimationFrame(gameLoop);
}

createInvaders();
gameLoop();

document.addEventListener('keydown', (e) => {
    if (gameOver) return;
    if (e.key === 'ArrowLeft') player.isMovingLeft = true;
    if (e.key === 'ArrowRight') player.isMovingRight = true;
    if (e.key === ' ') {
        rockets.push(new Rocket(player.x + player.width / 2 - 5, player.y));
    }
});

document.addEventListener('keyup', (e) => {
    if (gameOver) return;
    if (e.key === 'ArrowLeft') player.isMovingLeft = false;
    if (e.key === 'ArrowRight') player.isMovingRight = false;
});