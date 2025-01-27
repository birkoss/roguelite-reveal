import Phaser from "../lib/phaser.js";

import { DUNGEON_ASSET_KEYS } from "../keys/asset.js";
import { DataUtils } from "../utils/data.js";
import { TILE_TYPE, Tile } from "./tiles/tile.js";
import { TILE_ITEM_TYPE, TileItem } from "./tiles/entities/item.js";
import { SKIP_OVERLAYS } from "../config.js";
import { TILE_STATUS_TYPE, TileStatus } from "./tiles/entities/status.js";

export class Map {
    /** @type {Phaser.Scene} */
    #scene;
    /** @type {number} */
    #width;
    /** @type {number} */
    #height;
    /** @type {DungeonTheme} */
    #theme;
    
    /** @type {number} */
    #level;
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
        this.#level = 0;

        this.#createTiles();
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
        this.#theme = theme;

        this.tiles.forEach((singleTile) => {
            let assetKey = theme.floor.assetKey;
            let assetFrame = theme.floor.assetFrames[0];
            
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
        });
    }

    /**
     * @param {DungeonTheme} theme 
     */
    generate(theme) {
        this.#level++;

        // Make sure each FLOOR have an overlay and show it
        this.hideAllTiles();

        // Randomize floor tile
        this.tiles.forEach((singleTile) => {
            if (singleTile.type === TILE_TYPE.WALL) {
                return;
            }

            // Dynamic floor depending on the theme
            if (theme.floor.assetFrames.length > 1) {
                if (Phaser.Math.Between(1, 4) === 3) {
                    singleTile.background.gameObject.setFrame(theme.floor.assetFrames[Phaser.Math.Between(1, theme.floor.assetFrames.length - 1)]);
                }
            }
        });

        // Delete previous enemy, item, status, shadow
        this.tiles.forEach((singleTile) => {
            singleTile.removeAll();
        });

        let emptyTiles = this.getEmptyTiles();
        Phaser.Utils.Array.Shuffle(emptyTiles);

        // Add exit
        let itemDetails = DataUtils.getItemDetails(this.#scene, 'exit');
        itemDetails.assetKey = theme.exit.assetKey;
        itemDetails.assetFrame = theme.exit.assetFrame;

        let tile = emptyTiles.shift();
        tile = this.#tiles.find(singleTile => singleTile.x === 1 && singleTile.y === 1);
        tile.setItem(new TileItem(TILE_ITEM_TYPE.EXIT, itemDetails));

        // Add enemies
        for (let i=0; i<1; i++) {
            let enemyDetails = DataUtils.getEnemyDetails(this.#scene, (i==0 ? 'imp' : 'skeleton'));
            // tile = emptyTiles.shift();
            tile = this.#tiles.find(singleTile => singleTile.x === 2 && singleTile.y === 1);
            tile.setEnemy(enemyDetails, this.#level);
        }

        // Add items
        itemDetails = DataUtils.getItemDetails(this.#scene, 'minor_hp_potion');
        for (let i=0; i<1; i++) {
            tile = emptyTiles.shift();
            tile = this.#tiles.find(singleTile => singleTile.x === 2 && singleTile.y === 2);
            tile.setItem(new TileItem(TILE_ITEM_TYPE.CONSUMABLE, itemDetails));
        }

        // TODO: Add chest
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

        // Add adjacents tiles WITH overlay, WITHOUT status OR WITHOUT locked status
        let neighboors = this.getNeighboors(tile.x, tile.y);
        neighboors.forEach((singleNeighboor) => {
            if (singleNeighboor.overlay && (!singleNeighboor.status || (singleNeighboor.status && singleNeighboor.status.type !== TILE_STATUS_TYPE.LOCKED))) {
               tilesToExplore.push(singleNeighboor);
            }
        });

        // Nothing to reveal ?
        if (tilesToExplore.length === 0) {
            callback();
            return;
        }
        
        // Reveal all those tiles
        this.#revealTiles(tilesToExplore, callback);
    }

    /**
     * @param {number} x 
     * @param {number} y 
     */
    selectTileAt(x, y) {
        let tile = this.#tiles.find(singleTile => singleTile.x === x && singleTile.y === y);
        
        // Select the current tile
        this.#tiles.forEach((singleTile) => {
            singleTile.removeSelection();
        });
        tile.createSeletion(this.#scene);
    }

    #createTiles() {
        this.#tiles = [];

        for (let y=0; y<this.#height; y++) {
            for (let x=0; x<this.#width; x++) {
                let isWall = (x === 0 || y === 0 || y === this.#height-1 || x === this.#width-1);

                let tile = new Tile(x, y, isWall ? TILE_TYPE.WALL : TILE_TYPE.FLOOR);

                this.#tiles.push(tile);
            }
        }
    }

    /**
     * @param {() => void} [callback]
     */
    revealAllTiles(callback) {
        let tiles = this.tiles.filter(singleTile => singleTile.overlay);

        this.preRevealTiles(tiles);

        tiles.forEach((singleTile) => {
            singleTile.removeOverlay(() => {
                this.#postRevealTile(singleTile);
            });
        });

        if (callback) {
            callback();
        }
    }

    /**
     * @param {() => void} [callback]
     */
    hideAllTiles(callback) {
        this.tiles.forEach((singleTile) => {
            if (singleTile.type === TILE_TYPE.WALL) {
                return;
            }

            if (singleTile.overlay) {
                return;
            }

            if (!SKIP_OVERLAYS) {
                singleTile.removeAll();
                singleTile.createOverlay(this.#scene, this.#theme.hidden.assetKey, this.#theme.hidden.assetFrame);
                singleTile.overlay.scaleIn();
            }
        });

        if (callback) {
            callback();
        }
    }

    /**
     * @param {Tile} tile1 
     * @param {Tile} tile2
     * @param {() => void} [callback] 
     */
    swapTiles(tile1, tile2, callback) {
        // Focus those tile on top
        this.#container.bringToTop(tile1.container);
        this.#container.bringToTop(tile2.container);

        // Move tile1
        let originalX1 = tile1.container.x;
        let originalY1 = tile1.container.y;

        this.#scene.add.tween({
            targets: tile1.container,
            x: tile2.container.x,
            y: tile2.container.y,
            duration: 200,
            onComplete: () => {
                tile1.container.x = originalX1;
                tile1.container.y = originalY1;
            }
        });

        // Move tile2
        let originalX2 = tile2.container.x;
        let originalY2 = tile2.container.y;

        this.#scene.add.tween({
            targets: tile2.container,
            x: tile1.container.x,
            y: tile1.container.y,
            duration: 200,
            onComplete: () => {
                tile2.container.x = originalX2;
                tile2.container.y = originalY2;

                if (callback) {
                    callback();
                }
            }
        });
    }

    /**
     * @param {Tile[]} tiles 
     * @param {() => void} [callback]
     */
    #revealTiles(tiles, callback) {
        this.preRevealTiles(tiles);

        tiles.forEach((singleTile) => {
            singleTile.removeOverlay(() => {
                this.#postRevealTile(singleTile, true, () => {
                   // callback = function callback 
                   console.log("...");
                });
            });
        });

        // TODO: Fix this
        this.#scene.time.delayedCall(250, () => {
            console.log("TIME...");
            callback();
        });

    }

    /**
     * @param {Tile} tile 
     * @param {boolean} [changeTileStatus=false] 
     * @param {() => void} [callback ]
     */
    #postRevealTile(tile, changeTileStatus, callback) {
        // An enemy is on the tile ?
        if (tile.enemy) {
            tile.createEnemy(this.#scene);
            console.log("ENEMY CREATED...");
            tile.enemy.shadow.gameObject.setAlpha(0);
            tile.enemy.fadeIn(() => {
                tile.enemy.shadow.fadeIn(); 
                console.log("enemy fade in...");

                // Animate an appear effect
                // TODO: Add Status on top tile instead (and roll back to the previous status)
                let effect = this.#scene.add.sprite(
                    tile.container.x + tile.container.getBounds().width / 2,
                    tile.container.y - tile.container.getBounds().height / 2,
                    DUNGEON_ASSET_KEYS.EFFECTS_LARGE
                );
                this.#container.add(effect);
                effect.on("animationcomplete", (tween, sprite, element) => {
                    element.destroy();
                });
                effect.anims.play("appear", true);
            });
            tile.enemy.animate();

            // Disable surrounding tile
            if (changeTileStatus) {
                let neighboors = this.getNeighboors(tile.x, tile.y);
                neighboors.forEach((singleNeighboor) => {
                    if (singleNeighboor.item) {
                        this.changeTileStatus(singleNeighboor, TILE_STATUS_TYPE.LOCKED);
                    }
                });
            }
        }

        if (callback) {
            callback();
        }
    }

    /**
     * @param {Tile} tile 
     * @param {TILE_STATUS_TYPE} newStatus 
     */
    changeTileStatus(tile, newStatus) {
        tile.setStatus(new TileStatus(newStatus));
        tile.createStatus(this.#scene, DUNGEON_ASSET_KEYS.TILE_STATUS, 0);
        tile.status.fadeIn();
    }

    /**
     * @param {Tile[]} [revealingTiles] 
     */
    preRevealTiles(revealingTiles) {
        // Shadow
        this.#tiles.forEach((singleTile) => {
            if (singleTile.type === TILE_TYPE.WALL) {
                return;
            }

            // Still have an overlay and is not in the revealing tiles..
            if (singleTile.overlay && !revealingTiles.find((singleRevealingTile) => singleRevealingTile.x === singleTile.x && singleRevealingTile.y === singleTile.y)) {
                return;
            }

            let needShadow = false;

            // Check if the top neighboor is NOT in the revealingTiles
            let tileTopNeighboor = this.#tiles.find(singleTopTile => singleTopTile.x === singleTile.x && singleTopTile.y === singleTile.y - 1);
            // A shadow below a wall
            if (tileTopNeighboor.type === TILE_TYPE.WALL) {
                needShadow = true;
            }
            // Need a shadow below a FLOOR with an OVERLAY
            if (tileTopNeighboor.type === TILE_TYPE.FLOOR && tileTopNeighboor.overlay && !revealingTiles.find(singleTopTile => singleTopTile.x === singleTile.x && singleTopTile.y === singleTile.y - 1)) {
                needShadow = true;
            }

            if (needShadow && !singleTile.shadow) {
                singleTile.createShadow(this.#scene, this.#theme.shadow.assetKey, this.#theme.shadow.assetFrame);
                return;
            }
            if (!needShadow && singleTile.shadow) {
                singleTile.shadow.fadeOut(() => {
                    singleTile.removeShadow();
                }, 200);
            }
        });

        revealingTiles.forEach((singleTile) => {
            if (singleTile.item) {
                singleTile.createItem(this.#scene);
            }
        });
    }

    validateStatus() {
        this.#tiles.forEach((singleTile) => {
            if (!singleTile.status) {
                return;
            }

            if (singleTile.status.type === TILE_STATUS_TYPE.LOCKED) {
                // Validate that at least ONE enemy is around
                let neighboors = this.getNeighboors(singleTile.x, singleTile.y);
                let aliveEnemies = neighboors.filter((singleNeighboor) => {
                    // Only check revealed tile
                    if (singleNeighboor.overlay) {
                        return;
                    }
                    // Must have an alive enemy
                    if (!singleNeighboor.enemy || !singleNeighboor.enemy.isAlive) {
                        return;
                    }
                    return true;
                });

                if (aliveEnemies.length === 0) {
                    singleTile.removeStatus();
                }
            }
        });
    }

    fixTilesDepth() {
        this.#tiles.forEach((singleTile) => {
            this.#container.bringToTop(singleTile.container);
        });
    }
}