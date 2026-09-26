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

// Aset 3 Status Gambar Ubin Tombol Anda
const btnNormal = new Image(); btnNormal.src = "btn_normal.png";
const btnHover  = new Image(); btnHover.src  = "btn_hover.png";
const btnActive = new Image(); btnActive.src = "btn_active.png";

// ========================================================
// 2. DATA UTAMA KARAKTER & CONFIG
// ========================================================
let player = { x: 500, y: 350, size: 32, scale: 5.0, speed: 3.0, direction: "down", isFlipped: false, state: "idle", currentFrame: 0, animTimer: 0, animSpeed: 8 };
let displaySize = player.size * player.scale;
let keys = {};

// ========================================================
// 3. DAFTAR KOORDINAT 4 BUTTON UI (SERASI & ERGONOMIS)
// ========================================================
// Diletakkan rapi di pojok kiri bawah kanvas dengan ukuran ubin 72x72 pixel
let buttons = {
    up:    { x: 132, y: 590, w: 72, h: 72, state: "normal" },
    down:  { x: 132, y: 734, w: 72, h: 72, state: "normal" },
    left:  { x: 50,  y: 662, w: 72, h: 72, state: "normal" },
    right: { x: 214, y: 662, w: 72, h: 72, state: "normal" }
};

window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ========================================================
// 4. LOGIKA DETEKSI SENTUHAN / KLIK
// ========================================================
function getCanvasTouchPos(clientX, clientY) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
    };
}

function checkButtonClick(posX, posY, isInputEnd = false) {
    let p = getCanvasTouchPos(posX, posY);
    let anyButtonPressed = false;

    for (let key in buttons) {
        let b = buttons[key];
        if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
            if (isInputEnd) {
                b.state = "normal";
            } else {
                b.state = "active";
                keys[key] = true;
                anyButtonPressed = true;
            }
        } else {
            if (!isInputEnd) b.state = "normal";
            if (!anyButtonPressed && !isInputEnd) keys[key] = false;
        }
    }
}

function clearAllButtons() {
    for (let key in buttons) {
        buttons[key].state = "normal";
        keys[key] = false;
    }
}

canvas.addEventListener("mousedown", e => checkButtonClick(e.clientX, e.clientY));
canvas.addEventListener("mousemove", e => {
    let p = getCanvasTouchPos(e.clientX, e.clientY);
    for (let key in buttons) {
        let b = buttons[key];
        if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
            if (b.state !== "active") b.state = "hover";
        } else {
            if (b.state !== "active") b.state = "normal";
        }
    }
});
window.addEventListener("mouseup", clearAllButtons);

canvas.addEventListener("touchstart", e => { e.preventDefault(); checkButtonClick(e.touches.clientX, e.touches.clientY); }, {passive:false});
canvas.addEventListener("touchmove", e => { checkButtonClick(e.touches.clientX, e.touches.clientY); });
window.addEventListener("touchend", clearAllButtons);

// ========================================================
// 5. ENGINE LOGIC UPDATE (COLLISION SYSTEM)
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
    
    // Kunci Pergerakan Karakter di Zona Aman
    if (player.x < 15) player.x = 15;
    if (player.x > canvas.width - displaySize - 15) player.x = canvas.width - displaySize - 15;
    if (player.y < 0) player.y = 0;
    if (player.y > canvas.height - displaySize - 260) player.y = canvas.height - displaySize - 260; 
}

// ========================================================
// 6. RENDERING GRAPHIC SYSTEM
// ========================================================
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    // A. Gambar Pijakan Background
    if (imgBackground.complete && imgBackground.naturalWidth > 0) {
        ctx.drawImage(imgBackground, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#161a14"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // B. Gambar Player Aseprite
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

    // C. MENGGAMBAR UI BUTTONS TANPA TEKS (MURNI PIXEL ART ANDA)
    for (let key in buttons) {
        let b = buttons[key];
        let currentBtnImg = btnNormal;

        if (b.state === "hover") currentBtnImg = btnHover;
        if (b.state === "active") currentBtnImg = btnActive;

        if (currentBtnImg.complete && currentBtnImg.naturalWidth > 0) {
            ctx.drawImage(currentBtnImg, b.x, b.y, b.w, b.h);
        } else {
            ctx.fillStyle = b.state === "active" ? "rgba(56, 189, 248, 0.4)" : "rgba(30, 41, 59, 0.4)";
            ctx.fillRect(b.x, b.y, b.w, b.h);
        }
    }

    // HUD Petunjuk Atas Kanvas (Transparan & Estetik)
    ctx.fillStyle = "rgba(9, 10, 15, 0.6)"; ctx.fillRect(15, 15, 335, 26);
    ctx.fillStyle = "#38bdf8"; ctx.font = "bold 11px monospace"; ctx.fillText("⚡ WASD KEYBOARD / TOUCH RETRO BUTTON D-PAD", 25, 32);
}

function gameLoop() {
    updateGame(); drawGame();
    player.animTimer++;
    if (player.animTimer >= player.animSpeed) { player.animTimer = 0; player.currentFrame = (player.currentFrame + 1) % 6; }
    requestAnimationFrame(gameLoop);
}

gameLoop();
