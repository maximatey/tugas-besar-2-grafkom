import Articulated from '../classes/Articulated';
import Face from '../classes/Face';
import Node from '../classes/Node';
import Transformation from '../classes/Transformation';
import Vector2 from '../classes/Vector2';
import Vector3 from '../classes/Vector3';
import Vector4 from '../classes/Vector4';
import ArticulatedInterface from '../interfaces/ArticulatedInterface';
import ModelInterface from '../interfaces/ModelInterface';
import NodeInterface from '../interfaces/NodeInterface';
import Model from '../objects/Model';

class FileSystem {
    public static load(text: string): Model {
        const modelInterface = JSON.parse(text) as ModelInterface;

        const { faces, transformations } = modelInterface;

        const newFaces = faces.map((face) => {
            const { points, color, textures } = face;

            const newPoints = points.map((point) => {
                const { x, y, z, w } = point;

                return new Vector4(x, y, z, w);
            });

            const { x, y, z } = color;

            const newColor = new Vector3(x, y, z);

            const newTexture = textures.map((texture) => {
                const { x, y } = texture;

                return new Vector2(x, y);
            });

            return new Face(newPoints, newColor, newTexture);
        });

        const newTransformations = transformations.map((transformation) => {
            const { px, py, pz, tx, ty, tz, rx, ry, rz, sx, sy, sz } = transformation;

            return new Transformation(px, py, pz, tx, ty, tz, rx, ry, rz, sx, sy, sz);
        });

        return new Model(newFaces, newTransformations);
    }

    private static parseNode(nodes: NodeInterface[]): Node[] {
        const newNodes = nodes.map((node) => {
            const { component, children, model } = node;

            const newChildren = this.parseNode(children);

            const { faces, transformations } = model;

            const newFaces = faces.map((face) => {
                const { points, color, textures } = face;

                const newPoints = points.map((point) => {
                    const { x, y, z, w } = point;

                    return new Vector4(x, y, z, w);
                });

                const { x, y, z } = color;

                const newColor = new Vector3(x, y, z);

                const newTexture = textures.map((texture) => {
                    const { x, y } = texture;

                    return new Vector2(x, y);
                });

                return new Face(newPoints, newColor, newTexture);
            });

            const newTransformations = transformations.map((transformation) => {
                const { px, py, pz, tx, ty, tz, rx, ry, rz, sx, sy, sz } = transformation;

                return new Transformation(px, py, pz, tx, ty, tz, rx, ry, rz, sx, sy, sz);
            });

            const newModel = new Model(newFaces, newTransformations);

            return new Node(component, newChildren, newModel);
        });

        for (const node of newNodes) {
            this.setParentNodes(node.children, node);
        }

        return newNodes;
    }

    public static loadArticulated(text: string): Articulated {
        const articulatedInterface = JSON.parse(text) as ArticulatedInterface;

        const { root, transformations } = articulatedInterface;

        const newRoot = this.parseNode(root);

        const newRootTransformations = transformations.map((transformation) => {
            const { px, py, pz, tx, ty, tz, rx, ry, rz, sx, sy, sz } = transformation;

            return new Transformation(px, py, pz, tx, ty, tz, rx, ry, rz, sx, sy, sz);
        });

        return new Articulated(newRoot, newRootTransformations);
    }

    public static setParentNodes(nodes: Node[], parent: Node) {
        for (const node of nodes) {
            node.parent = parent;
        }
    }
}

export default FileSystem;
