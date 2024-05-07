import Phaser from "../lib/phaser.js";

import { SCENE_KEYS } from "../keys/scene.js";
import { Map } from "../dungeons/map.js";
import { DataUtils } from "../utils/data.js";
import { TILE_SIZE } from "../config.js";
import { StateMachine } from "../state-machine.js";
import { DUNGEON_ASSET_KEYS } from "../keys/asset.js";
import { Panel } from "../ui/panel.js";
import { TileUnit } from "../dungeons/tiles/entities/unit.js";
import { TILE_ITEM_TYPE } from "../dungeons/tiles/entities/item.js";
import { OverlayText } from "../ui/overlay-text.js";
import { TILE_STATUS_TYPE } from "../dungeons/tiles/entities/status.js";

const MAIN_STATES = Object.freeze({
    CREATE_DUNGEON: 'CREATE_DUNGEON',
    GENERATE_DUNGEON: 'GENERATE_DUNGEON',
    TURN_START: 'TURN_START',
    WAITING_FOR_PLAYER_ACTION: 'WAITING_FOR_PLAYER_ACTION',
    WAITING_FOR_ACTION_FEEDBACK: 'WAITING_FOR_ACTION_FEEDBACK',
    TURN_END: 'TURN_END',
});

export class DungeonScene extends Phaser.Scene {
    /** @type {Map} */
    #map;

    /** @type {Panel} */
    #panel;

    /** @type {OverlayText} */
    #overlayText;

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
        let dataDetails = DataUtils.getCharacterDetails(this, 'knight');

        this.#panel = new Panel(this, 9, 9);
        this.#panel.setCharacter(dataDetails);

        this.#createStateMachine();
        this.#stateMachine.setState(MAIN_STATES.CREATE_DUNGEON);

