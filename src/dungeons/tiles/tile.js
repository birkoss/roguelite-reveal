import Phaser from "../../lib/phaser.js";

import { TILE_SIZE } from "../../config.js";
import { Entity } from "../entities/entity.js";

/** @typedef {keyof typeof TILE_TYPE} TileType */
/** @enum {TileType} */
export const TILE_TYPE = Object.freeze({
    WALL: 'WALL',
    FLOOR: 'FLOOR',
});


/** @typedef {keyof typeof TILE_FOG_OF_WAR} TileFogOfWar */
/** @enum {TileFogOfWar} */
export const TILE_FOG_OF_WAR = Object.freeze({
    NONE: 'NONE',
    PARTIAL: 'PARTIAL',
    FULL: 'FULL',
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
    /** @protected @type {Phaser.GameObjects.Image | undefined} */
    _overlayGameObject;

    /** @type {number} */
    _assetFrame;

    /** @type {TileFogOfWar} */
    _fogOfWar;

    /** @type {Entity | undefined} */
    _entity;

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
        this._fogOfWar = TILE_FOG_OF_WAR.FULL;
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
    /** @type {boolean} */
    get isRevealed() {
        return this._isRevealed;
    }
    /** @type {TileFogOfWar} */
    get fogOfWar() {
        return this._fogOfWar;
    }
    /** @type {Phaser.GameObjects.Image} */
    get gameObject() {
        return this._gameObject;
    }

    /**
     * @param {Phaser.Scene} scene 
     * @param {string} assetKey
     * @param {number} [assetFrame=0]
     * @returns {Phaser.GameObjects.Image}
     */
    create(scene, assetKey, assetFrame) {
        this._assetFrame = assetFrame;

        this._gameObject = scene.add.image(this.x * TILE_SIZE, this.y * TILE_SIZE, assetKey, assetFrame);
        this._gameObject.setOrigin(0);

        // this._gameObject.setTint(0x000000);

        // this._overlayGameObject = scene.add.image(this._gameObject.x, this._gameObject.y, assetKey, 2);
        // this._overlayGameObject.setOrigin(0);
        // this._overlayGameObject.setAlpha(0.4);

        // TODO: Replace this shadow depending on the layout
        // if (this.x === 1 && this.y === 1) {
        //     let shadow = scene.add.sprite(this.x * 48, this.y * 48, assetKey, 2009);
        //     shadow.setOrigin(0);
        // }

        return this._gameObject;
    }

    /**
     * @param {object} [options]
     * @param {() => void} [options.callback]
     * @param {boolean} [options.skipAnimation=false]
     */
    reveal(options) {
        const skipAnimation = options?.skipAnimation || false;

        this._gameObject.setTint(0xffffff);

        if (skipAnimation) {
            this._overlayGameObject.setAlpha(0);
            this._isRevealed = true;
            this._fogOfWar = TILE_FOG_OF_WAR.NONE;

            if (options?.callback) {
                options.callback();
            }
        }

        this._gameObject.scene.add.tween({
            targets: this._overlayGameObject,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                this._isRevealed = true;
                this._fogOfWar = TILE_FOG_OF_WAR.NONE;

                if (options?.callback) {
                    options.callback();
                }
            }
        });
    }

    /**
     * @param {() => void} [callback]
     */
    preview(callback) {
        if (this._fogOfWar === TILE_FOG_OF_WAR.NONE) {
            return;
        }

        this._gameObject.scene.add.tween({
            targets: this._overlayGameObject,
            alpha: 1,
            ease: Phaser.Math.Easing.Sine.Out,
            duration: 400,
            onComplete: () => {
                this._fogOfWar = TILE_FOG_OF_WAR.PARTIAL;
                if (callback) {
                    callback();
                }
            }
        });
    }
}
