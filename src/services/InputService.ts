import { THREE } from '@enable3d/phaser-extension'
import { ThreeGraphics } from '@enable3d/three-graphics'
import { DEBUG, GAME_MUSIC_VOLUME, SPEED } from '../constants'
import { MAPS } from '../maps'
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
    this.activeCamera = 0
    this.offset = new THREE.Vector3()
    const input = this.scene.input
    const { width, height } = this.scene.map!

    let zoom = 20
    if (height > 72) {
      zoom = 13.5
    } else if (height > 36) {
      zoom = 20
    } else {
      zoom = 40
    }
    const w = this.scene.cameras.main.width / zoom
    const h = this.scene.cameras.main.height / zoom
    const config = { left: w * -1, right: w, top: h, bottom: h * -1 }
    this.firstPersonCamera = this.scene.third.camera
    this.orthoCamera = this.scene.third.cameras.orthographicCamera(config)
    this.switchCamera()

    if (DEBUG) {
      input.keyboard.on('keydown-F', this.switchCamera)
      input.keyboard.on('keydown-L', this.nextLevel)
      input.keyboard.on('keydown-K', this.prevLevel)
    }
    input.keyboard.on('keydown-R', this.restartLevel)
    input.keyboard.on('keydown-SPACE', () => {
      if (
        this.scene.ui!.crumbCount === 0 ||
        this.scene.inputService?.activeCamera === 0
      )
        return
      // @ts-ignore
      const { x, z } = this.scene.player?.object.position
      this.scene.map?.addCrumb(x, z)
      this.scene.ui?.useCrumb()
      this.scene.sound.play('place')
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
    if (firstPerson) cam.position.copy(pos).add(new THREE.Vector3(0, 2, 0))

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
      if (this.keys!.a.isDown) {
        x = -SPEED * 2
      } else if (this.keys!.d.isDown) {
        x = SPEED * 2
      }
      if (this.keys!.w.isDown) {
        z = -SPEED * 2
      } else if (this.keys!.s.isDown) {
        z = SPEED * 2
      }
    }

    this.scene.player?.move(x, z)
  }

  nextLevel = () => {
    if (this.scene.level < MAPS.length - 1)
      this.scene.scene.start('GameScene', { level: this.scene.level + 1 })
  }

  restartLevel = () => {
    this.scene.scene.start('GameScene', { level: this.scene.level })
  }

  prevLevel = () => {
    if (this.scene.level > 0)
      this.scene.scene.start('GameScene', { level: this.scene.level - 1 })
  }

  switchCamera = () => {
    this.scene.tweens.add({
      targets: this.scene.music,
      volume: this.activeCamera === 1 ? 0.01 : GAME_MUSIC_VOLUME,
      duration: 300,
    })

    if (this.activeCamera === 1) {
      this.scene.ui?.hideCrumbs()
      this.pointCameraAt(0, 0)
      this.scene.third.camera = this.firstPersonCamera!
    } else {
      this.scene.ui?.showCrumbs()
      this.scene.third.camera = this.orthoCamera!
      const cam = this.scene.third.camera
      const _pos = new THREE.Vector3(
        this.scene.map!.width / 2,
        10,
        this.scene.map!.height / 2,
      )
      cam.position.copy(_pos)
      cam.lookAt(_pos.clone().add(new THREE.Vector3(0, -8, 0)))
    }
    this.scene.player!.object.visible = this.activeCamera === 0
    this.activeCamera = this.activeCamera ? 0 : 1
    if (this.scene.enemy)
      this.scene.enemy.object.visible = this.activeCamera === 0
    this.scene.map?.toggleWallColors(this.activeCamera === 1)
  }

  pointCameraAt(dx: number, dy: number, r = 8) {
    const p = this.scene.player!.object.position.clone()
    const cam = this.scene.third.camera
    cam.position.copy(p)

    theta -= dx * (0.25 / 2)
    theta %= 360
    phi += dy * (-0.25 / 2)
    phi = Math.min(15, Math.max(-15, phi))

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
