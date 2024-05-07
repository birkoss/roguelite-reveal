/** 
 * @typedef DungeonTheme
 * @type {Object}
 * @property {string} id
 * @property {string} name
 * @property {AssetMultipleFrames} floor
 * @property {AssetSingleFrame} exit
 * @property {AssetSingleFrame} hidden
 * @property {AssetSingleFrame} shadow
 * @property {AssetMultipleFrames} walls
 */

/** 
 * @typedef AssetSingleFrame
 * @type {Object}
 * @property {string} assetKey
 * @property {number} assetFrame
 */

/** 
 * @typedef AssetMultipleFrames
 * @type {Object}
 * @property {string} assetKey
 * @property {number[]} assetFrames
 * @property {number[]} [alternateAssetFrames]
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
 * @property {AssetSingleFrame} [death]
 * @property {AssetSingleFrame} [shadow]
 * @property {number} tileLockDistance
 */

/** 
 * @typedef ItemDetails
 * @type {Object}
 * @property {string} id
 * @property {string} name
 * @property {string} [assetKey]
 * @property {number} [assetFrame]
 * @property {object} [modifiers]
 * @property {number} [modifiers.hp]
 */

/** 
 * @typedef Coordinate
 * @type {Object}
 * @property {number} x
 * @property {number} y
 */
