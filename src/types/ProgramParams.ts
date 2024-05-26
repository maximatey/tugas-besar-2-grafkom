enum ShaderStatus {
    OFF = 0,
    ON = 1,
}

type ProgramParam = {
  attributes: {
    rawPosition: Float32Array;
    rawNormal: Float32Array;
    rawTexture: Float32Array;
    rawTangent: Float32Array;
    rawBitangent: Float32Array;
  };
  uniforms: {
    rawMatrix: readonly number[];
    rawInverseTransposeMatrix: readonly number[];
    rawAmbientColor: readonly [number, number, number];
    rawDirectionalLight: readonly [number, number, number];
    shaderStatus: ShaderStatus;
  };
};

export default ProgramParam;