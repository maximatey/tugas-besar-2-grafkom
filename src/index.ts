import Articulated from './classes/Articulated';
import Matrix4 from './classes/Matrix4';
import Node from './classes/Node';
import Transformation from './classes/Transformation';
import Vector4 from './classes/Vector4';
import FileSystem from './files/FileSystem';
import Camera from './objects/Camera';
import Model from './objects/Model';
import MappingMode from './types/MappingMode';
import ProjectionType from './types/ProjectionTypes';
import resizeCanvasToDisplaySize from './utils/canvas';
import createProgram from './utils/program';
import createShader from './utils/shader';
import TexturePack from './types/TexturePack';
import EnvPack from './types/EnvPack';
import AnimationManager from './classes/AnimationManager';
import Vector3 from './classes/Vector3';

/** Global variables */
let model: Model;

let articulated: Articulated;

let selectedNode: Node = null;

let camera: Camera;

let animationManager: AnimationManager;

let tweeningFunction: Function = AnimationManager.linear;

let currentArticulated = JSON.stringify(require('../tests/ironGol.json'));

let currentProjectionType = ProjectionType.ORTHOGRAPHIC;

let mappingMode: MappingMode = MappingMode.NONE as MappingMode;

let textureOpt: string = 'WOOD';

let appliedTransformation = new Transformation(0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1);

var nodeTransformation: { [key: string]: Transformation } = {};

let texture: WebGLTexture;

let defaultCube: Articulated = FileSystem.loadArticulated(JSON.stringify(require('../tests/defCube.json')));

let currDupIndex: number = 0;

let exportNode: Node;

let shine: number = 5.0;
let ambientColor : Vector3 = new Vector3(1,1,1);
let diffuseColor : Vector3 = new Vector3(1,1,1);
let specularColor : Vector3 = new Vector3(1,1,1);

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const gl = canvas.getContext('webgl');

const vertexShaderScript = document.getElementById('vertex-shader').textContent;
const fragmentShaderScript = document.getElementById('fragment-shader').textContent;

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderScript);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderScript);

const program = createProgram(gl, vertexShader, fragmentShader);

const initializeWebGL = () => {
    // Setup buffers
    const positionBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();
    const normalBuffer = gl.createBuffer();
    const textureBuffer = gl.createBuffer();
    const tangentBuffer = gl.createBuffer();
    const bitangetBuffer = gl.createBuffer();
    // Setup program
    gl.useProgram(program);

    // Setup viewport
    resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear color and buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Turn on culling
    gl.enable(gl.CULL_FACE);

    // Enable Depth Buffer
    gl.enable(gl.DEPTH_TEST);

    // initializeDefaultCanvas(FileSystem.load(currentModel));
    initializeDefaultArticulatedCanvas(FileSystem.loadArticulated(currentArticulated));

    initTransformation(articulated);

    const renderCanvas = (currentTime: number) => {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        articulated.renderTree(
            gl,
            program,
            positionBuffer,
            colorBuffer,
            normalBuffer,
            textureBuffer,
            tangentBuffer,
            bitangetBuffer,
            currentTime,
            appliedTransformation,
            Matrix4.identity(),
            camera,
            currentProjectionType,
            mappingMode,
            nodeTransformation,
            tweeningFunction,
            shine,
            ambientColor,
            diffuseColor,
            specularColor
        );

        window.requestAnimationFrame(renderCanvas);
    };

    window.requestAnimationFrame(renderCanvas);
};

const initializeDefaultCanvas = (newModel: Model) => {
    model = newModel;
    camera = new Camera(500, (0 * Math.PI) / 180, new Vector4(0, 0, 0, 1));

    inputElements.forEach((element) => {
        element.slider.valueAsNumber = element.get();
        element.label.textContent = element.get().toString();
    });
};

const initializeDefaultArticulatedCanvas = (newArticulated: Articulated) => {
    articulated = newArticulated;
    camera = new Camera(500, (0 * Math.PI) / 180, new Vector4(0, 0, 0, 1));
    animationManager = new AnimationManager(
        selectedNode,
        articulated,
        setCurrentFrame,
        setTotalFrame,
        handleAnimationPlayToggle,
        frameContainer,
    );
    setCurrentFrame(1);
    setTotalFrame(animationManager.root.transformations.length);

    inputElements.forEach((element) => {
        element.slider.valueAsNumber = element.get();
        element.label.textContent = element.get().toString();
    });
};

