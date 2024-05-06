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
}
