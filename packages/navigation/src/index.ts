import { DataStructure } from "./data";
import { Direction, Navigator } from "./navigator";

let dataStructureInstance: null | DataStructure;
const initDataStructure = (): DataStructure => {
  if (dataStructureInstance) {
    return dataStructureInstance;
  }

  dataStructureInstance = new DataStructure();

  return dataStructureInstance;
};

const initEventListener = (): (() => void) => {
  const handler = ({ key }: { key: string }) => {
    const data = initDataStructure();
    const navigation = new Navigator();

    switch (key) {
      case "ArrowUp":
        navigation.goTo(data, Direction.UP);
        break;
      case "ArrowRight":
        navigation.goTo(data, Direction.RIGHT);
        break;
      case "ArrowDown":
        navigation.goTo(data, Direction.DOWN);
        break;
      case "ArrowLeft":
        navigation.goTo(data, Direction.LEFT);
        break;
    }
  };

  window.addEventListener("keydown", handler);

  return () => {
    window.removeEventListener("keydown", handler);
  };
};

export { initDataStructure, initEventListener };
