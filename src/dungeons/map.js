import Phaser from "../lib/phaser.js";
import { Floor } from "./tiles/floor.js";

import { TILE_TYPE, Tile } from "./tiles/tile.js";
import { Wall } from "./tiles/wall.js";

export class Map {
    /** @type {number} */
    #width;
    /** @type {number} */
    #height;

    /** @type {Tile[]} */
    #tiles;

    /**
     * @param {number} width 
     * @param {number} height 
     */
    constructor(width, height) {
        this.#width = width;
        this.#height = height;

        this.#generate();
    }

    get tiles() {
        return [...this.#tiles];
    }

    #generate() {
        this.#tiles = [];

        for (let y=0; y<this.#height; y++) {
            for (let x=0; x<this.#width; x++) {
                const isWall = (x == 0 || y == 0 || y == this.#height-1 || x == this.#width-1);

                let tile;
                if (isWall) {
                    // TODO: Detect neighboors
                    tile = new Wall(x, y);
                } else {
                    tile = new Floor(x, y);
                }

                this.#tiles.push(tile);
            }
        }
    }

    #getNeighboors(x, y) {
        for (let y2=-1; y2<= 1; y2++) {
            for (let x2=-1; x2<= 1; x2++) {
                // Skip non-adjacent
                if (Math.abs(x2) == Math.abs(y2)) {
                    return;
                }
            }
        }
    }
}