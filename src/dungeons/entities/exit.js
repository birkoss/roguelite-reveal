import Phaser from "../../lib/phaser.js";

import { ENTITY_TYPE, Entity } from "./entity.js";


export class Exit extends Entity {
    constructor() {
        super(ENTITY_TYPE.EXIT);
    }
}
