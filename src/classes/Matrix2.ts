import Matrix2Interface from '../interfaces/Matrix2Interface';

/**
 * Implementation of mat2 data structure commonly used in WebGL
 */
class Matrix2 implements Matrix2Interface {
    readonly m11: number;
    readonly m12: number;
    readonly m21: number;
    readonly m22: number;

    constructor(public matrix: number[][]) {
        if (matrix.length != 2 || matrix[0].length != 2 || matrix[1].length != 2) {
            throw Error('Must be a 2x2 matrix');
        }

        this.m11 = matrix[0][0];
        this.m12 = matrix[0][1];
        this.m21 = matrix[1][0];
        this.m22 = matrix[1][1];
    }

    /**
     * Returns the array of matrix values. This method should only be used
     * to pass the matrix into the buffer array
     * @returns array of matrix values
     */
    public flatten(): readonly number[] {
        return [this.m11, this.m12, this.m21, this.m22];
    }

    /**
     * Returns the transposed form of the current matrix
     * @returns transposed matrix
     */
    public transpose(): Matrix2 {
        return new Matrix2([
            [this.m11, this.m21],
            [this.m12, this.m22],
        ]);
    }

    /**
     * Returns the current matrix determinant
     * @returns matrix determinant
     */
    public determinant(): number {
        return this.m11 * this.m22 - this.m12 * this.m21;
    }

    /**
     * Returns the inverse of the current matrix
     * @returns inversed matrix
     */
    public inverse(): Matrix2 {
        const det = this.determinant();

        if (det === 0) {
            throw Error('Matrix not inversable');
        }

        return new Matrix2([
            [(Math.pow(-1, 0) * this.m22) / det, (Math.pow(-1, 1) * this.m12) / det],
            [(Math.pow(-1, 2) * this.m21) / det, (Math.pow(-1, 3) * this.m11) / det],
        ]);
    }

    /**
     * Returns the resulting multiply operation on the current matrix and
     * the other matrix
     * @param other the other Matrix2 to apply multiplication on
     * @returns the resulting multiplication operation between the current
     * matrix and the other matrix
     */
    public multiply(other: Matrix2): Matrix2 {
        return new Matrix2([
            [this.m11 * other.m11 + this.m12 * other.m21, this.m11 * other.m12 + this.m12 * other.m22],
            [this.m21 * other.m11 + this.m22 * other.m21, this.m21 * other.m12 + this.m22 * other.m22],
        ]);
    }
}

export default Matrix2;
