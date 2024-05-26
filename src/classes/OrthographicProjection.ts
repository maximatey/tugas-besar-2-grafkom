import OrthographicProjectionParams from '../types/OrthographicProjectionParams';
import Matrix4 from './Matrix4';

/**
 * Implementation of Orthographic Projector
 */

class OrthographicProjection {
    /**
     * Calculate the orthographic projection matrix
     * @param OrthographicProjectionParams orthographic projection parameters
     * @returns projection matrix
     */
    public static project({ left, right, bottom, top, near, far }: OrthographicProjectionParams): Matrix4 {
        return new Matrix4([
            [2 / (right - left), 0, 0, -(right + left) / (right - left)],
            [0, 2 / (top - bottom), 0, -(top + bottom) / (top - bottom)],
            [0, 0, -2 / (far - near), -(far + near) / (far - near)],
            [0, 0, 0, 1],
        ]);
    }
}

export default OrthographicProjection;
