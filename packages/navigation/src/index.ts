import { Stack } from "./stack";
import { Direction, Navigator } from "./navigator";

let dataStructureInstance: null | Stack;
const initStack = (): Stack => {
  if (dataStructureInstance) {
    return dataStructureInstance;
  }

  dataStructureInstance = new Stack();

  return dataStructureInstance;
};

let lastItemVisited: HTMLElement | undefined;
const initEventListener = (): (() => void) => {
  const handler = ({ key }: { key: string }) => {
    const data = initStack();
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

export { initStack, initEventListener };
