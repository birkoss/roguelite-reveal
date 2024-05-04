import Phaser from '../lib/phaser.js';

import { DATA_ASSET_KEYS } from '../keys/asset.js';

export class DataUtils {
    /**
     * @param {Phaser.Scene} scene 
     * @param {string} themeId  
     */
    static getDungeonTheme(scene, themeId) {
        /** @type {DungeonTheme[]} */
        const data = scene.cache.json.get(DATA_ASSET_KEYS.DUNGEON_THEMES);

        return data.find((attack) => attack.id === themeId);
    }
}