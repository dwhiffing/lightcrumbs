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
  finished: boolean

  constructor() {
    super({ key: 'GameScene' })
    this.finished = false
  }

  init() {
    this.accessThirdDimension({ gravity: { x: 0, y: -20, z: 0 } })
    this.third.load.preload('sky', '/assets/sky-black.png')
    this.third.load.preload('robot', '/assets/robot.glb')
  }

  async create() {
    this.finished = false
    this.cameras.main.fadeFrom(1000, 0, 0, 0)
    const { lights } = await this.third.warpSpeed('light')
    if (lights) {
      lights.hemisphereLight.intensity = 0
      lights.ambientLight.intensity = 1
      lights.directionalLight.intensity = 0
    }

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
      if (
        /star/.test(otherObject.name) &&
        this.inputService?.activeCamera === 0
      ) {
        if (!otherObject.userData.dead) {
          otherObject.userData.dead = true
          otherObject.visible = false
          this.ui!.setScore(10)
        }
      }
      if (/exit/.test(otherObject.name) && !this.finished) {
        this.finished = true
        if (this.inputService?.activeCamera === 0) {
          this.cameras.main.fade(1000, 0, 0, 0, true, (_: any, b: number) => {
            if (b === 1) {
              document.getElementById('enable3d-three-canvas')?.remove()
              this.scene.start('MenuScene')
            }
          })
        } else {
          const { x, z } = this.map?.mapData.start!
          this.cameras.main.fade(1000, 0, 0, 0, true, (_: any, b: number) => {
            if (b === 1) {
              this.player?.teleport(x, z)
              setTimeout(() => {
                this.finished = false
                this.cameras.main.fadeFrom(1000, 0, 0, 0)
                this.inputService?.switchCamera()
              }, 50)
            }
          })
        }
      }
    })
  }

  update() {
    this.map?.update()
    this.inputService?.update()
  }
}
