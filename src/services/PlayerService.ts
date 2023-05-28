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

    this.scene.third.load.gltf('robot').then((gltf) => {
      this.object.add(gltf.scene)
      const scale = 0.75
      this.object.scale.set(scale, scale, scale)
      // this.object.position.setY(0)

      this.object.traverse((child) => {
        if (child.isMesh) child.castShadow = child.receiveShadow = true
      })

      this.scene.third.animationMixers.add(this.object.anims.mixer)
      gltf.animations.forEach((animation) =>
        this.object!.anims.add(animation.name, animation),
      )
      this.idle()
    })
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

      this.object.anims.play('Walking')
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

      this.object.anims.play('Idle')
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
    const s = 15

    if (x < 0) {
      if (a > 110 || a < 70) v = a > 90 && a < 270 ? -s : s
    } else if (x > 0) {
      if (a > 290 || a < 250) v = a > 90 && a < 270 ? s : -s
    }

    if (z < 0) {
      if (a > 20 || a > 340) v = a < 180 ? -s : s
    } else if (z > 0) {
      if (a > 200 || a < 160) v = a < 180 ? s : -s
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
