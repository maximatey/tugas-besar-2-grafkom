import ArticulatedInterface from '../interfaces/ArticulatedInterface';
import Camera from '../objects/Camera';
import MappingMode from '../types/MappingMode';
import ProjectionType from '../types/ProjectionTypes';
import AnimationManager from './AnimationManager';
import Matrix4 from './Matrix4';
import Node from './Node';
import Transformation from './Transformation';
import Vector3 from './Vector3';
import Vector4 from './Vector4';

class Articulated implements ArticulatedInterface {
    private startTime: number = 0;

    public transformationIndex: number = 0;
    public accumTime: number = 0;
    public frameRate: number = 4;
    public isAutoReplay: boolean = false;
    public isAnimating: boolean = false;
    public isReverse: boolean = false;

    constructor(
        public readonly root: Node[],
        public transformations: Transformation[],
    ) {}

    /**
     * Returns the center point of the Articulated. This methohd will return a
     * point type (w = 1)
     * @returns center point of the Articulated
     */
    public center(): Vector4 {
        let articulatedCenter: Vector4 = new Vector4(0, 0, 0, 0);
        let nPoints = 0;
        this.root.forEach((node) => {
            nPoints += node.model.faces.length;
            let nodeSumCoordinate = new Vector4(
                node.model.faces.reduce((acc1, face) => acc1 + face.center().x, 0),
                node.model.faces.reduce((acc1, face) => acc1 + face.center().y, 0),
                node.model.faces.reduce((acc1, face) => acc1 + face.center().z, 0),
                node.model.faces.length,
            );
            articulatedCenter = articulatedCenter.add(nodeSumCoordinate);
        });

        articulatedCenter = new Vector4(
            articulatedCenter.x / nPoints,
            articulatedCenter.y / nPoints,
            articulatedCenter.z / nPoints,
            articulatedCenter.w / nPoints,
        );

        return articulatedCenter;
    }

    public getTransformations() {
        return this.transformations;
    }
    public getTransformation(idx: number) {
        return this.transformations[idx];
    }

    public setTransformations(transformations: Transformation[]) {
        this.transformations = transformations;
    }

    public setTransformation(transformation: Transformation, idx: number) {
        this.transformations[idx] = transformation;
    }

    public getTransformationIndex() {
        return this.transformationIndex;
    }

    public setTransformationIndexbyDelta(dIndex: number) {
        this.transformationIndex =
            (this.transformationIndex + dIndex + this.transformations.length) % this.transformations.length;
        this.root.forEach((node) => {
            node.setTransformationIndexByDelta(dIndex);
        });
    }

    public setTransformationIndex(transformationIndex: number) {
        this.transformationIndex = transformationIndex % this.transformations.length;
        this.root.forEach((node) => {
            node.setTransformationIndex(transformationIndex);
        });
    }

    public getAccumTime() {
        return this.accumTime;
    }

    public setAccumTimeByDelta(dIndex: number) {
        this.accumTime = (this.accumTime + dIndex + this.transformations.length) % this.transformations.length;
        this.root.forEach((node) => {
            node.setAccumTimeByDelta(dIndex);
        });
    }

    public setAccumTime(accumTime: number) {
        this.accumTime = accumTime;
        this.root.forEach((node) => {
            node.setAccumTime(accumTime);
        });
    }

    public resetAccumTime() {
        this.accumTime = 0;
        this.root.forEach((node) => {
            node.resetAccumTime();
        });
    }

    public setFrameRate(fps: number) {
        this.frameRate = fps;
        this.root.forEach((node) => {
            node.setFrameRate(fps);
        });
    }

    public setIsAnimating(value: boolean) {
        this.isAnimating = value;
        this.root.forEach((node) => {
            node.setIsAnimating(value);
        });
    }

    public setIsReverse(value: boolean) {
        this.isReverse = value;
        this.root.forEach((node) => {
            node.setIsReverse(value);
        });
    }

    public setIsAutoReplay(value: boolean) {
        this.isAutoReplay = value;
        this.root.forEach((node) => {
            node.setIsAutoReplay(value);
        });
    }

