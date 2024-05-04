import Phaser from "../../lib/phaser.js";

/** @typedef {keyof typeof ENTITY_TYPE} EntityType */
/** @enum {EntityType} */
export const ENTITY_TYPE = Object.freeze({
    WALL: 'WALL',
    FLOOR: 'FLOOR',
});

export class Entity {
    /** @protected @type {EntityType} */
    _type

    /** @protected @type {Phaser.GameObjects.Image} */
    _gameObject;

    /**
     * @param {EntityType} type 
     */
    constructor(type) {
        this._type = type;
    }

    /** @type {EntityType} */
    get type() {
        return this._type;
    }

    /**
     * @param {Phaser.Scene} scene 
     * @param {number} x
     * @param {number} y
     * @param {string} assetKey
     * @param {number} [assetFrame=0]
     * @returns {Phaser.GameObjects.Image}
     */
    create(scene, x, y, assetKey, assetFrame) {
        this._assetFrame = assetFrame;

        this._gameObject = scene.add.image(x, y, assetKey, assetFrame);
        this._gameObject.setOrigin(0);
        this._gameObject.setTint(0x000000);

        return this._gameObject;
    }
}
