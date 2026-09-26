// 1. KONFIGURASI ENGINE GAMES (PHASER SETTINGS)
const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 420,
    parent: 'game-container',
    pixelArt: true, // PAKSA SEMUA PIXEL ART TAJAM & PIXELATED OTOMATIS!
    physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
    scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);
let player;
let cursors;
let wasd;

// 2. LOAD SEMUA ASSETS (PNG AUTOMATION)
function preload() {
    this.load.image('bg', 'background_level.png');
    this.load.spritesheet('i_down', 'Main_character-Idle_down-Base_body-Engine.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('i_up', 'Main_character-Idle_up-Base_body-Engine.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('i_side', 'Main_character-Idle_side-Base_body-Engine.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('w_down', 'Main_character-Walk_down-Base_body-Engine.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('w_up', 'Main_character-Walk_up-Base_body-Engine.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('w_side', 'Main_character-Walk_side-Base_body-Engine.png', { frameWidth: 32, frameHeight: 32 });
}

// 3. SETUP ENGINES & DAFTAR ANIMASI (6 FRAMES)
function create() {
    // Gambar Background Peta
    this.add.image(300, 210, 'bg').setDisplaySize(600, 420);

    // Setup Karakter (Skala diperbesar 5x Lipat)
    player = this.physics.add.sprite(300, 200, 'i_down').setScale(5);
    
    // COLLISION BOX: Mengunci Karakter di Batas Margin Peta 530x300 Anda
    player.setCollideWorldBounds(true);
    this.physics.world.setBounds(35, 35, 530, 250); 

    // Setup Input Kontrol Keyboard
    cursors = this.input.keyboard.createCursorKeys();
    wasd = this.input.keyboard.addKeys('W,A,S,D');

    // Mendaftarkan Siklus Animasi 6-Frame ke Sistem Engine
    const createAnim = (key, texture) => {
        this.anims.create({ key: key, frames: this.anims.generateFrameNumbers(texture, { start: 0, end: 5 }), frameRate: 8, repeat: -1 });
    };
    createAnim('idle_down', 'i_down'); createAnim('idle_up', 'i_up'); createAnim('idle_side', 'i_side');
    createAnim('walk_down', 'w_down'); createAnim('walk_up', 'w_up'); createAnim('walk_side', 'w_side');

    player.play('idle_down');

    // Menghubungkan Fungsi Klik Tombol UI Bawah Layar
    document.getElementById('btn-i-down').onclick = () => { player.play('idle_down'); player.setFlipX(false); };
    document.getElementById('btn-i-up').onclick   = () => { player.play('idle_up');   player.setFlipX(false); };
    document.getElementById('btn-i-side').onclick = () => { player.play('idle_side'); player.setFlipX(false); };
    document.getElementById('btn-w-down').onclick = () => { player.play('walk_down'); player.setFlipX(false); };
    document.getElementById('btn-w-up').onclick   = () => { player.play('walk_up');   player.setFlipX(false); };
    document.getElementById('btn-w-side').onclick = () => { player.play('walk_side'); player.setFlipX(false); };
}

// 4. LOGIKA UPDATE PERGERAKAN KEYBOARD
function update() {
    player.setVelocity(0);
    let moving = false;

    if (cursors.left.isDown || wasd.A.isDown) {
        player.setVelocityX(-150); player.play('walk_side', true); player.setFlipX(true); moving = true;
    } else if (cursors.right.isDown || wasd.D.isDown) {
        player.setVelocityX(150); player.play('walk_side', true); player.setFlipX(false); moving = true;
    }

    if (cursors.up.isDown || wasd.W.isDown) {
        player.setVelocityY(-150); if(!moving) player.play('walk_up', true); moving = true;
    } else if (cursors.down.isDown || wasd.S.isDown) {
        player.setVelocityY(150); if(!moving) player.play('walk_down', true); moving = true;
    }

    // Deteksi Tombol Lepas: Otomatis kembali ke Idle sesuai arah hadap terakhir
    if (!moving && player.anims.currentAnim) {
        let currentKey = player.anims.currentAnim.key;
        if (currentKey === 'walk_side') player.play('idle_side', true);
        if (currentKey === 'walk_up') player.play('idle_up', true);
        if (currentKey === 'walk_down') player.play('idle_down', true);
    }
}
