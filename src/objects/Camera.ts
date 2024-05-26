import CameraInterface from '../interfaces/CameraInterface';
import Vector4 from '../classes/Vector4';
import Matrix4 from '../classes/Matrix4';
import Transformation from '../classes/Transformation';
import Vector from '../utils/vector';

class Camera implements CameraInterface {
    public constructor(
        public radius: number,
        public angle: number,
        public center: Vector4,
    ) {}

    public rotate(angle: number): void {
        this.angle = angle;
    }

    public moveRadius(distance: number): void {
        this.radius = distance;
    }

    lookAt(): Matrix4 {
        const initialMatrix = Transformation.translation(this.center.x, this.center.y, this.center.z)
            .multiply(Transformation.rotation(0, this.angle, 0))
            .multiply(Transformation.translation(0, 0, this.radius))
            .multiply(Transformation.translation(-this.center.x, -this.center.y, -this.center.z));

        const cameraPosition_x = initialMatrix.m14;
        const cameraPosition_y = initialMatrix.m24;
        const cameraPosition_z = initialMatrix.m34;

        const eyeVector = new Vector(cameraPosition_x, cameraPosition_y, cameraPosition_z);

        const centerVector = new Vector(this.center.x, this.center.y, this.center.z);

        const upVector = new Vector(0, 1, 0);

        const zAxis = eyeVector.subtract(centerVector).normalize();
        const xAxis = upVector.cross(zAxis).normalize();
        const yAxis = zAxis.cross(xAxis).normalize();

        const cameraMatrix = new Matrix4([
            [xAxis.x, yAxis.x, zAxis.x, eyeVector.x],
            [xAxis.y, yAxis.y, zAxis.y, eyeVector.y],
            [xAxis.z, yAxis.z, zAxis.z, eyeVector.z],
            [0, 0, 0, 1],
        ]);

        return cameraMatrix.inverse();
    }
}

export default Camera;