    public animation(
        currentTime: number,
        currentTransformation: Transformation,
        transformationFunction: Function,
    ): Transformation {
        if (this.transformations.length == 1) {
            return currentTransformation;
        }

        if (this.isReverse) {
            this.accumTime = this.accumTime - ((currentTime - this.startTime) / 1000) * this.frameRate;
        } else {
            this.accumTime = this.accumTime + ((currentTime - this.startTime) / 1000) * this.frameRate;
        }

        if (!this.isAutoReplay && this.accumTime > this.transformations.length) {
            this.isAnimating = false;
        }

        console.log('artic: ' + this.accumTime, this.isAnimating);

        this.accumTime = (this.accumTime + this.transformations.length) % this.transformations.length;

        const baseIndex = Math.floor(this.accumTime);

        const currTime = transformationFunction(this.accumTime - baseIndex);

        const currTransform = this.transformations[baseIndex];
        const nextTransform = this.transformations[(baseIndex + 1) % this.transformations.length];

        if ((baseIndex + 1) % this.transformations.length == 0) {
            return new Transformation(
                currentTransformation.px,
                currentTransformation.py,
                currentTransformation.pz,
                currentTransformation.tx + (currTime * -currTransform.tx + currTransform.tx),
                currentTransformation.ty + (currTime * -currTransform.ty + currTransform.ty),
                currentTransformation.tz + (currTime * -currTransform.tz + currTransform.tz),
                currentTransformation.rx + (currTime * -currTransform.rx + currTransform.rx),
                currentTransformation.ry + (currTime * -currTransform.ry + currTransform.ry),
                currentTransformation.rz + (currTime * -currTransform.rz + currTransform.rz),
                currentTransformation.sx * currTransform.sx,
                currentTransformation.sy * currTransform.sy,
                currentTransformation.sz * currTransform.sz,
            );
        } else {
            return new Transformation(
                currentTransformation.px,
                currentTransformation.py,
                currentTransformation.pz,
                currentTransformation.tx + (currTime * (nextTransform.tx - currTransform.tx) + currTransform.tx),
                currentTransformation.ty + (currTime * (nextTransform.ty - currTransform.ty) + currTransform.ty),
                currentTransformation.tz + (currTime * (nextTransform.tz - currTransform.tz) + currTransform.tz),
                currentTransformation.rx + (currTime * (nextTransform.rx - currTransform.rx) + currTransform.rx),
                currentTransformation.ry + (currTime * (nextTransform.ry - currTransform.ry) + currTransform.ry),
                currentTransformation.rz + (currTime * (nextTransform.rz - currTransform.rz) + currTransform.rz),
                currentTransformation.sx * (currTime * (nextTransform.sx - currTransform.sx) + currTransform.sx),
                currentTransformation.sy * (currTime * (nextTransform.sy - currTransform.sy) + currTransform.sy),
                currentTransformation.sz * (currTime * (nextTransform.sz - currTransform.sz) + currTransform.sz),
            );
        }
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
        let currentTransformation = new Transformation(
            this.center().x,
            this.center().y,
            this.center().z,
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

        if (this.isAnimating) {
            currentTransformation = this.animation(currentTime, currentTransformation, tweeningFunction);
        } else {
            let staticTransformation = this.transformations[this.transformationIndex];
            currentTransformation = new Transformation(
                this.center().x,
                this.center().y,
                this.center().z,
                appliedTransformation.tx + staticTransformation.tx,
                appliedTransformation.ty + staticTransformation.ty,
                appliedTransformation.tz + staticTransformation.tz,
                appliedTransformation.rx + staticTransformation.rx,
                appliedTransformation.ry + staticTransformation.ry,
                appliedTransformation.rz + staticTransformation.rz,
                appliedTransformation.sx * staticTransformation.sx,
                appliedTransformation.sy * staticTransformation.sy,
                appliedTransformation.sz * staticTransformation.sz,
            );
        }

        const childrenWorldMatrix = worldMatrix.multiply(currentTransformation.getMatrix());

        this.startTime = currentTime;

        this.root.forEach((node) => {
            node.renderTree(
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
        });
    }

    public to_json(): Object {
        let children: Object[] = [];
        let transformations: Object[] = [];

        this.root.forEach((node) => {
            children.push(node.to_json());
        });

        this.transformations.forEach((transformation) => {
            transformations.push(transformation.to_json());
        });

        return {
            root: children,
            transformations: transformations,
        };
    }
}

export default Articulated;
