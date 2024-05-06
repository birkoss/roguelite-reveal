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
        this._gameObject = scene.add.sprite(0, 0, assetKey, assetFrame).setOrigin(0);
        this._gameObject.setOrigin(0);

        return this._gameObject;
    }

    /**
     * @param {() => void} [callback]
     */
    remove(callback) {
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
