import Phaser from "../lib/phaser.js";

import { UI_ASSET_KEYS } from "../keys/asset.js";

export class HorizontalBar {
    /** @type {Phaser.Scene} */
    #scene;
    /** @type {number} */
    #fullWidth;
    /** @type {number} */
    #assetFrame;

    /** @type {Phaser.GameObjects.Container} */
    #container;

    /** @type {Phaser.GameObjects.Image} */
    #leftGameObject;
    /** @type {Phaser.GameObjects.Image} */
    #middleGameObject;
    /** @type {Phaser.GameObjects.Image} */
    #rightGameObject;

    /** @type {Phaser.GameObjects.Text} */
    #text;

    /**
     * @param {Phaser.Scene} scene 
     * @param {number} x 
     * @param {number} y 
     * @param {number} fullWidth 
     */
    constructor(scene, x, y, fullWidth, assetFrame) {
        this.#scene = scene;
        this.#fullWidth = fullWidth;
        this.#assetFrame = assetFrame;

        this.#container = this.#scene.add.container(x, y);

        this.#createBar();

        this.#text = this.#scene.add.text((this.#fullWidth / 2) + this.#middleGameObject.x, 0, 'X', {
            color: 'white',
            fontSize: '12px',
        }).setOrigin(0.5);
        this.#container.add(this.#text);

        this.#setWidth(1);
    }

    /** @type {Phaser.GameObjects.Container} */
    get container() {
        return this.#container;
    }

    /**
     * @param {string} text 
     */
    setText(text) {
        this.#text.setText(text);
    }

    /**
     * @param {number} percent - Between 0 and 1
     */
    setWidthAnimated(percent, options) {
        const width = this.#fullWidth * Math.min(Math.max(percent, 0), 1);

        this.#scene.tweens.add({
            targets: this.#middleGameObject,
            displayWidth: width,
            duration: options?.duration || 800,
            ease: Phaser.Math.Easing.Sine.Out,
            onUpdate: () => {
                this.#rightGameObject.setX(this.#middleGameObject.x + this.#middleGameObject.displayWidth);
                
                const isVisible = this.#middleGameObject.displayWidth > 0;
                this.#leftGameObject.visible = isVisible;
                this.#middleGameObject.visible = isVisible;
                this.#rightGameObject.visible = isVisible;
            },
            onComplete: options?.callback,
        });
    }

    #createBar() {
        let leftShadowGameObject = this.#scene.add.image(0, 0, UI_ASSET_KEYS.HORIZONTAL_BARS, 0).setOrigin(0, 0.5);
        let middleShadowGameObject = this.#scene.add.image(leftShadowGameObject.x + leftShadowGameObject.width, 0, UI_ASSET_KEYS.HORIZONTAL_BARS, 1).setOrigin(0, 0.5);
        middleShadowGameObject.displayWidth = this.#fullWidth;
        let rightShadowGameObject = this.#scene.add.image(middleShadowGameObject.x + middleShadowGameObject.displayWidth, 0, UI_ASSET_KEYS.HORIZONTAL_BARS, 2).setOrigin(0, 0.5);

        this.#leftGameObject = this.#scene.add.image(0, 0, UI_ASSET_KEYS.HORIZONTAL_BARS, this.#assetFrame).setOrigin(0, 0.5);
        this.#middleGameObject = this.#scene.add.image(this.#leftGameObject.x + this.#leftGameObject.width, 0, UI_ASSET_KEYS.HORIZONTAL_BARS, this.#assetFrame + 1).setOrigin(0, 0.5);
        this.#rightGameObject = this.#scene.add.image(this.#middleGameObject.x + this.#middleGameObject.displayWidth, 0, UI_ASSET_KEYS.HORIZONTAL_BARS, this.#assetFrame + 2).setOrigin(0, 0.5);
        
        this.#container.add([leftShadowGameObject, middleShadowGameObject, rightShadowGameObject, this.#leftGameObject, this.#middleGameObject, this.#rightGameObject]);
    }

    /**
     * @param {number} percent - Between 0 and 1
     */
    #setWidth(percent) {
        const width = this.#fullWidth * percent;
        this.#middleGameObject.displayWidth = width;
        this.#rightGameObject.setX(this.#middleGameObject.x + this.#middleGameObject.displayWidth);
    }
}