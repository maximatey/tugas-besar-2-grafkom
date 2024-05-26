import ModelInterface from './ModelInterface';

interface NodeInterface {
    component: string;
    children: NodeInterface[];
    model: ModelInterface;
}

export default NodeInterface;
