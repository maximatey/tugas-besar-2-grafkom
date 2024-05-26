import Vector4Interface from '../interfaces/Vector4Interface';

/**
 * Implementation of vec4 data structure commonly used in WebGL
 */
class Vector4 implements Vector4Interface {
    constructor(
        public readonly x: number,
        public readonly y: number,
        public readonly z: number,
        public readonly w: number,
    ) {}

    public clone(): Vector4 {
        return new Vector4(this.x, this.y, this.z, this.w);
    }
    /**
     * Returns the (x, y, z) quadruplet value
     * @returns (x, y, z) quadruplet value
     */
    public getTriplet(): readonly [number, number, number] {
        return [this.x, this.y, this.z];
    }

    /**
     * Returns the (x, y, z, w) quadruplet value
     * @returns (x, y, z, w) quadruplet value
     */
    public getQuadruplet(): readonly [number, number, number, number] {
        return [this.x, this.y, this.z, this.w];
    }

    /**
     * Returns the normalized form of the current vector. This method
     * should only be used on a vector type (w = 0)
     * @returns the normalized form of the current vector
     */
    public normalize(): Vector4 {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

        return new Vector4(this.x / length, this.y / length, this.z / length, 0);
    }

    /**
     * Returns the resulting add operation between the current vector and
     * the other vector
     * @param other the other Vector4 to apply add operation on
     * @returns the resulting add operation between the current vector and
     * the other vector
     */
    public add(other: Vector4): Vector4 {
        return new Vector4(this.x + other.x, this.y + other.y, this.z + other.z, this.w + other.w);
    }

    /**
     * Returns the resulting add operation between the current vector and
     * the other vector
     * @param other the other Vector4 to apply subtract operation on
     * @returns the resulting subtract operation between the current vector
     * and the other vector
     */
    public subtract(other: Vector4): Vector4 {
        return new Vector4(this.x - other.x, this.y - other.y, this.z - other.z, this.w - other.w);
    }

    /**
     * Returns the dot product value of the current vector and the other
     * vector. This method should only be used on a vector type (w = 0)
     * @param other other Vector4 to apply dot operation on
     * @returns value of dot product
     */
    public dot(other: Vector4): number {
        return this.x * other.x + this.y * other.y + this.z * other.z + this.w * other.w;
    }

    /**
     * Returns the resulting cross operation between the current vector
     * and the other vector. This method should only be used on a vector type
     * (w = 0)
     * @param other other Vector4 to apply cross operation on
     * @returns the resulting cross operation between the current vector
     * and the other vector
     */
    public cross(other: Vector4): Vector4 {
        return new Vector4(
            this.y * other.z - other.y * this.z,
            this.x * other.z - other.x * this.z,
            this.x * other.y - other.x * this.y,
            0,
        );
    }

    public to_json(): Object {
        return {
            x: this.x,
            y: this.y,
            z: this.z,
            w: this.w,
        };
    }
}

export default Vector4;
