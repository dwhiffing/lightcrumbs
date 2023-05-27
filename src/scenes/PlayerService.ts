import { THREE, ExtendedObject3D } from '@enable3d/phaser-extension'
import GameScene from './Game'

export class PlayerService {
  scene: GameScene
  object: ExtendedObject3D

  constructor(scene: GameScene) {
    this.scene = scene
    this.object = new ExtendedObject3D()
    this.scene.third.load.gltf('/assets/robot.glb').then((gltf) => {
      this.object.add(gltf.scene)
      const scale = 1 / 3
      this.object.scale.set(scale, scale, scale)
      this.object.position.setY(0)
      this.object.visible = false

      this.object.traverse((child) => {
        if (child.isMesh) child.castShadow = child.receiveShadow = true
      })

      this.scene.third.animationMixers.add(this.object!.anims.mixer)
      gltf.animations.forEach((animation) =>
        this.object!.anims.add(animation.name, animation),
      )
      this.object.anims.play('Idle')

      this.scene.third.add.existing(this.object)
      this.scene.third.physics.add.existing(this.object, {
        shape: 'box',
        ignoreScale: true,
        width: 0.5,
        height: 1.25,
        depth: 0.5,
        offset: { y: -0.625 },
      })
      this.object.body.setLinearFactor(1, 1, 1)
      this.object.body.setAngularFactor(0, 0, 0)
      this.object.body.setFriction(0)

      this.scene.third.camera.lookAt(this.object.position)

      // add a sensor
      const sensor = new ExtendedObject3D()
      sensor.position.setY(-0.625)
      this.scene.third.physics.add.existing(sensor, {
        mass: 1e-8,
        shape: 'box',
        width: 0.2,
        height: 0.2,
        depth: 0.2,
      })
      sensor.body.setCollisionFlags(4)

      // connect sensor to player
      this.scene.third.physics.add.constraints.lock(
        this.object.body,
        sensor.body,
      )

      // check player overlap with star
      this.object.body.on.collision((otherObject, event) => {
        if (/star/.test(otherObject.name)) {
          if (!otherObject.userData.dead) {
            otherObject.userData.dead = true
            otherObject.visible = false
            this.scene.score += 10
            this.scene.scoreText!.setText(`score: ${this.scene.score}`)
          }
        }
      })
    })
  }

  walk() {
    if (this.object.anims.current !== 'Walking')
      this.object.anims.play('Walking')
  }

  idle() {
    if (this.object.anims.current !== 'Idle') this.object.anims.play('Idle')
  }

  update() {
    const body = this.object.body
    if (!body) return

    const firstPerson = this.scene.activeCamera === 0

    this.scene.cameraOffset.lerp(
      new THREE.Vector3(0, firstPerson ? 1 : 10, 0),
      0.2,
    )
    const { x, y, z } = this.scene.cameraOffset
    this.scene.third.camera.position
      .copy(this.object.position)
      .add(new THREE.Vector3(x, y, z))

    if (!firstPerson) {
      this.scene.third.camera.lookAt(
        this.object.position.clone().add(new THREE.Vector3(0, 2, 0)),
      )
    }

    // get rotation of player
    const speed = 7
    const rotation = this.scene.third.camera.getWorldDirection(
      new THREE.Vector3(),
    )
    const _theta = Math.atan2(rotation.x, rotation.z)
    const theta = this.object.world.theta
    const halfPi = Math.PI * 0.5

    body.setAngularVelocityY(0)
    body.setVelocity(0, 0, 0)

    if (!firstPerson) {
      this.idle()
      if (this.scene.keys!.a.isDown) {
        this.walk()
        body.setVelocityX(-speed)
        if (theta > -(Math.PI / 2)) body.setAngularVelocityY(-10)
      } else if (this.scene.keys!.d.isDown) {
        this.walk()
        body.setVelocityX(speed)
        if (theta < Math.PI / 2) body.setAngularVelocityY(10)
      }
      if (this.scene.keys!.w.isDown) {
        this.walk()
        body.setVelocityZ(-speed)
        if (theta < Math.PI / 1.1) body.setAngularVelocityY(10)
      } else if (this.scene.keys!.s.isDown) {
        this.walk()
        body.setVelocityZ(speed)
        if (theta >= 0) body.setAngularVelocityY(-10)
      }
    } else {
      if (this.scene.keys!.w.isDown) {
        body.setVelocityX(Math.sin(_theta) * speed)
        body.setVelocityZ(Math.cos(_theta) * speed)
      } else if (this.scene.keys!.s.isDown) {
        body.setVelocityX(-(Math.sin(_theta) * speed))
        body.setVelocityZ(-(Math.cos(_theta) * speed))
      }

      if (this.scene.keys!.a.isDown) {
        body.setVelocityX(Math.sin(_theta + halfPi) * speed)
        body.setVelocityZ(Math.cos(_theta + halfPi) * speed)
      } else if (this.scene.keys!.d.isDown) {
        body.setVelocityX(Math.sin(_theta - halfPi) * speed)
        body.setVelocityZ(Math.cos(_theta - halfPi) * speed)
      }
    }
  }
}
