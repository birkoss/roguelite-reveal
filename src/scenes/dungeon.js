import Phaser from "../lib/phaser.js";

import { SCENE_KEYS } from "../keys/scene.js";
import { Map } from "../dungeons/map.js";
import { TILE_TYPE } from "../dungeons/tiles/tile.js";
import { DataUtils } from "../utils/data.js";

export class DungeonScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.DUNGEON_SCENE,
        });
    }

    create() {
        let map = new Map(10, 8);

        let dungeonTheme = DataUtils.getDungeonTheme(this, "main");

        map.tiles.forEach((singleTile) => {
            if (singleTile.type == TILE_TYPE.FLOOR) {
                singleTile.create(this, dungeonTheme.floor.assetKey, dungeonTheme.floor.assetFrame);
                return;
            }

            if (singleTile.type == TILE_TYPE.WALL) {
                let dungeonWallAssetFrame = 0;

                // Get the first frame, should always be the default wall
                if (dungeonTheme.walls.assetFrames.length > 0) {
                    dungeonWallAssetFrame = dungeonTheme.walls.assetFrames[0];
                }

                let dungeonWallLayout = map.getTileLayout(singleTile.x, singleTile.y, TILE_TYPE.WALL);

                if (dungeonWallLayout < dungeonTheme.walls.assetFrames.length) {
                    dungeonWallAssetFrame = dungeonTheme.walls.assetFrames[dungeonWallLayout];
                }
                
                singleTile.create(this, dungeonTheme.walls.assetKey, dungeonWallAssetFrame);
            }

        });
    }
}
