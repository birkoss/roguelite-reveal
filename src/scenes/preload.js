import Phaser from "../lib/phaser.js";

import { SCENE_KEYS } from "../keys/scene.js";
import { DATA_ASSET_KEYS, DUNGEON_ASSET_KEYS, UI_ASSET_KEYS } from "../keys/asset.js";
import { TILE_SIZE } from "../config.js";

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.PRELOAD_SCENE,
        });
    }

    preload() {
        this.load.image(UI_ASSET_KEYS.PANEL, 'assets/images/panel.png');

        this.load.spritesheet(DUNGEON_ASSET_KEYS.WORLD, 'assets/tilesets/world.png', {
            frameWidth: TILE_SIZE,
            frameHeight: TILE_SIZE,
        });
        this.load.spritesheet(DUNGEON_ASSET_KEYS.UNITS, 'assets/tilesets/units.png', {
            frameWidth: TILE_SIZE,
            frameHeight: TILE_SIZE,
        });
        this.load.spritesheet(DUNGEON_ASSET_KEYS.ITEMS, 'assets/tilesets/items.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet(DUNGEON_ASSET_KEYS.EFFECTS_LARGE, 'assets/tilesets/effects-large.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.spritesheet(DUNGEON_ASSET_KEYS.EFFECTS_SMALL, 'assets/tilesets/effects-small.png', {
            frameWidth: TILE_SIZE,
            frameHeight: TILE_SIZE,
        });
        this.load.spritesheet(DUNGEON_ASSET_KEYS.TILE_STATUS, 'assets/tilesets/tile-status.png', {
            frameWidth: TILE_SIZE,
            frameHeight: TILE_SIZE,
        });
        this.load.spritesheet(UI_ASSET_KEYS.HORIZONTAL_BARS, 'assets/tilesets/horizontal-bars.png', {
            frameWidth: 9,
            frameHeight: 18,
        });
        this.load.spritesheet(UI_ASSET_KEYS.BUTTON_SKILLS, 'assets/tilesets/button-skills.png', {
            frameWidth: 45,
            frameHeight: 49,
        });

        this.load.json(
            DATA_ASSET_KEYS.DUNGEON_THEMES,
            'assets/data/dungeon-themes.json'
        );
        this.load.json(
            DATA_ASSET_KEYS.ENEMIES,
            'assets/data/enemies.json'
        );
        this.load.json(
            DATA_ASSET_KEYS.CHARACTERS,
            'assets/data/characters.json'
        );
    }

    create() {
        this.scene.start(SCENE_KEYS.DUNGEON_SCENE);
    }
}
