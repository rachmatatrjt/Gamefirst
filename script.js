window.onload = function() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const statusTxt = document.getElementById("status-txt");

    ctx.imageSmoothingEnabled = false;

    // 1. MEMUAT SPRITESHEETS UTAMA (SINKRON SCRIPT ASEPRITE)
    const imgIdleDown = new Image(); imgIdleDown.src = "Main_character-Idle_down-Base_body-Engine.png";
    const imgIdleUp   = new Image(); imgIdleUp.src   = "Main_character-Idle_up-Base_body-Engine.png";
    const imgIdleSide = new Image(); imgIdleSide.src = "Main_character-Idle_side-Base_body-Engine.png";
    const imgWalkDown = new Image(); imgWalkDown.src = "Main_character-Walk_down-Base_body-Engine.png";
    const imgWalkUp   = new Image(); imgWalkUp.src   = "Main_character-Walk_up-Base_body-Engine.png";
    const imgWalkSide = new Image(); imgWalkSide.src = "Main_character-Walk_side-Base_body-Engine.png";

    // 2. DATA UTAMA KARAKTER
    let player = { x: 240, y: 150, size: 32, scale: 5.0, speed: 3.0, direction: "down", isFlipped: false, state: "idle", currentFrame: 0, animTimer: 0, animSpeed: 8 };

    let displaySize = player.size * player.scale;
    let keys = {};

    // 3. DATA VIRTUAL JOYSTICK (D-PAD LINGKARAN)
    // Posisi joystick diletakkan di pojok kanan bawah kanvas agar pas untuk jempol kanan
    let joystick = { x: 500, y: 320, outerRadius: 55, innerRadius: 25, touchX: 500, touchY: 320, isDragging: false };

    // Input Keyboard Fisik (Laptop)
    window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
    window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

    // Input Sentuh Layar (Mobile Touch & Mouse)
    function handleStart(posX, posY) {
        let rect = canvas.getBoundingClientRect();
        // Konversi koordinat klik layar ke skala koordinat internal Canvas
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

    // Event Listener Mouse & Touch Mobile
    canvas.addEventListener("mousedown", e => handleStart(e.clientX, e.clientY));
    window.addEventListener("mousemove", e => handleMove(e.clientX, e.clientY));
    window.addEventListener("mouseup", handleEnd);
    canvas.addEventListener("touchstart", e => { e.preventDefault(); handleStart(e.touches[0].clientX, e.touches[0].clientY); }, {pasive:false});
    window.addEventListener("touchmove", e => { handleMove(e.touches[0].clientX, e.touches[0].clientY); });
    window.addEventListener("touchend", handleEnd);

    // 4. ENGINE LOGIC UPDATE (KEYBOARD + CONTROLLER INTERATIVE)
    function updateGame() {
        let movingX = 0, movingY = 0;

        // Cek Input Keyboard Fisik
        if (keys["arrowup"] || keys["w"]) movingY = -1;
        if (keys["arrowdown"] || keys["s"]) movingY = 1;
        if (keys["arrowleft"] || keys["a"]) movingX = -1;
        if (keys["arrowright"] || keys["d"]) movingX = 1;

        // Cek Input Virtual Joystick Sentuh
        if (joystick.isDragging) {
            let dx = joystick.touchX - joystick.x;
            let dy = joystick.touchY - joystick.y;
            if (Math.abs(dx) > 12) movingX = Math.sign(dx);
            if (Math.abs(dy) > 12) movingY = Math.sign(dy);
        }

        // Proses Eksekusi Translasi Pergerakan & State Karakter
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
        player.y = Math.max(0, Math.min(canvas.height - 200, player.y)); // Menyisakan ruang bawah untuk area joystick
        
        player.animTimer++;
        if (player.animTimer >= player.animSpeed) { player.animTimer = 0; player.currentFrame = (player.currentFrame + 1) % 6; }
    }

    // 5. RENDERING GRAPHIC SYSTEM
    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;

        // Gambar Grid Background Peta Sederhana ala RPG Dev
        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        for (let i = 0; i < canvas.width; i += 32) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
        for (let j = 0; j < canvas.height; j += 32) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke(); }

        // Gambar Karakter Utama
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

        // 6. DRAW VIRTUAL JOYSTICK GRAPHIC (Minimalist UI Overlay)
        // Lingkaran Luar Joystick
        ctx.beginPath(); ctx.arc(joystick.x, joystick.y, joystick.outerRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(30, 41, 59, 0.4)"; ctx.fill();
        ctx.strokeStyle = "rgba(56, 189, 248, 0.5)"; ctx.lineWidth = 3; ctx.stroke();

        // Tombol Inti Dalam Joystick (Kursor Geser)
        ctx.beginPath(); ctx.arc(joystick.touchX, joystick.touchY, joystick.innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = joystick.isDragging ? "rgba(56, 189, 248, 0.8)" : "rgba(148, 163, 184, 0.6)"; ctx.fill();
        ctx.stroke();

        // Teks Petunjuk Kontrol Overlay Atas
        ctx.fillStyle = "rgba(15, 17, 21, 0.7)"; ctx.fillRect(15, 15, 340, 26);
        ctx.fillStyle = "#38bdf8"; ctx.font = "bold 11px monospace"; ctx.fillText("🎮 KONTROL: TEKAN WASD / GESER JOYSTICK HP", 25, 32);
    }

    function gameLoop() { updateGame(); drawGame(); requestAnimationFrame(gameLoop); }
    gameLoop();
};
