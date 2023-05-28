import Phaser from 'phaser'
import { DEBUG, FADE_DURATION } from '../constants'

export default class Menu extends Phaser.Scene {
  win: boolean
  constructor() {
    super('MenuScene')
    this.win = false
  }

  init(opts: any) {
    this.win = !!opts.win
  }

  create() {
    const w = this.cameras.main.width
    const h = this.cameras.main.height
    let helpTextIndex = 0

    this.input.mouse.releasePointerLock()
    const dur = FADE_DURATION

    let title = this.add.image(w / 2, h / 2 - 120, 'title').setScale(2)
    title.setAlpha(0)
    this.tweens.add({ targets: title, alpha: 0.6, duration: 15000, delay: dur })
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
      this.sound.play('finish', { volume: 0.5 })
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
      onStart()
    }

    const onClickBottomButton = () => {
      if (helpTextIndex < HELP_TEXT.length) {
        playButton.text = ''
        helpButton.text = 'Next'
        helpText.text = HELP_TEXT[helpTextIndex++]
        this.sound.play('scale', { volume: 0.2, rate: 2.2 })
        if (helpTextIndex === HELP_TEXT.length) helpButton.text = 'Start'
      } else {
        onStart()
      }
    }
    const playButton = this.add
      .bitmapText(w / 2, h - 160, 'gem', 'Play')
      .setOrigin(0.5)
      .setFontSize(64)
      .setInteractive()
      .on('pointerdown', onClickTopButton)

    const helpButton = this.add
      .bitmapText(w / 2, h - 80, 'gem', 'Help')
      .setOrigin(0.5)
      .setFontSize(64)
      .setInteractive()
      .on('pointerdown', onClickBottomButton)

    const helpText = this.add
      .bitmapText(w / 2, h / 2 + 100, 'gem', this.win ? 'You Win!' : '')
      .setOrigin(0.5)
      .setFontSize(60)
      .setCenterAlign()

    if (DEBUG) this.scene.start('GameScene', { level: 0 })
  }
}

const HELP_TEXT = [
  `Navigate to the exit
with your drone using
WASD keys.`,
  `Hit SPACE to leave
lightcrumbs behind and
show a path through.`,
  `Once you exit with
the drone, you will
follow it.`,
  `It is pitch black
in there, so you must
use lightcrumbs to see.`,
  `Good luck!`,
  `Concept & Code: Dan Whiffing
Sounds: pixabay.com
Music: purpleplanet.com`,
]
