import Vector2Interface from '../interfaces/Vector2Interface';

/**
 * Implementation of the vec2 data structure commonly used in WebGL
 */
class Vector2 implements Vector2Interface {
    constructor(
        public readonly x: number,
        public readonly y: number,
    ) {}

    public clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }
    /**
     * Returns the (x, y) pair value
     * @returns (x, y) pair value
     */
    public getPair(): readonly [number, number] {
        return [this.x, this.y];
    }

    /**
     * Returns the dot product value of the current vector and the other vector
     * @param other other Vector2 to apply dot operation on
     * @returns value of dot product
     */
    public dot(other: Vector2): number {
        return this.x * other.x + this.y * other.y;
    }

    public to_json(): Object {
        return {
            x: this.x,
            y: this.y,
        };
    }
}

export default Vector2;
