import { THREE, ExtendedObject3D } from '@enable3d/phaser-extension'
import GameScene from '../scenes/Game'

export class EnemyService {
  scene: GameScene
  object: ExtendedObject3D
  isColliding: boolean

  constructor(scene: GameScene) {
    this.scene = scene

    const { x, z } = this.scene.map?.mapData.enemy!
    const y = 3
    const svg = this.scene.cache.html.get('star')
    const shape = this.scene.third.transform.fromSVGtoShape(svg)[0]
    // @ts-ignore
    this.object = this.scene.third.add.extrude({ shape, depth: 200 }) as any

    this.object.name = `enemy`
    this.object.scale.set(1 / 100, 1 / -100, 1 / 100)
    // @ts-ignore
    this.object.material = this.object.material.clone()
    // @ts-ignore
    this.object.material.color.setHex(0xff0000)
    this.object.position.set(x, y, z)
    this.object.rotation.set(0, Math.PI / 2, 0)
    this.scene.third.physics.add.existing(this.object, {
      shape: 'box',
      ignoreScale: true,
      width: 0.5,
      height: 3,
      depth: 0.5,
    })

    this.object.body.setLinearFactor(1, 1, 1)
    this.object.body.setAngularFactor(0, 0, 0)
    this.object.body.setFriction(0)

    const sensor = this.scene.third.physics.add.cylinder(
      {
        x: x + 1,
        y: y,
        z: z,
        height: 2,
        radiusTop: 1.3,
        radiusBottom: 1.3,
        radiusBody: 1.3,
        collisionFlags: 1,
        mass: 0.001,
      },
      { lambert: { color: 0xff00ff, transparent: true, opacity: 0.2 } },
    )
    sensor.castShadow = sensor.receiveShadow = false
    sensor.body.setCollisionFlags(4)

    this.scene.third.physics.add.constraints.lock(this.object.body, sensor.body)

    this.isColliding = false
    sensor.body.on.collision((otherObject, event) => {
      if (otherObject.name.includes('wall')) {
        this.isColliding = true
        this.object.body.setAngularVelocityY(1)
      }
      if (event === 'end') {
        this.isColliding = false
        this.object.body.setAngularVelocityY(0)
      }
    })
  }

  update() {
    const speed = 4
    const rotation = this.object.getWorldDirection(
      new THREE.Vector3()?.setFromEuler?.(this.object.rotation),
    )
    const theta = Math.atan2(rotation.x, rotation.z)

    const x = Math.sin(theta) * speed,
      y = this.object.body.velocity.y,
      z = Math.cos(theta) * speed
    if (this.isColliding) {
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
