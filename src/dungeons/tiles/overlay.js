import Phaser from "../../lib/phaser.js";

import { TILE_TYPE, Tile } from "./tile.js";

/** @typedef {keyof typeof OVERLAY_TYPE} OverlayType */
/** @enum {OverlayType} */
export const OVERLAY_TYPE = Object.freeze({
    NONE: 'NONE',
    PARTIAL: 'PARTIAL',
    FULL: 'FULL',
});

export class Overlay extends Tile {
    /** @type {Phaser.GameObjects.Rectangle} */
    #background;

    /** @type {OverlayType} */
    #overlayType;

    /**
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        super(x, y, TILE_TYPE.OVERLAY);

        this.#overlayType = OVERLAY_TYPE.FULL;
    }

    /** @type {Phaser.GameObjects.Rectangle} */
    get background() {
        return this.#background;
    }
    /** @type {OverlayType} */
    get overlayType() {
        return this.#overlayType;
    }

    /**
     * @param {Phaser.Scene} scene 
     * @param {string} assetKey
     * @param {number} [assetFrame=0]
     * @returns {Phaser.GameObjects.Image}
     */
    create(scene, assetKey, assetFrame) {
        let gameObject = super.create(scene, assetKey, assetFrame);
        gameObject.setAlpha(0.5);

        this.#background = scene.add.rectangle(gameObject.x, gameObject.y, gameObject.displayWidth, gameObject.displayHeight, 0x000000);
        this.#background.setOrigin(0);

        return gameObject;
    }

    /**
     * @param {object} [options]
     * @param {() => void} [options.callback]
     * @param {boolean} [options.skipAnimation=false]
     */
    reveal(options) {
        const skipAnimation = options?.skipAnimation || false;

        this.#overlayType = OVERLAY_TYPE.NONE;

        if (skipAnimation) {
            this._gameObject.setAlpha(0);
            this.#background.setAlpha(0);

            if (options?.callback) {
                options.callback();
            }
        }

        this._gameObject.scene.add.tween({
            targets: [
                this._gameObject,
                this.#background,
            ],
            alpha: 0,
            duration: 200,
            onComplete: () => {
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
        this.#overlayType = OVERLAY_TYPE.PARTIAL;

        this._gameObject.scene.add.tween({
            targets: this._gameObject,
            alpha: 1,
            ease: Phaser.Math.Easing.Sine.Out,
            duration: 100,
            onComplete: () => {
                if (callback) {
                    callback();
                }
            }
        });
    }
}
