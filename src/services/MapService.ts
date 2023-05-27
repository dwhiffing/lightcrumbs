import { ExtendedObject3D } from '@enable3d/phaser-extension'
import GameScene from '../scenes/Game'

const material = { phong: { transparent: true, color: 0x21572f } }
export class MapService {
  stars: ExtendedObject3D[]
  scene: GameScene

  constructor(scene: GameScene) {
    this.scene = scene
    this.stars = []

    this.addPlatforms()
    this.addStars()
  }

  addPlatforms() {
    this.scene.third.physics.add.box(
      {
        name: 'platform-ground',
        y: -2,
        width: 30,
        depth: 10,
        height: 2,
        mass: 0,
      },
      material,
    )
  }
  addStars() {
    const svg = this.scene.cache.html.get('star')
    const starShape = this.scene.third.transform.fromSVGtoShape(svg)
    const starPositions = [
      { x: -4, y: 0 },
      { x: -2, y: 0 },
    ]
    starPositions.forEach((pos, i) => {
      const star = this.scene.third.add.extrude({
        shape: starShape[0],
        // @ts-ignore
        depth: 200,
      }) as any
      star.name = `star-${i}`
      star.scale.set(1 / 500, 1 / -500, 1 / 500)
      star.material.color.setHex(0xffd851)
      star.position.set(pos.x, pos.y, 0)
      this.scene.third.physics.add.existing(star, {
        shape: 'box',
        ignoreScale: true,
        width: 0.5,
        height: 0.5,
        depth: 0.5,
      })
      star.body.setCollisionFlags(6)
      this.stars.push(star)
    })
  }

  update() {
    this.stars.forEach((star) => {
      if (star.visible) {
        star.rotation.y += 0.03
        star.body.needUpdate = true
      }
    })
  }
}
