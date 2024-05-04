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

        let theme = 0;

        map.tiles.forEach((singleTile) => {
            let assetKey = DUNGEON_ASSET_KEYS.WORLD;
            let assetFrame = 3 + (theme * 55);
            if (singleTile.type == TILE_TYPE.WALL) {
                assetFrame = 0;

                let frame = 0;

                let neighboors = map.getNeighboors(singleTile.x, singleTile.y);
                neighboors.forEach((singleNeighboor) => {
                    if (singleNeighboor.type !== TILE_TYPE.WALL) {
                        return;
                    }

                    let diffX = singleTile.x - singleNeighboor.x;
                    let diffY = singleTile.y - singleNeighboor.y;

                    if (diffX !== 0) {
                        frame += (diffX < 0 ? 4 : 1);
                    } else {
                        frame += (diffY < 0 ? 8 : 2);
                    }
                });

                const frames = {
                    1: 12,
                    2: 15,
                    4: 10,
                    3: 19,
                    5: 11,
                    6: 18,
                    7: 24,
                    8: 13,
                    9: 17,
                    10: 14,
                    11: 22,
                    12: 16,
                    13: 21,
                    14: 23,
                    15: 20,
                }
                
                if (frames[frame]) {
                    assetFrame = frames[frame];
                    assetFrame += (theme * 55);
                }
            }

            singleTile.create(this, assetKey, assetFrame);
        });
    }
}
