import AnimationManagerInterface from '../interfaces/AnimationManagerInterface';
import Articulated from './Articulated';
import Node from './Node';
import Transformation from './Transformation';

class AnimationManager implements AnimationManagerInterface {
    constructor(
        public node: Node,
        public readonly root: Articulated,
        public currFrameSetter: Function,
        public totalFrameSetter: Function,
        public playToggle: Function,
        public frameContainer: HTMLDivElement,
    ) {
        this.displayAllFrame();
    }

    public static linear(x: number): number {
        return x;
    }

    public static easeInQuart(x: number): number {
        return x * x * x * x;
    }

    public static easeInElastic(x: number): number {
        const c4 = (2 * Math.PI) / 3;

        return x === 0 ? 0 : x === 1 ? 1 : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
    }

    public static easeInOutCubic(x: number): number {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    public static easeInOutQuint(x: number): number {
        return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
    }

    public static easeOutElastic(x: number): number {
        const c4 = (2 * Math.PI) / 3;

        return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    }

    public static easeOutBounce(x: number): number {
        const n1 = 7.5625;
        const d1 = 2.75;

        if (x < 1 / d1) {
            return n1 * x * x;
        } else if (x < 2 / d1) {
            return n1 * (x -= 1.5 / d1) * x + 0.75;
        } else if (x < 2.5 / d1) {
            return n1 * (x -= 2.25 / d1) * x + 0.9375;
        } else {
            return n1 * (x -= 2.625 / d1) * x + 0.984375;
        }
    }

    public selectNode(node: Node) {
        this.node = node;
        this.clearFrameDisplay();
        this.displayAllFrame();

        let selectedNode: any = this.node == null ? this.root : this.node;
        this.totalFrameSetter(selectedNode.getTransformations().length);
    }

    public toFirstFrame() {
        this.root.setTransformationIndex(0);
        this.currFrameSetter(this.root.getTransformationIndex() + 1);
    }

    public toLastFrame() {
        let selectedNode: any = this.node == null ? this.root : this.node;
        this.root.setTransformationIndex(selectedNode.getTransformations().length - 1);
        this.currFrameSetter(selectedNode.getTransformationIndex() + 1);
    }

    public toNextFrame() {
        let selectedNode: any = this.node == null ? this.root : this.node;
        this.root.setTransformationIndexbyDelta(+1);
        this.currFrameSetter(selectedNode.getTransformationIndex() + 1);
    }

    public toPreviousFrame() {
        let selectedNode: any = this.node == null ? this.root : this.node;
        this.root.setTransformationIndexbyDelta(-1);
        this.currFrameSetter(selectedNode.getTransformationIndex() + 1);
    }

    // Animation Editor
    public swap(trans1idx: number, trans2idx: number) {
        let selectedNode: any = this.node == null ? this.root : this.node;
        let tranformTemp = selectedNode.getTransformations()[trans2idx];
        selectedNode.setTransformation(selectedNode.getTransformation(trans1idx), trans2idx);
        selectedNode.setTransformation(tranformTemp, trans1idx);
        this.clearFrameDisplay();
        this.displayAllFrame();
    }

    public addNewFrame(idx: number) {
        // Initial transformation
        let newTransformation = new Transformation(0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1);
        let selectedNode: any = this.node == null ? this.root : this.node;
        selectedNode.getTransformations().splice(idx, 0, newTransformation);
        this.clearFrameDisplay();
        this.displayAllFrame();
        this.totalFrameSetter(selectedNode.getTransformations().length);
    }

    public deleteFrame(idx: number) {
        let selectedNode: any = this.node == null ? this.root : this.node;
        selectedNode.getTransformations().splice(idx, 1);
        this.clearFrameDisplay();
        this.displayAllFrame();
        this.totalFrameSetter(selectedNode.getTransformations().length);
    }

    public clearFrameDisplay() {
        this.frameContainer.innerHTML = '';
    }

    public displayAllFrame() {
        let selectedNode: any = this.node == null ? this.root : this.node;
        // Show frames
        for (let i = 0; i < selectedNode.getTransformations().length; i++) {
            let transformation = selectedNode.getTransformation(i);

            // Frame Div
            const frameElement = document.createElement('div');
            frameElement.className = 'frame';

            // Frame Header
            const frameHeader = document.createElement('div');
            frameHeader.className = 'frame-header';

            // Add Button
            const addButton = document.createElement('button');
            addButton.textContent = '+';
            addButton.className = 'add-btn';

            addButton.addEventListener('click', () => {
                this.addNewFrame(i + 1);
            });

            // Frame Name
            const frameName = document.createElement('h2');
            frameName.textContent = `Frame ${i + 1}`;
            frameName.className = 'frame-name';

            frameName.addEventListener('click', () => {
                if (frameEditor.style.display == 'none') {
                    frameEditor.style.display = 'block';
                } else {
                    frameEditor.style.display = 'none';
                }
            });

            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'x';
            deleteButton.className = 'delete-btn';

            deleteButton.addEventListener('click', () => {
                this.deleteFrame(i);
            });

            frameHeader.appendChild(addButton);
            frameHeader.appendChild(frameName);
            frameHeader.appendChild(deleteButton);

            // Frame Editor
            const frameEditor = document.createElement('div');
            frameEditor.className = 'frame-editor';

            // Translation

            const frameTranslationDiv = document.createElement('div');

            // Tx
            const frameTxDiv = document.createElement('div');
            const frameTxLabel = document.createElement('label');
            frameTxLabel.textContent = 'Tx:';

            const frameTxInput = document.createElement('input');
            frameTxInput.type = 'range';
            frameTxInput.min = '-100';
            frameTxInput.max = '100';
            frameTxInput.step = '1';
            frameTxInput.value = transformation.tx.toString();

            const frameTxVal = document.createElement('span');
            frameTxVal.textContent = transformation.tx.toString();

            frameTxInput.addEventListener('input', () => {
                transformation.tx = Number(frameTxInput.value);
                frameTxVal.textContent = frameTxInput.value;
            });

            frameTxDiv.appendChild(frameTxLabel);
            frameTxDiv.appendChild(frameTxInput);
            frameTxDiv.appendChild(frameTxVal);

            // Ty
            const frameTyDiv = document.createElement('div');
            const frameTyLabel = document.createElement('label');
            frameTyLabel.textContent = 'Ty:';

            const frameTyInput = document.createElement('input');
            frameTyInput.type = 'range';
            frameTyInput.min = '-100';
            frameTyInput.max = '100';
            frameTyInput.step = '1';
            frameTyInput.value = transformation.ty.toString();

            const frameTyVal = document.createElement('span');
            frameTyVal.textContent = transformation.ty.toString();

            frameTyInput.addEventListener('input', () => {
                transformation.ty = Number(frameTyInput.value);
                frameTyVal.textContent = frameTyInput.value;
            });

            frameTyDiv.appendChild(frameTyLabel);
            frameTyDiv.appendChild(frameTyInput);
            frameTyDiv.appendChild(frameTyVal);

            // Tz
            const frameTzDiv = document.createElement('div');
            const frameTzLabel = document.createElement('label');
            frameTzLabel.textContent = 'Tz:';

            const frameTzInput = document.createElement('input');
            frameTzInput.type = 'range';
            frameTzInput.min = '-100';
            frameTzInput.max = '100';
            frameTzInput.step = '1';
            frameTzInput.value = transformation.tz.toString();

            const frameTzVal = document.createElement('span');
            frameTzVal.textContent = transformation.tz.toString();

            frameTzInput.addEventListener('input', () => {
                transformation.tz = Number(frameTzInput.value);
                frameTzVal.textContent = frameTzInput.value;
            });

            frameTzDiv.appendChild(frameTzLabel);
            frameTzDiv.appendChild(frameTzInput);
            frameTzDiv.appendChild(frameTzVal);

            frameTranslationDiv.appendChild(frameTxDiv);
            frameTranslationDiv.appendChild(frameTyDiv);
            frameTranslationDiv.appendChild(frameTzDiv);

            // Rotation

            const frameRotationDiv = document.createElement('div');

            // Rx
            const frameRxDiv = document.createElement('div');
            const frameRxLabel = document.createElement('label');
            frameRxLabel.textContent = 'Rx:';

            const frameRxInput = document.createElement('input');
            frameRxInput.type = 'range';
            frameRxInput.min = '0';
            frameRxInput.max = '360';
            frameRxInput.step = '1';
            frameRxInput.value = transformation.rx.toString();

            const frameRxVal = document.createElement('span');
            frameRxVal.textContent = transformation.rx.toString();

            frameRxInput.addEventListener('input', () => {
                transformation.rx = Number(frameRxInput.value);
                frameRxVal.textContent = frameRxInput.value;
            });

            frameRxDiv.appendChild(frameRxLabel);
            frameRxDiv.appendChild(frameRxInput);
            frameRxDiv.appendChild(frameRxVal);

            // Ry
            const frameRyDiv = document.createElement('div');
            const frameRyLabel = document.createElement('label');
            frameRyLabel.textContent = 'Ry:';

            const frameRyInput = document.createElement('input');
            frameRyInput.type = 'range';
            frameRyInput.min = '0';
            frameRyInput.max = '360';
            frameRyInput.step = '1';
            frameRyInput.value = transformation.ry.toString();

            const frameRyVal = document.createElement('span');
            frameRyVal.textContent = transformation.ry.toString();

            frameRyInput.addEventListener('input', () => {
                transformation.ry = Number(frameRyInput.value);
                frameRyVal.textContent = frameRyInput.value;
            });

            frameRyDiv.appendChild(frameRyLabel);
            frameRyDiv.appendChild(frameRyInput);
            frameRyDiv.appendChild(frameRyVal);

            // Rz
            const frameRzDiv = document.createElement('div');
            const frameRzLabel = document.createElement('label');
            frameRzLabel.textContent = 'Rz:';

            const frameRzInput = document.createElement('input');
            frameRzInput.type = 'range';
            frameRzInput.min = '0';
            frameRzInput.max = '360';
            frameRzInput.step = '1';
            frameRzInput.value = transformation.rz.toString();

            const frameRzVal = document.createElement('span');
            frameRzVal.textContent = transformation.rz.toString();

            frameRzInput.addEventListener('input', () => {
                transformation.rz = Number(frameRzInput.value);
                frameRzVal.textContent = frameRzInput.value;
            });

            frameRzDiv.appendChild(frameRzLabel);
            frameRzDiv.appendChild(frameRzInput);
            frameRzDiv.appendChild(frameRzVal);

            frameRotationDiv.appendChild(frameRxDiv);
            frameRotationDiv.appendChild(frameRyDiv);
            frameRotationDiv.appendChild(frameRzDiv);

            // Scale

            const frameScaleDiv = document.createElement('div');

            // Sx
            const frameSxDiv = document.createElement('div');
            const frameSxLabel = document.createElement('label');
            frameSxLabel.textContent = 'Sx:';

            const frameSxInput = document.createElement('input');
            frameSxInput.type = 'range';
            frameSxInput.min = '1';
            frameSxInput.max = '10';
            frameSxInput.step = '0.1';
            frameSxInput.value = transformation.sx.toString();

            const frameSxVal = document.createElement('span');
            frameSxVal.textContent = transformation.sx.toString();

            frameSxInput.addEventListener('input', () => {
                transformation.sx = Number(frameSxInput.value);
                frameSxVal.textContent = frameSxInput.value;
            });

            frameSxDiv.appendChild(frameSxLabel);
            frameSxDiv.appendChild(frameSxInput);
            frameSxDiv.appendChild(frameSxVal);

            // Sy
            const frameSyDiv = document.createElement('div');
            const frameSyLabel = document.createElement('label');
            frameSyLabel.textContent = 'Sy:';

            const frameSyInput = document.createElement('input');
            frameSyInput.type = 'range';
            frameSyInput.min = '1';
            frameSyInput.max = '10';
            frameSyInput.step = '0.1';
            frameSyInput.value = transformation.sy.toString();

            const frameSyVal = document.createElement('span');
            frameSyVal.textContent = transformation.sy.toString();

            frameSyInput.addEventListener('input', () => {
                transformation.sy = Number(frameSyInput.value);
                frameSyVal.textContent = frameSyInput.value;
            });

            frameSyDiv.appendChild(frameSyLabel);
            frameSyDiv.appendChild(frameSyInput);
            frameSyDiv.appendChild(frameSyVal);

            // Sz
            const frameSzDiv = document.createElement('div');
            const frameSzLabel = document.createElement('label');
            frameSzLabel.textContent = 'Sz:';

            const frameSzInput = document.createElement('input');
            frameSzInput.type = 'range';
            frameSzInput.min = '1';
            frameSzInput.max = '10';
            frameSzInput.step = '0.1';
            frameSzInput.value = transformation.sz.toString();

            const frameSzVal = document.createElement('span');
            frameSzVal.textContent = transformation.sz.toString();

            frameSzInput.addEventListener('input', () => {
                transformation.sz = Number(frameSzInput.value);
                frameSzVal.textContent = frameSzInput.value;
            });

            frameSzDiv.appendChild(frameSzLabel);
            frameSzDiv.appendChild(frameSzInput);
            frameSzDiv.appendChild(frameSzVal);

            frameScaleDiv.appendChild(frameSxDiv);
            frameScaleDiv.appendChild(frameSyDiv);
            frameScaleDiv.appendChild(frameSzDiv);

            // Add translation, rotation, and scale to editor
            frameEditor.appendChild(frameTranslationDiv);
            frameEditor.appendChild(frameRotationDiv);
            frameEditor.appendChild(frameScaleDiv);

            // Swap Up Frame
            if (i > 0) {
                const swapUpFrameButton = document.createElement('button');
                swapUpFrameButton.textContent = '^';
                swapUpFrameButton.className = 'swap-btn up';

                swapUpFrameButton.addEventListener('click', () => {
                    this.swap(i, i - 1);
                });

                frameElement.appendChild(swapUpFrameButton);
            }
            frameElement.appendChild(frameHeader);
            frameElement.appendChild(frameEditor);
            // Swap Down Frame
            if (i < selectedNode.getTransformations().length - 1) {
                const swapUpFrameButton = document.createElement('button');
                swapUpFrameButton.textContent = 'v';
                swapUpFrameButton.className = 'swap-btn down';

                swapUpFrameButton.addEventListener('click', () => {
                    this.swap(i, i + 1);
                });

                frameElement.appendChild(swapUpFrameButton);
            }

            this.frameContainer.appendChild(frameElement);
        }
    }
}

export default AnimationManager;
