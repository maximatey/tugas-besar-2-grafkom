type ProgramInformation = {
    attLoc: {
      positionLocation: number;
      normalLocation: number;
      texcoordLocation: number;
      tangentLocation: number;
      bitangentLocation: number;
    };
    uniformLoc: {
      worldViewProjectionLocation: WebGLUniformLocation;
      worldInverseTransposeLocation: WebGLUniformLocation;
      ambientLightColorLocation: WebGLUniformLocation;
      reverseLightDirectionLocation: WebGLUniformLocation;
      shadingLocation: WebGLUniformLocation;
      textureLocation: WebGLUniformLocation;
      textureEnvLocation: WebGLUniformLocation;
      textureModeLocation: WebGLUniformLocation;
    };
  };
  
  export default ProgramInformation;
  