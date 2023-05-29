This is a [Phaser 3](https://github.com/photonstorm/phaser) starter with [TypeScript](https://www.typescriptlang.org/), [Rollup](https://rollupjs.org) and [Vite](https://vitejs.dev/).

# TOJam 2023

Theme: You must leave it behind

Idea: You leave a trail of breadcrumbs behind you to lead a Follower character through a level

## notes

do the player and the Follower traverse the level at the same time? Or does the Follower only enter the level when the player has left

are there different types of breadcrumbs that cause the Follower to behave in different ways?

the Follower should stop for a second whenever they reach a breadcrumb. This way the player can stall the Follower by placing many breadcrumbs in a single spot (perhaps this makes a larger breadcrumb for better readability)

breadcrumbs can possibly be thrown into areas the player cannot reach?

the levels should be 2d platforming puzzles with limited physics. Levels will be designed with Tiled
could there be many Follower players similar to lemmings? Does it matter that there are more?

possible scenarios:

lead the Follower to a moving platform, then have them wait on the platform for the right amount of time

## Sprites

Player character
Follower character
Breadcrumbs

## Map Sprites

Walls
Start/Exit points
Moving Platforms
Ladders
Buttons/Switches
Doors
locks/keys?
vanishing tiles
spikes
guns
spring platforms activated by button?
enemies
use guns to shoot enemies but not Follower
color coded doors?
make guns into lasers that can be reflected to hit switches
build a staircase/bridge for the follower
dig a hole for the follower
make sure the follower doesn't fall too far
put up blockers for the follower so they dont fall off an edge
