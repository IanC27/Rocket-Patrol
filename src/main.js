
const config = {
    type: Phaser.CANVAS,
    width: 640,
    height: 480,
    scene: [Menu, Play]
};

let borderUISize = config.height / 15;
let borderPadding = borderUISize / 3;
let keyF, keyR, keyLeft, keyRight;

let game = new Phaser.Game(config);
