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

        return data.find((theme) => theme.id === themeId);
    }

    /**
     * @param {Phaser.Scene} scene 
     * @param {string} enemyId  
     */
    static getEnemyDetails(scene, enemyId) {
        /** @type {EnemyDetails[]} */
        const data = scene.cache.json.get(DATA_ASSET_KEYS.ENEMIES);

        return data.find((enemy) => enemy.id === enemyId);
    }
}