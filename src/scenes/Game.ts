import { Scene3D, THREE, ExtendedObject3D } from '@enable3d/phaser-extension'
import { ThreeGraphics } from '@enable3d/three-graphics'

export default class GameScene extends Scene3D {
  score: number
  activeCamera: number
  stars: ExtendedObject3D[]
  firstPersonCamera?: ThreeGraphics['camera']
  orthoCamera?: ThreeGraphics['camera']
  scoreText?: Phaser.GameObjects.Text
  player?: ExtendedObject3D
  cameraOffset: THREE.Vector3
  keys?: Record<string, Phaser.Input.Keyboard.Key>

  constructor() {
    super({ key: 'GameScene' })
    this.stars = []
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
    const { lights } = await this.third.warpSpeed('-ground', '-sky')

    const zoom = 70
    const w = this.cameras.main.width / zoom
    const h = this.cameras.main.height / zoom
    const config = { left: w / -2, right: w / 2, top: h / 2, bottom: h / -2 }
    this.firstPersonCamera = this.third.camera
    this.orthoCamera = this.third.cameras.orthographicCamera(config)

    this.input.keyboard.on('keydown-F', () => {
      if (this.activeCamera === 0) {
        this.third.camera = this.orthoCamera!
        this.activeCamera = 1
      } else {
        this.third.camera = this.firstPersonCamera!
        this.activeCamera = 0
      }
    })

    // add background image
    this.third.load.texture('sky').then((sky) => {
      sky.encoding = THREE.LinearEncoding
      sky.needsUpdate = true
      this.third.scene.background = sky
    })

    // add score text
    this.scoreText = this.add
      .text(32, this.cameras.main.height - 32, 'score: 0', { fontSize: '32px' })
      .setOrigin(0, 1)
      .setDepth(1)

    // add platforms
    const platformMaterial = { phong: { transparent: true, color: 0x21572f } }
    this.third.physics.add.box(
      {
        name: 'platform-ground',
        y: -2,
        width: 30,
        depth: 10,
        height: 2,
        mass: 0,
      },
      platformMaterial,
    )

    // add stars
    const svg = this.cache.html.get('star')
    const starShape = this.third.transform.fromSVGtoShape(svg)
    const starPositions = [
      { x: -4, y: 0 },
      { x: -2, y: 0 },
    ]
    starPositions.forEach((pos, i) => {
      const star = this.third.add.extrude({
        shape: starShape[0],
        // @ts-ignore
        depth: 200,
      }) as any
      star.name = `star-${i}`
      star.scale.set(1 / 500, 1 / -500, 1 / 500)
      star.material.color.setHex(0xffd851)
      star.position.set(pos.x, pos.y, 0)
      this.third.physics.add.existing(star, {
        shape: 'box',
        ignoreScale: true,
        width: 0.5,
        height: 0.5,
        depth: 0.5,
      })
      star.body.setCollisionFlags(6)
      this.stars.push(star)
    })

    // add player
    this.third.load.gltf('/assets/robot.glb').then((gltf) => {
      this.player = new ExtendedObject3D()
      this.player.add(gltf.scene)
      const scale = 1 / 3
      this.player.scale.set(scale, scale, scale)
      this.player.position.setY(0)

      this.player.traverse((child) => {
        if (child.isMesh) child.castShadow = child.receiveShadow = true
      })

      this.third.animationMixers.add(this.player!.anims.mixer)
      gltf.animations.forEach((animation) =>
        this.player!.anims.add(animation.name, animation),
      )
      this.player.anims.play('Idle')

      this.third.add.existing(this.player)
      this.third.physics.add.existing(this.player, {
        shape: 'box',
        ignoreScale: true,
        width: 0.5,
        height: 1.25,
        depth: 0.5,
        offset: { y: -0.625 },
      })
      this.player.body.setLinearFactor(1, 1, 1)
      this.player.body.setAngularFactor(0, 0, 0)
      this.player.body.setFriction(0)

      this.third.camera.lookAt(this.player.position)

      // add a sensor
      const sensor = new ExtendedObject3D()
      sensor.position.setY(-0.625)
      this.third.physics.add.existing(sensor, {
        mass: 1e-8,
        shape: 'box',
        width: 0.2,
        height: 0.2,
        depth: 0.2,
      })
      sensor.body.setCollisionFlags(4)

      // connect sensor to player
      this.third.physics.add.constraints.lock(this.player.body, sensor.body)

      // check player overlap with star
      this.player.body.on.collision((otherObject, event) => {
        if (/star/.test(otherObject.name)) {
          if (!otherObject.userData.dead) {
            otherObject.userData.dead = true
            otherObject.visible = false
            this.score += 10
            this.scoreText!.setText(`score: ${this.score}`)
          }
        }
      })

      // this.third.physics.debug.enable()

      const offset = new THREE.Vector3(0, 0, 0)
      const sensitivity = new THREE.Vector2(0.25, 0.25)
      const r = 8
      const camera = this.third.camera
      const target = this.player
      let theta = 0
      let phi = 0

      this.input.on('pointerdown', () => this.input.mouse.requestPointerLock())
      this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (!this.input.mouse.locked) return

        const deltaX = pointer.movementX
        const deltaY = pointer.movementY
        const center = target.position.clone().add(offset)
        camera.position.copy(center)

        theta -= deltaX * (sensitivity.x / 2)
        theta %= 360
        phi += deltaY * (-sensitivity.y / 2)
        phi = Math.min(85, Math.max(-85, phi))

        const lookAt = new THREE.Vector3()
        lookAt.x =
          center.x +
          r *
            Math.sin((theta * Math.PI) / 180) *
            Math.cos((phi * Math.PI) / 180)
        lookAt.y = center.y + r * Math.sin((phi * Math.PI) / 180)
        lookAt.z =
          center.z +
          r *
            Math.cos((theta * Math.PI) / 180) *
            Math.cos((phi * Math.PI) / 180)

        camera.updateMatrix()
        camera.lookAt(lookAt)
      })
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

  walkAnimation() {
    if (this.player!.anims.current !== 'Walking')
      this.player!.anims.play('Walking')
  }

  idleAnimation() {
    if (this.player!.anims.current !== 'Idle') this.player!.anims.play('Idle')
  }

  update() {
    this.stars.forEach((star) => {
      if (star.visible) {
        star.rotation.y += 0.03
        star.body.needUpdate = true
      }
    })

    if (this.player && this.player.body) {
      const firstPerson = this.activeCamera === 0

      this.cameraOffset.lerp(new THREE.Vector3(0, firstPerson ? 1 : 10, 0), 0.2)
      const { x, y, z } = this.cameraOffset
      this.third.camera.position
        .copy(this.player.position)
        .add(new THREE.Vector3(x, y, z))

      if (!firstPerson) {
        this.third.camera.lookAt(
          this.player.position.clone().add(new THREE.Vector3(0, 2, 0)),
        )
      }

      // get rotation of player
      const speed = 7
      const rotation = this.third.camera.getWorldDirection(new THREE.Vector3())
      const _theta = Math.atan2(rotation.x, rotation.z)
      const theta = this.player.world.theta
      this.player.body.setAngularVelocityY(0)

      if (!firstPerson) {
        this.player.body.setVelocity(0, 0, 0)
        this.walkAnimation()
        if (this.keys!.a.isDown) {
          this.player.body.setVelocityX(-speed)
          if (theta > -(Math.PI / 2)) this.player.body.setAngularVelocityY(-10)
        } else if (this.keys!.d.isDown) {
          this.player.body.setVelocityX(speed)
          if (theta < Math.PI / 2) this.player.body.setAngularVelocityY(10)
        } else if (this.keys!.w.isDown) {
          this.player.body.setVelocityZ(-speed)
          if (theta < Math.PI / 1.1) this.player.body.setAngularVelocityY(10)
        } else if (this.keys!.s.isDown) {
          this.player.body.setVelocityZ(speed)
          if (theta >= 0) this.player.body.setAngularVelocityY(-10)
        } else {
          this.idleAnimation()
        }
      } else {
        let noKeyPressed = true
        if (this.keys!.w.isDown) {
          this.player.body.setVelocityX(Math.sin(_theta) * speed)
          this.player.body.setVelocityZ(Math.cos(_theta) * speed)
          noKeyPressed = false
        } else if (this.keys!.s.isDown) {
          this.player.body.setVelocityX(-(Math.sin(_theta) * speed))
          this.player.body.setVelocityZ(-(Math.cos(_theta) * speed))
          noKeyPressed = false
        }

        // move sideways
        if (this.keys!.a.isDown) {
          this.player.body.setVelocityX(
            Math.sin(_theta + Math.PI * 0.5) * speed,
          )
          this.player.body.setVelocityZ(
            Math.cos(_theta + Math.PI * 0.5) * speed,
          )
          noKeyPressed = false
        } else if (this.keys!.d.isDown) {
          this.player.body.setVelocityX(
            Math.sin(_theta - Math.PI * 0.5) * speed,
          )
          this.player.body.setVelocityZ(
            Math.cos(_theta - Math.PI * 0.5) * speed,
          )
          noKeyPressed = false
        }
        if (noKeyPressed) {
          this.player.body.setVelocityZ(0)
          this.player.body.setVelocityX(0)
          this.player.body.setVelocityY(0)
        }
      }
    }
  }
}
