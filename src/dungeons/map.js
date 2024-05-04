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

    /**
     * @param {number} x 
     * @param {number} y 
     * @returns {boolean}
     */
    isInBound(x, y) {
        return (x >= 0 && x < this.#width && y >= 0 && y < this.#height);
    }

    #generate() {
        this.#tiles = [];

        for (let y=0; y<this.#height; y++) {
            for (let x=0; x<this.#width; x++) {
                let isWall = (x === 0 || y === 0 || y === this.#height-1 || x === this.#width-1);

                let tile;
                if (isWall) {
                    tile = new Wall(x, y);
                } else {
                    tile = new Floor(x, y);
                }

                this.#tiles.push(tile);
            }
        }
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @returns {Tile[]}
     */
    getNeighboors(x, y) {
        let neighboors = [];

        for (let y2=-1; y2<= 1; y2++) {
            for (let x2=-1; x2<= 1; x2++) {
                // Skip non-adjacent
                if (Math.abs(x2) == Math.abs(y2)) {
                    continue;
                }

                let neighboorX = x + x2;
                let neighboorY = y + y2;

                // Must be in bound
                if (!this.isInBound(neighboorX, neighboorY)) {
                    continue;
                }

                let index = (neighboorY * this.#width) + neighboorX;
                neighboors.push(this.#tiles[index]);
            }
        }
        return neighboors;
    }
}