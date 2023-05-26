export default class UIService {
  scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    this.scene = scene

    this.scene.input.keyboard.on('keydown-F', () => {
      this.scene.scale.startFullscreen()
    })

    const muteButton = this.scene.add
      .sprite(
        this.scene.cameras.main.width,
        this.scene.cameras.main.height,
        'icons',
        this.scene.sound.mute ? 0 : 1,
      )
      .setOrigin(1.2, 1.2)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.sound.mute = !this.scene.sound.mute
        muteButton.setFrame(this.scene.sound.mute ? 1 : 0)
      })
  }

  destroy() {}
}
