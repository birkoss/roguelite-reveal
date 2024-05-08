import Phaser from "../../../lib/phaser.js";

export class TileEntity {
    /** @protected @type {Phaser.GameObjects.Sprite} */
    _gameObject;

    /** @type {Phaser.GameObjects.Sprite} */
    get gameObject() {
        return this._gameObject;
    }

    /**
     * @param {Phaser.Scene} scene 
     * @param {string} [assetKey='']
     * @param {number} [assetFrame=0]
     * @returns {Phaser.GameObjects.Sprite}
     */
    create(scene, assetKey, assetFrame) {
        this._gameObject = scene.add.sprite(0, 0, assetKey, assetFrame).setOrigin(0.5);
        this._gameObject.x = this._gameObject.width / 2;
        this._gameObject.y = this._gameObject.height / 2;
        return this._gameObject;
    }

    /**
     * @param {() => void} [callback]
     */
    fadeIn(callback) {
        this._gameObject.setAlpha(0);

        this._gameObject.scene.add.tween({
            targets: [
                this._gameObject,
            ],
            alpha: 1,
            duration: 500,
            ease: Phaser.Math.Easing.Cubic.Out,
            onComplete: () => {
                if (callback) {
                    callback();
                }
            }
        });
    }
    /**
     * @param {() => void} [callback]
     */
    fadeOut(callback) {
        this._gameObject.setAlpha(1);

        this._gameObject.scene.add.tween({
            targets: [
                this._gameObject,
            ],
            alpha: 0,
            duration: 500,
            onComplete: () => {
                if (callback) {
                    callback();
                }
            }
        });
    }

    /**
     * @param {() => void} [callback]
     */
    scaleIn(callback) {
        this._gameObject.setScale(0);
        this._gameObject.setAlpha(0);

        this._gameObject.scene.add.tween({
            targets: [
                this._gameObject,
            ],
            alpha: 1,
            scaleY: 1,
            scaleX: 1,
            duration: 500,
            ease: Phaser.Math.Easing.Bounce.Out,
            onComplete: () => {
                if (callback) {
                    callback();
                }
            }
        });
    }
    /**
     * @param {() => void} [callback]
     */
    scaleOut(callback) {
        this._gameObject.scene.add.tween({
            targets: [
                this._gameObject,
            ],
            // alpha: 0,
            scaleY: 0,
            scaleX: 0,
            duration: 500,
            ease: Phaser.Math.Easing.Bounce.In,
            onComplete: () => {
                if (callback) {
                    callback();
                }
            }
        });
    }
}
