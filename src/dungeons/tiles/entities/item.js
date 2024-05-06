import { DUNGEON_ASSET_KEYS } from "../../../keys/asset.js";
import Phaser from "../../../lib/phaser.js";

import { TileEntity } from "./entity.js";

/** @typedef {keyof typeof TILE_ITEM_TYPE} TileItemType */
/** @enum {TileItemType} */
export const TILE_ITEM_TYPE = Object.freeze({
    EXIT: 'EXIT',
});

export class TileItem extends TileEntity {
    /** @type {TileItemType} */
    #type;
    /** @type {ItemDetails} */
    #itemDetails;

    /**
     * @param {TileItemType} type 
     * @param {ItemDetails} [itemDetails] 
     */
    constructor(type, itemDetails) {
        super();


        this.#type = type;
        this.#itemDetails = this.#itemDetails;
    }

    /** @type {ItemDetails} */
    get itemDetails() {
        return this.#itemDetails;
    }
    /** @type {TileItemType} */
    get type() {
        return this.#type;
    }

    /**
     * @param {Phaser.Scene} scene 
     */
    createItem(scene) {
        this._gameObject = scene.add.sprite(
            0,
            0,
            this.#itemDetails.assetKey,
            this.#itemDetails.assetFrame
        ).setOrigin(0);

        return this._gameObject;
    }
}
