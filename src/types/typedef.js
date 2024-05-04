/** 
 * @typedef DungeonTheme
 * @type {Object}
 * @property {string} id
 * @property {string} name
 * @property {DungeonFloorData} floor
 * @property {DungeonWallData} walls
 */

/** 
 * @typedef DungeonFloorData
 * @type {Object}
 * @property {string} assetKey
 * @property {number} assetFrame
 */

/** 
 * @typedef DungeonWallData
 * @type {Object}
 * @property {string} assetKey
 * @property {number[]} assetFrames
 */