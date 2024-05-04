import { TILE_SIZE } from "../config.js";
import Phaser from "../lib/phaser.js";
import { Floor } from "./tiles/floor.js";

import { TILE_FOG_OF_WAR, TILE_TYPE, Tile } from "./tiles/tile.js";
import { Wall } from "./tiles/wall.js";

export class Map {
    /** @type {Phaser.Scene} */
    #scene;
    /** @type {number} */
    #width;
    /** @type {number} */
    #height;

    /** @type {Tile[]} */
    #tiles;

    /** @type {Phaser.GameObjects.Container} */
    #container;
    /** @type {Phaser.GameObjects.Container} */
    #tilesContainer;
    /** @type {Phaser.GameObjects.Container} */
    #entitiesContainer;
    /** @type {Phaser.GameObjects.Container} */
    #overlayContainer;

    /**
     * @param {Phaser.Scene} scene
     * @param {number} width 
     * @param {number} height 
     */
    constructor(scene, width, height) {
        this.#scene = scene;
        this.#width = width;
        this.#height = height;

        this.#tilesContainer = scene.add.container(0, 0);
        this.#entitiesContainer = scene.add.container(0, 0);
        this.#overlayContainer = scene.add.container(0, 0);

        this.#container = scene.add.container(0, 0, [
            this.#tilesContainer,
            this.#entitiesContainer, 
            this.#overlayContainer,
        ]);

        this.#generate();
    }

    /** @type {number} */
    get width() {
        return this.#width;
    }
    /** @type {number} */
    get height() {
        return this.#height;
    }
    /** @type {Tile[]} */
    get tiles() {
        return [...this.#tiles];
    }
    /** @type {Phaser.GameObjects.Container} */
    get container() {
        return this.#container;
    }

    /**
     * @param {DungeonTheme} theme 
     */
    create(theme) {
        // Create tiles
        this.tiles.forEach((singleTile) => {
            let assetKey = theme.floor.assetKey;
            let assetFrame = theme.floor.assetFrame;

            if (singleTile.type == TILE_TYPE.WALL) {
                assetKey = theme.walls.assetKey;

                assetFrame = 0;

                // Get the first frame, should always be the default wall
                if (theme.walls.assetFrames.length > 0) {
                    assetFrame = theme.walls.assetFrames[0];
                }

                let dungeonWallLayout = this.getTileLayout(singleTile.x, singleTile.y, TILE_TYPE.WALL);

                if (dungeonWallLayout < theme.walls.assetFrames.length) {
                    assetFrame = theme.walls.assetFrames[dungeonWallLayout];
                }
            }

            let tileGameObject = singleTile.create(this.#scene, assetKey, assetFrame);
            this.#tilesContainer.add(tileGameObject);
        });

        // Create Overlays
        this.tiles.forEach((singleTile) => {
            if (this.isBorder(singleTile.x, singleTile.y)) {
                return;
            }

            let overlay = this.#scene.add.image(
                singleTile.gameObject.x,
                singleTile.gameObject.y,
                theme.floor.assetKey,
                2
            );
            overlay.setOrigin(0);
            overlay.setAlpha(0.3);
            this.#overlayContainer.add(overlay);
        });


        // Place exit
        let emptyTiles = this.getEmptyTiles();
        Phaser.Utils.Array.Shuffle(emptyTiles);

        let tile = emptyTiles.shift();
        let exitGameObject = this.#scene.add.image(
            tile.gameObject.x,
            tile.gameObject.y,
            theme.exit.assetKey,
            theme.exit.assetFrame,
        );
        exitGameObject.setOrigin(0);
        exitGameObject.setAlpha(1);
        this.#entitiesContainer.add(exitGameObject);
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @returns {boolean}
     */
    isInBound(x, y) {
        return (x >= 0 && x < this.#width && y >= 0 && y < this.#height);
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @returns {boolean}
     */
    isBorder(x, y) {
        return (x == 0 || y === 0 || x == this.#width - 1 || y === this.#height - 1);
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {import("./tiles/tile.js").TileType} tileType 
     * @returns {number}
     */
    getTileLayout(x, y, tileType) {
        // Get the layout depending on its neighboors from the tileType
        // - Depending on the adjacent tile from those values (0 to 15) :
        //  - (left = +1, top = +2, right = +4, bottom = +8)
        let layout = 0;

        let neighboors = this.getNeighboors(x, y);
        neighboors.forEach((singleNeighboor) => {
            // Only check adjacent wall
            if (singleNeighboor.type !== tileType) {
                return;
            }

            let diffX = x - singleNeighboor.x;
            let diffY = y - singleNeighboor.y;
            if (diffX !== 0) {
                layout += (diffX < 0 ? 4 : 1);
            } else {
                layout += (diffY < 0 ? 8 : 2);
            }
        });

        return layout;
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @returns {Tile[]}
     */
    getNeighboors(x, y) {
        let neighboors = [];

        for (let y2=-1; y2<= 1; y2++) {
            for (let x2=-1; x2<= 1; x2++) {
                // Skip non-adjacent
                if (Math.abs(x2) == Math.abs(y2)) {
                    continue;
                }

                let neighboorX = x + x2;
                let neighboorY = y + y2;

                // Must be in bound
                if (!this.isInBound(neighboorX, neighboorY)) {
                    continue;
                }

                let index = (neighboorY * this.#width) + neighboorX;
                neighboors.push(this.#tiles[index]);
            }
        }
        return neighboors;
    }

    /**
     * @returns {Tile[]}
     */
    getEmptyTiles() {
        return this.#tiles.filter((singleTile) => {
            // Walls are not empty
            if (singleTile.type === TILE_TYPE.WALL) {
                return;
            }
            return singleTile;
        });
    }

    /**
     * @param {number} x 
     * @param {number} y 
     */
    revealTile(x, y) {
        // TODO: Remove
        return;
        console.log(`TILE CLICKED ON ${x}x${y}`);
        let tile = this.tiles.find(singleTile => singleTile.x === x && singleTile.y === y);
        if (tile.fogOfWar !== TILE_FOG_OF_WAR.PARTIAL) {
            return;
        }

        tile.reveal({
            callback: () => {
                // Preview adjacent tiles
                let neighboors = this.getNeighboors(tile.x, tile.y);
                neighboors.forEach((singleNeighboor) => {
                    singleNeighboor.preview();
                });
            }
        });
    }

    #generate() {
        this.#tiles = [];

        for (let y=0; y<this.#height; y++) {
            for (let x=0; x<this.#width; x++) {
                let isWall = (x === 0 || y === 0 || y === this.#height-1 || x === this.#width-1);

                let tile;
                if (isWall) {
                    tile = new Wall(x, y);
                } else {
                    tile = new Floor(x, y);
                }

                this.#tiles.push(tile);
            }
        }

        // Generate ennemies

        // Generate chest



    }
}