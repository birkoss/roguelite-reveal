import Phaser from "../../lib/phaser.js";

import { ENTITY_TYPE, Entity } from "./entity.js";

export class Enemy extends Entity {
    constructor(x, y) {
        super(x, y, ENTITY_TYPE.ENEMY);
    }
}
