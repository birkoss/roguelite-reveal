import { TILE_SIZE } from "../../config.js";
import Phaser from "../../lib/phaser.js";

import { ENTITY_TYPE, Entity } from "./entity.js";

export class Enemy extends Entity {
    /** @type {EnemyDetails} */
    #enemyDetails;

    /** @type {EnemyDetails} */
    get enemyDetails() {
        return this.#enemyDetails;
    }

    constructor(x, y, enemyDetails) {
        super(x, y, ENTITY_TYPE.ENEMY);

        this.#enemyDetails = enemyDetails;
    }

    /**
     * @param {Phaser.Scene} scene 
     * @returns {Phaser.GameObjects.Image}
     */
    create(scene) {
        this._gameObject = scene.add.image(this.x * TILE_SIZE, this.y * TILE_SIZE, this.#enemyDetails.assetKey, this.#enemyDetails.assetFrames[0]);
        this._gameObject.setOrigin(0);

        return this._gameObject;
    }
}
