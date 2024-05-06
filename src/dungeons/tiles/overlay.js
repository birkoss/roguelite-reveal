import Phaser from "../../lib/phaser.js";

import { TILE_TYPE, Tile } from "./tile.js";

/** @typedef {keyof typeof OVERLAY_TYPE} OverlayType */
/** @enum {OverlayType} */
export const OVERLAY_TYPE = Object.freeze({
    NONE: 'NONE',
    FULL: 'FULL',
});

export class Overlay extends Tile {
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

            if (options?.callback) {
                options.callback();
            }
        }

        this._gameObject.setOrigin(0.5);
        this._gameObject.x += this._gameObject.displayWidth / 2;
        this._gameObject.y += this._gameObject.displayHeight / 2;

        this._gameObject.scene.add.tween({
            targets: [
                this._gameObject,
            ],
            alpha: 0,
            scaleY: 0,
            scaleX: 0,
            duration: 100,
            onComplete: () => {
                if (options?.callback) {
                    options.callback();
                }
            }
        });
    }
}
