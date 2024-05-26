import TransformationInterface from '../interfaces/TransformationInterface';
import Matrix4 from './Matrix4';

/**
 * Implementation of the transformation operation
 */
class Transformation implements TransformationInterface {
    constructor(
        public px: number,
        public py: number,
        public pz: number,
        public tx: number,
        public ty: number,
        public tz: number,
        public rx: number,
        public ry: number,
        public rz: number,
        public sx: number,
        public sy: number,
        public sz: number,
    ) {}

    public clone(): Transformation {
        return new Transformation(
            this.px,
            this.py,
            this.pz,
            this.tx,
            this.ty,
            this.tz,
            this.rx,
            this.ry,
            this.rz,
            this.sx,
            this.sy,
            this.sz,
        );
    }

    /**
     * Returns the translation matrix as defined in Ed Angel Chapter 4.9.1
     * page 179.
     * @param tx translation on the x-axis
     * @param ty translation on the y-axis
     * @param tz translation on the z-axis
     * @returns transformation matrix
     */
    public translation(tx: number, ty: number, tz: number) {
        return new Matrix4([
            [1, 0, 0, tx],
            [0, 1, 0, ty],
            [0, 0, 1, tz],
            [0, 0, 0, 1],
        ]);
    }

    public static translation(tx: number, ty: number, tz: number) {
        return new Matrix4([
            [1, 0, 0, tx],
            [0, 1, 0, ty],
            [0, 0, 1, tz],
            [0, 0, 0, 1],
        ]);
    }

    /**
     * Returns the scaling matrix as defined in Ed Angel Chapter 4.9.2
     * page 181.
     * @param sx scaling on the x-axis
     * @param sy scaling on the y-axis
     * @param sz scaling on the z-axis
     * @returns scaling matrix
     */
    public scale(sx: number, sy: number, sz: number): Matrix4 {
        return new Matrix4([
            [sx, 0, 0, 0],
            [0, sy, 0, 0],
            [0, 0, sz, 0],
            [0, 0, 0, 1],
        ]);
    }

    /**
     * Returns the rotation matrix as defined in Ed Angel Chapter 4.9.3
     * page 181. The matrix is transposed beforehand to improve performance.
     * @param rx rotation on the x-axis in degrees (0-360)
     * @param ry rotation on the y-axis in degrees (0-360)
     * @param rz rotation on the z-axis in degrees (0-360)
     * @returns rotation matrix
     */
    public rotation(rx: number, ry: number, rz: number): Matrix4 {
        const sinX = Math.sin((rx * Math.PI) / 180);
        const sinY = Math.sin((ry * Math.PI) / 180);
        const sinZ = Math.sin((rz * Math.PI) / 180);

        const cosX = Math.cos((rx * Math.PI) / 180);
        const cosY = Math.cos((ry * Math.PI) / 180);
        const cosZ = Math.cos((rz * Math.PI) / 180);

        return new Matrix4([
            [cosY * cosZ, -cosY * sinZ, sinY, 0],
            [cosZ * sinX * sinY + cosX * sinZ, -sinX * sinY * sinZ + cosX * cosZ, -cosY * sinX, 0],
            [-cosX * cosZ * sinY + sinX * sinZ, cosX * sinY * sinZ + cosZ * sinX, cosX * cosY, 0],
            [0, 0, 0, 1],
        ]);
    }

    public static rotation(rx: number, ry: number, rz: number): Matrix4 {
        const sinX = Math.sin((rx * Math.PI) / 180);
        const sinY = Math.sin((ry * Math.PI) / 180);
        const sinZ = Math.sin((rz * Math.PI) / 180);

        const cosX = Math.cos((rx * Math.PI) / 180);
        const cosY = Math.cos((ry * Math.PI) / 180);
        const cosZ = Math.cos((rz * Math.PI) / 180);

        return new Matrix4([
            [cosY * cosZ, -cosY * sinZ, sinY, 0],
            [cosZ * sinX * sinY + cosX * sinZ, -sinX * sinY * sinZ + cosX * cosZ, -cosY * sinX, 0],
            [-cosX * cosZ * sinY + sinX * sinZ, cosX * sinY * sinZ + cosZ * sinX, cosX * cosY, 0],
            [0, 0, 0, 1],
        ]);
    }

    /**
     * Returns the transformation matrix as defined in Ed Angel Chapter 4.10
     * The matrix will be translated back to the origin before applying the
     * rotation and scale matrix, then translated back to the original point
     * Finally, the translation matrix (tx, ty, tz) will be applied to the
     * matrix
     * @returns transformation matrix
     */
    public getMatrix(): Matrix4 {
        return this.translation(this.tx, this.ty, this.tz)
            .multiply(this.translation(this.px, this.py, this.pz))
            .multiply(this.rotation(this.rx, this.ry, this.rz))
            .multiply(this.scale(this.sx, this.sy, this.sz))
            .multiply(this.translation(-this.px, -this.py, -this.pz));
    }

    public to_json(): Object {
        return {
            px: this.px,
            py: this.py,
            pz: this.pz,
            tx: this.tx,
            ty: this.ty,
            tz: this.tz,
            rx: this.rx,
            ry: this.ry,
            rz: this.rz,
            sx: this.sx,
            sy: this.sy,
            sz: this.sz,
        };
    }
}

export default Transformation;
