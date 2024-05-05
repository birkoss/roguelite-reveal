import Phaser from "../lib/phaser.js";

import { Unit } from "../dungeons/tiles/unit.js";
import { UI_ASSET_KEYS } from "../keys/asset.js";
import { HorizontalBar } from "./horizontal-bar.js";

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
    /** @type {Unit} */
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

    /**
     * @param {UnitDetails} dataDetails 
     */
    setCharacter(dataDetails) {
        this.#textName = this.#scene.add.text(22, 20, dataDetails.name).setOrigin(0);
        this.#container.add(this.#textName);

        this.#textLevel = this.#scene.add.text(366, 20, "LV 1").setOrigin(1, 0);
        this.#container.add(this.#textLevel);

        this.#player = new Unit(0, 0, dataDetails);
        this.#player.create(this.#scene);
        this.#player.animatedGameObject.setOrigin(0).setPosition(22, 54);
        this.#player.animate();
        this.#container.add(this.#player.animatedGameObject);

        let text = this.#scene.add.text(120, 46, "HP").setOrigin(1, 0);
        this.#container.add(text);
        this.#hpBar = new HorizontalBar(this.#scene, 130, text.y + 8, 220, 3);
        this.#hpBar.setText(`${dataDetails.hp}/${dataDetails.hp}`);
        this.#container.add(this.#hpBar.container);

        text = this.#scene.add.text(120, 70, "MP").setOrigin(1, 0);
        this.#container.add(text);
        this.#mpBar = new HorizontalBar(this.#scene, 130, text.y + 8, 220, 6);
        this.#mpBar.setText('0/3');
        this.#mpBar.setWidthAnimated(0);
        this.#container.add(this.#mpBar.container);

        text = this.#scene.add.text(120, 94, "XP").setOrigin(1, 0);
        this.#container.add(text);
        this.#xpBar = new HorizontalBar(this.#scene, 130, text.y + 8, 220, 9);
        this.#xpBar.setText("0 / 100");
        this.#xpBar.setWidthAnimated(0);
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
}