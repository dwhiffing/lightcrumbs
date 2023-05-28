import { THREE, ExtendedObject3D } from '@enable3d/phaser-extension'
import { DEBUG } from '../constants'
import GameScene from '../scenes/Game'

let listener: THREE.AudioListener
let sound: THREE.PositionalAudio
export class EnemyService {
  scene: GameScene
  object: ExtendedObject3D
  isColliding: boolean
  isEating: boolean
  isTurning: boolean
  isChasing: boolean

  constructor(scene: GameScene) {
    this.scene = scene

    const { x, z } = this.scene.map?.mapData.enemy!
    const y = 3
    this.isEating = false
    this.isTurning = false
    this.isChasing = false
    this.object = this.scene.third.add.box(
      {
        width: 2.5,
        height: 4,
        depth: 2,
      },
      { phong: { transparent: false, color: DEBUG ? 0x440000 : 0x000000 } },
    )

    const eye1 = this.scene.third.add.sphere(
      { radius: 0.1, x: 0.4, z: 1, y: 1.3 },
      { phong: { transparent: false, color: 0xff0000 } },
    )
    const eye2 = this.scene.third.add.sphere(
      { radius: 0.1, x: -0.4, z: 1, y: 1.3 },
      { phong: { transparent: false, color: 0xff0000 } },
    )

    this.object.add(eye1)
    this.object.add(eye2)

    this.object.name = `enemy`
    this.object.position.set(x, y, z)
    const left = false
    this.object.rotation.set(0, left ? Math.PI / -2 : Math.PI / 2, 0)
    this.scene.third.physics.add.existing(this.object, {
      shape: 'box',
      ignoreScale: true,
      width: 1.5,
      height: 3,
      depth: 1.5,
      mass: 500,
      collisionGroup: 2,
      collisionMask: 3,
    })

    this.object.body.setLinearFactor(1, 1, 1)
    this.object.body.setAngularFactor(0, 0, 0)
    this.object.body.setFriction(10)

    const sensorConfigBase = {
      y: y,
      z: z,
      height: 2,
      radiusTop: 1.1,
      radiusBottom: 1.1,
      radiusBody: 1.1,
      collisionFlags: 1,
      mass: 0.001,
    }

    const sensor = this.scene.third.physics.add.cylinder(
      {
        ...sensorConfigBase,
        x: x + (left ? -1 : 1),
      },
      { lambert: { color: 0xff00ff, transparent: true, opacity: 0 } },
    )
    const backSensor = this.scene.third.physics.add.cylinder(
      {
        ...sensorConfigBase,
        x: x + (left ? 3 : -3),
        radiusTop: 3,
        radiusBottom: 3,
        radiusBody: 3,
      },
      { lambert: { color: 0xff0000, transparent: true, opacity: 0 } },
    )
    sensor.castShadow = sensor.receiveShadow = false
    backSensor.castShadow = backSensor.receiveShadow = false
    sensor.body.setCollisionFlags(4)
    backSensor.body.setCollisionFlags(4)

    this.scene.third.physics.add.constraints.lock(this.object.body, sensor.body)

    this.scene.third.physics.add.constraints.lock(
      this.object.body,
      backSensor.body,
    )

    if (!sound) {
      listener = new THREE.AudioListener()
      sound = new THREE.PositionalAudio(listener)
      sound.setRefDistance(3)
      sound.setRolloffFactor(7)
      sound.loop = true
      sound.play()
    }
    this.isColliding = false
    sensor.body.on.collision((otherObject, event) => {
      if (otherObject.name.includes('player')) this.eat()
      if (otherObject.name.includes('wall') && !this.isTurning) {
        this.isColliding = true
        this.object.body.setAngularVelocityY(1)
      }
      if (event === 'end' && !this.isTurning) {
        this.isColliding = false
        this.object.body.setAngularVelocityY(0)
      }
    })

    backSensor.body.on.collision((otherObject) => {
      if (this.scene.inputService?.activeCamera !== 0) return
      if (otherObject.name.includes('player') && !this.isTurning) {
        this.isTurning = true
        this.object.body.setAngularVelocityY(12)
        this.scene.time.delayedCall(250, () => {
          this.isChasing = true
          this.isTurning = false
          this.object.lookAt(this.scene.player!.object.position.clone())
          this.scene.time.delayedCall(3000, () => {
            this.isChasing = false
          })
          this.object.body.setAngularVelocityY(0)
        })
      }
    })

    this.scene.third.camera.add(listener)
    const audioLoader = new THREE.AudioLoader()
    audioLoader.load('assets/monster.mp3', function (buffer) {
      sound.setBuffer(buffer)
    })

    this.object.add(sound)
  }

  eat() {
    if (!this.isEating) {
      if (this.scene.inputService?.activeCamera === 0) {
        this.isEating = true
        this.scene.sound.play('growl')
        this.scene.time.delayedCall(5000, () => {
          this.scene.scene.start('GameScene', { level: this.scene.level })
        })
      }
    }
  }

  mute() {
    sound.stop()
  }

  unmute() {
    sound.play()
  }

  update() {
    if (this.scene.inputService?.activeCamera === 1) return
    const speed = this.isTurning ? 0 : this.isChasing ? 6 : 4
    const rotation = this.object.getWorldDirection(
      new THREE.Vector3()?.setFromEuler?.(this.object.rotation),
    )
    const theta = Math.atan2(rotation.x, rotation.z)

    const x = Math.sin(theta) * speed,
      y = this.object.body.velocity.y,
      z = Math.cos(theta) * speed
    if (this.isColliding || this.isEating) {
      this.object.body.setVelocity(0, 0, 0)
    } else {
      this.object.body.setVelocity(x, y, z)
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
}
