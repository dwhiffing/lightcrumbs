import Phaser from 'phaser'
import { Canvas } from '@enable3d/phaser-extension'
import BootScene from './scenes/Boot'
import GameScene from './scenes/Game'
import MenuScene from './scenes/Menu'

export default {
  type: Phaser.WEBGL,
  transparent: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  scene: [BootScene, MenuScene, GameScene],
  ...Canvas(),
  // parent: 'game',
  // backgroundColor: '#000',
  // physics: {
  //   default: 'arcade',
  //   arcade: {
  //     gravity: { y: 0 },
  //     // debug: true,
  //   },
  // },
  // pixelArt: true,
}
