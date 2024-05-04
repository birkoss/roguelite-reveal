import { TILE_SIZE } from "../../config.js";
import Phaser from "../../lib/phaser.js";

/** @typedef {keyof typeof TILE_TYPE} TileType */
/** @enum {TileType} */
export const TILE_TYPE = Object.freeze({
    WALL: 'WALL',
    FLOOR: 'FLOOR',
});

export class Tile {
    /** @protected @type {number} */
    _x;
    /** @protected @type {number} */
    _y;
    /** @protected @type {TileType} */
    _type;
    /** @protected @type {boolean} */
    _isRevealed;

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

        this._isRevealed = false;
    }

    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get type() {
        return this._type;
    }

    /**
     * @param {Phaser.Scene} scene 
     * @param {string} assetKey
     * @param {number} [assetFrame=0]
     * @returns {Phaser.GameObjects.Image}
     */
    create(scene, assetKey, assetFrame) {
        if (this._type == TILE_TYPE.FLOOR) {
            assetFrame = 2;
        }
        this._gameObject = scene.add.sprite(this.x * TILE_SIZE, this.y * TILE_SIZE, assetKey, assetFrame);
        this._gameObject.setOrigin(0);

        // TODO: Replace this shadow depending on the layout
        // if (this.x === 1 && this.y === 1) {
        //     let shadow = scene.add.sprite(this.x * 48, this.y * 48, assetKey, 2009);
        //     shadow.setOrigin(0);
        // }

        return this._gameObject;
    }
}
