import Phaser from "../../../lib/phaser.js";

import { TileEntity } from "./entity.js";

/** @typedef {keyof typeof TILE_STATUS_TYPE} TileStatusType */
/** @enum {TileStatusType} */
export const TILE_STATUS_TYPE = Object.freeze({
    LOCKED: 'LOCKED',
});

export class TileStatus extends TileEntity {
    /** @type {TileStatusType} */
    #type;

    /**
     * @param {TileStatusType} type 
     */
    constructor(type) {
        super();

        this.#type = type;
    }

    /** @type {TileStatusType} */
    get type() {
        return this.#type;
    }
}
