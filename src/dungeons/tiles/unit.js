import Phaser from "../../lib/phaser.js";

import { TILE_SIZE } from "../../config.js";
import { DUNGEON_ASSET_KEYS } from "../../keys/asset.js";
import { ENTITY_TYPE, Entity } from "./entity.js";

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
    /** @type {number} */
    #defense;
    /** @type {number} */
    #level;
    /** @type {number} */
    #xp;
    /** @type {number} */
    #xpToNext;

    constructor(x, y, unitDetails) {
        super(x, y, ENTITY_TYPE.UNIT);

        this.#unitDetails = unitDetails;
        
        this.#hp = this.#unitDetails.hp;
        this.#maxHp = this.#unitDetails.hp;
        this.#attack = this.#unitDetails.attack;
        this.#defense = this.#unitDetails.defense;
        this.#level = 1;

        this.#xp = 0;
        this.#xpToNext = this.#calculateXpToNext();
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
    /** @type {number} */
    get attack() {
        return this.#attack;
    }
    /** @type {number} */
    get defense() {
        return this.#defense;
    }
    /** @type {number} */
    get level() {
        return this.#level;
    }
    /** @type {number} */
    get xp() {
        return this.#xp;
    }
    /** @type {number} */
    get xpToNext() {
        return this.#xpToNext;
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

    levelUp() {
        this.#level++;

        this.#attack = this.#getStats(this.#unitDetails.attack);
        this.#defense = this.#getStats(this.#unitDetails.defense);
        this.#hp = this.#calculateHealth(this.#unitDetails.hp);

        this.#xpToNext = this.#calculateXpToNext();
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

    /**
     * @param {number} base 
     * @returns {number}
     */
    #getStats(base) {
        let mod = 0.42; // (0.42 -> 0.5)
        return Math.floor(base + ((base * mod) * (this.#level - 1)));
    }

    /**
     * @param {number} base 
     * @returns {number}
     */
    #calculateHealth(base) {
        let mod = 0.47; // (0.47 -> 0.53)
        return Math.floor( (this.#level + 165) / 100 * Math.floor(base * mod * (this.#level + 1)));
    }

    

    #calculateXpToNext() {
        // return (0.04 * this.#level^3) + (0.8 * this.#level^2) + (2 * this.#level);
        return (2 * this.#level) + 1;
    }
}
