import Phaser from "../lib/phaser.js";

import { SCENE_KEYS } from "../keys/scene.js";
import { Map } from "../dungeons/map.js";
import { DataUtils } from "../utils/data.js";
import { TILE_SIZE } from "../config.js";
import { StateMachine } from "../state-machine.js";

const MAIN_STATES = Object.freeze({
    CREATE_DUNGEON: 'CREATE_DUNGEON',
    TURN_START: 'TURN_START',
    WAITING_FOR_PLAYER_ACTION: 'WAITING_FOR_PLAYER_ACTION',
    WAITING_FOR_ACTION_FEEDBACK: 'WAITING_FOR_ACTION_FEEDBACK',
    TURN_END: 'TURN_END',
});

export class DungeonScene extends Phaser.Scene {
    /** @type {Map} */
    #map;

    /** @type {DungeonTheme} */
    #dungeonTheme;

    /** @type {StateMachine} */
    #stateMachine;

    constructor() {
        super({
            key: SCENE_KEYS.DUNGEON_SCENE,
        });
    }

    create() {
        this.#createStateMachine();

        this.#stateMachine.setState(MAIN_STATES.CREATE_DUNGEON);
    }

    update() {
        this.#stateMachine.update();
    }

    #createMap() {
        this.#map = new Map(this, 10, 8);

        this.#map.create(this.#dungeonTheme);

        this.#map.container.setPosition(this.scale.width - this.#map.container.getBounds().width, 0);

        // Enable Tile selection
        this.#map.container.setInteractive(
            new Phaser.Geom.Rectangle(
                0, 0, this.#map.container.getBounds().width, this.#map.container.getBounds().height
            ),
            Phaser.Geom.Rectangle.Contains
        );
        this.#map.container.on('pointerdown', (target) => {
            let x = Math.floor((target.worldX - this.#map.container.x) / TILE_SIZE);
            let y = Math.floor((target.worldY - this.#map.container.y) / TILE_SIZE);

            this.#selectTile(x, y);
        });

        // Pick a random position for the starting player
        let tiles = this.#map.getEmptyTiles();
        // TODO: Shuffle
        //Phaser.Utils.Array.Shuffle(tiles);

        let startingPosition = tiles.shift();
        this.#map.previewTile(startingPosition.x, startingPosition.y, () => {
            this.#map.selectTile(startingPosition.x, startingPosition.y);
        });
    }

    #createStateMachine() {
        this.#stateMachine = new StateMachine('MAIN', this);

        this.#stateMachine.addState({
            name: MAIN_STATES.CREATE_DUNGEON,
            onEnter: () => {
                this.#dungeonTheme = DataUtils.getDungeonTheme(this, "main");

                this.#createMap();

                this.time.delayedCall(500, () => {
                    this.#stateMachine.setState(MAIN_STATES.TURN_START);
                });
            },
        });

        this.#stateMachine.addState({
            name: MAIN_STATES.TURN_START,
            onEnter: () => {
                this.time.delayedCall(500, () => {
                    this.#stateMachine.setState(MAIN_STATES.WAITING_FOR_PLAYER_ACTION);
                });
            },
        });

        this.#stateMachine.addState({
            name: MAIN_STATES.WAITING_FOR_PLAYER_ACTION,
            onEnter: () => {
                // 
            },
        });

        this.#stateMachine.addState({
            name: MAIN_STATES.WAITING_FOR_ACTION_FEEDBACK,
            onEnter: () => {
                // 
            },
        });

        this.#stateMachine.addState({
            name: MAIN_STATES.TURN_END,
            onEnter: () => {
                // Find all REVEALED and ALIVE enemy
                let revealedTiles = this.#map.getRevealedTiles();
                let enemies = this.#map.enemies;
                let aliveAndRevealedEnemies = this.#map.enemies.filter((singleEnemy) => {
                    // TODO: Check for enemy health
                    // if (singleEnemy.isAlive) {
                    //     return;
                    // }
                    return revealedTiles.find((singleTile) => singleTile.x === singleEnemy.x && singleTile.y === singleEnemy.y);
                });

                console.log(aliveAndRevealedEnemies);


                // let enemies = this.#map.enemies.filter()
                this.time.delayedCall(500, () => {
                    this.#stateMachine.setState(MAIN_STATES.TURN_START);
                });
            },
        });
    }

    /**
     * @param {number} x 
     * @param {number} y 
     */
    #selectTile(x, y) {
        if (this.#stateMachine.currentStateName === MAIN_STATES.WAITING_FOR_PLAYER_ACTION) {
            this.#stateMachine.setState(MAIN_STATES.WAITING_FOR_ACTION_FEEDBACK);
            this.#map.selectTile(x, y, () => {
                this.#stateMachine.setState(MAIN_STATES.TURN_END);
            });
        }
    }
}
