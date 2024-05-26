import NodeInterface from './NodeInterface';
import TransformationInterface from './TransformationInterface';

interface ArticulatedInterface {
    readonly root: NodeInterface[];
    transformations: TransformationInterface[];
}

export default ArticulatedInterface;