        this.#overlayText = new OverlayText(this, this.#map.container.x + this.#map.container.getBounds().width / 2, this.#map.container.y + this.#map.container.getBounds().height / 2);
    }

    update() {
        if (this.#stateMachine) {
            this.#stateMachine.update();
        }
    }

    #createMap() {
        this.#map = new Map(this, 10, 8);

        // Create the WALL and FLOOR
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
                    this.#stateMachine.setState(MAIN_STATES.GENERATE_DUNGEON);
                });
            },
        });

        this.#stateMachine.addState({
            name: MAIN_STATES.GENERATE_DUNGEON,
            onEnter: () => {
                this.#map.generate(this.#dungeonTheme);

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
                // Find all REVEALED enemy
                let revealedTiles = this.#map.getRevealedTiles();
                let aliveAndRevealedEnemies = revealedTiles.filter(singleTile => singleTile.enemy !== undefined && singleTile.enemy.isAlive);

                // No enemy to counter-attack ?
                if (aliveAndRevealedEnemies.length === 0) {
                    this.#stateMachine.setState(MAIN_STATES.TURN_START);
                    return;
                }

                let totalDamage = 0;
                aliveAndRevealedEnemies.forEach((singleTile) => {
                    let dmg = this.#calculateDamage(singleTile.enemy, this.#panel.player);
                    totalDamage += dmg;
                });

                // Weird, but no damage ?
                if (totalDamage === 0) {
                    this.#stateMachine.setState(MAIN_STATES.TURN_START);
                    return;
                }

                // Wait a bit and damage the player
                this.time.delayedCall(500, () => {
                    // TODO: Add a PASSIVE that allow the player to survive a deadly attack ONCE per X (level, move, etc.)
                    this.cameras.main.shake(200);
                    this.cameras.main.flash(200, 255, 0, 0);
                    
                    this.#updatePlayerHp(-totalDamage, () => {
                        this.#panel.updatePlayerHp(-totalDamage);
                        this.#stateMachine.setState(MAIN_STATES.TURN_START);
                    });
                });
            },
        });
    }

    #createAnimations() {
        if (!this.anims.exists("attack")) {
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
        }

        if (!this.anims.exists("appear")) {
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
    }

    /**
     * @param {number} x 
     * @param {number} y 
     */
    #selectTile(x, y) {
        if (this.#stateMachine.currentStateName === MAIN_STATES.WAITING_FOR_PLAYER_ACTION) {

            this.#map.selectTileAt(x, y);

            if (this.#map.canAttackAt(x, y)) {
                this.#stateMachine.setState(MAIN_STATES.WAITING_FOR_ACTION_FEEDBACK);

                // Find the enemy to attack
                let tile = this.#map.tiles.find(singleTile => singleTile.x === x && singleTile.y === y);

                let effect = this.add.sprite(
                    tile.container.x + tile.enemy.gameObject.displayWidth / 2,
                    tile.container.y + tile.enemy.gameObject.displayHeight / 2,
                    DUNGEON_ASSET_KEYS.EFFECTS_LARGE
                );
                this.#map.container.add(effect);

                effect.on("animationcomplete", (tween, sprite, element) => {
                    element.destroy();

                    let dmg = this.#calculateDamage(this.#panel.player, tile.enemy);

                    tile.enemy.updateHp(-dmg);

                    // Dead enemy ? Give XP !
                    if (!tile.enemy.isAlive) {
                        this.#map.validateStatus();

                        let xp = tile.enemy.xpToNext;
                        this.#updatePlayerXp(xp, () => {
                            console.log("Updating Player XP ...");
                            this.#panel.gainXp(xp, () => {
                                // No Level Up!
                                if (this.#panel.player.xp < this.#panel.player.xpToNext) {
                                    this.#stateMachine.setState(MAIN_STATES.TURN_END);
                                    return ;
                                }

                                // Level Up!
                                if (this.#panel.player.xp >= this.#panel.player.xpToNext) {
                                    this.#updatePlayerLevel(() => {
                                        this.#panel.resetXp(() => {
                                            // TODO: Manage multiple level up one by one
                                            while (this.#panel.player.xp >= this.#panel.player.xpToNext) {
                                                this.#panel.player.levelUp();
                                            }
                                            this.#panel.refresh();
    
                                            this.#stateMachine.setState(MAIN_STATES.TURN_END);
                                        });
                                    });

                                    return;
                                }
                            });

                        });

                        return;
                    }

                    this.#stateMachine.setState(MAIN_STATES.TURN_END);
                });
                effect.anims.play("attack", true);

                return;
            }

            if (this.#map.canInteracAt(x, y)) {
                let tile = this.#map.tiles.find(singleTile => singleTile.x === x && singleTile.y === y);

                // Can't use a LOCKED item
                if (tile.status && tile.status.type === TILE_STATUS_TYPE.LOCKED) {
                    this.cameras.main.shake(200);
                    return;
                }

                if (tile.item.type === TILE_ITEM_TYPE.EXIT) {
                    this.#goDeeper();
                    return;
                }

                if (tile.item.type === TILE_ITEM_TYPE.CONSUMABLE) {
                    this.#stateMachine.setState(MAIN_STATES.WAITING_FOR_ACTION_FEEDBACK);

                    // Remove the Item
                    tile.useItem();

                    // Apply HP modifier
                    let amountHp = tile.item.itemDetails.modifiers.hp;
                    this.#updatePlayerHp(amountHp, () => {
                        this.#panel.updatePlayerHp(amountHp);
                        this.#stateMachine.setState(MAIN_STATES.TURN_END);
                    });

                    return;
                }
            }

            if (this.#map.canRevealAt(x, y)) {
                let tile = this.#map.tiles.find(singleTile => singleTile.x === x && singleTile.y === y);

                // Can't reveal a LOCKED tile
                if (tile.status && tile.status.type === TILE_STATUS_TYPE.LOCKED) {
                    this.cameras.main.shake(200);
                    return;
                }

                this.#stateMachine.setState(MAIN_STATES.WAITING_FOR_ACTION_FEEDBACK);

                this.#map.exploreAt(x, y, () => {
                    this.#stateMachine.setState(MAIN_STATES.TURN_END);
                });

                return;
            }
        }
    }

    /**
     * 
     * @param {TileUnit} attacker 
     * @param {TileUnit} defender 
     * @returns {number}
     */
    #calculateDamage(attacker, defender) {
        console.log(`${attacker.attack} -> ${defender.defense}`);

        let atk_mod = 0.9;  // (0.9 -> 1.1)
        let def_mod = 0.45; // (0.45 -> 0.6)
        let dmg = Math.max(1, Math.ceil(((attacker.attack / 2) * (atk_mod)) - ((defender.defense / 2) * def_mod)));

        // let dmg = Math.max(1, Math.ceil((attacker.attack * 0.5) - (defender.defense * 0.25)));

        console.log("===", dmg);

        return dmg;
    }

    /**
     * @param {number} amount 
     * @param {() => void} callback 
     */
    #updatePlayerHp(amount, callback) {
        let destinationObject = this.#panel.getHpBarCenterPosition();
        let destinationX = destinationObject.x + this.#panel.container.x;
        let destinationY = destinationObject.y + this.#panel.container.y;

        this.#overlayText.setText(`${amount} HP`, destinationX, destinationY, callback);
    }

    /**
     * @param {number} amount 
     * @param {() => void} callback 
     */
    #updatePlayerXp(amount, callback) {
        let destinationObject = this.#panel.getXpBarCenterPosition();
        let destinationX = destinationObject.x + this.#panel.container.x;
        let destinationY = destinationObject.y + this.#panel.container.y;

        this.#overlayText.setText(`${amount} XP`, destinationX, destinationY, callback);
    }

    /**
     * @param {() => void} callback 
     */
    #updatePlayerLevel(callback) {
        let destinationObject = this.#panel.getLevelCenterPosition();
        let destinationX = destinationObject.x + this.#panel.container.x;
        let destinationY = destinationObject.y + this.#panel.container.y;

        this.#overlayText.setText('Level Up', destinationX, destinationY, callback);
    }

    #goDeeper() {
        console.log("oh yeah!");

        this.#map.tiles.forEach((singleTile) => {
        });
        // Remove all overlay
        // Wait 1000ms
        // Put overlay back on each tile
        // Make a "false" tile switching for 1-2 tiles
        // Generate map again (with level+1)
        // Show the player that it can interac again!
        //  - Maybe a test overlay with "Explore"
    }
}
