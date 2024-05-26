import Matrix4Interface from '../interfaces/Matrix4Interface';
import Matrix3 from './Matrix3';
import Vector4 from './Vector4';

/**
 * Implementation of mat4 data structure commonly used in WebGL
 */
class Matrix4 implements Matrix4Interface {
    readonly m11: number;
    readonly m12: number;
    readonly m13: number;
    readonly m14: number;
    readonly m21: number;
    readonly m22: number;
    readonly m23: number;
    readonly m24: number;
    readonly m31: number;
    readonly m32: number;
    readonly m33: number;
    readonly m34: number;
    readonly m41: number;
    readonly m42: number;
    readonly m43: number;
    readonly m44: number;

    constructor(public matrix: number[][]) {
        if (
            matrix.length != 4 ||
            matrix[0].length != 4 ||
            matrix[1].length != 4 ||
            matrix[2].length != 4 ||
            matrix[3].length != 4
        ) {
            throw Error('Must be a 4x4 matrix');
        }

        this.m11 = matrix[0][0];
        this.m12 = matrix[0][1];
        this.m13 = matrix[0][2];
        this.m14 = matrix[0][3];
        this.m21 = matrix[1][0];
        this.m22 = matrix[1][1];
        this.m23 = matrix[1][2];
        this.m24 = matrix[1][3];
        this.m31 = matrix[2][0];
        this.m32 = matrix[2][1];
        this.m33 = matrix[2][2];
        this.m34 = matrix[2][3];
        this.m41 = matrix[3][0];
        this.m42 = matrix[3][1];
        this.m43 = matrix[3][2];
        this.m44 = matrix[3][3];
    }

    /**
     * Returns the array of matrix values. This method should only be used
     * to pass the matrix into the buffer array
     * @returns array of matrix values
     */
    public flatten(): readonly number[] {
        return [
            this.m11,
            this.m12,
            this.m13,
            this.m14,
            this.m21,
            this.m22,
            this.m23,
            this.m24,
            this.m31,
            this.m32,
            this.m33,
            this.m34,
            this.m41,
            this.m42,
            this.m43,
            this.m44,
        ];
    }

    /**
     * Returns an identity matrix
     * @returns identity matrix
     */
    public static identity(): Matrix4 {
        return new Matrix4([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        ]);
    }

    /**
     * Returns the transposed form of the current matrix
     * @returns transposed matrix
     */
    public transpose(): Matrix4 {
        return new Matrix4([
            [this.m11, this.m21, this.m31, this.m41],
            [this.m12, this.m22, this.m32, this.m42],
            [this.m13, this.m23, this.m33, this.m43],
            [this.m14, this.m24, this.m34, this.m44],
        ]);
    }

    /**
     * Returns the current matrix determinant
     * @returns matrix determinant
     */
    public determinant(): number {
        return (
            this.m11 * this.m22 * this.m33 * this.m44 +
            this.m12 * this.m23 * this.m34 * this.m41 +
            this.m13 * this.m24 * this.m31 * this.m42 +
            this.m14 * this.m21 * this.m32 * this.m43 -
            this.m41 * this.m32 * this.m23 * this.m14 -
            this.m42 * this.m33 * this.m24 * this.m11 -
            this.m43 * this.m34 * this.m21 * this.m12 -
            this.m44 * this.m31 * this.m22 * this.m13
        );
    }