/***********************************************************************/
/*** Get the HTML elements and add the corresponding event listeners ***/
/***********************************************************************/
var inputElements = [
    {
        slider: document.getElementById('slider-translate-x') as HTMLInputElement,
        label: document.getElementById('label-translate-x'),
        set: (value: number) => (appliedTransformation.tx = value),
        get: () => appliedTransformation.tx,
    },
    {
        slider: document.getElementById('slider-translate-y') as HTMLInputElement,
        label: document.getElementById('label-translate-y'),
        set: (value: number) => (appliedTransformation.ty = value),
        get: () => appliedTransformation.ty,
    },
    {
        slider: document.getElementById('slider-translate-z') as HTMLInputElement,
        label: document.getElementById('label-translate-z'),
        set: (value: number) => (appliedTransformation.tz = value),
        get: () => appliedTransformation.tz,
    },
    {
        slider: document.getElementById('slider-rotate-x') as HTMLInputElement,
        label: document.getElementById('label-rotate-x'),
        set: (value: number) => (appliedTransformation.rx = value),
        get: () => appliedTransformation.rx,
    },
    {
        slider: document.getElementById('slider-rotate-y') as HTMLInputElement,
        label: document.getElementById('label-rotate-y'),
        set: (value: number) => (appliedTransformation.ry = value),
        get: () => appliedTransformation.ry,
    },
    {
        slider: document.getElementById('slider-rotate-z') as HTMLInputElement,
        label: document.getElementById('label-rotate-z'),
        set: (value: number) => (appliedTransformation.rz = value),
        get: () => appliedTransformation.rz,
    },
    {
        slider: document.getElementById('slider-scale-x') as HTMLInputElement,
        label: document.getElementById('label-scale-x'),
        set: (value: number) => (appliedTransformation.sx = value),
        get: () => appliedTransformation.sx,
    },
    {
        slider: document.getElementById('slider-scale-y') as HTMLInputElement,
        label: document.getElementById('label-scale-y'),
        set: (value: number) => (appliedTransformation.sy = value),
        get: () => appliedTransformation.sy,
    },
    {
        slider: document.getElementById('slider-scale-z') as HTMLInputElement,
        label: document.getElementById('label-scale-z'),
        set: (value: number) => (appliedTransformation.sz = value),
        get: () => appliedTransformation.sz,
    },
    {
        slider: document.getElementById('slider-camera-angle') as HTMLInputElement,
        label: document.getElementById('label-camera-angle'),
        set: (value: number) => (camera.angle = value),
        get: () => camera.angle,
    },
    {
        slider: document.getElementById('slider-camera-radius') as HTMLInputElement,
        label: document.getElementById('label-camera-radius'),
        set: (value: number) => (camera.radius = -value),
        get: () => camera.radius,
    },
    {
        slider: document.getElementById('slider-frame-rate') as HTMLInputElement,
        label: document.getElementById('label-frame-rate'),
        set: (value: number) => articulated.setFrameRate(value),
        get: () => articulated.frameRate,
    },
];

inputElements.forEach((element) => {
    element.slider.addEventListener('input', (event) => {
        const value = (event.target as HTMLInputElement).valueAsNumber;

        element.label.textContent = value.toString();

        element.set(value);
    });
});

const sliderTranslateNodeX = document.getElementById('slider-translate-node-x') as HTMLInputElement;
const labelTranslateNodeX = document.getElementById('label-translate-node-x');

sliderTranslateNodeX.addEventListener('input', (event) => {
    const value = (event.target as HTMLInputElement).valueAsNumber;

    labelTranslateNodeX.textContent = value.toString();
    if (selectedNode != null) {
        nodeTransformation[selectedNode.component].tx = value;
    }
});

const sliderTranslateNodeY = document.getElementById('slider-translate-node-y') as HTMLInputElement;
const labelTranslateNodeY = document.getElementById('label-translate-node-y');

sliderTranslateNodeY.addEventListener('input', (event) => {
    const value = (event.target as HTMLInputElement).valueAsNumber;

    labelTranslateNodeY.textContent = value.toString();
    if (selectedNode != null) {
        nodeTransformation[selectedNode.component].ty = value;
    }
});

