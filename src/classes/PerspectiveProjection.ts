import PerspectiveProjectionParams from '../types/PerspectiveProjectionParams';
import Matrix4 from './Matrix4';

/**
 * Implementation of Perspective Projector
 */

class PerspectiveProjection {
    /**
     * Calculate the perspective projection matrix
     * @param PerspectiveProjectionParams perspective projection parameters
     * @returns projection matrix
     */
    public static project({ fov, aspect, near, far }: PerspectiveProjectionParams): Matrix4 {
        const factor = Math.tan(0.5 * (Math.PI - fov));

        return new Matrix4([
            [factor / aspect, 0, 0, 0],
            [0, factor, 0, 0],
            [0, 0, -(far + near) / (far - near), -1],
            [0, 0, (-2 * (far * near)) / (far - near), 0],
        ]);
    }
}

export default PerspectiveProjection;
