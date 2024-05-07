import Phaser from "../../lib/phaser.js";

import { SKIP_OVERLAYS, TILE_SIZE } from "../../config.js";
import { TileEntity } from "./entities/entity.js";
import { TileUnit } from "./entities/unit.js";
import { TileItem } from "./entities/item.js";
import { UI_ASSET_KEYS } from "../../keys/asset.js";

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
    /** @type {Phaser.GameObjects.Sprite} */
    #selection;
    /** @type {TileEntity} */
    #overlay;
    /** @type {TileUnit} */
    #enemy;
    /** @type {TileItem} */
    #item;

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
    /** @type {TileUnit} */
    get enemy() {
        return this.#enemy;
    }
    /** @type {TileItem} */
    get item() {
        return this.#item;
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
     * @param {UnitDetails} unitDetails 
     */
    addEnemy(unitDetails) {
        this.#enemy = new TileUnit(unitDetails);
    }

    /**
     * @param {TileItem} item 
     */
    addItem(item) {
        this.#item = item;
    }

    /**
     * @param {Phaser.Scene} scene 
     * @param {string} assetKey 
     * @param {number} assetFrame 
     */
    createItem(scene, assetKey, assetFrame) {
        this.#item.create(scene, assetKey, assetFrame);
        this.#container.add(this.#item.gameObject);

        // Center the item on the tile
        this.#item.gameObject.x = (this.#background.gameObject.displayWidth - this.#item.gameObject.displayWidth) / 2;
        this.#item.gameObject.y = (this.#background.gameObject.displayHeight - this.#item.gameObject.displayHeight) / 2;
    }

    /**
     * @param {Phaser.Scene} scene 
     */
    createEnemy(scene) {
        let container = this.#enemy.createUnit(scene);
        if (!SKIP_OVERLAYS) {
            this.#enemy.gameObject.setAlpha(0);
        }
        this.#container.add(container);
    }

    /**
     * @param {Phaser.Scene} scene 
     * @param {string} assetKey 
     * @param {number} assetFrame 
     */
    createShadow(scene, assetKey, assetFrame) {
        let shadow = scene.add.sprite(0, 0, assetKey, assetFrame);
        shadow.setOrigin(0);
        this.#container.add(shadow);
    }

    /**
     * @param {Phaser.Scene} scene 
     */
    createSeletion(scene) {
        console.log("CS...");
        this.#selection = scene.add.sprite(0, 0, UI_ASSET_KEYS.SELECTED_TILE);
        this.#selection.setAlpha(0).setOrigin(0);
        this.#container.add(this.#selection);
    }

    /**
     * @param {Phaser.Scene} scene 
     * @param {string} assetKey 
     * @param {number} assetFrame 
     */
    createStatus(scene, assetKey, assetFrame) {
        console.log(assetKey);
        let status = scene.add.image(0, 0, assetKey, assetFrame);
        status.setOrigin(0);
        this.#container.add(status);
    }

    /**
     * @param {() => void} [callback] 
     */
    reveal(callback) {
        this.#overlay.remove(() => {
            this.#overlay.gameObject.destroy();
            this.#overlay = undefined;

            if (this.#enemy) {
                this.#enemy.gameObject.setAlpha(1);
            }

            if (callback) {
                callback();
            }
        });
    }

    select() {
        if (this.#selection) {
            this.#selection.setAlpha(1);
        }
    }

    unselect() {
        if (this.#selection) {
            this.#selection.setAlpha(0);
        }
    }

    /**
     * @param {() => void} [callback] 
     */
    useItem(callback) {
        this.#item.remove(() => {
            this.#item.gameObject.destroy();
            this.#item = undefined;

            if (callback) {
                callback();
            }
        });
    }
}
