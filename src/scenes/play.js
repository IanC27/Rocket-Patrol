class Play extends Phaser.Scene {
    constructor() {
        super("play");
    }

    preload() {
        this.load.image('rocket', 'assets/rocket.png');
        this.load.image('spaceship', 'assets/spaceship.png');
        this.load.image('starfield', 'assets/starfield.png');
        this.load.spritesheet('explosion', 'assets/explosion.png', { frameWidth: 64, frameHeight: 32, startFrame: 0, endFrame: 9 })
    }

    create() {


        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0, 0);
        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0);
        //this.add.text(20, 20, "Welcome to the game")
        // white borders
        this.add.rectangle(0, 0, game.config.width, borderUISize,
            0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(0, game.config.height - borderUISize,
            game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(0, 0, borderUISize, game.config.height,
            0xffffff).setOrigin(0, 0);
        this.add.rectangle(game.config.width - borderUISize, 0,
            borderUISize, game.config.height, 0xffffff).setOrigin(0, 0);

        

        this.ship1 = new Ship(this, game.config.width + borderUISize * 6, borderUISize * 4,
            'spaceship', 0, 30).setOrigin(0, 0);
        this.ship2 = new Ship(this, game.config.width + borderUISize * 3, borderUISize * 5 + borderPadding * 2,
            'spaceship', 0, 20).setOrigin(0, 0);
        this.ship3 = new Ship(this, game.config.width, borderUISize * 6 + borderPadding * 4,
            'spaceship', 0, 10).setOrigin(0, 0);

        p1Controls.keyFire = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        p1Controls.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        p1Controls.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        p2Controls.keyFire = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        p2Controls.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        p2Controls.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        this.p1Rocket = new Rocket(this, game.config.width / 3, 431,
            'rocket', p1Controls).setOrigin(0.5, 0);
        this.p2Rocket = new Rocket(this, game.config.width * 0.66, 431,
             'rocket', p2Controls).setOrigin(0.5, 0);

        //animation config
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 9, first: 0 }),
            frameRate: 30
        });

        this.p1Score = 0;

        // display score
        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding * 2, 
            this.p1Rocket.points, scoreConfig);
        this.scoreRight = this.add.text(game.config.width - borderUISize - borderPadding - scoreConfig.fixedWidth, 
            borderUISize + borderPadding * 2, this.p2Rocket.points, scoreConfig);

        this.gameOver = false;

        // 60-sec play clock
        scoreConfig.fixedWidth = 0;
        this.clock = this.time.delayedCall(game.settings.gameTimer, () => {
            this.add.text(game.config.width / 2, game.config.height / 2, 'GAME OVER', scoreConfig).setOrigin(0.5);
            this.add.text(game.config.width / 2, game.config.height / 2 + 64, 'Press (R) to Restart or ← for Menu',
                scoreConfig).setOrigin(0.5);
            this.gameOver = true;
        }, null, this);

    }

    update() {
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyR)) {
            this.scene.restart();
        }
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(p1Controls.keyLeft)) {
            this.scene.start("menu");
        }

        if (!this.gameOver) {
            this.starfield.tilePositionX -= 4;
            this.p1Rocket.update();
            this.p2Rocket.update();
            this.ship1.update();
            this.ship2.update();
            this.ship3.update();
        }

        for (let rocket of [this.p1Rocket, this.p2Rocket]){
            for (let ship of [this.ship1, this.ship2, this.ship3]) {
                if (this.checkCollision(rocket, ship)) {
                    rocket.reset();
                    this.shipExplode(ship, rocket);
                }
            }
        }
        
    }

    checkCollision(rocket, ship) {
        if (rocket.x < ship.x + ship.width &&
            rocket.x + rocket.width > ship.x &&
            rocket.y < ship.y + ship.height &&
            rocket.height + rocket.y > ship.y) {
            return true;
        } else {
            return false;
        }
    }

    shipExplode(ship, rocket) {
        // hide ship temporarily
        ship.alpha = 0;

        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
        boom.anims.play('explode');
        boom.on('animationcomplete', () => {
            ship.reset();
            ship.alpha = 1;
            boom.destroy();
        });
        rocket.points += ship.points;
        this.scoreLeft.text = this.p1Rocket.points;
        this.scoreRight.text = this.p2Rocket.points;
        this.sound.play('sfx_explosion');
    }

}