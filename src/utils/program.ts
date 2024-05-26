const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS) as boolean;
    if (success) {
        return program;
    }

    gl.deleteProgram(program);

    throw Error("Failed to link program!");
}

export default createProgram;