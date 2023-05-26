import Phaser from 'phaser'
import config from './config'
import { enable3d } from '@enable3d/phaser-extension'

window.addEventListener('load', () =>
  enable3d(() => new Phaser.Game(config)).withPhysics('ammo'),
)
