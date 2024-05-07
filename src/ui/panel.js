import Phaser from "../lib/phaser.js";

import { UI_ASSET_KEYS } from "../keys/asset.js";
import { HorizontalBar } from "./horizontal-bar.js";
import { TileUnit } from "../dungeons/tiles/entities/unit.js";

export class Panel {
    /** @type {Phaser.Scene} */
    #scene;

    /** @type {Phaser.GameObjects.Container} */
    #container;
    /** @type {Phaser.GameObjects.Image} */
    #background;
    /** @type {Phaser.GameObjects.Text} */
    #textName;
    /** @type {Phaser.GameObjects.Text} */
    #textLevel;
    /** @type {TileUnit} */
    #player;
    /** @type {HorizontalBar} */
    #hpBar;
    /** @type {HorizontalBar} */
    #mpBar;
    /** @type {HorizontalBar} */
    #xpBar;

    /**
     * @param {Phaser.Scene} scene 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(scene, x, y) {
        this.#scene = scene;

        this.#container = this.#scene.add.container(x, y);

        this.#background = this.#scene.add.image(0, 0, UI_ASSET_KEYS.PANEL);
        this.#background.setOrigin(0);
        this.#container.add(this.#background);
    }

    /** @type {Phaser.GameObjects.Container} */
    get container() {
        return this.#container;
    }

    /** @type {TileUnit} */
    get player() {
        return this.#player;
    }

    /**
     * @param {UnitDetails} dataDetails 
     */
    setCharacter(dataDetails) {
        this.#textName = this.#scene.add.text(22, 20, dataDetails.name).setOrigin(0);
        this.#container.add(this.#textName);

        this.#player = new TileUnit(dataDetails);
        let container = this.#player.createUnit(this.#scene);
        container.setPosition(22, 62);
        this.#player.gameObject.setFlipX(true);
        this.#player.animate();
        this.#container.add(container);

        // for (let i=0; i<20; i++) {
        //     console.log(this.#player.level, this.#player.xpToNext);
        //     this.#player.levelUp();
        // }

        this.#textLevel = this.#scene.add.text(366, 20, `LV ${this.#player.level}`).setOrigin(1, 0);
        this.#container.add(this.#textLevel);

        let text = this.#scene.add.text(120, 46, "HP").setOrigin(1, 0);
        this.#container.add(text);
        this.#hpBar = new HorizontalBar(this.#scene, 130, text.y + 8, 220, 3);
        this.#hpBar.setText(`${this.#player.hp}/${this.#player.maxHp}`);
        this.#container.add(this.#hpBar.container);

        text = this.#scene.add.text(120, 70, "MP").setOrigin(1, 0);
        this.#container.add(text);
        this.#mpBar = new HorizontalBar(this.#scene, 130, text.y + 8, 220, 6);
        this.#mpBar.setText('0/3');
        this.#mpBar.setWidthAnimated(0, { duration: 1 });
        this.#container.add(this.#mpBar.container);

        text = this.#scene.add.text(120, 94, "XP").setOrigin(1, 0);
        this.#container.add(text);
        this.#xpBar = new HorizontalBar(this.#scene, 130, text.y + 8, 220, 9);
        this.#xpBar.setText(`${this.#player.xp}/${this.#player.xpToNext}`);
        this.#xpBar.setWidthAnimated(0, { duration: 1 });
        this.#container.add(this.#xpBar.container);

        text = this.#scene.add.text(120, 148, "Skills").setOrigin(1, 0);
        this.#container.add(text);
        let btn = this.#scene.add.sprite(130, 130, UI_ASSET_KEYS.BUTTON_SKILLS, 1).setOrigin(0);
        this.#container.add(btn);
        btn = this.#scene.add.sprite(222, 130, UI_ASSET_KEYS.BUTTON_SKILLS, 1).setOrigin(0);
        this.#container.add(btn);
        btn = this.#scene.add.sprite(320, 130, UI_ASSET_KEYS.BUTTON_SKILLS, 1).setOrigin(0);
        this.#container.add(btn);
    }

    /**
     * @param {number} amount 
     */
    updatePlayerHp(amount) {
        this.#player.updateHp(amount);
        this.refresh();
    }

    /**
     * @param {number} xp 
     * @param {() => void} [callback]
     */
    gainXp(xp, callback) {
        this.#player.gainXp(xp);
        this.refreshXp(callback);
    }

    refresh() {
        this.#textLevel.setText(`LV ${this.#player.level}`);

        this.#hpBar.setText(`${this.#player.hp}/${this.#player.maxHp}`);
        this.#hpBar.setWidthAnimated(this.#player.hp/this.#player.maxHp);

        this.refreshXp();
    }

    /**
     * @param {() => void} [callback]
     */
    refreshXp(callback) {
        this.#xpBar.setText(`${this.#player.xp}/${this.#player.xpToNext}`);
        if (this.#player.xp === 0) {

        }
        this.#xpBar.setWidthAnimated(this.#player.xp/this.#player.xpToNext, {
            duration: this.#player.xp === 0 ? 1 : 1000,
            callback: callback,
        });
    }
    /**
     * @param {() => void} [callback]
     */
    resetXp(callback) {
        this.#xpBar.setText("");
        this.#xpBar.setWidthAnimated(0, {
            duration: 1,
            callback: callback,
        });
    }

    /**
     * @returns {Coordinate}
     */
    getHpBarCenterPosition() {
        return {
            x: this.#hpBar.container.x + this.#hpBar.container.getBounds().width / 2,
            y: this.#hpBar.container.y,
        };
    }
    /**
     * @returns {Coordinate}
     */
    getXpBarCenterPosition() {
        return {
            x: this.#xpBar.container.x + this.#xpBar.container.getBounds().width / 2,
            y: this.#xpBar.container.y,
        };
    }
    /**
     * @returns {Coordinate}
     */
    getLevelCenterPosition() {
        return {
            x: this.#textLevel.x + this.#textLevel.width / 2,
            y: this.#textLevel.y + this.#textLevel.height / 2,
        };
    }
}