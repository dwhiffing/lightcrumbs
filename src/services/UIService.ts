import GameScene from '../scenes/Game'

export class UIService {
  scene: GameScene
  scoreText: Phaser.GameObjects.Text
  score: number

  constructor(scene: GameScene) {
    this.scene = scene
    this.score = 0

    // this.scene.input.keyboard.on('keydown-F', () => {
    //   this.scene.scale.startFullscreen()
    // })

    this.scoreText = this.scene.add
      .text(32, this.scene.cameras.main.height - 32, '', {
        fontSize: '32px',
      })
      .setOrigin(0, 1)
      .setDepth(1)

    // const muteButton = this.scene.add
    //   .sprite(
    //     this.scene.cameras.main.width,
    //     this.scene.cameras.main.height,
    //     'icons',
    //     this.scene.sound.mute ? 0 : 1,
    //   )
    //   .setOrigin(1.2, 1.2)
    //   .setInteractive()
    //   .on('pointerdown', () => {
    //     this.scene.sound.mute = !this.scene.sound.mute
    //     muteButton.setFrame(this.scene.sound.mute ? 1 : 0)
    //   })
  }

  setScore(score: number) {
    this.score += score
    // this.scoreText.setText(`score: ${this.score}`)
  }

  update() {}
}
