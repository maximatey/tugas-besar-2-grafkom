import CanvasProps from './CanvasProps';

const ProjectionOffset = {
    orthographicProjection: {
        x: CanvasProps.width / 2,
        y: CanvasProps.height / 3,
    },
    perspectiveProjection: {
        x: 0,
        y: 0,
    },
    obliqueProjection: {
        x: CanvasProps.width / 1.7,
        y: CanvasProps.height / 5.5,
    },
};

export default ProjectionOffset;
