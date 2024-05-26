import OrthographicProjectionParams from "../types/OrthographicProjectionParams"
import PerspectiveProjectionParams from "../types/PerspectiveProjectionParams";
import ObliqueProjectionParams from "../types/ObliqueProjectionParams";

interface ProjectionManagerInterface {
    orthographicProjectionParams : OrthographicProjectionParams;
    perspectiveProjectionParams : PerspectiveProjectionParams;
    obliqueProjectionParams : ObliqueProjectionParams;
}

export default ProjectionManagerInterface