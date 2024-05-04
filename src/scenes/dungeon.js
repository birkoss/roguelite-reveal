import Phaser from "../lib/phaser.js";

import { SCENE_KEYS } from "../keys/scene.js";
import { Map } from "../dungeons/map.js";
import { TILE_FOG_OF_WAR, TILE_TYPE } from "../dungeons/tiles/tile.js";
import { DataUtils } from "../utils/data.js";
import { TILE_SIZE } from "../config.js";

export class DungeonScene extends Phaser.Scene {
    /** @type {Map} */
    #map;
    /** @type {Phaser.GameObjects.Container} */
    #mapContainer;

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
        this.#mapContainer = this.add.container(0, 0);

        this.#map = new Map(10, 8);

        this.#map.tiles.forEach((singleTile) => {
            let assetKey = this.#dungeonTheme.floor.assetKey;
            let assetFrame = this.#dungeonTheme.floor.assetFrame;

            if (singleTile.type == TILE_TYPE.WALL) {
                assetKey = this.#dungeonTheme.walls.assetKey;

                assetFrame = 0;

                // Get the first frame, should always be the default wall
                if (this.#dungeonTheme.walls.assetFrames.length > 0) {
                    assetFrame = this.#dungeonTheme.walls.assetFrames[0];
                }

                let dungeonWallLayout = this.#map.getTileLayout(singleTile.x, singleTile.y, TILE_TYPE.WALL);

                if (dungeonWallLayout < this.#dungeonTheme.walls.assetFrames.length) {
                    assetFrame = this.#dungeonTheme.walls.assetFrames[dungeonWallLayout];
                }
            }

            let tileGameObjects = singleTile.create(this, assetKey, assetFrame);
            this.#mapContainer.add(tileGameObjects);
        });

        this.#mapContainer.setPosition(this.scale.width - this.#mapContainer.getBounds().width, 0);

        // Enable Tile selection
        this.#mapContainer.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, this.#mapContainer.getBounds().width, this.#mapContainer.getBounds().height),
            Phaser.Geom.Rectangle.Contains
        );
        this.#mapContainer.on('pointerdown', (target) => {
            let x = Math.floor((target.worldX - this.#mapContainer.x) / TILE_SIZE);
            let y = Math.floor((target.worldY - this.#mapContainer.y) / TILE_SIZE);

            this.#selectTile(x, y);
        });

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
