import { Scene3D } from '@enable3d/phaser-extension'
import { MapService } from '../services/MapService'
import { PlayerService } from '../services/PlayerService'
import { UIService } from '../services/UIService'
import { InputService } from '../services/InputService'

export default class GameScene extends Scene3D {
  map?: MapService
  player?: PlayerService
  ui?: UIService
  inputService?: InputService

  constructor() {
    super({ key: 'GameScene' })
  }

  preload() {
    this.third.load.preload('sky', '/assets/sky.png')
    this.load.html('star', '/assets/star.svg')
  }

  init() {
    this.accessThirdDimension({ gravity: { x: 0, y: -20, z: 0 } })
  }

  async create() {
    await this.third.warpSpeed('-ground', '-sky')

    this.third.load.texture('sky').then((sky) => {
      this.third.scene.background = sky
    })

    this.map = new MapService(this)
    this.map.loadLevel()
    this.player = new PlayerService(this)
    this.ui = new UIService(this)
    this.inputService = new InputService(this)
    // this.third.physics.debug.enable()

    // check player overlap with star
    this.player.object.body.on.collision((otherObject, event) => {
      if (/star/.test(otherObject.name)) {
        if (!otherObject.userData.dead) {
          otherObject.userData.dead = true
          otherObject.visible = false
          this.ui!.setScore(10)
        }
      }
    })
  }

  update() {
    this.map?.update()
    this.inputService?.update()
  }
}
