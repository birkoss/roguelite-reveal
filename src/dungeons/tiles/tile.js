import Phaser from "../../lib/phaser.js";

import { TILE_SIZE } from "../../config.js";
import { TileEntity } from "./entities/entity.js";
import { TileOverlay } from "./entities/overlay.js";
import { TileUnit } from "./entities/unit.js";
import { TileItem } from "./entities/item.js";

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
    /** @type {TileOverlay} */
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

    /** @type {TileOverlay} */
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
        // TODO: Replace this shadow depending on the layout
        // if (this.x === 1 && this.y === 1) {
        //     let shadow = scene.add.sprite(this.x * 48, this.y * 48, assetKey, 2009);
        //     shadow.setOrigin(0);
        // }
        this.#background = new TileEntity();
        this.#background.create(scene, assetKey, assetFrame);
        this.#container.add(this.#background.gameObject);

        if (this.#enemy) {
            this.#enemy.createUnit(scene);
            this.#container.add(this.#enemy.gameObject);
        }

        return this.#container;
    }

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {string} assetKey 
     * @param {number} assetFrame 
     * @returns {TileOverlay}
     */
    createOverlay(scene, assetKey, assetFrame) {
        this.#overlay = new TileOverlay();
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
    }

    /**
     * @param {() => void} [callback] 
     */
    reveal(callback) {
        this.#overlay.reveal(() => {
            this.#overlay.gameObject.destroy();
            this.#overlay = undefined;

            if (callback) {
                callback();
            }
        });
    }
}
