import { TILE_SIZE } from "../../config.js";
import { DUNGEON_ASSET_KEYS } from "../../keys/asset.js";
import Phaser from "../../lib/phaser.js";

import { ENTITY_TYPE, Entity } from "./entity.js";

export class Enemy extends Entity {
    /** @type {EnemyDetails} */
    #enemyDetails;

    /** @type {Phaser.GameObjects.Sprite} */
    #animatedGameObject;
    /** @type {number} */
    #hp;
    /** @type {number} */
    #attack;

    constructor(x, y, enemyDetails) {
        super(x, y, ENTITY_TYPE.ENEMY);

        this.#enemyDetails = enemyDetails;
        
        this.#hp = this.#enemyDetails.hp;
        this.#attack = this.#attack;
    }

    /** @type {Phaser.GameObjects.Sprite} */
    get animatedGameObject() {
        return this.#animatedGameObject;
    }
    /** @type {EnemyDetails} */
    get enemyDetails() {
        return this.#enemyDetails;
    }
    /** @type {boolean} */
    get isAlive() {
        return this.#hp > 0;
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

    /**
     * @param {number} damage 
     */
    takeDamage(damage) {
        this.#hp = Math.max(0, this.#hp - damage);

        if (!this.isAlive) {
            this.#animatedGameObject.anims.stop();
            this.#animatedGameObject.setTexture(DUNGEON_ASSET_KEYS.WORLD);
            this.#animatedGameObject.setFrame(89);
        }
    }
}
