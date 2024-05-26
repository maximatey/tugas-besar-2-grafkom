import Vector2Interface from '../interfaces/Vector2Interface';

/**
 * Implementation of the vec3 data structure commonly used in WebGL
 */
class Vector3 implements Vector2Interface {
    constructor(
        public readonly x: number,
        public readonly y: number,
        public readonly z: number,
    ) {}

    public clone(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    /**
     * Returns the (x, y, z) triplet value
     * @returns (x, y, z) triplet value
     */
    public getTriplet(): readonly [number, number, number] {
        return [this.x, this.y, this.z];
    }

    /**
     * Returns the normalized form of the current vector. This method
     * should only be used on a vector type (w = 0)
     * @returns the normalized form of the current vector
     */
    public normalize(): Vector3 {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

        return new Vector3(this.x / length, this.y / length, this.z / length);
    }

    /**
     * Returns the dot product value of the current vector and the other vector
     * @param other other Vector3 to apply dot operation on
     * @returns value of dot product
     */
    public dot(other: Vector3): number {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    public subtract(other: Vector3): Vector3 {
        return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    public crossMultiplication(other: Vector3): Vector3 {
        return new Vector3(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x,
        );
    }

    public to_json(): Object {
        return {
            x: this.x,
            y: this.y,
            z: this.z,
        };
    }
}

export default Vector3;
