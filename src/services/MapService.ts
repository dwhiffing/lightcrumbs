import { ExtendedObject3D } from '@enable3d/phaser-extension'
import GameScene from '../scenes/Game'
import map from '../../public/map1.json'
import chunk from 'lodash/chunk'

const material = { phong: { color: 0x21572f } }
const material2 = { phong: { color: 0xffffff } }
// wall height
const h = 6
// wall width/depth
const w = 3
const ratio = 8 / w

const walls = map.layers.find((f) => f.name === 'Walls') as any
const stars = map.layers.find((f) => f.name === 'Stars') as any
const MAP = chunk(
  walls.data.map((d: any) => (d === 17 ? 1 : 0)),
  walls.width,
) as unknown as number[][]
const STARS = stars.objects.map((d: any) => ({
  x: d.x + 4,
  z: d.y + 4,
})) as unknown as { x: number; z: number }[]

const size = MAP[0].length * w
export class MapService {
  stars: ExtendedObject3D[]
  scene: GameScene

  constructor(scene: GameScene) {
    this.scene = scene
    this.stars = []

    this.addGround()
    this.addWalls()
    this.addStars()
  }

  addGround() {
    const hs = size / 2
    const hd = w / 2
    const y = h / 2 - 1
    this.addBox('ground', hs, -2, hs, size, w, size, material)
    this.addBox('wall-l', 0 - hd, y, hs, w, h, size, material2)
    this.addBox('wall-r', size + hd, y, hs, w, h, size, material2)
    this.addBox('wall-t', hs, y, 0 - hd, size, h, w, material2)
    this.addBox('wall-b', hs, y, size + hd, size, h, w, material2)
  }

  addWalls() {
    let i = 0
    MAP.forEach((row, z) => {
      row.forEach((n, x) => {
        if (n === 0) return
        this.addBox(
          `wall-${i++}`,
          w / 2 + x * w,
          h / 2 - 1,
          w / 2 + z * w,
          w,
          h,
          w,
          material2,
        )
      })
    })
  }

  addStars() {
    const svg = this.scene.cache.html.get('star')
    const starShape = this.scene.third.transform.fromSVGtoShape(svg)

    STARS.forEach((pos, i) => {
      const star = this.scene.third.add.extrude({
        shape: starShape[0],
        // @ts-ignore
        depth: 200,
      }) as any

      star.name = `star-${i}`
      star.scale.set(1 / 500, 1 / -500, 1 / 500)
      star.material.color.setHex(0xffd851)
      star.position.set(pos.x / ratio, 0, pos.z / ratio - 0)
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

  addBox = (
    name: string,
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number,
    material: any,
  ) => {
    this.scene.third.physics.add.box(
      { name, x, z, y, width, depth, height, mass: 0 },
      material,
    )
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
