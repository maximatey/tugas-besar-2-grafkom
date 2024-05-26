import Vector4Interface from "../interfaces/Vector4Interface";

class Coordinate implements Vector4Interface {
  public constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
    public readonly w: number
  ) {}

  public getQuadruplet(): readonly [number, number, number, number] {
    return [this.x, this.y, this.z, this.w];
  }

  public dot(other: Coordinate): number {
    return (
      this.x * other.x + this.y * other.y + this.z * other.z + this.w * other.w
    );
  }
}

export default Coordinate;
