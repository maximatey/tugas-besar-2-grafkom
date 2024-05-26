import Matrix3Interface from '../interfaces/Matrix3Interface';
import Matrix2 from './Matrix2';

/**
 * Implementation of mat3 data structure commonly used in WebGL
 */
class Matrix3 implements Matrix3Interface {
    readonly m11: number;
    readonly m12: number;
    readonly m13: number;
    readonly m21: number;
    readonly m22: number;
    readonly m23: number;
    readonly m31: number;
    readonly m32: number;
    readonly m33: number;

    constructor(public matrix: number[][]) {
        if (matrix.length != 3 || matrix[0].length != 3 || matrix[1].length != 3 || matrix[2].length != 3) {
            throw Error('Must be a 3x3 matrix');
        }

        this.m11 = matrix[0][0];
        this.m12 = matrix[0][1];
        this.m13 = matrix[0][2];
        this.m21 = matrix[1][0];
        this.m22 = matrix[1][1];
        this.m23 = matrix[1][2];
        this.m31 = matrix[2][0];
        this.m32 = matrix[2][1];
        this.m33 = matrix[2][2];
    }

    /**
     * Returns the array of matrix values. This method should only be used
     * to pass the matrix into the buffer array
     * @returns array of matrix values
     */
    public flatten(): readonly number[] {
        return [this.m11, this.m12, this.m13, this.m21, this.m22, this.m23, this.m31, this.m32, this.m33];
    }

    /**
     * Returns the transposed form of the current matrix
     * @returns transposed matrix
     */
    public transpose(): Matrix3 {
        return new Matrix3([
            [this.m11, this.m21, this.m31],
            [this.m12, this.m22, this.m32],
            [this.m13, this.m23, this.m33],
        ]);
    }

    /**
     * Returns the current matrix determinant
     * @returns matrix determinant
     */
    public determinant(): number {
        return (
            this.m11 * this.m22 * this.m33 +
            this.m12 * this.m23 * this.m31 +
            this.m13 * this.m21 * this.m32 -
            this.m31 * this.m22 * this.m13 -
            this.m32 * this.m23 * this.m11 -
            this.m33 * this.m21 * this.m12
        );
    }

    /**
     * Returns the inverse of the current matrix
     * @returns inversed matrix
     */
    public inverse(): Matrix3 {
        const c11 = new Matrix2([
            [this.m22, this.m23],
            [this.m32, this.m33],
        ]).determinant();
        const c12 = new Matrix2([
            [this.m21, this.m23],
            [this.m31, this.m33],
        ]).determinant();
        const c13 = new Matrix2([
            [this.m21, this.m22],
            [this.m31, this.m32],
        ]).determinant();
        const c21 = new Matrix2([
            [this.m12, this.m13],
            [this.m32, this.m33],
        ]).determinant();
        const c22 = new Matrix2([
            [this.m11, this.m13],
            [this.m31, this.m33],
        ]).determinant();
        const c23 = new Matrix2([
            [this.m11, this.m12],
            [this.m31, this.m32],
        ]).determinant();
        const c31 = new Matrix2([
            [this.m12, this.m13],
            [this.m22, this.m23],
        ]).determinant();
        const c32 = new Matrix2([
            [this.m11, this.m13],
            [this.m21, this.m23],
        ]).determinant();
        const c33 = new Matrix2([
            [this.m11, this.m12],
            [this.m21, this.m22],
        ]).determinant();

        const det = this.determinant();

        if (det === 0) {
            throw Error('Matrix not inversable');
        }

        return new Matrix3([
            [(Math.pow(-1, 0) * c11) / det, (Math.pow(-1, 3) * c21) / det, (Math.pow(-1, 6) * c31) / det],
            [(Math.pow(-1, 1) * c12) / det, (Math.pow(-1, 4) * c22) / det, (Math.pow(-1, 7) * c32) / det],
            [(Math.pow(-1, 2) * c13) / det, (Math.pow(-1, 5) * c23) / det, (Math.pow(-1, 8) * c33) / det],
        ]);
    }

    /**
     * Returns the resulting multiply operation on the current matrix and
     * the other matrix
     * @param other the other Matrix3 to apply multiplication on
     * @returns the resulting multiplication operation between the current
     * matrix and the other matrix
     */
    public multiply(other: Matrix3): Matrix3 {
        return new Matrix3([
            [
                this.m11 * other.m11 + this.m12 * other.m21 + this.m13 * other.m31,
                this.m11 * other.m12 + this.m12 * other.m22 + this.m13 * other.m32,
                this.m11 * other.m13 + this.m12 * other.m23 + this.m13 * other.m33,
            ],
            [
                this.m21 * other.m11 + this.m22 * other.m21 + this.m23 * other.m31,
                this.m21 * other.m12 + this.m22 * other.m22 + this.m23 * other.m32,
                this.m21 * other.m13 + this.m22 * other.m23 + this.m23 * other.m33,
            ],
            [
                this.m31 * other.m11 + this.m32 * other.m21 + this.m33 * other.m31,
                this.m31 * other.m12 + this.m32 * other.m22 + this.m33 * other.m32,
                this.m31 * other.m13 + this.m32 * other.m23 + this.m33 * other.m33,
            ],
        ]);
    }
}

export default Matrix3;
