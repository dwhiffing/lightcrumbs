import { THREE } from '@enable3d/phaser-extension'
import { ThreeGraphics } from '@enable3d/three-graphics'
import { SPEED, ZOOM } from '../constants'
import GameScene from '../scenes/Game'

export class InputService {
  activeCamera: number
  offset: THREE.Vector3
  firstPersonCamera?: ThreeGraphics['camera']
  orthoCamera?: ThreeGraphics['camera']
  keys?: Record<string, Phaser.Input.Keyboard.Key>
  scene: GameScene

  constructor(scene: GameScene) {
    this.scene = scene
    this.activeCamera = 1
    this.offset = new THREE.Vector3()
    const input = this.scene.input

    // TODO: set zoom based on size of map
    // when ortho cam, stay centered on map instead of player
    const w = this.scene.cameras.main.width / ZOOM
    const h = this.scene.cameras.main.height / ZOOM
    const config = { left: w / -2, right: w / 2, top: h / 2, bottom: h / -2 }
    this.firstPersonCamera = this.scene.third.camera
    this.orthoCamera = this.scene.third.cameras.orthographicCamera(config)
    this.scene.third.camera = this.orthoCamera!

    input.keyboard.on('keydown-F', this.switchCamera)

    input.keyboard.on('keydown-SPACE', () => {
      // @ts-ignore
      const { x, z } = this.scene.player?.object.position
      this.scene.map?.addStar(x, z)
    })

    input.on('pointerdown', () => input.mouse.requestPointerLock())
    input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!input.mouse.locked || !this.scene.player || this.activeCamera === 1)
        return

      this.pointCameraAt(pointer.movementX, pointer.movementY)
    })

    this.keys = {
      w: input.keyboard.addKey('w'),
      a: input.keyboard.addKey('a'),
      s: input.keyboard.addKey('s'),
      d: input.keyboard.addKey('d'),
    }
  }

  update() {
    const cam = this.scene.third.camera
    const pos = this.scene.player!.object.position
    const firstPerson = this.activeCamera === 0
    const _pos = new THREE.Vector3(0, firstPerson ? 2 : 10, 0)
    cam.position.copy(pos).add(_pos)

    let x = 0
    let z = 0

    const rotation = cam.getWorldDirection(new THREE.Vector3())

    if (firstPerson) {
      const _theta = Math.atan2(rotation.x, rotation.z)
      if (this.keys!.w.isDown) {
        x = Math.sin(_theta) * SPEED
        z = Math.cos(_theta) * SPEED
      } else if (this.keys!.s.isDown) {
        x = -(Math.sin(_theta) * SPEED)
        z = -(Math.cos(_theta) * SPEED)
      }

      if (this.keys!.a.isDown) {
        x = Math.sin(_theta + Math.PI * 0.5) * SPEED
        z = Math.cos(_theta + Math.PI * 0.5) * SPEED
      } else if (this.keys!.d.isDown) {
        x = Math.sin(_theta - Math.PI * 0.5) * SPEED
        z = Math.cos(_theta - Math.PI * 0.5) * SPEED
      }
    } else {
      cam.lookAt(pos.clone().add(new THREE.Vector3(0, 2, 0)))
      if (this.keys!.a.isDown) {
        x = -SPEED
      } else if (this.keys!.d.isDown) {
        x = SPEED
      }
      if (this.keys!.w.isDown) {
        z = -SPEED
      } else if (this.keys!.s.isDown) {
        z = SPEED
      }
    }

    this.scene.player?.move(x, z)
  }

  switchCamera = () => {
    if (this.activeCamera === 1) {
      this.pointCameraAt(0, 0)
      this.scene.third.camera = this.firstPersonCamera!
    } else {
      this.scene.third.camera = this.orthoCamera!
    }
    this.scene.player!.object.visible = this.activeCamera === 0
    this.activeCamera = this.activeCamera ? 0 : 1
    this.scene.map?.toggleWallColors()
  }

  pointCameraAt(dx: number, dy: number, r = 8) {
    const p = this.scene.player!.object.position.clone()
    const cam = this.scene.third.camera
    cam.position.copy(p)

    theta -= dx * (0.25 / 2)
    theta %= 360
    phi += dy * (-0.25 / 2)
    phi = Math.min(85, Math.max(-85, phi))

    const lookAt = new THREE.Vector3()
    lookAt.x =
      p.x +
      r * Math.sin((theta * Math.PI) / 180) * Math.cos((phi * Math.PI) / 180)
    lookAt.y = p.y + r * Math.sin((phi * Math.PI) / 180)
    lookAt.z =
      p.z +
      r * Math.cos((theta * Math.PI) / 180) * Math.cos((phi * Math.PI) / 180)

    cam.updateMatrix()
    cam.lookAt(lookAt)
  }
}

let theta = 0
let phi = 0
