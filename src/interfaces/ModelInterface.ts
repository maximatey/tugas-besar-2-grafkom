import FaceInterface from './FaceInterface';
import TransformationInterface from './TransformationInterface';

interface ModelInterface {
    readonly faces: FaceInterface[];
    transformations: TransformationInterface[];
}

export default ModelInterface;
