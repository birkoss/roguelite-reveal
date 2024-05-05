import Phaser from "../../lib/phaser.js";

import { TILE_SIZE } from "../../config.js";
import { DUNGEON_ASSET_KEYS } from "../../keys/asset.js";

import { ENTITY_TYPE, Entity } from "./entity.js";

// TODO: Refactor to Unit class instead
export class Unit extends Entity {
    /** @type {UnitDetails} */
    #unitDetails; 

    /** @type {Phaser.GameObjects.Sprite} */
    #animatedGameObject;
    /** @type {number} */
    #hp;
    /** @type {number} */
    #maxHp;
    /** @type {number} */
    #attack;

    constructor(x, y, unitDetails) {
        super(x, y, ENTITY_TYPE.UNIT);

        this.#unitDetails = unitDetails;
        
        this.#hp = this.#unitDetails.hp;
        this.#maxHp = this.#unitDetails.hp;
        this.#attack = this.#attack;
    }

    /** @type {Phaser.GameObjects.Sprite} */
    get animatedGameObject() {
        return this.#animatedGameObject;
    }
    /** @type {UnitDetails} */
    get unitDetails() {
        return this.#unitDetails;
    }
    /** @type {boolean} */
    get isAlive() {
        return this.#hp > 0;
    }
    /** @type {number} */
    get hp() {
        return this.#hp;
    }
    /** @type {number} */
    get maxHp() {
        return this.#maxHp;
    }

    /**
     * @param {Phaser.Scene} scene 
     * @returns {Phaser.GameObjects.Image}
     */
    create(scene) {
        this.#animatedGameObject = scene.add.sprite(this.x * TILE_SIZE, this.y * TILE_SIZE, this.#unitDetails.assetKey, this.#unitDetails.assetFrames[0]);
        this.#animatedGameObject.setOrigin(0);

        let frames = this.#animatedGameObject.anims.generateFrameNumbers(this.#unitDetails.assetKey, { frames: this.#unitDetails.assetFrames });

        this.#animatedGameObject.anims.create({
            key: 'idle',
            frames: frames,
            frameRate: 2,
            repeat: -1,
          });

          // TODO: Add shadow under the character

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
            // TODO: Depending on Unit Data
            // TODO: Randomize the death frame
            this.#animatedGameObject.setTexture(DUNGEON_ASSET_KEYS.WORLD);
            this.#animatedGameObject.setFrame(89);
        }
    }
}
