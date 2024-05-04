import Phaser from "../../lib/phaser.js";

import { TILE_TYPE, Tile } from "./tile.js";

export class Wall extends Tile {
    /**
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        super(x, y, TILE_TYPE.WALL);
    }
}
