import { TILE_SIZE } from "../../config.js";
import Phaser from "../../lib/phaser.js";

import { ENTITY_TYPE, Entity } from "./entity.js";

export class Enemy extends Entity {
    /** @type {EnemyDetails} */
    #enemyDetails;

    /** @type {Phaser.GameObjects.Sprite} */
    #animatedGameObject;

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
        this.#animatedGameObject = scene.add.sprite(this.x * TILE_SIZE, this.y * TILE_SIZE, this.#enemyDetails.assetKey, this.#enemyDetails.assetFrames[0]);
        this.#animatedGameObject.setOrigin(0);

        let frames = this.#animatedGameObject.anims.generateFrameNumbers(this.#enemyDetails.assetKey, { frames: this.#enemyDetails.assetFrames });

        this.#animatedGameObject.anims.create({
            key: 'idle',
            frames: frames,
            frameRate: 2,
            repeat: -1,
          });

        return this.#animatedGameObject;
    }

    animate() {
        this.#animatedGameObject.anims.play('idle');
    }
}
