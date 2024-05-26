import ObliqueProjectionParams from '../types/ObliqueProjectionParams';
import OrthographicProjection from './OrthographicProjection';
import Matrix4 from './Matrix4';
import Coordinate from '../utils/coordinate';

/**
 * Implementation of Oblique Projector
 */
class ObliqueProjection {
    /**
     * Calculate the oblique projection matrix
     * @param ObliqueProjectionParams oblique projection parameters
     * @returns projection matrix
     */
    public static project({
        factor,
        angle,
        ortholeft : left,
        orthoright : right,
        orthobottom : bottom,
        orthotop : top,
        orthonear : near,
        orthofar : far,
    }: ObliqueProjectionParams): Matrix4 {
        const P = OrthographicProjection.project({
            left,
            right,
            bottom,
            top,
            near,
            far,
        });

        const cotAngle = 1 / Math.tan(angle);
        const shearX = factor * cotAngle;
        const shearY = factor * -cotAngle;
        const pShear1 = new Coordinate(1,0,0,0);
        const pShear2 = new Coordinate(0,1,0,0);
        const pShear3 = new Coordinate(shearX,shearY,1,0);
        const pShear4 = new Coordinate(0,0,0,1);

        const shearMatrix = [
            [pShear1.x, pShear2.x, pShear3.x, pShear4.x],
            [pShear1.y, pShear2.y, pShear3.y, pShear4.y],
            [pShear1.z, pShear2.z, pShear3.z, pShear4.z],
            [pShear1.w, pShear2.w, pShear3.w, pShear4.w]
        ];

        const S = new Matrix4(shearMatrix);
        return P.multiply(S);
    }
}

export default ObliqueProjection;