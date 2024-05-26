import Face from '../classes/Face';
import Matrix4 from '../classes/Matrix4';
import ProjectionManager from '../classes/ProjectionManager';
import Transformation from '../classes/Transformation';
import Vector3 from '../classes/Vector3';
import Vector4 from '../classes/Vector4';
import ProjectionOffset from '../constants/ProjectionOffset';
import ModelInterface from '../interfaces/ModelInterface';
import ObliqueProjectionParams from '../types/ObliqueProjectionParams';
import OrthographicProjectionParams from '../types/OrthographicProjectionParams';
import PerspectiveProjectionParams from '../types/PerspectiveProjectionParams';
import ProjectionType from '../types/ProjectionTypes';
import Camera from './Camera';
import EnvironmentInformation from '../types/EnvironmentInformation';
import MappingMode from '../types/MappingMode';
import AnimationManager from '../classes/AnimationManager';

/**
 * Implementation of the Model structure representing the 3d object shown in
 * WebGL
 */
class Model implements ModelInterface {
    private projectionManager: ProjectionManager;
    private startTime: number = 0;

    public transformationIndex: number = 0;
    public accumTime: number = 0;
    public frameRate: number = 4;
    public isAutoReplay: boolean = false;
    public isAnimating: boolean = false;
    public isReverse: boolean = false;

    constructor(
        public readonly faces: Face[],
        public transformations: Transformation[],
    ) {}

    public clone(): Model {
        return new Model(
            this.faces.map((face) => face.clone()),
            this.transformations.map((transformation) => transformation.clone()),
        );
    }
    /**
     * Returns the center point of the Model. This methohd will return a
     * point type (w = 1)
     * @returns center point of the Model
     */
    public center(): Vector4 {
        return new Vector4(
            this.faces.reduce((acc1, face) => acc1 + face.center().x, 0) / this.faces.length,
            this.faces.reduce((acc1, face) => acc1 + face.center().y, 0) / this.faces.length,
            this.faces.reduce((acc1, face) => acc1 + face.center().z, 0) / this.faces.length,
            1,
        );
    }

    /**
     * Returns the Model width (x axis)
     * @returns Model width
     */
    public width() {
        return Math.max(...this.faces.map((face) => face.max(0) - face.min(0)));
    }

    /**
     * Returns the Model height (y axis)
     * @returns Model height
     */
    public height() {
        return Math.max(...this.faces.map((face) => face.max(1) - face.min(1)));
    }

    /**
     * Returns the Model depth (z axis)
     * @returns Model depth
     */
    public depth() {
        return Math.max(...this.faces.map((face) => face.max(2) - face.min(2)));
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

    private initializeProjectionManager(gl: WebGLRenderingContext) {
        const clientWidth = (gl.canvas as HTMLCanvasElement).clientWidth;
        const clientHeight = (gl.canvas as HTMLCanvasElement).clientHeight;

        this.projectionManager = new ProjectionManager(
            {
                left: 0,
                right: clientWidth,
                top: clientHeight,
                bottom: -100,
                near: -2000,
                far: 2000,
            } as OrthographicProjectionParams,
            {
                fov: (60 * Math.PI) / 180,
                aspect: clientWidth / clientHeight,
                near: 1,
                far: 2000,
            } as PerspectiveProjectionParams,
            {
                factor: 0.1,
                angle: (15 * Math.PI) / 180,
                ortholeft: clientWidth,
                orthoright: 0,
                orthobottom: 0,
                orthotop: clientHeight,
                orthonear: -2000,
                orthofar: 2000,
            } as ObliqueProjectionParams,
        );
    }

    private initializeMappingMode(gl: WebGLRenderingContext, program: WebGLProgram, mappingMode: MappingMode) {
        const textureLocation = gl.getUniformLocation(program, 'u_texture');
        const textureEnvLocation = gl.getUniformLocation(program, 'u_texture_env');
        const textureModeLocation = gl.getUniformLocation(program, 'u_texture_mode');

        switch (mappingMode) {
            case MappingMode.TEXTURE:
                gl.uniform1i(textureLocation, 0);
                gl.uniform1i(textureEnvLocation, 1);
                gl.uniform1i(textureModeLocation, 0);
                break;
            case MappingMode.ENVIRONMENT:
                gl.uniform1i(textureLocation, 1);
                gl.uniform1i(textureEnvLocation, 0);
                gl.uniform1i(textureModeLocation, 1);
                break;
            case MappingMode.BUMP:
                gl.uniform1i(textureLocation, 0);
                gl.uniform1i(textureEnvLocation, 1);
                gl.uniform1i(textureModeLocation, 2);
                break;
            case MappingMode.NONE:
                gl.uniform1i(textureLocation, 0);
                gl.uniform1i(textureEnvLocation, 1);
                gl.uniform1i(textureModeLocation, 3);
                break;
        }
    }

    public render(
        gl: WebGLRenderingContext,
        program: WebGLProgram,
        positionBuffer: WebGLBuffer,
        colorBuffer: WebGLBuffer,
        normalBuffer: WebGLBuffer,
        textureBuffer: WebGLBuffer,
        tangentBuffer: WebGLBuffer,
        bitangentBuffer: WebGLBuffer,
        currentTime: number,
        appliedTransformation: Transformation,
        worldMatrix: Matrix4,
        worldCamera: Camera,
        projectionType: ProjectionType,
        mappingMode: MappingMode,
        nodeTransformation: Transformation,
        tweeningFunction: Function,
        shininess: number,
        ambientColor : Vector3,
        diffuseColor :Vector3,
        specularColor : Vector3
    ) {
        // Attributes
        const position = gl.getAttribLocation(program, 'a_position');
        const color = gl.getAttribLocation(program, 'a_color');
        const normal = gl.getAttribLocation(program, 'a_normal');
        const tangent = gl.getAttribLocation(program, 'a_tangent');
        const bitangent = gl.getAttribLocation(program, 'a_bitangent');
        const texCoord = gl.getAttribLocation(program, 'a_texcoord');
        // Uniforms
        const viewProjection = gl.getUniformLocation(program, 'u_viewProjection');
        const inverseTranspose = gl.getUniformLocation(program, 'u_inverseTranspose');
        const reverseLight = gl.getUniformLocation(program, 'u_reverseLight');
        const enableShading = gl.getUniformLocation(program, 'u_shading');
        const lightPosition = gl.getUniformLocation(program, 'u_lightPosition');
        const shineLocation = gl.getUniformLocation(program, 'u_shininess');
        const ambientColorLocation = gl.getUniformLocation(program, 'u_ambientLight');
        const diffuseColorLocation = gl.getUniformLocation(program, 'u_diffuseLight');
        const specularColorLocation = gl.getUniformLocation(program, 'u_specularLight');


        const size = 3;
        const type = gl.FLOAT;
        const normalized = false;
        const stride = 0;
        const offset = 0;
        const tsize = 2;

        // Setup position
        gl.enableVertexAttribArray(position);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positionArray = this.faces.flatMap((face) => face.flattenPoints());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionArray), gl.STATIC_DRAW);
        gl.vertexAttribPointer(position, size, type, normalized, stride, offset);

