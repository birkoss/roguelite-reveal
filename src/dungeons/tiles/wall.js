import Phaser from "../../lib/phaser.js";

import { TILE_TYPE, Tile } from "./tile.js";

/** @typedef {keyof typeof WALL_TYPE} WallType */
/** @enum {WallType} */
export const WALL_TYPE = Object.freeze({
    TOP_LEFT: 'TOP_LEFT',
    TOP: 'TOP',
    TOP_RIGHT: 'TOP_RIGHT',

    LEFT: 'LEFT',
    MIDDLE: 'MIDDLE',
    RIGHT: 'TOP_RIGHT',

    BOTTOM_LEFT: 'BOTTOM_LEFT',
    BOTTOM: 'BOTTOM',
    BOTTOM_RIGHT: 'BOTTOM_RIGHT',
});

export class Wall extends Tile {
    /** @type {WallType} */
    #wallType;

    /**
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        super(x, y, TILE_TYPE.WALL);
    }
}