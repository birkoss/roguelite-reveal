/** 
 * @typedef DungeonTheme
 * @type {Object}
 * @property {string} id
 * @property {string} name
 * @property {DungeonSingleFrame} floor
 * @property {DungeonSingleFrame} exit
 * @property {DungeonMultipleFrames} walls
 */

/** 
 * @typedef DungeonSingleFrame
 * @type {Object}
 * @property {string} assetKey
 * @property {number} assetFrame
 */

/** 
 * @typedef DungeonMultipleFrames
 * @type {Object}
 * @property {string} assetKey
 * @property {number[]} assetFrames
 */

/** 
 * @typedef UnitDetails
 * @type {Object}
 * @property {string} id
 * @property {string} name
 * @property {number} hp
 * @property {number} attack
 * @property {number} defense
 * @property {number} level
 * @property {string} assetKey
 * @property {number[]} assetFrames
 * @property {number} tileLockDistance
 */
