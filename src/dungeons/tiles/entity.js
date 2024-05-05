import Phaser from "../../lib/phaser.js";

import { TILE_TYPE, Tile } from "./tile.js";

/** @typedef {keyof typeof ENTITY_TYPE} EntityType */
/** @enum {EntityType} */
export const ENTITY_TYPE = Object.freeze({
    EXIT: 'EXIT',
    ENEMY: 'ENEMY',
});

export class Entity extends Tile {
    /** @protected @type {EntityType} */
    _entityType

    /**
     * @param {EntityType} type 
     */
    constructor(x, y, type) {
        super(x, y, TILE_TYPE.ENTITY);

        this._entityType = type;
    }

    /** @type {EntityType} */
    get entityType() {
        return this._entityType;
    }
}
