import OrthographicProjection from '../classes/OrthographicProjection';
import OrthographicProjectionParams from '../types/OrthographicProjectionParams';
import ProjectionManagerInterface from '../interfaces/ProjectionManagerInterface';
import ProjectionType from '../types/ProjectionTypes';
import Matrix4 from './Matrix4';
import PerspectiveProjection from './PerspectiveProjection';
import PerspectiveProjectionParams from '../types/PerspectiveProjectionParams';
import ObliqueProjectionParams from '../types/ObliqueProjectionParams';
import ObliqueProjection from './ObliqueProjection';

/**
 * Implementation of the projection manager
 */

class ProjectionManager implements ProjectionManagerInterface {
    constructor(
        public orthographicProjectionParams: OrthographicProjectionParams,
        public perspectiveProjectionParams: PerspectiveProjectionParams,
        public obliqueProjectionParams: ObliqueProjectionParams,
    ) {}

    /**
     * Calculate the projection matrix based on projection type
     * @param type type of the projection
     * @returns projection matrix
     */
    public project(type: ProjectionType): Matrix4 {
        if (type === ProjectionType.ORTHOGRAPHIC) {
            return OrthographicProjection.project(this.orthographicProjectionParams);
        } else if (type === ProjectionType.PERSPECTIVE) {
            return PerspectiveProjection.project(this.perspectiveProjectionParams);
        } else if (type === ProjectionType.OBLIQUE) {
            return ObliqueProjection.project(this.obliqueProjectionParams);
        }

        return;
    }
}

export default ProjectionManager;
