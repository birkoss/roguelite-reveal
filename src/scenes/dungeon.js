import Phaser from "../lib/phaser.js";

import { SCENE_KEYS } from "../keys/scene.js";
import { Map } from "../dungeons/map.js";
import { TILE_TYPE } from "../dungeons/tiles/tile.js";
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
            if (singleTile.type == TILE_TYPE.FLOOR) {
                let gameObject = singleTile.create(this, this.#dungeonTheme.floor.assetKey, this.#dungeonTheme.floor.assetFrame);
                this.#mapContainer.add(gameObject);
                return;
            }

            if (singleTile.type == TILE_TYPE.WALL) {
                let dungeonWallAssetFrame = 0;

                // Get the first frame, should always be the default wall
                if (this.#dungeonTheme.walls.assetFrames.length > 0) {
                    dungeonWallAssetFrame = this.#dungeonTheme.walls.assetFrames[0];
                }

                let dungeonWallLayout = this.#map.getTileLayout(singleTile.x, singleTile.y, TILE_TYPE.WALL);

                if (dungeonWallLayout < this.#dungeonTheme.walls.assetFrames.length) {
                    dungeonWallAssetFrame = this.#dungeonTheme.walls.assetFrames[dungeonWallLayout];
                }
                
                let gameObject = singleTile.create(this, this.#dungeonTheme.walls.assetKey, dungeonWallAssetFrame);
                this.#mapContainer.add(gameObject);
            }
        });

        this.#mapContainer.setPosition(this.scale.width - this.#mapContainer.getBounds().width, 0);

        this.#mapContainer.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, this.#mapContainer.getBounds().width, this.#mapContainer.getBounds().height),
            Phaser.Geom.Rectangle.Contains
        );
        this.#mapContainer.on('pointerdown', (target) => {
            let x = Math.floor((target.worldX - this.#mapContainer.x) / TILE_SIZE);
            let y = Math.floor((target.worldY - this.#mapContainer.y) / TILE_SIZE);

            this.#selectTile(x, y);
        });
    }

    /**
     * @param {number} x 
     * @param {number} y 
     */
    #selectTile(x, y) {
        console.log(`TILE CLICKED ON ${x}x${y}`);
    }
}
