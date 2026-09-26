window.onload = function() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const statusTxt = document.getElementById("status-txt");

    // Matikan pemulusan gambar di awal agar pixel art tajam
    ctx.imageSmoothingEnabled = false;

    // ========================================================
    // 1. BARU: MEMUAT GAMBAR BACKGROUND PIJAKAN (TERRAIN NOMOR 4)
    // ========================================================
    const imgBackground = new Image();
    imgBackground.src = "background_level.png"; // Memanggil file peta rakitan Aseprite Anda

    // MEMUAT SPRITESHEETS UTAMA KARAKTER
    const imgIdleDown = new Image(); imgIdleDown.src = "Main_character-Idle_down-Base_body-Engine.png";
    const imgIdleUp   = new Image(); imgIdleUp.src   = "Main_character-Idle_up-Base_body-Engine.png";
    const imgIdleSide = new Image(); imgIdleSide.src = "Main_character-Idle_side-Base_body-Engine.png";
    const imgWalkDown = new Image(); imgWalkDown.src = "Main_character-Walk_down-Base_body-Engine.png";
    const imgWalkUp   = new Image(); imgWalkUp.src   = "Main_character-Walk_up-Base_body-Engine.png";
    const imgWalkSide = new Image(); imgWalkSide.src = "Main_character-Walk_side-Base_body-Engine.png";

    // 2. DATA UTAMA KARAKTER
    let player = { x: 250, y: 150, size: 32, scale: 3.5, speed: 2.2, direction: "down", isFlipped: false, state: "idle", currentFrame: 0, animTimer: 0, animSpeed: 8 };
    let displaySize = player.size * player.scale;
    let keys = {};

    // 3. DATA VIRTUAL JOYSTICK
    let joystick = { x: 500, y: 320, outerRadius: 55, innerRadius: 25, touchX: 500, touchY: 320, isDragging: false };

    // Input Keyboard Fisik
    window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
    window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

    // Logika Sentuh Layar & Mouse
    function handleStart(posX, posY) {
        let rect = canvas.getBoundingClientRect();
        let canvasX = (posX - rect.left) * (canvas.width / rect.width);
        let canvasY = (posY - rect.top) * (canvas.height / rect.height);
        let dist = Math.hypot(canvasX - joystick.x, canvasY - joystick.y);
        if (dist < joystick.outerRadius) { joystick.isDragging = true; handleMove(posX, posY); }
    }

    function handleMove(posX, posY) {
        if (!joystick.isDragging) return;
        let rect = canvas.getBoundingClientRect();
        let canvasX = (posX - rect.left) * (canvas.width / rect.width);
        let canvasY = (posY - rect.top) * (canvas.height / rect.height);
        let angle = Math.atan2(canvasY - joystick.y, canvasX - joystick.x);
        let dist = Math.hypot(canvasX - joystick.x, canvasY - joystick.y);
        if (dist > joystick.outerRadius) dist = joystick.outerRadius;
        joystick.touchX = joystick.x + Math.cos(angle) * dist;
        joystick.touchY = joystick.y + Math.sin(angle) * dist;
    }

    function handleEnd() { joystick.isDragging = false; joystick.touchX = joystick.x; joystick.touchY = joystick.y; }

    canvas.addEventListener("mousedown", e => handleStart(e.clientX, e.clientY));
    window.addEventListener("mousemove", e => handleMove(e.clientX, e.clientY));
    window.addEventListener("mouseup", handleEnd);
    canvas.addEventListener("touchstart", e => { e.preventDefault(); handleStart(e.touches[0].clientX, e.touches[0].clientY); }, {passive:false});
    window.addEventListener("touchmove", e => { handleMove(e.touches[0].clientX, e.touches[0].clientY); });
    window.addEventListener("touchend", handleEnd);

    // 4. ENGINE LOGIC UPDATE
    function updateGame() {
        let movingX = 0, movingY = 0;

        if (keys["arrowup"] || keys["w"]) movingY = -1;
        if (keys["arrowdown"] || keys["s"]) movingY = 1;
        if (keys["arrowleft"] || keys["a"]) movingX = -1;
        if (keys["arrowright"] || keys["d"]) movingX = 1;

        if (joystick.isDragging) {
            let dx = joystick.touchX - joystick.x;
            let dy = joystick.touchY - joystick.y;
            if (Math.abs(dx) > 12) movingX = Math.sign(dx);
            if (Math.abs(dy) > 12) movingY = Math.sign(dy);
        }

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
        
        player.x = Math.max(0, Math.min(canvas.width - displaySize, player.x));
        player.y = Math.max(0, Math.min(canvas.height - 130, player.y)); // Membatasi agar tidak menembus batas bawah area joystick
    }

    // 5. RENDERING GRAPHIC SYSTEM
    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Memaksa ulang setelan pixelated di dalam loop agar tetap tajam
        ctx.imageSmoothingEnabled = false;

        // ========================================================
        // A. BARU: MENGGAMBAR PIJAKAN LATAR BELAKANG TERRAIN
        // ========================================================
        if (imgBackground.complete && imgBackground.naturalWidth > 0) {
            ctx.drawImage(imgBackground, 0, 0, canvas.width, canvas.height);
        } else {
            // Gambar warna dasar fallback jika gambar background belum selesai di-load
            ctx.fillStyle = "#2a3d2e";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // B. MENGGAMBAR KARAKTER UTAMA
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

        // C. DRAW VIRTUAL JOYSTICK OVERLAY
        ctx.getTransform(); // Menjaga transform aman
        ctx.beginPath(); ctx.arc(joystick.x, joystick.y, joystick.outerRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(15, 23, 42, 0.4)"; ctx.fill();
        ctx.strokeStyle = "rgba(56, 189, 248, 0.5)"; ctx.lineWidth = 3; ctx.stroke();

        ctx.beginPath(); ctx.arc(joystick.touchX, joystick.touchY, joystick.innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = joystick.isDragging ? "rgba(56, 189, 248, 0.8)" : "rgba(148, 163, 184, 0.6)"; ctx.fill();
        ctx.stroke();

        // HUD Informasi Atas
        ctx.fillStyle = "rgba(15, 17, 21, 0.7)"; ctx.fillRect(15, 15, 340, 26);
        ctx.fillStyle = "#38bdf8"; ctx.font = "bold 11px monospace"; ctx.fillText("🎮 KONTROL: TEKAN WASD / GESER JOYSTICK HP", 25, 32);
    }

    function gameLoop() {
        updateGame();
        drawGame();
        // Animasi 6 Frame terus berjalan
        player.animTimer++;
        if (player.animTimer >= player.animSpeed) { 
            player.animTimer = 0; 
            player.currentFrame = (player.currentFrame + 1) % 6; 
        }
        requestAnimationFrame(gameLoop);
    }
    gameLoop();
};
