import Phaser from '../lib/phaser.js';

import { DATA_ASSET_KEYS } from '../keys/asset.js';

export class DataUtils {
    /**
     * @param {Phaser.Scene} scene 
     * @param {string} characterId  
     */
    static getCharacterDetails(scene, characterId) {
        /** @type {UnitDetails[]} */
        const data = scene.cache.json.get(DATA_ASSET_KEYS.ENEMIES);

        return data.find((unit) => unit.id === characterId);
    }

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
        /** @type {UnitDetails[]} */
        const data = scene.cache.json.get(DATA_ASSET_KEYS.ENEMIES);

        return data.find((unit) => unit.id === enemyId);
    }
}