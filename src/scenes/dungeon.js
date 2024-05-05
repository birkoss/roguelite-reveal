import Phaser from "../lib/phaser.js";

import { SCENE_KEYS } from "../keys/scene.js";
import { Map } from "../dungeons/map.js";
import { DataUtils } from "../utils/data.js";
import { TILE_SIZE } from "../config.js";

export class DungeonScene extends Phaser.Scene {
    /** @type {Map} */
    #map;

    /** @type {DungeonTheme} */
    #dungeonTheme;

    constructor() {
        super({
            key: SCENE_KEYS.DUNGEON_SCENE,
        });
    }

    create() {
        this.#dungeonTheme = DataUtils.getDungeonTheme(this, "main");

       this.#createMap();
    }

    #createMap() {
        this.#map = new Map(this, 10, 8);

        this.#map.create(this.#dungeonTheme);

        this.#map.container.setPosition(this.scale.width - this.#map.container.getBounds().width, 0);

        // Enable Tile selection
        this.#map.container.setInteractive(
            new Phaser.Geom.Rectangle(
                0, 0, this.#map.container.getBounds().width, this.#map.container.getBounds().height
            ),
            Phaser.Geom.Rectangle.Contains
        );
        this.#map.container.on('pointerdown', (target) => {
            let x = Math.floor((target.worldX - this.#map.container.x) / TILE_SIZE);
            let y = Math.floor((target.worldY - this.#map.container.y) / TILE_SIZE);

            this.#selectTile(x, y);
        });

        // Pick a random position for the starting player
        let tiles = this.#map.getEmptyTiles();
        Phaser.Utils.Array.Shuffle(tiles);

        let startingPosition = tiles.shift();
        this.#map.previewTile(startingPosition.x, startingPosition.y, () => {
            this.#selectTile(startingPosition.x, startingPosition.y);
        });
    }

    /**
     * @param {number} x 
     * @param {number} y 
     */
    #selectTile(x, y) {
        this.#map.revealTile(x, y);
    }
}
