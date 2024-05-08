import Phaser from "../lib/phaser.js";

export class OverlayText {
    /** @type {Phaser.Scene} */
    #scene;

    /** @type {Phaser.GameObjects.Container} */
    #container;

    /** @type {Phaser.GameObjects.Text} */
    #text;

    /**
     * @param {Phaser.Scene} scene 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(scene, x, y) {
        this.#scene = scene;

        this.#container = this.#scene.add.container(x, y);

        this.#text = this.#scene.add.text(0, 0, '', {
            color: 'white',
            fontSize: '55px',
        }).setOrigin(0.5, 0.5);
        this.#container.add(this.#text);

        this.#text.setScale(0);
    }

    /** @type {Phaser.GameObjects.Container} */
    get container() {
        return this.#container;
    }

    /**
     * @param {string} text
     * @param {() => void} [callback]
     * @param {number} [destinationX]
     * @param {number} [destinationY]
     */
    setText(text, callback, destinationX, destinationY) {
        this.#text.setPosition(0, 0).setAlpha(1).setText(text);

        let animData = {
            scaleX: 0,
            scaleY: 0,
        };

        if (destinationX && destinationY) {
            animData = {
                x: destinationX - this.#container.x,
                y: destinationY - this.#container.y,
                scaleX: 0.3,
                scaleY: 0.3,
            }
        }

        this.#scene.add.tween({
            targets: this.#text,
            scaleX: 1,
            scaleY: 1,
            duration: 800,
            ease: Phaser.Math.Easing.Bounce.Out,
            onComplete: () => {
                this.#scene.add.tween({
                    targets: this.#text,
                    ...animData,
                    duration: 400,
                    ease: Phaser.Math.Easing.Expo.In,
                    onComplete: () => {
                        this.#scene.add.tween({
                            targets: this.#text,
                            alpha: 0,
                            duration: 200,
                            onComplete: () => {
                                if (callback) {
                                    callback();
                                }
                            }
                        });
                    },
                });
            }
        });
    }
}