    /**
     * Returns the inverse of the current matrix
     * @returns inversed matrix
     */
    public inverse(): Matrix4 {
        const c11 = new Matrix3([
            [this.m22, this.m23, this.m24],
            [this.m32, this.m33, this.m34],
            [this.m42, this.m43, this.m44],
        ]).determinant();
        const c12 = new Matrix3([
            [this.m21, this.m23, this.m24],
            [this.m31, this.m33, this.m34],
            [this.m41, this.m43, this.m44],
        ]).determinant();
        const c13 = new Matrix3([
            [this.m21, this.m22, this.m24],
            [this.m31, this.m32, this.m34],
            [this.m41, this.m42, this.m44],
        ]).determinant();
        const c14 = new Matrix3([
            [this.m21, this.m22, this.m23],
            [this.m31, this.m32, this.m33],
            [this.m41, this.m42, this.m43],
        ]).determinant();
        const c21 = new Matrix3([
            [this.m12, this.m13, this.m14],
            [this.m32, this.m33, this.m34],
            [this.m42, this.m43, this.m44],
        ]).determinant();
        const c22 = new Matrix3([
            [this.m11, this.m13, this.m14],
            [this.m31, this.m33, this.m34],
            [this.m41, this.m43, this.m44],
        ]).determinant();
        const c23 = new Matrix3([
            [this.m11, this.m12, this.m14],
            [this.m31, this.m32, this.m34],
            [this.m41, this.m42, this.m44],
        ]).determinant();
        const c24 = new Matrix3([
            [this.m11, this.m12, this.m13],
            [this.m31, this.m32, this.m33],
            [this.m41, this.m42, this.m43],
        ]).determinant();
        const c31 = new Matrix3([
            [this.m12, this.m13, this.m14],
            [this.m22, this.m23, this.m24],
            [this.m42, this.m43, this.m44],
        ]).determinant();
        const c32 = new Matrix3([
            [this.m11, this.m13, this.m14],
            [this.m21, this.m23, this.m24],
            [this.m41, this.m43, this.m44],
        ]).determinant();
        const c33 = new Matrix3([
            [this.m11, this.m12, this.m14],
            [this.m21, this.m22, this.m24],
            [this.m41, this.m42, this.m44],
        ]).determinant();
        const c34 = new Matrix3([
            [this.m11, this.m12, this.m13],
            [this.m21, this.m22, this.m23],
            [this.m41, this.m42, this.m43],
        ]).determinant();
        const c41 = new Matrix3([
            [this.m12, this.m13, this.m14],
            [this.m22, this.m23, this.m24],
            [this.m32, this.m33, this.m34],
        ]).determinant();
        const c42 = new Matrix3([
            [this.m11, this.m13, this.m14],
            [this.m21, this.m23, this.m24],
            [this.m31, this.m33, this.m34],
        ]).determinant();
        const c43 = new Matrix3([
            [this.m11, this.m12, this.m14],
            [this.m21, this.m22, this.m24],
            [this.m31, this.m32, this.m34],
        ]).determinant();
        const c44 = new Matrix3([
            [this.m11, this.m12, this.m13],
            [this.m21, this.m22, this.m23],
            [this.m31, this.m32, this.m33],
        ]).determinant();

        const det = this.determinant();

        if (det === 0) {
            throw Error('Matrix not inversable');
        }

        return new Matrix4([
            [
                (Math.pow(-1, 0) * c11) / det,
                (Math.pow(-1, 1) * c12) / det,
                (Math.pow(-1, 2) * c13) / det,
                (Math.pow(-1, 3) * c14) / det,
            ],
            [
                (Math.pow(-1, 1) * c21) / det,
                (Math.pow(-1, 2) * c22) / det,
                (Math.pow(-1, 3) * c23) / det,
                (Math.pow(-1, 4) * c24) / det,
            ],
            [
                (Math.pow(-1, 2) * c31) / det,
                (Math.pow(-1, 3) * c32) / det,
                (Math.pow(-1, 4) * c33) / det,
                (Math.pow(-1, 5) * c34) / det,
            ],
            [
                (Math.pow(-1, 3) * c41) / det,
                (Math.pow(-1, 4) * c42) / det,
                (Math.pow(-1, 5) * c43) / det,
                (Math.pow(-1, 6) * c44) / det,
            ],
        ]);
    }

    /**
     * Returns the resulting multiply operation on the current matrix and
     * the other matrix
     * @param other the other Matrix4 to apply multiplication on
     * @returns the resulting multiplication operation between the current
     * matrix and the other matrix
     */
    public multiply(other: Matrix4): Matrix4 {
        return new Matrix4([
            [
                this.m11 * other.m11 + this.m12 * other.m21 + this.m13 * other.m31 + this.m14 * other.m41,
                this.m11 * other.m12 + this.m12 * other.m22 + this.m13 * other.m32 + this.m14 * other.m42,
                this.m11 * other.m13 + this.m12 * other.m23 + this.m13 * other.m33 + this.m14 * other.m43,
                this.m11 * other.m14 + this.m12 * other.m24 + this.m13 * other.m34 + this.m14 * other.m44,
            ],
            [
                this.m21 * other.m11 + this.m22 * other.m21 + this.m23 * other.m31 + this.m24 * other.m41,
                this.m21 * other.m12 + this.m22 * other.m22 + this.m23 * other.m32 + this.m24 * other.m42,
                this.m21 * other.m13 + this.m22 * other.m23 + this.m23 * other.m33 + this.m24 * other.m43,
                this.m21 * other.m14 + this.m22 * other.m24 + this.m23 * other.m34 + this.m24 * other.m44,
            ],
            [
                this.m31 * other.m11 + this.m32 * other.m21 + this.m33 * other.m31 + this.m34 * other.m41,
                this.m31 * other.m12 + this.m32 * other.m22 + this.m33 * other.m32 + this.m34 * other.m42,
                this.m31 * other.m13 + this.m32 * other.m23 + this.m33 * other.m33 + this.m34 * other.m43,
                this.m31 * other.m14 + this.m32 * other.m24 + this.m33 * other.m34 + this.m34 * other.m44,
            ],
            [
                this.m41 * other.m11 + this.m42 * other.m21 + this.m43 * other.m31 + this.m44 * other.m41,
                this.m41 * other.m12 + this.m42 * other.m22 + this.m43 * other.m32 + this.m44 * other.m42,
                this.m41 * other.m13 + this.m42 * other.m23 + this.m43 * other.m33 + this.m44 * other.m43,
                this.m41 * other.m14 + this.m42 * other.m24 + this.m43 * other.m34 + this.m44 * other.m44,
            ],
        ]);
    }
}

export default Matrix4;
