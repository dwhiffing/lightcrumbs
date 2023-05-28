import { THREE, ExtendedObject3D } from '@enable3d/phaser-extension'
import GameScene from '../scenes/Game'

export class PlayerService {
  scene: GameScene
  object: ExtendedObject3D
  stepSound: Phaser.Sound.BaseSound

  constructor(scene: GameScene) {
    this.scene = scene
    const { x, z } = this.scene.map?.mapData.start!
    this.object = new ExtendedObject3D()
    this.object.position.set(x, 0, z)
    this.object.name = 'player'
    this.scene.third.add.existing(this.object)
    this.scene.third.physics.add.existing(this.object, {
      shape: 'cylinder',
      ignoreScale: true,
      radius: 1.5,
      height: 2,
      offset: { y: -0.625 },
      collisionGroup: 4,
    })
    this.object.body.setLinearFactor(1, 1, 1)
    this.object.body.setAngularFactor(0, 0, 0)
    this.object.body.setFriction(0)

    this.stepSound = this.scene.sound.add('steps', { loop: true })
    this.stepSound.play()
    this.stepSound.pause()

    const body = this.scene.third.add.sphere(
      { radius: 1.1 },
      { phong: { transparent: false, color: 0x111166 } },
    )
    const eye1 = this.scene.third.add.sphere(
      { radius: 0.25, x: 0.4, z: 1 },
      { phong: { transparent: false, color: 0xffd851 } },
    )
    const eye2 = this.scene.third.add.sphere(
      { radius: 0.25, x: -0.4, z: 1 },
      { phong: { transparent: false, color: 0xffd851 } },
    )

    this.object.add(body)
    this.object.add(eye1)
    this.object.add(eye2)

    this.idle()
  }

  walk() {
    if (this.object.anims.current !== 'Walking') {
      if (this.scene.inputService?.activeCamera === 0) {
        this.scene.tweens.add({
          targets: this.stepSound,
          volume: 0.5,
          duration: 300,
        })
        this.stepSound.resume()
      }
    }
  }

  idle() {
    if (this.object.anims.current !== 'Idle') {
      this.scene.tweens.add({
        targets: this.stepSound,
        volume: 0,
        duration: 300,
        onComplete: () => this.stepSound.pause(),
      })
    }
  }

  teleport(x: number, z: number) {
    this.object.body.setCollisionFlags(2)

    this.object.position.set(x, 0, z)
    this.object.body.needUpdate = true

    this.object.body.once.update(() => {
      this.object.body.setCollisionFlags(0)
    })
  }

  move(x: number, z: number) {
    if (this.scene.finished) {
      this.idle()
      this.object.body?.setVelocity(0, 0, 0)
      return
    }
    const a = this.object.world.theta * (180 / Math.PI) + 180
    let v = 0
    const s = 4

    if (x < 0) {
      if (a > 95 || a < 85) v = a > 90 && a < 270 ? -s : s
    } else if (x > 0) {
      if (a > 275 || a < 265) v = a > 90 && a < 270 ? s : -s
    }

    if (z < 0) {
      if (a > 5 || a > 355) v = a < 180 ? -s : s
    } else if (z > 0) {
      if (a > 185 || a < 175) v = a < 180 ? s : -s
    }

    if (x !== 0 || z !== 0) {
      this.walk()
    } else {
      this.idle()
    }

    if (this.scene.inputService?.activeCamera === 0) v = 0

    this.object.body?.setVelocity(x, 0, z)
    this.object.body?.setAngularVelocityY(v)
  }
}
