import NodeInterface from '../interfaces/NodeInterface';
import Camera from '../objects/Camera';
import Model from '../objects/Model';
import MappingMode from '../types/MappingMode';
import ProjectionType from '../types/ProjectionTypes';
import AnimationManager from './AnimationManager';
import Matrix4 from './Matrix4';
import Transformation from './Transformation';
import Vector3 from './Vector3';

class Node implements NodeInterface {
    public parent: Node;

    constructor(
        public component: string,
        public children: Node[],
        public model: Model,
    ) {}

    public clone(): Node {
        return new Node(
            this.component,
            this.children.map((child) => child.clone()),
            this.model.clone(),
        );
    }

    public resetAccumTime() {
        this.model.accumTime = 0;
        this.children.forEach((child) => {
            child.resetAccumTime();
        });
    }

    public setAccumTimeByDelta(dIndex: number) {
        this.model.accumTime =
            (this.model.accumTime + dIndex + this.model.transformations.length) % this.model.transformations.length;
        this.children.forEach((child) => {
            child.setAccumTimeByDelta(dIndex);
        });
    }

    public setAccumTime(accumTime: number) {
        this.model.accumTime = accumTime;
        this.children.forEach((child) => {
            child.setAccumTime(accumTime);
        });
    }

    public getAccumTime() {
        return this.model.accumTime;
    }

    public setFrameRate(fps: number) {
        this.model.frameRate = fps;
        this.children.forEach((child) => {
            child.setFrameRate(fps);
        });
    }

    public setIsAnimating(value: boolean) {
        this.model.isAnimating = value;
        this.children.forEach((child) => {
            child.setIsAnimating(value);
        });
    }

    public setIsReverse(value: boolean) {
        this.model.isReverse = value;
        this.children.forEach((child) => {
            child.setIsReverse(value);
        });
    }

    public setIsAutoReplay(value: boolean) {
        this.model.isAutoReplay = value;
        this.children.forEach((child) => {
            child.setIsAutoReplay(value);
        });
    }

    public getTransformations() {
        return this.model.transformations;
    }

    public getTransformation(idx: number) {
        return this.model.transformations[idx];
    }

    public setTransformations(transformations: Transformation[]) {
        this.model.transformations = transformations;
    }

    public setTransformation(transformation: Transformation, idx: number) {
        this.model.transformations[idx] = transformation;
    }

    public setTransformationIndexByDelta(dIndex: number) {
        this.model.transformationIndex =
            (this.model.transformationIndex + dIndex + this.model.transformations.length) %
            this.model.transformations.length;
        this.children.forEach((child) => {
            child.setTransformationIndexByDelta(dIndex);
        });
    }

    public setTransformationIndex(transformationIndex: number) {
        this.model.transformationIndex = transformationIndex % this.model.transformations.length;
        this.children.forEach((child) => {
            child.setTransformationIndex(transformationIndex);
        });
    }

    public getTransformationIndex() {
        return this.model.transformationIndex;
    }

    public renderTree(
        gl: WebGLRenderingContext,
        program: WebGLProgram,
        positionBuffer: WebGLBuffer,
        colorBuffer: WebGLBuffer,
        normalBuffer: WebGLBuffer,
        textureBuffer: WebGLBuffer,
        tangetBuffer: WebGLBuffer,
        bitangentBuffer: WebGLBuffer,
        currentTime: number,
        appliedTransformation: Transformation,
        worldMatrix: Matrix4,
        worldCamera: Camera,
        projectionType: ProjectionType,
        mappingMode: MappingMode,
        nodeTransformation: { [key: string]: Transformation },
        tweeningFunction: Function,
        shine: number,
        ambientColor : Vector3,
        diffuseColor : Vector3,
        specularColor : Vector3
    ) {
        this.model.render(
            gl,
            program,
            positionBuffer,
            colorBuffer,
            normalBuffer,
            textureBuffer,
            tangetBuffer,
            bitangentBuffer,
            currentTime,
            appliedTransformation,
            worldMatrix,
            worldCamera,
            projectionType,
            mappingMode,
            nodeTransformation[this.component],
            tweeningFunction,
            shine,
            ambientColor,
            diffuseColor,
            specularColor
        );

        let currentTransformation = new Transformation(
            this.model.center().x,
            this.model.center().y,
            this.model.center().z,
            appliedTransformation.tx,
            appliedTransformation.ty,
            appliedTransformation.tz,
            appliedTransformation.rx,
            appliedTransformation.ry,
            appliedTransformation.rz,
            appliedTransformation.sx,
            appliedTransformation.sy,
            appliedTransformation.sz,
        );

        if (this.model.isAnimating) {
            currentTransformation = this.model.animation(
                currentTime,
                currentTransformation,
                AnimationManager.easeInElastic,
            );
        } else {
            currentTransformation = this.model.transformations[this.model.transformationIndex];
        }

        const childrenWorldMatrix = worldMatrix.multiply(currentTransformation.getMatrix());

        for (const child of this.children) {
            child.renderTree(
                gl,
                program,
                positionBuffer,
                colorBuffer,
                normalBuffer,
                textureBuffer,
                tangetBuffer,
                bitangentBuffer,
                currentTime,
                appliedTransformation,
                childrenWorldMatrix,
                worldCamera,
                projectionType,
                mappingMode,
                nodeTransformation,
                tweeningFunction,
                shine,
                ambientColor,
                diffuseColor,
                specularColor
            );
        }
    }

    public to_json(): Object {
        let children: Object[] = [];

        this.children.forEach((child) => {
            children.push(child.to_json());
        });

        return {
            component: this.component,
            children: children,
            model: this.model.to_json(),
        };
    }
}

export default Node;