const sliderTranslateNodeZ = document.getElementById('slider-translate-node-z') as HTMLInputElement;
const labelTranslateNodeZ = document.getElementById('label-translate-node-z');

sliderTranslateNodeZ.addEventListener('input', (event) => {
    const value = (event.target as HTMLInputElement).valueAsNumber;

    labelTranslateNodeZ.textContent = value.toString();
    if (selectedNode != null) {
        nodeTransformation[selectedNode.component].tz = value;
    }
});

const sliderRotateNodeX = document.getElementById('slider-rotate-node-x') as HTMLInputElement;
const labelRotateNodeX = document.getElementById('label-rotate-node-x');

sliderRotateNodeX.addEventListener('input', (event) => {
    const value = (event.target as HTMLInputElement).valueAsNumber;

    labelRotateNodeX.textContent = value.toString();
    if (selectedNode != null) {
        nodeTransformation[selectedNode.component].rx = value;
    }
});

const sliderRotateNodeY = document.getElementById('slider-rotate-node-y') as HTMLInputElement;
const labelRotateNodeY = document.getElementById('label-rotate-node-y');

sliderRotateNodeY.addEventListener('input', (event) => {
    const value = (event.target as HTMLInputElement).valueAsNumber;

    labelRotateNodeY.textContent = value.toString();
    if (selectedNode != null) {
        nodeTransformation[selectedNode.component].ry = value;
    }
});

const sliderRotateNodeZ = document.getElementById('slider-rotate-node-z') as HTMLInputElement;
const labelRotateNodeZ = document.getElementById('label-rotate-node-z');

sliderRotateNodeZ.addEventListener('input', (event) => {
    const value = (event.target as HTMLInputElement).valueAsNumber;

    labelRotateNodeZ.textContent = value.toString();
    if (selectedNode != null) {
        nodeTransformation[selectedNode.component].rz = value;
    }
});

const sliderScaleNodeX = document.getElementById('slider-scale-node-x') as HTMLInputElement;
const labelScaleNodeX = document.getElementById('label-scale-node-x');

sliderScaleNodeX.addEventListener('input', (event) => {
    const value = (event.target as HTMLInputElement).valueAsNumber;

    labelScaleNodeX.textContent = value.toString();
    if (selectedNode != null) {
        nodeTransformation[selectedNode.component].sx = value;
    }
});

const sliderScaleNodeY = document.getElementById('slider-scale-node-y') as HTMLInputElement;
const labelScaleNodeY = document.getElementById('label-scale-node-y');

sliderScaleNodeY.addEventListener('input', (event) => {
    const value = (event.target as HTMLInputElement).valueAsNumber;

    labelScaleNodeY.textContent = value.toString();
    if (selectedNode != null) {
        nodeTransformation[selectedNode.component].sy = value;
    }
});

const sliderScaleNodeZ = document.getElementById('slider-scale-node-z') as HTMLInputElement;
const labelScaleNodeZ = document.getElementById('label-scale-node-z');

sliderScaleNodeZ.addEventListener('input', (event) => {
    const value = (event.target as HTMLInputElement).valueAsNumber;

    labelScaleNodeZ.textContent = value.toString();
    if (selectedNode != null) {
        nodeTransformation[selectedNode.component].sz = value;
    }
});

const sceneGraph = document.getElementById('component-tree');

// IO

// Save Model
const saveButton = document.getElementById('save-btn');

saveButton.addEventListener('click', () => saveArticulated());

