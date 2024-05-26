import FaceInterface from '../interfaces/FaceInterface';
import Matrix4 from './Matrix4';
import Transformation from './Transformation';
import Vector2 from './Vector2';
import Vector3 from './Vector3';
import Vector4 from './Vector4';

/**
 * Implementation of the Face structure representing the 2d polygonal surface
 * of a 3d object
 */
class Face implements FaceInterface {
    constructor(
        public readonly points: Vector4[],
        public readonly color: Vector3,
        public readonly textures: Vector2[],
    ) {}

    public clone(): Face {
        return new Face(
            this.points.map((point) => point.clone()),
            this.color.clone(),
            this.textures.map((texture) => texture.clone()),
        );
    }

    /**
     * Returns the array of face points. This method should only be used
     * to pass the face points into the buffer array
     * @returns array of face points values
     */
    public flattenPoints(): readonly number[] {
        return this.points.flatMap((point) => point.getTriplet());
    }

    /**
     * Returns the array of face colors, where each elements are of the same
     * value. This method should only be used to pass the face color into
     * the buffer array
     * @returns array of face color values
     */
    public flattenColor(): readonly number[] {
        return Array(this.points.length).fill(this.color.getTriplet()).flat();
    }

    /**
     * Returns the array of face normals, where each elements are of the same
     * value. This method should only be used to pass the face normal into
     * the buffer array
     * @returns array of face color values
     */
    public flattenNormal(): readonly number[] {
        return Array(this.points.length).fill(this.normal().getTriplet()).flat();
    }

    /**
     * Returns the center point of all points defined in a Face. This method
     * will return a point type (w = 1)
     * @returns center point of the Face
     */
    public center(): Vector4 {
        return new Vector4(
            this.points.reduce((acc, point) => acc + point.x, 0) / this.points.length,
            this.points.reduce((acc, point) => acc + point.y, 0) / this.points.length,
            this.points.reduce((acc, point) => acc + point.z, 0) / this.points.length,
            1,
        );
    }

    /**
     * Returns the maximum value of all points in a defined axis
     * @param axis the pivot axis (x = 0, y = 1, z = 2)
     * @returns the max value on the passed axis
     */
    public max(axis: number) {
        if (axis === 0) {
            return Math.max(...this.points.map((point) => point.x));
        }
        if (axis === 1) {
            return Math.max(...this.points.map((point) => point.y));
        }
        if (axis === 2) {
            return Math.max(...this.points.map((point) => point.z));
        }

        throw Error('Axis not defined');
    }

    /**
     * Returns the minimum value of all points in a defined axis
     * @param axis the pivot axis (x = 0, y = 1, z = 2)
     * @returns the min value on the passed axis
     */
    public min(axis: number) {
        if (axis === 0) {
            return Math.min(...this.points.map((point) => point.x));
        }
        if (axis === 1) {
            return Math.min(...this.points.map((point) => point.y));
        }
        if (axis === 2) {
            return Math.min(...this.points.map((point) => point.z));
        }

        throw Error('Axis not defined');
    }

    /**
     * Returns the normal vector of the current Face
     * @returns the normal vector of the current Face
     */
    public normal(): Vector4 {
        const pq = this.points[1].subtract(this.points[0]);
        const pr = this.points[2].subtract(this.points[0]);

        return pr.cross(pq).normalize();
    }

    public transform(matrix: Matrix4): Face {
        return new Face(
            this.points.map((point) => {
                const r1 = new Vector4(matrix.m11, matrix.m12, matrix.m13, matrix.m14);
                const r2 = new Vector4(matrix.m21, matrix.m22, matrix.m23, matrix.m24);
                const r3 = new Vector4(matrix.m31, matrix.m32, matrix.m33, matrix.m34);
                const r4 = new Vector4(matrix.m41, matrix.m42, matrix.m43, matrix.m44);

                return new Vector4(r1.dot(point), r2.dot(point), r3.dot(point), 1);
            }),
            this.color,
            this.textures,
        );
    }

    public tangent(): Vector4 {
        const pq = this.points[1].subtract(this.points[0]);

        return pq.normalize();
    }

    public bitangent(): Vector4 {
        const pr = this.points[2].subtract(this.points[0]);

        return pr.normalize();
    }

    public flattenTexture(): readonly number[] {
        return Array(this.points.length).fill(this.textures).flat();
    }

    public rawTexture(): readonly number[] {
        return this.textures.flatMap((texture) => texture.getPair());
    }

    public flattenTangent(): readonly number[] {
        return Array(this.points.length).fill(this.tangent()).flat();
    }

    public flattenBitangent(): readonly number[] {
        return Array(this.points.length).fill(this.bitangent()).flat();
    }

    public to_json(): Object {
        let points: Object[] = [];
        this.points.forEach((point: Vector4) => {
            points.push(point.to_json());
        });
        let color = this.color.to_json();
        let textures: Object[] = [];
        this.textures.forEach((texture) => {
            textures.push(texture);
        });

        return {
            points: points,
            color: color,
            textures: textures,
        };
    }
}

export default Face;
