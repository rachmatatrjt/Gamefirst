const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const statusTxt = document.getElementById("status-txt");

ctx.imageSmoothingEnabled = false;

// ========================================================
// 1. LOADING SEMUA ASSETS (BACKGROUND, PLAYER, & UI BUTTONS)
// ========================================================
const imgBackground = new Image(); imgBackground.src = "background_level.png";
const imgIdleDown = new Image(); imgIdleDown.src = "Main_character-Idle_down-Base_body-Engine.png";
const imgIdleUp   = new Image(); imgIdleUp.src   = "Main_character-Idle_up-Base_body-Engine.png";
const imgIdleSide = new Image(); imgIdleSide.src = "Main_character-Idle_side-Base_body-Engine.png";
const imgWalkDown = new Image(); imgWalkDown.src = "Main_character-Walk_down-Base_body-Engine.png";
const imgWalkUp   = new Image(); imgWalkUp.src   = "Main_character-Walk_up-Base_body-Engine.png";
const imgWalkSide = new Image(); imgWalkSide.src = "Main_character-Walk_side-Base_body-Engine.png";

// Memuat 3 Status Gambar Ubin Kustom Anda
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
// 3. DAFTAR KOORDINAT 4 BUTTON UI NYATA DI KANVAS (D-PAD)
// ========================================================
// Tombol diletakkan secara ergonomis di pojok kiri bawah kanvas (Ukuran 70x70 pixel per ubin)
let buttons = {
    up:    { x: 130, y: 610, w: 70, h: 70, state: "normal", moveY: -1, moveX: 0 },
    down:  { x: 130, y: 750, w: 70, h: 70, state: "normal", moveY: 1,  moveX: 0 },
    left:  { x: 50,  y: 680, w: 70, h: 70, state: "normal", moveY: 0,  moveX: -1 },
    right: { x: 210, y: 680, w: 70, h: 70, state: "normal", moveY: 0,  moveX: 1 }
};

window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ========================================================
// 4. DETEKSI KLIK & SENTUHAN PADA LAYAR SCREEN BUTTONS
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
        // Deteksi apakah koordinat jari/mouse berada di dalam kotak tombol
        if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
            if (isInputEnd) {
                b.state = "normal";
            } else {
                b.state = "active";
                keys[key] = true; // Pemicu tombol virtual jalan
                anyButtonPressed = true;
            }
        } else {
            if (!isInputEnd) b.state = "normal";
            // Matikan tombol jika jari bergeser keluar dari area kotak ubin
            if (!anyButtonPressed && !isInputEnd) keys[key] = false;
        }
    }
}

function clearAllButtons() {
    for (let key in buttons) {
        buttons[key].state = "normal";
        keys[key] = false; // Hentikan semua instruksi jalan virtual
    }
}

// Handler Interaksi Input Mouse & Touch Mobile
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

canvas.addEventListener("touchstart", e => { e.preventDefault(); checkButtonClick(e.touches[0].clientX, e.touches[0].clientY); }, {passive:false});
canvas.addEventListener("touchmove", e => { checkButtonClick(e.touches[0].clientX, e.touches[0].clientY); });
window.addEventListener("touchend", clearAllButtons);

// ========================================================
// 5. ENGINE LOGIC UPDATE (CALIBRATED ACCURATE COLLISION)
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
    
    // Kalibrasi Batas Dinding Akurat
    if (player.x < 15) player.x = 15;
    if (player.x > canvas.width - displaySize - 15) player.x = canvas.width - displaySize - 15;
    if (player.y < 0) player.y = 0;
    if (player.y > canvas.height - displaySize - 240) player.y = canvas.height - displaySize - 240; // Ruang aman bawah bebas dari bentrokan ubin tombol
}

// ========================================================
// 6. RENDERING GRAPHIC SYSTEM (UI BUTTONS COMPONENT)
// ========================================================
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    // A. Gambar Background Level
    if (imgBackground.complete && imgBackground.naturalWidth > 0) {
        ctx.drawImage(imgBackground, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#1e241d"; ctx.fillRect(0, 0, canvas.width, canvas.height);
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

    // C. BARU: DRAW INTERACTIVE UI BUTTONS (MENGGUNAKAN ASET GAMBAR ANDA)
    for (let key in buttons) {
        let b = buttons[key];
        let currentBtnImg = btnNormal; // State default

        if (b.state === "hover") currentBtnImg = btnHover;
        if (b.state === "active") currentBtnImg = btnActive;

        if (currentBtnImg.complete && currentBtnImg.naturalWidth > 0) {
            ctx.drawImage(currentBtnImg, b.x, b.y, b.w, b.h);
        } else {
            // Kotak fallback transparan jika gambar ubin bermasalah/loading
            ctx.fillStyle = b.state === "active" ? "rgba(56, 189, 248, 0.6)" : "rgba(30, 41, 59, 0.6)";
            ctx.fillRect(b.x, b.y, b.w, b.h);
        }
        
        // Gambar label arah teks kecil di dalam ubin tombol
        ctx.fillStyle = "#ffffff"; ctx.font = "bold 11px monospace";
        ctx.fillText(key.toUpperCase(), b.x + (b.w/2) - 12, b.y + (b.h/2) + 4);
    }

    // HUD Petunjuk Instruksi Atas Kanvas
    ctx.fillStyle = "rgba(15, 17, 21, 0.75)"; ctx.fillRect(15, 15, 410, 26);
    ctx.fillStyle = "#38bdf8"; ctx.font = "bold 11px monospace"; ctx.fillText("🎮 KONTROL: WASD LAPTOP / SENTUH UBIN TOMBOL RETRO HP", 25, 32);
}

function gameLoop() {
    updateGame(); drawGame();
    player.animTimer++;
    if (player.animTimer >= player.animSpeed) { player.animTimer = 0; player.currentFrame = (player.currentFrame + 1) % 6; }
    requestAnimationFrame(gameLoop);
}

gameLoop();
