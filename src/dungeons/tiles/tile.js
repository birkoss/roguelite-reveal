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
     */
    create(scene, assetKey, assetFrame) {
        this._gameObject = scene.add.sprite(this.x * 48, this.y * 48, assetKey, assetFrame);
        this._gameObject.setOrigin(0);
    }
}