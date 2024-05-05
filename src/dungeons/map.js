import Phaser from "../lib/phaser.js";
import { DataUtils } from "../utils/data.js";
import { Enemy } from "./tiles/enemy.js";
import { ENTITY_TYPE, Entity } from "./tiles/entity.js";

import { Floor } from "./tiles/floor.js";
import { OVERLAY_TYPE, Overlay } from "./tiles/overlay.js";
import { TILE_TYPE, Tile } from "./tiles/tile.js";
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
    /** @type {Overlay[]} */
    #overlays;
    /** @type {Entity[]} */
    #entities;
    /** @type {Enemy[]} */
    #enemies;

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
    /** @type {Enemy[]} */
    get enemies() {
        return this.#enemies;
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
            
            let overlay = new Overlay(singleTile.x, singleTile.y);
            this.#overlays.push(overlay);

            let overlayGameObject = overlay.create(this.#scene, theme.floor.assetKey, 2);
            this.#overlayContainer.add(overlay.background);
            this.#overlayContainer.add(overlayGameObject);
        });

        // Place entities
        this.#entities.forEach((singleTile) => {
            console.log(`${singleTile.x}x${singleTile.y}`);

            if (singleTile.entityType === ENTITY_TYPE.EXIT) {
                let gameObject = singleTile.create(this.#scene, theme.exit.assetKey, theme.exit.assetFrame);
                this.#entitiesContainer.add(gameObject);
                return;
            }

            if (singleTile.entityType === ENTITY_TYPE.ENEMY) {
                let gameObject = singleTile.create(this.#scene);
                this.#entitiesContainer.add(gameObject);
                return;
            }
        });

        // Place enemies
        this.#enemies.forEach((singleTile) => {
            console.log(`enemy @ ${singleTile.x}x${singleTile.y}`);

            let gameObject = singleTile.create(this.#scene);
            this.#entitiesContainer.add(gameObject);
            return;
        });   
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
     * @returns {Tile[]}
     */
    getRevealedTiles() {
        return this.#tiles.filter((singleTile) => {
            return this.#overlays.find(singleOverlay => singleOverlay.x === singleTile.x && singleOverlay.y === singleTile.y && singleOverlay.overlayType === OVERLAY_TYPE.NONE);
        });
    }

    /**
     * @param {number} x 
     * @param {number} y
     * @param {() => void} [callback]
     */
    selectTile(x, y, callback) {
        // Pick the current valid tile, should always be one
        let tile = this.#tiles.find(singleTile => singleTile.x === x && singleTile.y === y);
        if (!tile) {
            if (callback) {
                callback();
            }
            return;
        }

        let overlay = this.#overlays.find(singleOverlay => singleOverlay.x === x && singleOverlay.y === y);
        if (!overlay) {
            if (callback) {
                callback();
            }
            return;
        }
        
        // Can't do NOTHING on FULLY hidden tile
        if (overlay.overlayType === OVERLAY_TYPE.FULL) {
            if (callback) {
                callback();
            }
            return;
        }

        // Reveal the tile if the OVERLAY was PARTIAL
        if (overlay.overlayType === OVERLAY_TYPE.PARTIAL) {
            overlay.reveal({
                callback: () => {
                    // TODO: When an Enemy is revealed, animate it!
                    let neighboors = this.getNeighboors(tile.x, tile.y);
                    neighboors.forEach((singleNeighboor) => {
                        this.#overlays.forEach((singleOverlay) => {
                            if (singleOverlay.x !== singleNeighboor.x || singleOverlay.y !== singleNeighboor.y) {
                                return;
                            }
                            if (singleOverlay.overlayType === OVERLAY_TYPE.FULL) {
                                singleOverlay.preview();
                            }
                        });
                    });

                    if (callback) {
                        callback();
                    }
                }
            });
            return;
        }

        let entity = this.#entities.find(singleEntity => singleEntity.x === x && singleEntity.y === y);

        // Can't do NOTHING on REVEALED tile without ENTITY
        if (!entity) {
            if (callback) {
                callback();
            }
            return;
        }

        console.log(`map.selectTile: ${x}x${y}`);
        console.log("LOGIC with ", entity);        
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {() => void} [callback]
     */
    previewTile(x, y, callback) {
        console.log(`map.previewTile: ${x}x${y}`);

        let tile = this.#tiles.find(singleTile => singleTile.x === x && singleTile.y === y);
        if (!tile) {
            return;
        }

        let overlay = this.#overlays.find(singleOverlay => singleOverlay.x === x && singleOverlay.y === y);
        if (!overlay) {
            return;
        }

        overlay.preview(callback);
    }

    #generate() {
        this.#tiles = [];
        this.#overlays = [];

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

        this.#entities = [];

        // Generate exit
        let emptyTiles = this.getEmptyTiles();
        // TODO: SHUFFLE
        //Phaser.Utils.Array.Shuffle(emptyTiles);
        //let tile = emptyTiles.shift();

        let tile = emptyTiles[1];

        let exit = new Entity(tile.x, tile.y, ENTITY_TYPE.EXIT);
        this.#entities.push(exit);

        // Generate ennemies

        this.#enemies = [];

        tile = emptyTiles[8];

        let enemyDetails = DataUtils.getEnemyDetails(this.#scene, 'skeleton');
        let enemy = new Enemy(tile.x, tile.y, enemyDetails);
        this.#enemies.push(enemy);

        // Generate chest
    }
}