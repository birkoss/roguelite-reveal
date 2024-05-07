import Phaser from "../../../lib/phaser.js";

import { DUNGEON_ASSET_KEYS } from "../../../keys/asset.js";
import { TileEntity } from "./entity.js";

export class TileUnit extends TileEntity {
    /** @type {UnitDetails} */
    #unitDetails;

    /** @type {TileEntity} */
    #shadow;

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

    constructor(unitDetails) {
        super();

        this.#unitDetails = unitDetails;
        
        this.#hp = this.#unitDetails.hp;
        this.#maxHp = this.#unitDetails.hp;
        this.#attack = this.#unitDetails.attack;
        this.#defense = this.#unitDetails.defense;
        this.#level = 1;

        this.#xp = 0;
        this.#xpToNext = this.#calculateXpToNext();
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
     * @param {string} [assetKey='']
     * @param {number[]} [assetFrames]
     * @returns {Phaser.GameObjects.Container}
     */
    createUnit(scene, assetKey, assetFrames) {
        this._gameObject = scene.add.sprite(
            0,
            -8,
            this.#unitDetails.assetKey,
            this.#unitDetails.assetFrames[0]
        ).setOrigin(0);

        let frames = this._gameObject.anims.generateFrameNumbers(
            this.#unitDetails.assetKey, 
            {
                frames: this.#unitDetails.assetFrames
            }
        );

        this._gameObject.anims.create({
            key: 'idle',
            frames: frames,
            frameRate: 2,
            repeat: -1,
        });

        let unitTiles = [];

        // Add shadow under the Unit
        this.#shadow = new TileEntity();
        if (this.#unitDetails.shadow) {
            this.#shadow.create(scene, this.#unitDetails.shadow.assetKey, this.#unitDetails.shadow.assetFrame);
            unitTiles.push(this.#shadow.gameObject);
        }

        unitTiles.push(this._gameObject);
        return scene.add.container(0, 0, unitTiles);
    }

    animate() {
        this._gameObject.anims.play('idle');
    }

    /**
     * @param {number} xp 
     */
    gainXp(xp) {
        this.#xp += xp;
    }

    levelUp() {
        this.#xp = Math.max(0, this.#xp - this.#xpToNext);

        this.#level++;

        this.#attack = this.#calculateStat(this.#unitDetails.attack);
        this.#defense = this.#calculateStat(this.#unitDetails.defense);
        let previousMaxHp = this.#maxHp;
        this.#maxHp = this.#calculateStat(this.#unitDetails.hp);
        this.#hp += (this.#maxHp - previousMaxHp);

        this.#xpToNext = this.#calculateXpToNext();
    }

    /**
     * @param {number} damage 
     */
    takeDamage(damage) {
        this.#hp = Math.max(0, this.#hp - damage);

        if (!this.isAlive) {
            this._gameObject.anims.stop();
            // Change the unit texture and frame
            this._gameObject.setTexture(this.#unitDetails.death.assetKey);
            this._gameObject.setFrame(this.#unitDetails.death.assetFrame);

            this._gameObject.y = 0;
            if (this.#shadow) {
                this.#shadow.remove();
            }
        }
    }

    /**
     * @param {number} base 
     * @returns {number}
     */
    #calculateStat(base) {
        let mod = 0.42; // (0.42 -> 0.5)
        return Math.floor(base + ((base * mod) * (this.#level - 1)));
    }

    /**
     * @param {number} base 
     * @returns {number}
     */
    #calculateHealth(base) {
        let mod = 0.47; // (0.47 -> 0.53)
        return Math.floor( (this.#level + 120) / 100 * Math.floor(base * mod * (this.#level + 1)));
    }

    #calculateXpToNext() {
        return Math.round((0.04 * Math.pow(this.#level, 3)) + (0.8 * Math.pow(this.#level, 2)) + (2 * this.#level));
    }
}
