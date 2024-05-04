import Phaser from "../lib/phaser.js";

import { SCENE_KEYS } from "../keys/scene.js";

export class DungeonScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.DUNGEON_SCENE,
        });
    }

    create() {
        console.log("DungeonScene...");
    }
}
