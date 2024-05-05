import Phaser from "../../lib/phaser.js";

import { TILE_SIZE } from "../../config.js";

/** @typedef {keyof typeof TILE_TYPE} TileType */
/** @enum {TileType} */
export const TILE_TYPE = Object.freeze({
    WALL: 'WALL',
    FLOOR: 'FLOOR',
    OVERLAY: 'OVERLAY',
    ENTITY: 'ENTITY',
});

export class Tile {
    /** @protected @type {number} */
    _x;
    /** @protected @type {number} */
    _y;
    /** @protected @type {TileType} */
    _type;

    /** @protected @type {Phaser.GameObjects.Image} */
    _gameObject;

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {TileType} type 
     */
    constructor(x, y, type) {
        this._x = x;
        this._y = y;
        this._type = type;
    }

    /** @type {number} */
    get x() {
        return this._x;
    }
    /** @type {number} */
    get y() {
        return this._y;
    }
    /** @type {TileType} */
    get type() {
        return this._type;
    }
    /** @type {Phaser.GameObjects.Image} */
    get gameObject() {
        return this._gameObject;
    }

    /**
     * @param {Phaser.Scene} scene 
     * @param {string} [assetKey='']
     * @param {number} [assetFrame=0]
     * @returns {Phaser.GameObjects.Image}
     */
    create(scene, assetKey, assetFrame) {
        this._gameObject = scene.add.image(this.x * TILE_SIZE, this.y * TILE_SIZE, assetKey, assetFrame);
        this._gameObject.setOrigin(0);

        // TODO: Replace this shadow depending on the layout
        // if (this.x === 1 && this.y === 1) {
        //     let shadow = scene.add.sprite(this.x * 48, this.y * 48, assetKey, 2009);
        //     shadow.setOrigin(0);
        // }

        return this._gameObject;
    }

   
}
