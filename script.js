window.onload = function() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const imgIdleDown = new Image(); imgIdleDown.src = "Main_character-Idle_down-Base_body-Engine.png";
    const imgIdleUp   = new Image(); imgIdleUp.src   = "Main_character-Idle_up-Base_body-Engine.png";
    const imgIdleSide = new Image(); imgIdleSide.src = "Main_character-Idle_side-Base_body-Engine.png";
    const imgWalkDown = new Image(); imgWalkDown.src = "Main_character-Walk_down-Base_body-Engine.png";
    const imgWalkUp   = new Image(); imgWalkUp.src   = "Main_character-Walk_up-Base_body-Engine.png";
    const imgWalkSide = new Image(); imgWalkSide.src = "Main_character-Walk_side-Base_body-Engine.png";

    let player = { x: 240, y: 200, size: 32, scale: 3.5, speed: 2.5, direction: "down", isFlipped: false, state: "idle", currentFrame: 0, animTimer: 0, animSpeed: 8 };
    let displaySize = player.size * player.scale;
    let keys = {};

    window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
    window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

    document.getElementById("btn-i-down").onclick  = () => setAnimation("idle", "down", false);
    document.getElementById("btn-i-up").onclick    = () => setAnimation("idle", "up", false);
    document.getElementById("btn-i-right").onclick = () => setAnimation("idle", "side", false);
    document.getElementById("btn-i-left").onclick  = () => setAnimation("idle", "side", true);
    document.getElementById("btn-w-down").onclick  = () => setAnimation("walk", "down", false);
    document.getElementById("btn-w-up").onclick    = () => setAnimation("walk", "up", false);
    document.getElementById("btn-w-right").onclick = () => setAnimation("walk", "side", false);
    document.getElementById("btn-w-left").onclick  = () => setAnimation("walk", "side", true);

    function setAnimation(state, direction, isFlipped) {
        player.state = state; player.direction = direction; player.isFlipped = isFlipped; player.currentFrame = 0;
    }

    function updateGame() {
        let movingX = 0, movingY = 0;
        if (keys["arrowup"] || keys["w"]) movingY = -1;
        if (keys["arrowdown"] || keys["s"]) movingY = 1;
        if (keys["arrowleft"] || keys["a"]) movingX = -1;
        if (keys["arrowright"] || keys["d"]) movingX = 1;

        if (movingX !== 0 || movingY !== 0) {
            player.state = "walk"; player.x += movingX * player.speed; player.y += movingY * player.speed;
            if (movingY === -1) player.direction = "up";
            if (movingY === 1)  player.direction = "down";
            if (movingX === 1) { player.direction = "side"; player.isFlipped = false; }
            else if (movingX === -1) { player.direction = "side"; player.isFlipped = true; }
        }
        player.x = Math.max(0, Math.min(canvas.width - displaySize, player.x));
        player.y = Math.max(0, Math.min(canvas.height - displaySize, player.y));
        player.animTimer++;
        if (player.animTimer >= player.animSpeed) { player.animTimer = 0; player.currentFrame = (player.currentFrame + 1) % 6; }
    }

    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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

        if (!activeImg.complete || activeImg.naturalWidth === 0) {
            ctx.fillStyle = "#e74c3c"; ctx.fillRect(player.x, player.y, displaySize, displaySize);
            ctx.fillStyle = "#ffffff"; ctx.font = "12px monospace"; ctx.fillText("PNG Hilang/Load", player.x + 5, player.y + 45);
            return;
        }

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

    function gameLoop() { updateGame(); drawGame(); requestAnimationFrame(gameLoop); }
    gameLoop();
};
