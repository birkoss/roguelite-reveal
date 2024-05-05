import Phaser from "../lib/phaser.js";

import { SCENE_KEYS } from "../keys/scene.js";
import { Map } from "../dungeons/map.js";
import { DataUtils } from "../utils/data.js";
import { TILE_SIZE } from "../config.js";
import { StateMachine } from "../state-machine.js";
import { DUNGEON_ASSET_KEYS } from "../keys/asset.js";

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

        // let startingPosition = tiles[20];
        this.#map.previewTileAt(startingPosition.x, startingPosition.y, () => {
            this.#map.revealTileAt(startingPosition.x, startingPosition.y);
        });
    }

    #createStateMachine() {
        this.#stateMachine = new StateMachine('MAIN', this);

        this.#stateMachine.addState({
            name: MAIN_STATES.CREATE_DUNGEON,
            onEnter: () => {
                this.#dungeonTheme = DataUtils.getDungeonTheme(this, "main");

                this.#createMap();
                this.#createAnimations();

                this.time.delayedCall(500, () => {
                    this.#stateMachine.setState(MAIN_STATES.TURN_START);
                });
            },
        });

        this.#stateMachine.addState({
            name: MAIN_STATES.TURN_START,
            onEnter: () => {
                this.#stateMachine.setState(MAIN_STATES.WAITING_FOR_PLAYER_ACTION);
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
                    // Only count ALIVE enemy
                    if (!singleEnemy.isAlive) {
                        return;
                    }
                    
                    return revealedTiles.find((singleTile) => singleTile.x === singleEnemy.x && singleTile.y === singleEnemy.y);
                });

                // No enemy to counter-attack
                if (aliveAndRevealedEnemies.length === 0) {
                    this.#stateMachine.setState(MAIN_STATES.TURN_START);
                    return;
                }

                this.time.delayedCall(500, () => {
                    console.log("REVEALED ENEMY:", aliveAndRevealedEnemies);

                    this.cameras.main.shake(200);
                    this.cameras.main.flash(200, 255, 0, 0);

                    this.#stateMachine.setState(MAIN_STATES.TURN_START);
                });
            },
        });
    }

    #createAnimations() {
        this.anims.create({
            key: "attack",
            frames: [{
                frame: 10,
                key: DUNGEON_ASSET_KEYS.EFFECTS_LARGE,
            },{
                frame: 11,
                key: DUNGEON_ASSET_KEYS.EFFECTS_LARGE,
            }],
            frameRate: 20,
            yoyo: true,
            repeat: 1,
        });
        this.anims.create({
            key: "appear",
            frames: [{
                frame: 76,
                key: DUNGEON_ASSET_KEYS.EFFECTS_SMALL,
            },{
                frame: 77,
                key: DUNGEON_ASSET_KEYS.EFFECTS_SMALL,
            }],
            frameRate: 10,
            yoyo: true,
            repeat: 3,
        });
    }

    /**
     * @param {number} x 
     * @param {number} y 
     */
    #selectTile(x, y) {
        if (this.#stateMachine.currentStateName === MAIN_STATES.WAITING_FOR_PLAYER_ACTION) {
            if (this.#map.canAttackAt(x, y)) {
                this.#stateMachine.setState(MAIN_STATES.WAITING_FOR_ACTION_FEEDBACK);

                // Find the enemy to attack
                let enemy = this.#map.enemies.find(singleEnemy => singleEnemy.x === x && singleEnemy.y === y);

                let effect = this.add.sprite(
                    enemy.animatedGameObject.x + enemy.animatedGameObject.displayWidth / 2,
                    enemy.animatedGameObject.y + enemy.animatedGameObject.displayHeight / 2,
                    DUNGEON_ASSET_KEYS.EFFECTS_LARGE
                );
                this.#map.container.add(effect);

                effect.on("animationcomplete", (tween, sprite, element) => {
                    element.destroy();

                    // TODO: Use player's stats
                    enemy.takeDamage(100);

                    this.#stateMachine.setState(MAIN_STATES.TURN_END);
                });
                effect.anims.play("attack", true);

                return;
            }
            if (this.#map.canRevealAt(x, y)) {
                this.#stateMachine.setState(MAIN_STATES.WAITING_FOR_ACTION_FEEDBACK);

                this.#map.revealTileAt(x, y, () => {
                    this.#stateMachine.setState(MAIN_STATES.TURN_END);
                });

                return;
            }
        }
    }
}
