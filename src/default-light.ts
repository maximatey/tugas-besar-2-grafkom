import Light from "./objects/Light";

function generateDefaultDirectionalLight(): Light {
  return new Light(0, 0, 1);
}

export default generateDefaultDirectionalLight;
