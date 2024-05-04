import Phaser from "../lib/phaser.js";

import { SCENE_KEYS } from "../keys/scene.js";
import { Map } from "../dungeons/map.js";
import { TILE_FOG_OF_WAR, TILE_TYPE } from "../dungeons/tiles/tile.js";
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
        // this.#mapContainer.setInteractive(
        //     new Phaser.Geom.Rectangle(0, 0, this.#mapContainer.getBounds().width, this.#mapContainer.getBounds().height),
        //     Phaser.Geom.Rectangle.Contains
        // );
        // this.#mapContainer.on('pointerdown', (target) => {
        //     let x = Math.floor((target.worldX - this.#mapContainer.x) / TILE_SIZE);
        //     let y = Math.floor((target.worldY - this.#mapContainer.y) / TILE_SIZE);

        //     this.#selectTile(x, y);
        // });

        // Reveal all borders
        this.#map.tiles.forEach((singleTile) => {
            if (singleTile.x == 0 || singleTile.y == 0 || singleTile.x == this.#map.width -1 || singleTile.y == this.#map.height - 1) {
                singleTile.reveal({
                    skipAnimation: true,
                });
            }
        });

        // Pick a random position for the starting player
        let tiles = this.#map.tiles.filter(singleTile => !singleTile.isRevealed);
        Phaser.Utils.Array.Shuffle(tiles);

        let startingPosition = tiles.shift();
        startingPosition.preview(() => {
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
