import { THREE, ExtendedObject3D } from '@enable3d/phaser-extension'
import GameScene from '../scenes/Game'

export class PlayerService {
  scene: GameScene
  object: ExtendedObject3D

  constructor(scene: GameScene) {
    this.scene = scene
    const x = this.scene.map?.mapData.start.x
    const z = this.scene.map?.mapData.start.z
    this.object = new ExtendedObject3D()
    this.object.position.set(x, 0, z)
    this.scene.third.add.existing(this.object)
    this.scene.third.physics.add.existing(this.object, {
      shape: 'box',
      ignoreScale: true,
      width: 0.5,
      height: 2,
      depth: 0.5,
      offset: { y: -0.625 },
    })
    this.object.body.setLinearFactor(1, 1, 1)
    this.object.body.setAngularFactor(0, 0, 0)
    this.object.body.setFriction(0)

    this.scene.third.load.gltf('/assets/robot.glb').then((gltf) => {
      this.object.add(gltf.scene)
      const scale = 1 / 3
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
    if (this.object.anims.current !== 'Walking')
      this.object.anims.play('Walking')
  }

  idle() {
    if (this.object.anims.current !== 'Idle') this.object.anims.play('Idle')
  }

  move(x: number, z: number) {
    const a = this.object.world.theta * (180 / Math.PI) + 180
    let v = 0

    if (x < 0) {
      if (a > 100 || a < 80) v = a > 90 && a < 270 ? -10 : 10
    } else if (x > 0) {
      if (a > 280 || a < 260) v = a > 90 && a < 270 ? 10 : -10
    }

    if (z < 0) {
      if (a > 10 || a > 350) v = a < 180 ? -10 : 10
    } else if (z > 0) {
      if (a > 190 || a < 170) v = a < 180 ? 10 : -10
    }

    if (x !== 0 || z !== 0) {
      this.walk()
    } else {
      this.idle()
    }

    this.object.body?.setVelocity(x, 0, z)
    this.object.body?.setAngularVelocityY(v)
  }
}
