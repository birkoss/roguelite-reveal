import Phaser from "../lib/phaser.js";

import { SCENE_KEYS } from "../keys/scene.js";
import { Map } from "../dungeons/map.js";
import { DUNGEON_ASSET_KEYS } from "../keys/asset.js";
import { TILE_TYPE } from "../dungeons/tiles/tile.js";

export class DungeonScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.DUNGEON_SCENE,
        });
    }

    create() {
        let map = new Map(10, 8);

        map.tiles.forEach((single_tile) => {
            let assetKey = DUNGEON_ASSET_KEYS.WORLD;
            let assetFrame = 3;
            if (single_tile.type == TILE_TYPE.WALL) {
                assetFrame = 0;
            }

            single_tile.create(this, assetKey, assetFrame);
        });
    }
}
