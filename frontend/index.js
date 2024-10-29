import { backend } from 'declarations/backend';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const loadingElement = document.getElementById('loading');

canvas.width = 800;
canvas.height = 600;

const TILE_SIZE = 40;
const PLAYER_SIZE = 20;
const ENEMY_SIZE = 20;

let player = { x: 400, y: 300, health: 100 };
let enemy = { x: 100, y: 100 };
let bullets = [];
let score = 0;

const maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

function drawMaze() {
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] === 1) {
                ctx.fillStyle = '#666';
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = '#00f';
    ctx.fillRect(player.x - PLAYER_SIZE / 2, player.y - PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);
}

function drawEnemy() {
    ctx.fillStyle = '#f00';
    ctx.fillRect(enemy.x - ENEMY_SIZE / 2, enemy.y - ENEMY_SIZE / 2, ENEMY_SIZE, ENEMY_SIZE);
}

function drawBullets() {
    ctx.fillStyle = '#ff0';
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateBullets() {
    bullets = bullets.filter(bullet => {
        bullet.x += bullet.dx * 5;
        bullet.y += bullet.dy * 5;
        return (
            bullet.x >= 0 && bullet.x <= canvas.width &&
            bullet.y >= 0 && bullet.y <= canvas.height &&
            !isColliding(bullet.x, bullet.y, 3, enemy.x, enemy.y, ENEMY_SIZE)
        );
    });
}

function isColliding(x1, y1, size1, x2, y2, size2) {
    return Math.abs(x1 - x2) < (size1 + size2) / 2 &&
           Math.abs(y1 - y2) < (size1 + size2) / 2;
}

function checkCollisions() {
    if (isColliding(player.x, player.y, PLAYER_SIZE, enemy.x, enemy.y, ENEMY_SIZE)) {
        player.health -= 1;
        updateHUD();
    }

    bullets.forEach(bullet => {
        if (isColliding(bullet.x, bullet.y, 3, enemy.x, enemy.y, ENEMY_SIZE)) {
            score += 10;
            resetEnemy();
            updateHUD();
        }
    });
}

function resetEnemy() {
    enemy.x = Math.random() * canvas.width;
    enemy.y = Math.random() * canvas.height;
}

function updateHUD() {
    document.getElementById('health').textContent = player.health;
    document.getElementById('score').textContent = score;
}

async function updateEnemyPosition() {
    try {
        loadingElement.classList.remove('hidden');
        const newPosition = await backend.updateEnemyPosition(player.x, player.y, enemy.x, enemy.y);
        enemy.x = newPosition.x;
        enemy.y = newPosition.y;
    } catch (error) {
        console.error('Error updating enemy position:', error);
    } finally {
        loadingElement.classList.add('hidden');
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMaze();
    drawPlayer();
    drawEnemy();
    drawBullets();

    updateBullets();
    checkCollisions();

    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    const speed = 5;
    switch (e.key) {
        case 'ArrowUp':
            if (player.y - speed > PLAYER_SIZE / 2) player.y -= speed;
            break;
        case 'ArrowDown':
            if (player.y + speed < canvas.height - PLAYER_SIZE / 2) player.y += speed;
            break;
        case 'ArrowLeft':
            if (player.x - speed > PLAYER_SIZE / 2) player.x -= speed;
            break;
        case 'ArrowRight':
            if (player.x + speed < canvas.width - PLAYER_SIZE / 2) player.x += speed;
            break;
        case ' ':
            const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
            bullets.push({
                x: player.x,
                y: player.y,
                dx: Math.cos(angle),
                dy: Math.sin(angle)
            });
            break;
    }
});

gameLoop();
setInterval(updateEnemyPosition, 1000);