        if (mappingMode == MappingMode.NONE) {
            // Setup color
            gl.enableVertexAttribArray(color);
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            const colorArray = this.faces.flatMap((face) => face.flattenColor());
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorArray), gl.STATIC_DRAW);
            gl.vertexAttribPointer(color, size, type, normalized, stride, offset);
        }

        // Setup normal
        gl.enableVertexAttribArray(normal);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        const normalArray = this.faces.flatMap((face) => face.flattenNormal());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalArray), gl.STATIC_DRAW);
        gl.vertexAttribPointer(normal, size, type, normalized, stride, offset);

        if (mappingMode != MappingMode.NONE) {
            // Setup Texture
            gl.enableVertexAttribArray(texCoord);
            gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
            const textureArray = this.faces.flatMap((face) => face.rawTexture());
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureArray), gl.STATIC_DRAW);
            gl.vertexAttribPointer(texCoord, tsize, type, normalized, stride, offset);

            // Setup Tangent
            gl.enableVertexAttribArray(tangent);
            gl.bindBuffer(gl.ARRAY_BUFFER, tangentBuffer);
            const tangentArray = this.faces.flatMap((face) => face.flattenTangent());
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tangentArray), gl.STATIC_DRAW);
            gl.vertexAttribPointer(tangent, tsize, type, normalized, stride, offset);

            // Setup Bitangent
            gl.enableVertexAttribArray(bitangent);
            gl.bindBuffer(gl.ARRAY_BUFFER, bitangentBuffer);
            const bitangentArray = this.faces.flatMap((face) => face.flattenBitangent());
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bitangentArray), gl.STATIC_DRAW);
            gl.vertexAttribPointer(bitangent, tsize, type, normalized, stride, offset);
        }

        let currentTransformation = new Transformation(
            this.center().x,
            this.center().y,
            this.center().z,
            appliedTransformation.tx + nodeTransformation.tx,
            appliedTransformation.ty + nodeTransformation.ty,
            appliedTransformation.tz + nodeTransformation.tz,
            appliedTransformation.rx + nodeTransformation.rx,
            appliedTransformation.ry + nodeTransformation.ry,
            appliedTransformation.rz + nodeTransformation.rz,
            appliedTransformation.sx * nodeTransformation.sx,
            appliedTransformation.sy * nodeTransformation.sy,
            appliedTransformation.sz * nodeTransformation.sz,
        );

        if (this.isAnimating) {
            currentTransformation = this.animation(currentTime, currentTransformation, tweeningFunction);
        } else {
            currentTransformation.tx += this.transformations[this.transformationIndex].tx;
            currentTransformation.ty += this.transformations[this.transformationIndex].ty;
            currentTransformation.tz += this.transformations[this.transformationIndex].tz;
            currentTransformation.rx += this.transformations[this.transformationIndex].rx;
            currentTransformation.ry += this.transformations[this.transformationIndex].ry;
            currentTransformation.rz += this.transformations[this.transformationIndex].rz;
            currentTransformation.sx *= this.transformations[this.transformationIndex].sx;
            currentTransformation.sy *= this.transformations[this.transformationIndex].sy;
            currentTransformation.sz *= this.transformations[this.transformationIndex].sz;
        }

        this.startTime = currentTime;

        let matrix = currentTransformation.getMatrix();

        matrix = worldMatrix.multiply(matrix);

        const inverseTransposeMatrix = matrix.inverse().transpose();

        matrix = worldCamera.lookAt().transpose().multiply(matrix);

        matrix = currentTransformation
            .translation(ProjectionOffset[projectionType].x, ProjectionOffset[projectionType].y, 0)
            .multiply(matrix);

        this.initializeProjectionManager(gl);

        matrix = this.projectionManager.project(projectionType).multiply(matrix).transpose();

        const rawMatrix = matrix.flatten();
        const rawInverseMatrix = inverseTransposeMatrix.flatten();

        // Set matrix value
        gl.uniformMatrix4fv(viewProjection, false, rawMatrix);
        gl.uniformMatrix4fv(inverseTranspose, false, rawInverseMatrix);

        // Set light color
        gl.uniform3fv(ambientColorLocation, ambientColor.getTriplet());
        gl.uniform3fv(diffuseColorLocation, diffuseColor.getTriplet());
        gl.uniform3fv(specularColorLocation, specularColor.getTriplet());

        // Set directional light
        let directionalLight =
            projectionType === ProjectionType.PERSPECTIVE ? new Vector3(0, 0, 1) : new Vector3(0, 0, -1);
        const rawDirectionalLight = directionalLight.normalize().getTriplet();
        gl.uniform3fv(reverseLight, rawDirectionalLight);

        gl.uniform1i(enableShading, 1);

        gl.uniform1f(shineLocation, shininess);

        this.initializeMappingMode(gl, program, mappingMode);

        // Set light position
        let lightPos = new Vector3(-8, 7, 5);
        gl.uniform3fv(lightPosition, lightPos.normalize().getTriplet());

        // Draw model
        const modelPrimitive = gl.TRIANGLES;
        const modelOffset = 0;
        const pointCount = this.faces.flatMap((face) => face.points).length;

        gl.drawArrays(modelPrimitive, modelOffset, pointCount);
    }

    public isPowerOfTwo(value: number) {
        return (value & (value - 1)) === 0;
    }

    public renderTexture(source: string, width: number, height: number, gl: WebGLRenderingContext): WebGLTexture {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        const imageLevel = 0;
        const imageInternalFormat = gl.RGBA;
        const imageWidth = width;
        const imageHeight = height;
        const imageBorder = 0;
        const imageFormat = gl.RGBA;
        const imageType = gl.UNSIGNED_BYTE;

        gl.texImage2D(
            gl.TEXTURE_2D,
            imageLevel,
            imageInternalFormat,
            imageWidth,
            imageHeight,
            imageBorder,
            imageFormat,
            imageType,
            null,
        );

        const image = new Image();
        image.src = source;

        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, imageLevel, imageInternalFormat, imageFormat, imageType, image);

            if (this.isPowerOfTwo(image.width) && this.isPowerOfTwo(image.height)) {
                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
        };

        return texture;
    }

    public renderEnvironment(envInfo: EnvironmentInformation, gl: WebGLRenderingContext): WebGLTexture {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        const target = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        ];

        envInfo.forEach((info, index) => {
            const imageLevel = 0;
            const imageInternalFormat = gl.RGBA;
            const imageWidth = info.width;
            const imageHeight = info.height;
            const imageBorder = 0;
            const imageFormat = gl.RGBA;
            const imageType = gl.UNSIGNED_BYTE;

            gl.texImage2D(
                target[index],
                imageLevel,
                imageInternalFormat,
                imageWidth,
                imageHeight,
                imageBorder,
                imageFormat,
                imageType,
                null,
            );

            const image = new Image();
            image.src = info.source;
            image.onload = () => {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.texImage2D(target[index], imageLevel, imageInternalFormat, imageFormat, imageType, image);
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            };
        });

        return texture;
    }

    public to_json(): Object {
        let faces: Object[] = [];
        let transformations: Object[] = [];

        this.faces.forEach((face) => {
            faces.push(face.to_json());
        });

        this.transformations.forEach((Transformation) => {
            transformations.push(Transformation.to_json());
        });

        return {
            faces: faces,
            transformations: transformations,
        };
    }
}

export default Model;
