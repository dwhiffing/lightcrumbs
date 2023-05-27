import Phaser from 'phaser'

export default class Menu extends Phaser.Scene {
  constructor() {
    super('MenuScene')
  }

  create() {
    const w = this.cameras.main.width
    const h = this.cameras.main.height

    this.input.mouse.releasePointerLock()

    this.cameras.main.fadeFrom(500, 0, 0, 0)
    // const music = this.sound.add('menu', { loop: true, volume: 0 })
    // music.play()
    // this.tweens.add({
    //   targets: music,
    //   volume: 0.4,
    //   duration: 500,
    // })

    let started = false
    const onStart = () => {
      if (started) return
      started = true
      this.input.mouse.requestPointerLock()
      this.cameras.main.fade(1000, 0, 0, 0, true, (_: any, b: number) => {
        if (b === 1) this.scene.start('GameScene')
      })
    }

    const onClickTopButton = () => {
      onStart()
    }
    const playButton = this.add
      .bitmapText(w / 2, h - 160, 'gem', 'Play')
      .setOrigin(0.5)
      .setFontSize(64)
      .setInteractive()
      .on('pointerdown', onClickTopButton)

    const muteButton = this.add
      .sprite(w, h, 'icons', 1)
      .setOrigin(1.2, 1.2)
      .setInteractive()
      .on('pointerdown', () => {
        this.sound.mute = !this.sound.mute
        muteButton.setFrame(this.sound.mute ? 1 : 0)
      })

    // this.scene.start('GameScene')
  }
}
