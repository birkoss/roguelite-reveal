import Phaser from "../lib/phaser.js";

import { DUNGEON_ASSET_KEYS } from "../keys/asset.js";
import { DataUtils } from "../utils/data.js";
import { TILE_TYPE, Tile } from "./tiles/tile.js";
import { TILE_ITEM_TYPE, TileItem } from "./tiles/entities/item.js";
import { SKIP_OVERLAYS } from "../config.js";

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

    /**
     * @param {Phaser.Scene} scene
     * @param {number} width 
     * @param {number} height 
     */
    constructor(scene, width, height) {
        this.#scene = scene;
        this.#width = width;
        this.#height = height;

        this.#container = scene.add.container(0, 0);

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
            let assetFrame = theme.floor.assetFrames[0];
            // Dynamic floor depending on the frame
            if (theme.floor.assetFrames.length > 1) {
                if (Phaser.Math.Between(1, 4) === 3) {
                    assetFrame = theme.floor.assetFrames[ Phaser.Math.Between(1, theme.floor.assetFrames.length - 1) ];
                }
            }

            if (singleTile.type === TILE_TYPE.WALL) {
                assetKey = theme.walls.assetKey;
                assetFrame = 0;
                // Get the first frame, should always be the default wall
                if (theme.walls.assetFrames.length > 0) {
                    assetFrame = theme.walls.assetFrames[0];
                }

                let dungeonWallLayout = this.getTileLayout(singleTile.x, singleTile.y, TILE_TYPE.WALL);
                if (dungeonWallLayout < theme.walls.assetFrames.length) {
                    assetFrame = theme.walls.assetFrames[dungeonWallLayout];
                    if (theme.walls.alternateAssetFrames?.[dungeonWallLayout] && Phaser.Math.Between(1, 4) === 2) {
                        assetFrame = theme.walls.alternateAssetFrames[dungeonWallLayout];
                    }
                }
            }

            let tileContainer = singleTile.create(this.#scene, assetKey, assetFrame);
            this.#container.add(tileContainer);
   
            // Nothing more to do with wall
            if (singleTile.type === TILE_TYPE.WALL) {
                return;
            }

            // Create tile shadow
            singleTile.createShadow(this.#scene, theme.shadow.assetKey, theme.shadow.assetFrame);
            
            if (singleTile.item) {
                let assetKey = theme.exit.assetKey;
                let assetFrame = theme.exit.assetFrame;

                if (singleTile.item.type === TILE_ITEM_TYPE.CONSUMABLE) {
                    assetKey = singleTile.item.itemDetails.assetKey;
                    assetFrame = singleTile.item.itemDetails.assetFrame;
                }

                singleTile.createItem(this.#scene, assetKey, assetFrame);
            }

            singleTile.createSeletion(this.#scene);

            if (singleTile.enemy) {
                singleTile.createEnemy(this.#scene);
            }

            if (!SKIP_OVERLAYS) {
                singleTile.createOverlay(this.#scene, theme.hidden.assetKey, theme.hidden.assetFrame);
            }
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
     * @returns {boolean}
     */
    canAttackAt(x, y) {
        // Is this tile valid ?
        let tile = this.#tiles.find(singleTile => singleTile.x === x && singleTile.y === y);
        if (!tile) {
            return false;
        }

        // Is this overlay revealed ?
        if (tile.overlay) {
            return false;
        }

        // An alive enemy must be there
        if (!tile.enemy || !tile.enemy.isAlive) {
            return false;
        }

        return true;
    }
    /**
     * @param {number} x 
     * @param {number} y 
     * @returns {boolean}
     */
    canInteracAt(x, y) {
        // Is this tile valid ?
        let tile = this.#tiles.find(singleTile => singleTile.x === x && singleTile.y === y);
        if (!tile) {
            return false;
        }

        // Still an overlay ?
        if (tile.overlay) {
            return false;
        }

        // Is an item present ?
        if (!tile.item) {
            return false;
        }

        return true;
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @returns {boolean}
     */
    canRevealAt(x, y) {
        let tile = this.#tiles.find(singleTile => singleTile.x === x && singleTile.y === y);
        if (!tile) {
            return false;
        }

        if (!tile.overlay) {
            return false;
        }

        return true;
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
     * @param {boolean} [includeAdjacent=false] 
     * @returns {Tile[]}
     */
    getNeighboors(x, y, includeAdjacent) {
        let neighboors = [];

        for (let y2=-1; y2<= 1; y2++) {
            for (let x2=-1; x2<= 1; x2++) {
                // Skip non-adjacent ?
                if (!includeAdjacent && Math.abs(x2) == Math.abs(y2)) {
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

            if (singleTile.enemy || singleTile.item) {
                return;
            }

            return singleTile;
        });
    }

    /**
     * @returns {Tile[]}
     */
    getRevealedTiles() {
        return this.#tiles.filter(singleTile => !singleTile.overlay && !this.isBorder(singleTile.x, singleTile.y));
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {() => void} [callback]
     */
    exploreAt(x, y, callback) {
        let tilesToExplore = [];

        let tile = this.#tiles.find(singleTile => singleTile.x === x && singleTile.y === y);

        // Add the main tile WITH overlay
        if (tile.overlay) {
            tilesToExplore.push(tile);
        }

        // Add adjacents tiles WITH overlay
        let neighboors = this.getNeighboors(tile.x, tile.y);
        neighboors.forEach((singleNeighboor) => {
            if (singleNeighboor.overlay) {
                tilesToExplore.push(singleNeighboor);
            }
        });

        // Nothing to reveal ?
        if (tilesToExplore.length === 0) {
            callback();
            return;
        }
        
        // Reveal all those tiles
        this.#revealTiles([...tilesToExplore], () => {
            // Reveal all things on those tiles
            this.#activateTiles(tilesToExplore, callback);
        }); 
    }

    /**
     * @param {number} x 
     * @param {number} y 
     */
    selectTileAt(x, y) {
        let tile = this.#tiles.find(singleTile => singleTile.x === x && singleTile.y === y);
        
        // Select the current tile
        this.#tiles.forEach((singleTile) => {
            singleTile.unselect();
        });
        tile.select();
    }

    #generate() {
        this.#tiles = [];

        for (let y=0; y<this.#height; y++) {
            for (let x=0; x<this.#width; x++) {
                let isWall = (x === 0 || y === 0 || y === this.#height-1 || x === this.#width-1);

                let tile = new Tile(x, y, isWall ? TILE_TYPE.WALL : TILE_TYPE.FLOOR);

                this.#tiles.push(tile);
            }
        }

        let emptyTiles = this.getEmptyTiles();
        Phaser.Utils.Array.Shuffle(emptyTiles);

        // Generate exit
        // TODO: Allow to lock the EXIT. Must give a key somewhere (drop or chest)
        // TODO: Allow to seal the EXIT. Must defeat a specific enemy to lift it.
        let tile = emptyTiles.shift();
        tile.addItem(new TileItem(TILE_ITEM_TYPE.EXIT));


        // Generate ennemies
        // TODO: Never spawn enemy adjacent to the EXIT (use getNeighboors to remove tiles)
        for (let i=0; i<1; i++) {
            let enemyDetails = DataUtils.getEnemyDetails(this.#scene, (i==0 ? 'imp' : 'skeleton'));
            tile = emptyTiles.shift();
            tile.addEnemy(enemyDetails);
        }

        // TODO: Generate item
        let itemDetails = DataUtils.getItemDetails(this.#scene, 'minor_hp_potion');
        for (let i=0; i<1; i++) {
            tile = emptyTiles.shift();
            tile.addItem(new TileItem(TILE_ITEM_TYPE.CONSUMABLE, itemDetails));
        }

        // TODO: Generate chest
    }

    /**
     * @param {Tile[]} tiles 
     * @param {() => void} [callback]
     */
    #revealTiles(tiles, callback) {
        let singleTile = tiles.shift();
        singleTile.reveal(() => {
            // Add SHADOW on this TILE if below a WALL or an OVERLAY
            let tileTopNeighboor = this.#tiles.find(singleTopTile => singleTopTile.x === singleTile.x && singleTopTile.y === singleTile.y - 1);
            if (tileTopNeighboor.type === TILE_TYPE.WALL || tileTopNeighboor.overlay) {
                singleTile.showShadow();
            }

            // Remove shadow from neighboors
            let neighboors = this.getNeighboors(singleTile.x, singleTile.y);
            neighboors.forEach((singleNeighboor) => {
                let tileTopNeighboor = this.#tiles.find(singleTopTile => singleTopTile.x === singleNeighboor.x && singleTopTile.y === singleNeighboor.y - 1);

                if (tileTopNeighboor && tileTopNeighboor.type === TILE_TYPE.FLOOR && !tileTopNeighboor.overlay) {
                    singleNeighboor.hideShadow();
                }
            });

            // Continue revealing tiles
            if (tiles.length > 0) {
                this.#revealTiles(tiles, callback);
            } else {
                callback();
            }
        });
    }

    /**
     * @param {Tile[]} tiles 
     * @param {() => void} [callback ]
     */
    #activateTiles(tiles, callback) {
        tiles.forEach((singleTile) => {
            // An enemy is on the tile ?
            if (singleTile.enemy) {
                singleTile.enemy.animate();

                // Animate an appear effect
                let effect = this.#scene.add.sprite(
                    singleTile.container.x + singleTile.enemy.gameObject.displayWidth / 2,
                    singleTile.container.y + singleTile.enemy.gameObject.displayHeight / 2 - singleTile.enemy.gameObject.displayHeight,
                    DUNGEON_ASSET_KEYS.EFFECTS_LARGE
                );
                this.#container.add(effect);
                effect.on("animationcomplete", (tween, sprite, element) => {
                    element.destroy();
                });
                effect.anims.play("appear", true);

                return;
            }
        });

        this.#scene.time.delayedCall(500, () => {
            if (callback) {
                callback();
            }
        });
    }
}