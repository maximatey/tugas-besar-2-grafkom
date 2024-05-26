import ArticulatedInterface from './ArticulatedInterface';
import NodeInterface from './NodeInterface';
interface AnimationManagerInterface {
    node?: NodeInterface;
    readonly root: ArticulatedInterface;
}

export default AnimationManagerInterface;
