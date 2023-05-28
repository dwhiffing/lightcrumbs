import Phaser from 'phaser'

export default class Boot extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  preload() {
    const progress = this.add.graphics()
    const { width, height } = this.sys.game.config

    this.load.on('progress', (value: number) => {
      progress.clear()
      progress.fillStyle(0xffffff, 1)
      progress.fillRect(0, +height / 2, +width * value, 60)
    })
    this.load.image('title', '/assets/title.png')
    this.load.bitmapFont('gem', 'assets/gem.png', 'assets/gem.xml')
    this.load.html('star', '/assets/star.svg')
    this.load.image('star-ui', '/assets/star-svg.png')
    this.load.audio('steps', '/assets/steps.ogg')
    this.load.audio('door', '/assets/door.ogg')
    this.load.audio('place', '/assets/finish.ogg')
    this.load.audio('menu', '/assets/menu.mp3')
    this.load.audio('game', '/assets/game.mp3')
    this.load.audio('finish', '/assets/place.ogg')
    this.load.audio('scale', '/assets/scale.ogg')

    this.load.spritesheet('icons', 'assets/icons.png', {
      frameHeight: 50,
      frameWidth: 49,
    })

    this.load.on('complete', () => {
      progress.destroy()

      // this.scene.start('GameScene')
      this.scene.start('MenuScene')
    })
  }

  create() {}
}
