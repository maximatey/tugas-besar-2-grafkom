import Vector2Interface from './Vector2Interface';
import Vector3Interface from './Vector3Interface';
import Vector4Interface from './Vector4Interface';

interface FaceInterface {
    points: Vector4Interface[];
    color: Vector3Interface;
    textures: Vector2Interface[];
}

export default FaceInterface;
