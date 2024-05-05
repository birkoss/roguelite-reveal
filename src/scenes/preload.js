import Phaser from "../lib/phaser.js";

import { SCENE_KEYS } from "../keys/scene.js";
import { DATA_ASSET_KEYS, DUNGEON_ASSET_KEYS } from "../keys/asset.js";
import { TILE_SIZE } from "../config.js";

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.PRELOAD_SCENE,
        });
    }

    preload() {
        this.load.spritesheet(DUNGEON_ASSET_KEYS.WORLD, 'assets/tilesets/world.png', {
            frameWidth: TILE_SIZE,
            frameHeight: TILE_SIZE,
        });
        this.load.spritesheet(DUNGEON_ASSET_KEYS.UNITS, 'assets/tilesets/units.png', {
            frameWidth: TILE_SIZE,
            frameHeight: TILE_SIZE,
        });
        this.load.spritesheet(DUNGEON_ASSET_KEYS.EFFECTS_LARGE, 'assets/tilesets/effects-large.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.spritesheet(DUNGEON_ASSET_KEYS.EFFECTS_SMALL, 'assets/tilesets/effects-small.png', {
            frameWidth: TILE_SIZE,
            frameHeight: TILE_SIZE,
        });

        this.load.json(
            DATA_ASSET_KEYS.DUNGEON_THEMES,
            'assets/data/dungeon-themes.json'
        );
        this.load.json(
            DATA_ASSET_KEYS.ENEMIES,
            'assets/data/enemies.json'
        );
    }

    create() {
        this.scene.start(SCENE_KEYS.DUNGEON_SCENE);
    }
}
