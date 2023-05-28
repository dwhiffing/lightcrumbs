import GameScene from '../scenes/Game'

export class UIService {
  scene: GameScene
  crumbs: Phaser.GameObjects.Image[]
  crumbCount: number
  constructor(scene: GameScene) {
    this.scene = scene

    const h = this.scene.cameras.main.height
    // this.scene.input.keyboard.on('keydown-F', () => {
    //   this.scene.scale.startFullscreen()
    // })

    this.crumbs = []
    this.crumbCount = 0
    for (let i = 0; i < 10; i++) {
      this.crumbs.push(
        this.scene.add
          .image(10 + 60 * i, h - 10, 'star-ui')
          .setScale(0.2)
          .setOrigin(0, 1)
          .setAlpha(0),
      )
    }
  }

  showCrumbs() {
    this.crumbs.forEach((c, i) => c.setAlpha(i < this.crumbCount ? 1 : 0))
  }

  hideCrumbs() {
    this.crumbs.forEach((c, i) => c.setAlpha(0))
  }

  setCrumbs(num: number) {
    this.crumbCount = num
    this.crumbs.forEach((c, i) => c.setAlpha(i < num ? 1 : 0))
  }

  useCrumb() {
    this.setCrumbs(this.crumbCount - 1)
  }

  update() {}
}
