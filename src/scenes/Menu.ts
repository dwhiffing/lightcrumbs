import Phaser from 'phaser'
import { DEBUG, FADE_DURATION } from '../constants'

export default class Menu extends Phaser.Scene {
  constructor() {
    super('MenuScene')
  }

  create() {
    const w = this.cameras.main.width
    const h = this.cameras.main.height

    this.input.mouse.releasePointerLock()
    const dur = FADE_DURATION

    let title = this.add.image(w / 2, h / 2, 'title').setScale(2)
    title.setAlpha(0)
    this.tweens.add({ targets: title, alpha: 0.5, duration: 30000, delay: dur })
    this.cameras.main.fadeFrom(dur, 0, 0, 0)
    const music = this.sound.add('menu', { loop: true, volume: 0 })
    music.play()
    this.tweens.add({
      targets: music,
      volume: 0.4,
      duration: 500,
    })

    let started = false
    const onStart = () => {
      if (started) return
      started = true
      this.input.mouse.requestPointerLock()
      this.tweens.add({ targets: music, volume: 0, duration: dur })
      this.cameras.main.fade(dur, 0, 0, 0, true, (_: any, b: number) => {
        if (b === 1) {
          music.stop()
          this.scene.start('GameScene', { level: 0 })
        }
      })
    }

    const onClickTopButton = () => {
      this.sound.play('finish', { volume: 0.5 })
      onStart()
    }
    this.add
      .bitmapText(w / 2, h - 160, 'gem', 'Play')
      .setOrigin(0.5)
      .setFontSize(64)
      .setInteractive()
      .on('pointerdown', onClickTopButton)

    if (DEBUG) this.scene.start('GameScene', { level: 1 })
  }
}
