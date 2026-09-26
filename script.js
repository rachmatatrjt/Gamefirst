const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const statusTxt = document.getElementById("status-txt");

ctx.imageSmoothingEnabled = false;

// ========================================================
// 1. MEMUAT SEMUA ASET GAMBAR
// ========================================================
const imgBackground = new Image(); imgBackground.src = "background_level.png";
const imgIdleDown = new Image(); imgIdleDown.src = "Main_character-Idle_down-Base_body-Engine.png";
const imgIdleUp   = new Image(); imgIdleUp.src   = "Main_character-Idle_up-Base_body-Engine.png";
const imgIdleSide = new Image(); imgIdleSide.src = "Main_character-Idle_side-Base_body-Engine.png";
const imgWalkDown = new Image(); imgWalkDown.src = "Main_character-Walk_down-Base_body-Engine.png";
const imgWalkUp   = new Image(); imgWalkUp.src   = "Main_character-Walk_up-Base_body-Engine.png";
const imgWalkSide = new Image(); imgWalkSide.src = "Main_character-Walk_side-Base_body-Engine.png";

const urlNormal = "url('btn_normal.png')";
const urlHover  = "url('btn_hover.png')";
const urlActive = "url('btn_active.png')";

// ========================================================
// 2. DATA UTAMA KARAKTER & CONFIG
// ========================================================
let player = { x: 500, y: 350, size: 32, scale: 5.0, speed: 3.0, direction: "down", isFlipped: false, state: "idle", currentFrame: 0, animTimer: 0, animSpeed: 8 };
let displaySize = player.size * player.scale;
let keys = {};

window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ========================================================
// 3. MENGIKAT INPUT DPAD DI LUAR KANVAS
// ========================================================
const dpadIds = { up: "btn-up", down: "btn-down", left: "btn-left", right: "btn-right" };

for (let direction in dpadIds) {
    let btnElement = document.getElementById(dpadIds[direction]);
    if (btnElement) {
        btnElement.style.backgroundImage = urlNormal;
        
        btnElement.addEventListener("mouseenter", () => { if(!keys[direction]) btnElement.style.backgroundImage = urlHover; });
        btnElement.addEventListener("mouseleave", () => { if(!keys[direction]) btnElement.style.backgroundImage = urlNormal; });

        const startPress = (e) => {
            e.preventDefault();
            keys[direction] = true;
            btnElement.style.backgroundImage = urlActive;
        };
        btnElement.addEventListener("mousedown", startPress);
        btnElement.addEventListener("touchstart", startPress, {passive: false});
    }
}

const endPressAll = () => {
    for (let direction in dpadIds) {
        keys[direction] = false;
        let btnElement = document.getElementById(dpadIds[direction]);
        if (btnElement) btnElement.style.backgroundImage = urlNormal;
    }
};
window.addEventListener("mouseup", endPressAll);
window.addEventListener("touchend", endPressAll);

// ========================================================
// 4. ENGINE LOGIC UPDATE (COLLISION AREA)
// ========================================================
function updateGame() {
    let movingX = 0, movingY = 0;

    if (keys["arrowup"] || keys["w"] || keys["up"]) movingY = -1;
    if (keys["arrowdown"] || keys["s"] || keys["down"]) movingY = 1;
    if (keys["arrowleft"] || keys["a"] || keys["left"]) movingX = -1;
    if (keys["arrowright"] || keys["d"] || keys["right"]) movingX = 1;

    if (movingX !== 0 || movingY !== 0) {
        player.state = "walk"; statusTxt.innerText = "WALKING";
        player.x += movingX * player.speed; player.y += movingY * player.speed;
        if (movingY === -1) player.direction = "up";
        if (movingY === 1)  player.direction = "down";
        if (movingX === 1) { player.direction = "side"; player.isFlipped = false; }
        else if (movingX === -1) { player.direction = "side"; player.isFlipped = true; }
    } else {
        player.state = "idle"; statusTxt.innerText = "IDLE";
    }
    
    if (player.x < 15) player.x = 15;
    if (player.x > canvas.width - displaySize - 10) player.x = canvas.width - displaySize - 10;
    
    if (player.y < 0) player.y = 0; 
    if (player.y > canvas.height - displaySize - 150) player.y = canvas.height - displaySize - 150;
}

// ========================================================
// 5. RENDERING GRAPHIC SYSTEM
// ========================================================
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    if (imgBackground.complete && imgBackground.naturalWidth > 0) {
        ctx.drawImage(imgBackground, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#141913"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    let activeImg = imgIdleDown;
    if (player.state === "idle") {
        if (player.direction === "down") activeImg = imgIdleDown;
        if (player.direction === "up")   activeImg = imgIdleUp;
        if (player.direction === "side") activeImg = imgIdleSide;
    } else {
        if (player.direction === "down") activeImg = imgWalkDown;
        if (player.direction === "up")   activeImg = imgWalkUp;
        if (player.direction === "side") activeImg = imgWalkSide;
    }

    if (activeImg.complete && activeImg.naturalWidth > 0) {
        let clipX = player.currentFrame * player.size;
        ctx.save();
        if (player.isFlipped) {
            ctx.translate(player.x + displaySize, player.y); ctx.scale(-1, 1);
            ctx.drawImage(activeImg, clipX, 0, player.size, player.size, 0, 0, displaySize, displaySize);
        } else {
            ctx.drawImage(activeImg, clipX, 0, player.size, player.size, player.x, player.y, displaySize, displaySize);
        }
        ctx.restore();
    }

    // HUD Petunjuk Atas Kanvas (Warna Tembaga Redup Harmonis)
    ctx.fillStyle = "rgba(9, 10, 15, 0.7)"; ctx.fillRect(15, 15, 435, 26);
    ctx.fillStyle = "#a48c64"; // MODIFIKASI FONT: Menggunakan warna emas tembaga redup low-contrast
    ctx.font = "11px monospace"; 
    ctx.fillText("WASD KEYBOARD / TOUCH RETRO BUTTON D-PAD", 25, 32);
}

function gameLoop() {
    updateGame(); drawGame();
    player.animTimer++;
    if (player.animTimer >= player.animSpeed) { player.animTimer = 0; player.currentFrame = (player.currentFrame + 1) % 6; }
    requestAnimationFrame(gameLoop);
}

gameLoop();
