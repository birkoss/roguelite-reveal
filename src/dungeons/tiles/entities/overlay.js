import Phaser from "../../../lib/phaser.js";

import { TileEntity } from "./entity.js";

export class TileOverlay extends TileEntity {
    /**
     * @param {() => void} [callback]
     */
    reveal(callback) {
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
                if (callback) {
                    callback();
                }
            }
        });
    }
}
