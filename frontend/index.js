import { backend } from 'declarations/backend';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const loadingElement = document.getElementById('loading');

canvas.width = 640;
canvas.height = 400;

const SCREEN_WIDTH = canvas.width;
const SCREEN_HEIGHT = canvas.height;
const TILE_SIZE = 64;
const FOV = 60 * Math.PI / 180;
const HALF_FOV = FOV / 2;
const CAST_RAYS = SCREEN_WIDTH;
const MAX_DEPTH = 8;

let player = { x: 2 * TILE_SIZE, y: 2 * TILE_SIZE, angle: 0, health: 100 };
let enemies = [{ x: 3 * TILE_SIZE, y: 3 * TILE_SIZE }];
let ammo = 50;

const map = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
];

const textures = {
    wall: new Image(),
    enemy: new Image()
};

let texturesLoaded = 0;
const totalTextures = Object.keys(textures).length;

function loadTexture(key, src) {
    return new Promise((resolve, reject) => {
        textures[key].onload = () => {
            texturesLoaded++;
            resolve();
        };
        textures[key].onerror = reject;
        textures[key].src = src;
    });
}

function toRadians(deg) {
    return deg * Math.PI / 180;
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function castRay(angle) {
    let rayX = player.x;
    let rayY = player.y;
    let rayAngle = player.angle + angle;

    let xStep = Math.cos(rayAngle);
    let yStep = Math.sin(rayAngle);

    let depth = 0;
    while (depth < MAX_DEPTH) {
        let mapX = Math.floor(rayX / TILE_SIZE);
        let mapY = Math.floor(rayY / TILE_SIZE);

        if (map[mapY][mapX] === 1) {
            let dist = distance(player.x, player.y, rayX, rayY);
            let wallHeight = (TILE_SIZE / dist) * 277;
            return { distance: dist, wallHeight, mapX, mapY };
        }

        rayX += xStep;
        rayY += yStep;
        depth += 1;
    }

    return null;
}

function drawWall(x, height, texture, texX) {
    const wallTop = (SCREEN_HEIGHT - height) / 2;
    ctx.drawImage(texture, texX, 0, 1, 64, x, wallTop, 1, height);
}

function drawSprite(enemy) {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const spriteAngle = Math.atan2(dy, dx) - player.angle;
    const size = (SCREEN_HEIGHT / dist) * 32;

    const x = (spriteAngle / FOV + 0.5) * SCREEN_WIDTH - size / 2;
    const y = SCREEN_HEIGHT / 2 - size / 2;

    ctx.drawImage(textures.enemy, x, y, size, size);
}

function drawScene() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    for (let x = 0; x < CAST_RAYS; x++) {
        const rayAngle = (x / CAST_RAYS - 0.5) * FOV;
        const ray = castRay(rayAngle);

        if (ray) {
            const wallX = ray.mapX * TILE_SIZE;
            const wallY = ray.mapY * TILE_SIZE;
            let textureX;

            if (Math.abs(wallY - ray.y) < 0.00001) {
                textureX = (ray.x / TILE_SIZE) % 1;
            } else {
                textureX = (ray.y / TILE_SIZE) % 1;
            }

            textureX = Math.floor(textureX * 64);

            drawWall(x, ray.wallHeight, textures.wall, textureX);
        }
    }

    enemies.forEach(drawSprite);
}

function movePlayer(distance) {
    const newX = player.x + Math.cos(player.angle) * distance;
    const newY = player.y + Math.sin(player.angle) * distance;

    if (!isColliding(newX, newY)) {
        player.x = newX;
        player.y = newY;
    }
}

function rotatePlayer(angle) {
    player.angle += angle;
}

function isColliding(x, y) {
    const mapX = Math.floor(x / TILE_SIZE);
    const mapY = Math.floor(y / TILE_SIZE);
    return map[mapY][mapX] === 1;
}

function updateHUD() {
    document.getElementById('health').textContent = player.health + '%';
    document.getElementById('ammo').textContent = ammo;
}

async function updateEnemyPositions() {
    try {
        loadingElement.classList.remove('hidden');
        const newPositions = await backend.updateEnemyPositions(player.x, player.y, enemies.map(e => ({ x: e.x, y: e.y })));
        enemies = newPositions;
    } catch (error) {
        console.error('Error updating enemy positions:', error);
    } finally {
        loadingElement.classList.add('hidden');
    }
}

function gameLoop() {
    drawScene();
    updateHUD();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    const moveSpeed = 5;
    const rotateSpeed = 0.1;

    switch (e.key) {
        case 'w':
            movePlayer(moveSpeed);
            break;
        case 's':
            movePlayer(-moveSpeed);
            break;
        case 'a':
            rotatePlayer(-rotateSpeed);
            break;
        case 'd':
            rotatePlayer(rotateSpeed);
            break;
        case ' ':
            if (ammo > 0) {
                ammo--;
                // Implement shooting logic here
            }
            break;
    }
});

Promise.all([
    loadTexture('wall', 'wall_texture.png'),
    loadTexture('enemy', 'enemy_texture.png')
]).then(() => {
    loadingElement.classList.add('hidden');
    gameLoop();
}).catch(error => {
    console.error('Failed to load textures:', error);
    loadingElement.textContent = 'Failed to load game resources. Please refresh the page.';
});
