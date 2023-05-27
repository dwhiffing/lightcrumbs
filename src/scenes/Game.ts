import { Scene3D, THREE } from '@enable3d/phaser-extension'
import { ThreeGraphics } from '@enable3d/three-graphics'
import { MapService } from './MapService'
import { PlayerService } from './PlayerService'

// GameScene (camera)
// UIService (score)
// Map (current level, placing walls/objects, clearing level)
// Player (input)

export default class GameScene extends Scene3D {
  score: number
  activeCamera: number
  map?: MapService
  player?: PlayerService
  firstPersonCamera?: ThreeGraphics['camera']
  orthoCamera?: ThreeGraphics['camera']
  scoreText?: Phaser.GameObjects.Text
  cameraOffset: THREE.Vector3
  keys?: Record<string, Phaser.Input.Keyboard.Key>

  constructor() {
    super({ key: 'GameScene' })
    this.score = 0
    this.activeCamera = 0
    this.cameraOffset = new THREE.Vector3()
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

    const zoom = 70
    const w = this.cameras.main.width / zoom
    const h = this.cameras.main.height / zoom
    const config = { left: w / -2, right: w / 2, top: h / 2, bottom: h / -2 }
    this.firstPersonCamera = this.third.camera
    this.orthoCamera = this.third.cameras.orthographicCamera(config)

    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.activeCamera === 0) {
        this.third.camera = this.orthoCamera!
        this.activeCamera = 1
        this.player!.object.visible = true
      } else {
        this.third.camera = this.firstPersonCamera!
        this.activeCamera = 0
        this.player!.object.visible = false
      }
    })

    // add background image
    this.third.load.texture('sky').then((sky) => {
      this.third.scene.background = sky
    })

    // add score text
    this.scoreText = this.add
      .text(32, this.cameras.main.height - 32, 'score: 0', { fontSize: '32px' })
      .setOrigin(0, 1)
      .setDepth(1)

    this.map = new MapService(this)
    this.player = new PlayerService(this)

    // this.third.physics.debug.enable()
    const r = 8
    let theta = 0
    let phi = 0

    this.input.on('pointerdown', () => this.input.mouse.requestPointerLock())
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.input.mouse.locked || !this.player) return

      const deltaX = pointer.movementX
      const deltaY = pointer.movementY
      const center = this.player.object.position.clone()
      this.third.camera.position.copy(center)

      theta -= deltaX * (0.25 / 2)
      theta %= 360
      phi += deltaY * (-0.25 / 2)
      phi = Math.min(85, Math.max(-85, phi))

      const lookAt = new THREE.Vector3()
      lookAt.x =
        center.x +
        r * Math.sin((theta * Math.PI) / 180) * Math.cos((phi * Math.PI) / 180)
      lookAt.y = center.y + r * Math.sin((phi * Math.PI) / 180)
      lookAt.z =
        center.z +
        r * Math.cos((theta * Math.PI) / 180) * Math.cos((phi * Math.PI) / 180)

      this.third.camera.updateMatrix()
      this.third.camera.lookAt(lookAt)
    })

    // add keys
    this.keys = {
      w: this.input.keyboard.addKey('w'),
      a: this.input.keyboard.addKey('a'),
      s: this.input.keyboard.addKey('s'),
      d: this.input.keyboard.addKey('d'),
      space: this.input.keyboard.addKey('space'),
    }
  }

  update() {
    this.map?.update()
    this.player?.update()
  }
}
