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

let lastItemVisited: Element | undefined;
const initEventListener = (): (() => void) => {
  const handler = ({ key }: { key: string }) => {
    const data = initDataStructure();
    const navigation = new Navigator();

    switch (key) {
      case "ArrowUp":
        lastItemVisited = navigation.goTo(data, Direction.UP, lastItemVisited);

        break;
      case "ArrowRight":
        lastItemVisited = navigation.goTo(
          data,
          Direction.RIGHT,
          lastItemVisited
        );

        break;
      case "ArrowDown":
        lastItemVisited = navigation.goTo(
          data,
          Direction.DOWN,
          lastItemVisited
        );

        break;
      case "ArrowLeft":
        lastItemVisited = navigation.goTo(
          data,
          Direction.LEFT,
          lastItemVisited
        );

        break;
    }
  };

  window.addEventListener("keydown", handler);

  return () => {
    lastItemVisited = undefined;
    window.removeEventListener("keydown", handler);
  };
};

export { initDataStructure, initEventListener };