const saveArticulated = () => {
    const filename = 'test';

    const text = JSON.stringify(articulated.to_json());

    const file = new Blob([text], {
        type: 'json/javascript',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = `${filename}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
};

// Animation Controller

const animatePlayButton = document.getElementById('animation-play');
const animateReverseButton = document.getElementById('animation-reverse');
const animateAutoReplayButton = document.getElementById('animation-autoreplay');

animatePlayButton.addEventListener('click', () => handleAnimationPlayToggle());
animateReverseButton.addEventListener('click', () => handleAnimationReverseToggle());
animateAutoReplayButton.addEventListener('click', () => handleAnimationAutoReplayToggle());

const handleAnimationPlayToggle = () => {
    if (!articulated.isAnimating) {
        animatePlayButton.textContent = 'PAUSE';
        articulated.setIsAnimating(true);
    } else {
        animatePlayButton.textContent = 'PLAY';
        articulated.setIsAnimating(false);
    }
};

const handleAnimationReverseToggle = () => {
    if (!articulated.isReverse) {
        animateReverseButton.textContent = 'UNREVERSE';
        articulated.setIsReverse(true);
    } else {
        animateReverseButton.textContent = 'REVERSE';
        articulated.setIsReverse(false);
    }
};

const handleAnimationAutoReplayToggle = () => {
    if (!articulated.isAutoReplay) {
        animateAutoReplayButton.textContent = 'NOT AUTO';
        articulated.setIsAutoReplay(true);
    } else {
        animateAutoReplayButton.textContent = 'AUTO';
        articulated.setIsAutoReplay(false);
    }
};

/* Frame Controller */
const currentFrame = document.getElementById('current-frame');
const totalFrame = document.getElementById('total-frame');

const frameFirstButton = document.getElementById('frame-first');
const framePreviousButton = document.getElementById('frame-previous');
const frameNextButton = document.getElementById('frame-next');
const frameLastButton = document.getElementById('frame-last');

frameFirstButton.addEventListener('click', () => handleFrameFirst());
framePreviousButton.addEventListener('click', () => handleFramePrevious());
frameNextButton.addEventListener('click', () => handleFrameNext());
frameLastButton.addEventListener('click', () => handleFrameLast());

const setCurrentFrame = (currFrame: number) => {
    currentFrame.textContent = currFrame.toString();
};

const setTotalFrame = (nFrame: number) => {
    totalFrame.textContent = nFrame.toString();
};

const handleFrameFirst = () => {
    animationManager.toFirstFrame();
};
const handleFramePrevious = () => {
    animationManager.toPreviousFrame();
};
const handleFrameNext = () => {
    animationManager.toNextFrame();
};
const handleFrameLast = () => {
    animationManager.toLastFrame();
};

/* Animation Editor */
const frameContainer = document.getElementsByClassName('frame-container')[0] as HTMLDivElement;
const animationAddFirstButton = document.getElementById('animation-addfirst-btn');

animationAddFirstButton.addEventListener('click', () => {
    handleAnimationAddFirstButton();
});

const handleAnimationAddFirstButton = () => {
    animationManager.addNewFrame(0);
};

// let period = 20; // in ms
// let animationTimeout = Date.now().valueOf() + period;

// const animate = () => {
//     if (animation && Date.now().valueOf() > animationTimeout) {
//         // inputElements[4].set((inputElements[4].get() + 1) % 360);
//         // inputElements[4].slider.value = ((inputElements[4].get() + 1) % 360).toString();
//         // inputElements[5].set((inputElements[5].get() + 1) % 360);
//         // inputElements[5].slider.value = ((inputElements[5].get() + 1) % 360).toString();
//         animationTimeout = Date.now().valueOf() + period;
//     }
// };

const canvasArea = document.getElementById('canvasArea');
let isDraggingOnCanvas = false;
let horizontalDistance = 0;
let prevX = 0;

canvasArea.addEventListener('mousedown', function (event) {
    isDraggingOnCanvas = true;
    prevX = event.clientX;
});

canvasArea.addEventListener('mousemove', function (event) {
    if (isDraggingOnCanvas) {
        let currentX = event.clientX;
        horizontalDistance = currentX - prevX;
        prevX = currentX;
        let angle = (camera.angle + ((horizontalDistance / 8) % 360)) % 360;
        camera.rotate(angle);
    }
});

canvasArea.addEventListener('mouseup', function (event) {
    isDraggingOnCanvas = false;
});

const projType = document.getElementById('projection-type') as HTMLSelectElement;

projType.addEventListener('change', () => {
    switch (projType.selectedOptions[0].value) {
        case 'Orthographic':
            currentProjectionType = ProjectionType.ORTHOGRAPHIC;
            break;
        case 'Perspective':
            currentProjectionType = ProjectionType.PERSPECTIVE;
            break;
        case 'Oblique':
            currentProjectionType = ProjectionType.OBLIQUE;
            break;
    }
});

const mapMode = document.getElementById('mapping-mode') as HTMLSelectElement;

mapMode.addEventListener('change', () => {
    switch (mapMode.selectedOptions[0].value) {
        case 'none':
            mappingMode = MappingMode.NONE;
            break;
        case 'texture':
            mappingMode = MappingMode.TEXTURE;
            break;
        case 'environment':
            mappingMode = MappingMode.ENVIRONMENT;
            break;
        case 'bump':
            mappingMode = MappingMode.BUMP;
            break;
    }
});

const textOpt = document.getElementById('texture-opt') as HTMLSelectElement;

textOpt.addEventListener('change', () => {
    switch (textOpt.selectedOptions[0].value) {
        case 'WOOD':
            textureOpt = 'WOOD';
            break;
        case 'BRICK':
            textureOpt = 'BRICK';
            break;
        case 'TILES':
            textureOpt = 'TILES';
            break;
        case 'BUMP':
            textureOpt = 'BUMP';
            break;
    }
});

const tweeningOpt = document.getElementById('tweening-opt') as HTMLSelectElement;

tweeningOpt.addEventListener('change', () => {
    switch (tweeningOpt.selectedOptions[0].value) {
        case 'linear':
            tweeningFunction = AnimationManager.linear;
            break;
        case 'ease-in-quartic':
            tweeningFunction = AnimationManager.easeInQuart;
            break;
        case 'ease-in-elastic':
            tweeningFunction = AnimationManager.easeInElastic;
            break;
        case 'ease-in-out-cubic':
            tweeningFunction = AnimationManager.easeInOutCubic;
            break;

        case 'ease-in-out-quintic':
            tweeningFunction = AnimationManager.easeInOutQuint;
            break;
        case 'ease-out-elastic':
            tweeningFunction = AnimationManager.easeOutElastic;
            break;
        case 'ease-out-bounce':
            tweeningFunction = AnimationManager.easeOutBounce;
            break;
    }
});

/* Node Editor */
const selectedNodeDisplay = document.getElementById('selected-node');
const exportNodeDisplay = document.getElementById('exported-node');
const backToRootButton = document.getElementById('back-to-root');

backToRootButton.addEventListener('click', () => backToRoot());

const backToRoot = () => {
    selectedNode = null;
    animationManager.selectNode(selectedNode);
    selectedNodeDisplay.textContent = '-';
    sliderTranslateNodeX.valueAsNumber = 0;
    sliderTranslateNodeY.valueAsNumber = 0;
    sliderTranslateNodeZ.valueAsNumber = 0;

    sliderRotateNodeX.valueAsNumber = 0;
    sliderRotateNodeY.valueAsNumber = 0;
    sliderRotateNodeZ.valueAsNumber = 0;

    sliderScaleNodeX.valueAsNumber = 0;
    sliderScaleNodeY.valueAsNumber = 0;
    sliderScaleNodeZ.valueAsNumber = 0;

    labelTranslateNodeX.textContent = '0';
    labelTranslateNodeY.textContent = '0';
    labelTranslateNodeZ.textContent = '0';

    labelRotateNodeX.textContent = '0';
    labelRotateNodeY.textContent = '0';
    labelRotateNodeZ.textContent = '0';

    labelScaleNodeX.textContent = '0';
    labelScaleNodeY.textContent = '0';
    labelScaleNodeZ.textContent = '0';
};

const componentTree = (compTree: HTMLElement, root: Node, margin: number = 0) => {
    const button = document.createElement('button');

    button.textContent = root.component;

    button.addEventListener('click', () => {
        selectedNode = root;
        animationManager.selectNode(selectedNode);
        selectedNodeDisplay.textContent = selectedNode.component;

        sliderTranslateNodeX.valueAsNumber = nodeTransformation[root.component].tx;
        sliderTranslateNodeY.valueAsNumber = nodeTransformation[root.component].ty;
        sliderTranslateNodeZ.valueAsNumber = nodeTransformation[root.component].tz;

        sliderRotateNodeX.valueAsNumber = nodeTransformation[root.component].rx;
        sliderRotateNodeY.valueAsNumber = nodeTransformation[root.component].ry;
        sliderRotateNodeZ.valueAsNumber = nodeTransformation[root.component].rz;

        sliderScaleNodeX.valueAsNumber = nodeTransformation[root.component].sx;
        sliderScaleNodeY.valueAsNumber = nodeTransformation[root.component].sy;
        sliderScaleNodeZ.valueAsNumber = nodeTransformation[root.component].sz;

        labelTranslateNodeX.textContent = nodeTransformation[root.component].tx.toString();
        labelTranslateNodeY.textContent = nodeTransformation[root.component].ty.toString();
        labelTranslateNodeZ.textContent = nodeTransformation[root.component].tz.toString();

        labelRotateNodeX.textContent = nodeTransformation[root.component].rx.toString();
        labelRotateNodeY.textContent = nodeTransformation[root.component].ry.toString();
        labelRotateNodeZ.textContent = nodeTransformation[root.component].rz.toString();

        labelScaleNodeX.textContent = nodeTransformation[root.component].sx.toString();
        labelScaleNodeY.textContent = nodeTransformation[root.component].sy.toString();
        labelScaleNodeZ.textContent = nodeTransformation[root.component].sz.toString();
    });

    button.style.marginLeft = `${margin}%`;
    compTree.appendChild(button);
    compTree.appendChild(document.createElement('br'));

    for (const child of root.children) {
        componentTree(compTree, child, margin + 5);
    }
};

const initCompTree = (art: Articulated) => {
    for (const root of art.root) {
        componentTree(sceneGraph, root, 0);
    }
};

const initTransformation = (art: Articulated) => {
    for (const root of art.root) {
        addTransformation(root);
    }
};

const addTransformation = (root: Node) => {
    nodeTransformation[root.component] = new Transformation(0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1);
    for (const child of root.children) {
        addTransformation(child);
    }
};

// Load
const modelOpt = document.getElementById('model-opt') as HTMLSelectElement;

modelOpt.addEventListener('change', () => {
    loadModel(modelOpt.selectedOptions[0].value);
});

const loadModel = (filename: string) => {
    currentArticulated = JSON.stringify(require(`../tests/${filename}.json`));
    initializeWebGL();
    sceneGraph.innerHTML = '';
    animationManager.clearFrameDisplay();
    animationManager.displayAllFrame();
    initCompTree(articulated);
};

const resetBtn = document.getElementById('reset-btn');

resetBtn.addEventListener('click', () => {
    camera.angle = 0;
});

const renderTextureButton = document.getElementById('texture-btn');

renderTextureButton.addEventListener('click', () => {
    if (texture != null) {
        const maxTextureUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        for (let i = 0; i < maxTextureUnits; i++) {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.deleteTexture(texture);
    }

    switch (mappingMode) {
        case MappingMode.TEXTURE:
            texture = articulated.root[0].model.renderTexture(TexturePack[textureOpt], 256, 256, gl);
            break;
        case MappingMode.ENVIRONMENT:
            texture = articulated.root[0].model.renderEnvironment(
                [
                    {
                        source: EnvPack['posX'],
                        width: 512,
                        height: 512,
                    },
                    {
                        source: EnvPack['negX'],
                        width: 512,
                        height: 512,
                    },
                    {
                        source: EnvPack['posY'],
                        width: 512,
                        height: 512,
                    },
                    {
                        source: EnvPack['negY'],
                        width: 512,
                        height: 512,
                    },
                    {
                        source: EnvPack['posZ'],
                        width: 512,
                        height: 512,
                    },
                    {
                        source: EnvPack['negZ'],
                        width: 512,
                        height: 512,
                    },
                ],
                gl,
            );
            break;
        case MappingMode.BUMP:
            texture = articulated.root[0].model.renderTexture(TexturePack['BUMP'], 1, 1, gl);
            break;
    }
});

const updateAddNode = (node: Node) => {
    node.component = node.component + currDupIndex;
    for (const child of node.children) {
        updateAddNode(child);
    }
};

const updateAllNewNode = (art: Articulated) => {
    for (const root of art.root) {
        updateAddNode(root);
    }

    currDupIndex = currDupIndex + 1;
};

const updateNodeComp = (node: Node) => {
    node.component = node.component + currDupIndex;

    for (const child of node.children) {
        updateNodeComp(child);
    }
};

const resetNodeComp = (node: Node) => {
    node.component = node.component.slice(0, -1);

    for (const child of node.children) {
        resetNodeComp(child);
    }
};

const resetAddNode = (node: Node) => {
    node.component = node.component.slice(0, -1);
    for (const child of node.children) {
        resetAddNode(child);
    }
};

const resetAllNewNode = (art: Articulated) => {
    for (const root of art.root) {
        resetAddNode(root);
    }
};

const addNodeButton = document.getElementById('add-node');

addNodeButton.addEventListener('click', () => {
    updateAllNewNode(defaultCube);

    if (selectedNode != null) {
        for (const child of defaultCube.root) {
            const clone = child.clone();
            setParentNodes([clone], selectedNode);
            selectedNode.children.push(clone);
        }
    } else {
        for (const child of defaultCube.root) {
            const clone = child.clone();
            setParentNodes([clone], selectedNode);
            articulated.root.push(clone);
        }
    }

    initTransformation(defaultCube);

    sceneGraph.innerHTML = '';
    animationManager.clearFrameDisplay();
    animationManager.displayAllFrame();
    initCompTree(articulated);
    resetAllNewNode(defaultCube);
});

const setParentNodes = (nodes: Node[], parent: Node) => {
    for (const node of nodes) {
        node.parent = parent;
        setParentNodes(node.children, node);
    }
};

const removeNodeButton = document.getElementById('remove-node');

removeNodeButton.addEventListener('click', () => {
    if (selectedNode != null) {
        const parent = selectedNode.parent;

        if (parent != null) {
            let index = parent.children.indexOf(selectedNode);
            if (index !== -1) {
                parent.children.splice(index, 1);
            }

            sceneGraph.innerHTML = '';
            animationManager.clearFrameDisplay();
            animationManager.displayAllFrame();
            initCompTree(articulated);
        } else {
            let index = articulated.root.indexOf(selectedNode);
            if (index !== -1) {
                articulated.root.splice(index, 1);
            }

            sceneGraph.innerHTML = '';
            animationManager.clearFrameDisplay();
            animationManager.displayAllFrame();
            initCompTree(articulated);
        }

        selectedNode = null;
        selectedNodeDisplay.textContent = '-';
    }
});

const exportNodeButton = document.getElementById('export-node');

exportNodeButton.addEventListener('click', () => {
    if (selectedNode != null) {
        exportNode = selectedNode.clone();
        exportNodeDisplay.textContent = exportNode.component;
    }
});

const importNodeButton = document.getElementById('import-node');

importNodeButton.addEventListener('click', () => {
    if (exportNode != null) {
        updateNodeComp(exportNode);
        currDupIndex = currDupIndex + 1;
        const tempNode: Node = exportNode.clone();
        if (selectedNode != null) {
            setParentNodes([tempNode], selectedNode);
            selectedNode.children.push(tempNode);
        } else {
            setParentNodes([tempNode], selectedNode);
            articulated.root.push(tempNode);
        }

        addTransformation(exportNode);

        sceneGraph.innerHTML = '';
        animationManager.clearFrameDisplay();
        animationManager.displayAllFrame();
        initCompTree(articulated);
        resetNodeComp(exportNode);
    }
});

/* Material Editor */
const sliderShininess = document.getElementById('slider-shininess');
const labelShininess = document.getElementById('label-shininess');

const ambientColorPicker = document.getElementById('ambient-color-picker') as HTMLInputElement;
const diffuseColorPicker = document.getElementById('diffuse-color-picker') as HTMLInputElement;
const specularColorPicker = document.getElementById('specular-color-picker') as HTMLInputElement;

ambientColorPicker.addEventListener("input", ()=> {
    ambientColor = hexToRgb(ambientColorPicker.value);
})

diffuseColorPicker.addEventListener("input", ()=> {
    diffuseColor = hexToRgb(diffuseColorPicker.value);
})

specularColorPicker.addEventListener("input", ()=> {
    specularColor = hexToRgb(specularColorPicker.value);
})

sliderShininess.addEventListener('input', (event) => {
    const value = (event.target as HTMLInputElement).valueAsNumber;

    labelShininess.textContent = value.toString();
    shine = value;
});

const hexToRgb = (hex : string) => {
    // Remove the # character if it's included
    hex = hex.replace('#', '');

    // Parse the hex values to rgb in scale 0..1
    var r = parseInt(hex.substring(0, 2), 16)/255;
    var g = parseInt(hex.substring(2, 4), 16)/255;
    var b = parseInt(hex.substring(4, 6), 16)/255;

    // Return the RGB value
    return new Vector3(r,g,b) ;
}

initializeWebGL();

initCompTree(articulated);
