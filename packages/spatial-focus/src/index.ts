import { Stack } from "./stack";
import { Direction, Navigator } from "./navigator";

let areasInstance: null | Stack;
const initAreas = (): Stack => {
  if (areasInstance) {
    return areasInstance;
  }

  areasInstance = new Stack();

  return areasInstance;
};

let lastItemVisited: HTMLElement | undefined;
const initEventListener = (): (() => void) => {
  const handler = ({ key }: { key: string }) => {
    const areas = initAreas();
    const nav = new Navigator();

    console.log(areas);

    switch (key) {
      case "Escape":
        lastItemVisited = nav.goTo(areas, Direction.AREA, lastItemVisited);

        break;
      case "ArrowUp":
        lastItemVisited = nav.goTo(areas, Direction.UP, lastItemVisited);

        break;
      case "ArrowRight":
        lastItemVisited = nav.goTo(areas, Direction.RIGHT, lastItemVisited);

        break;
      case "ArrowDown":
        lastItemVisited = nav.goTo(areas, Direction.DOWN, lastItemVisited);

        break;
      case "ArrowLeft":
        lastItemVisited = nav.goTo(areas, Direction.LEFT, lastItemVisited);

        break;
    }
  };

  window.addEventListener("keydown", handler);

  return () => {
    lastItemVisited = undefined;
    window.removeEventListener("keydown", handler);
  };
};

export { initAreas, initEventListener };
