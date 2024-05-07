import Phaser from "../../lib/phaser.js";

import { TILE_SIZE } from "../../config.js";
import { UI_ASSET_KEYS } from "../../keys/asset.js";
import { TileEntity } from "./entities/entity.js";
import { TileUnit } from "./entities/unit.js";
import { TileItem } from "./entities/item.js";
import { TileStatus } from "./entities/status.js";

/** @typedef {keyof typeof TILE_TYPE} TileType */
/** @enum {TileType} */
export const TILE_TYPE = Object.freeze({
    WALL: 'WALL',
    FLOOR: 'FLOOR',
});

export class Tile {
    /** @type {number} */
    #x;
    /** @type {number} */
    #y;
    /** @type {TileType} */
    #type;

    /** @type {Phaser.GameObjects.Container} */
    #container;

    /** @type {TileEntity} */
    #background;
    /** @type {TileEntity} */
    #shadow;
    /** @type {Phaser.GameObjects.Sprite} */
    #selection;
    /** @type {TileEntity} */
    #overlay;
    /** @type {TileUnit} */
    #enemy;
    /** @type {TileItem} */
    #item;
    /** @type {TileStatus} */
    #status;

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {TileType} type 
     */
    constructor(x, y, type) {
        this.#x = x;
        this.#y = y;
        this.#type = type;
    }

    /** @type {number} */
    get x() {
        return this.#x;
    }
    /** @type {number} */
    get y() {
        return this.#y;
    }
    /** @type {TileType} */
    get type() {
        return this.#type;
    }
    /** @type {Phaser.GameObjects.Container} */
    get container() {
        return this.#container;
    }

    /** @type {TileEntity} */
    get overlay() {
        return this.#overlay;
    }
    /** @type {TileEntity} */
    get background() {
        return this.#background;
    }
    /** @type {TileEntity} */
    get shadow() {
        return this.#shadow;
    }
    /** @type {TileUnit} */
    get enemy() {
        return this.#enemy;
    }
    /** @type {TileItem} */
    get item() {
        return this.#item;
    }
    /** @type {TileStatus} */
    get status() {
        return this.#status;
    }

    /**
     * @param {Phaser.Scene} scene 
     * @param {string} [assetKey='']
     * @param {number} [assetFrame=0]
     * @returns {Phaser.GameObjects.Container}
     */
    create(scene, assetKey, assetFrame) {
        this.#container = scene.add.container(this.x * TILE_SIZE, this.y * TILE_SIZE);

        // Create the tile background (wall or floor)
        this.#background = new TileEntity();
        this.#background.create(scene, assetKey, assetFrame);
        this.#container.add(this.#background.gameObject);

        return this.#container;
    }

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {string} assetKey 
     * @param {number} assetFrame 
     * @returns {TileEntity}
     */
    createOverlay(scene, assetKey, assetFrame) {
        this.#overlay = new TileEntity();
        this.#overlay.create(scene, assetKey, assetFrame);
        this.#container.add(this.#overlay.gameObject);
        return this.#overlay;
    }
    /**
     * @param {() => void} [callback] 
     */
    removeOverlay(callback) {
        this.#overlay.scaleOut(() => {
            this.#overlay.gameObject.destroy();
            this.#overlay = undefined;

            if (callback) {
                callback();
            }
        });
    }

    /**
     * @param {UnitDetails} unitDetails 
     */
    setEnemy(unitDetails) {
        this.#enemy = new TileUnit(unitDetails);
    }
    /**
     * @param {Phaser.Scene} scene 
     */
    createEnemy(scene) {
        let container = this.#enemy.createUnit(scene);
        this.#container.add(container);
    }
    removeEnemy() {
        if (this.#enemy) {
            this.#enemy.shadow.gameObject.destroy();
            this.#enemy.gameObject.destroy();
            this.#enemy = undefined;
        }
    }

    /**
     * @param {Phaser.Scene} scene 
     * @param {string} assetKey 
     * @param {number} assetFrame 
     */
    createShadow(scene, assetKey, assetFrame) {
        this.#shadow = new TileEntity();
        this.#shadow.create(scene, assetKey, assetFrame);
        this.#container.add(this.#shadow.gameObject);

        if (this.#selection) {
            this.#container.moveAbove(this.#selection, this.#shadow.gameObject);
        }
    }
    removeShadow() {
        if (this.#shadow) {
            this.#shadow.gameObject.destroy();
            this.#shadow = undefined;
        }
    }

    /**
     * @param {TileStatus} status 
     */
    setStatus(status) {
        this.#status = status;
    }
    /**
     * @param {Phaser.Scene} scene 
     * @param {string} assetKey 
     * @param {number} assetFrame 
     */
    createStatus(scene, assetKey, assetFrame) {
        let tile = this.#status.create(scene, assetKey, assetFrame);
        this.#container.add(tile);
    }
    removeStatus() {
        if (this.#status) {
            this.#status.gameObject.destroy();
            this.#status = undefined;
        }
    }

    /**
     * @param {Phaser.Scene} scene 
     */
    createSeletion(scene) {
        this.#selection = scene.add.sprite(0, 0, UI_ASSET_KEYS.SELECTED_TILE);
        this.#selection.setOrigin(0);
        this.#container.add(this.#selection);
    }
    removeSelection() {
        if (this.#selection) {
            this.#selection.destroy();
            this.#selection = undefined;
        }
    }

    /**
     * @param {TileItem} item 
     */
    setItem(item) {
        this.#item = item;
    }
    /**
     * @param {Phaser.Scene} scene 
     */
    createItem(scene) {
        this.#item.create(scene, this.#item.itemDetails.assetKey, this.#item.itemDetails.assetFrame);
        this.#container.add(this.#item.gameObject);

        // Center the item on the tile
        this.#item.gameObject.x += (this.#background.gameObject.displayWidth - this.#item.gameObject.displayWidth) / 2;
        this.#item.gameObject.y += (this.#background.gameObject.displayHeight - this.#item.gameObject.displayHeight) / 2;
    }
    /**
     * @param {() => void} [callback] 
     */
    useItem(callback) {
        this.#item.scaleOut(() => {
            this.removeItem();

            if (callback) {
                callback();
            }
        });
    }
    removeItem() {
        if (this.#item) {
            this.#item.gameObject.destroy();
            this.#item = undefined;
        }
    }
}
