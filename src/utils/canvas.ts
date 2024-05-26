const resizeCanvasToDisplaySize = (canvas: HTMLCanvasElement) => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (width !== canvas.width || height !== canvas.height) {
        canvas.width = width;
        canvas.height = height;
        return true;
    }

    return false;
}

export default resizeCanvasToDisplaySize;