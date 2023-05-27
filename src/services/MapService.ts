import { ExtendedObject3D } from '@enable3d/phaser-extension'
import GameScene from '../scenes/Game'
import map1 from '../../map1.json'
import map2 from '../../map2.json'
import chunk from 'lodash/chunk'

const material = { phong: { transparent: false, color: 0x000000 } }
const material2 = { phong: { transparent: false, color: 0x151515 } }
// wall height
const h = 6
// wall width/depth
const w = 3
const ratio = 8 / w
const MAPS = [map1, map2]
export const MAP_COUNT = MAPS.length
interface Coord {
  gid: number
  x: number
  z: number
}

export class MapService {
  stars: ExtendedObject3D[]
  scene: GameScene
  mapData: { walls: number[][]; exit?: Coord; start?: Coord }

  constructor(scene: GameScene) {
    this.scene = scene
    this.stars = []
    this.mapData = { walls: [], exit: undefined, start: undefined }
  }

  loadLevel(levelIndex: number) {
    const map = MAPS[levelIndex]

    const walls = map.layers.find((f) => f.name === 'Walls') as any
    const objects = map.layers.find((f) => f.name === 'Objects') as any
    const MAP = chunk(
      walls.data.map((d: any) => (d === 17 ? 1 : 0)),
      walls.width,
    ) as unknown as number[][]
    const OBJECTS = objects.objects.map((d: any) => ({
      gid: d.gid,
      x: (d.x + 4) / ratio,
      z: (d.y - 4) / ratio,
    })) as unknown as Coord[]

    this.mapData = {
      walls: MAP as number[][],
      exit: OBJECTS.find((g) => g.gid === 25)!,
      start: OBJECTS.find((g) => g.gid === 1)!,
    }

    this.addGround()
    this.addWalls()
    this.addExit()
  }

  addGround() {
    const width = this.mapData.walls[0].length * w
    const height = this.mapData.walls.length * w
    const hw = width / 2
    const hh = height / 2
    const hd = w / 2
    const y = h / 2 - 1
    this.addBox('ground', hw, -2, hh, width, w, height, material)
    this.addBox('wall-l', 0 - hd, y, hh, w, h, height, material2)
    this.addBox('wall-r', width + hd, y, hh, w, h, height, material2)
    this.addBox('wall-t', hw, y, 0 - hd, width, h, w, material2)
    this.addBox('wall-b', hw, y, height + hd, width, h, w, material2)
  }

  addWalls() {
    let i = 0
    const y = h / 2 - 1
    this.mapData.walls.forEach((row, _z) => {
      row.forEach((n, _x) => {
        if (n === 0) return
        const x = w / 2 + _x * w
        const z = w / 2 + _z * w
        this.addBox(`wall-${i++}`, x, y, z, w, h, w, material2)
      })
    })
  }

  addStar(x: number, z: number) {
    const svg = this.scene.cache.html.get('star')
    const shape = this.scene.third.transform.fromSVGtoShape(svg)[0]
    // @ts-ignore
    const star = this.scene.third.add.extrude({ shape, depth: 200 }) as any

    star.name = `star-${this.stars.length}`
    star.scale.set(1 / 1000, 1 / -1000, 1 / 1000)
    star.material = star.material.clone()
    star.material.color.setHex(0xffd851)
    star.position.set(x, 1, z)
    this.scene.third.physics.add.existing(star, {
      shape: 'box',
      ignoreScale: true,
      width: 0.5,
      height: 0.5,
      depth: 0.5,
    })
    star.body.setCollisionFlags(6)
    this.stars.push(star)
  }

  addExit() {
    const { x, z } = this.mapData.exit!
    const svg = this.scene.cache.html.get('star')
    const shape = this.scene.third.transform.fromSVGtoShape(svg)[0]
    // @ts-ignore
    const star = this.scene.third.add.extrude({ shape, depth: 200 }) as any

    star.name = `exit`
    star.scale.set(1 / 1000, 1 / -1000, 1 / 1000)
    star.material.color.setHex(0xff0000)
    star.position.set(x, 1, z)
    this.scene.third.physics.add.existing(star, {
      shape: 'box',
      ignoreScale: true,
      width: 0.5,
      height: 0.5,
      depth: 0.5,
    })
    star.body.setCollisionFlags(6)
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

  toggleWallColors() {
    this.scene.third.physics.rigidBodies.forEach((b) => {
      if (b.name.includes('wall')) {
        const mat = b.material as any
        // mat.color.setHex(mat.color.r === 0 ? 0x151515 : 0x000000)
      }
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
