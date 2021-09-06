import { Stack } from "./stack";
import { Direction, Navigator } from "./navigator";

let areasInstance: null | Stack;

/**
 * Create a new Stack or retrieve an exiting one
 */
export function initAreas(): Stack {
  if (areasInstance) {
    return areasInstance;
  }

  areasInstance = new Stack();

  return areasInstance;
}

/**
 * Last item visited, this specially important when
 * there is no focused item in the document
 */
let lastItemVisited: HTMLElement | undefined;

/**
 * Set the keydown event and create a new Navigator,
 * which will interact with the Stack
 */
export function initEventListener(): () => void {
  function keydownListener({ key }: { key: string }) {
    const areas = initAreas();
    const nav = new Navigator();

    switch (key) {
      case "Escape":
        lastItemVisited = nav.navigate(
          areas,
          Direction.LEAVE_AREA,
          lastItemVisited
        );

        break;
      case "Enter":
      case " ": // Space
        lastItemVisited = nav.navigate(
          areas,
          Direction.ENTER_AREA,
          lastItemVisited
        );

        break;
      case "ArrowUp":
        lastItemVisited = nav.navigate(areas, Direction.UP, lastItemVisited);

        break;
      case "ArrowRight":
        lastItemVisited = nav.navigate(areas, Direction.RIGHT, lastItemVisited);

        break;
      case "ArrowDown":
        lastItemVisited = nav.navigate(areas, Direction.DOWN, lastItemVisited);

        break;
      case "ArrowLeft":
        lastItemVisited = nav.navigate(areas, Direction.LEFT, lastItemVisited);

        break;
    }
  }

  window.addEventListener("keydown", keydownListener);

  return function removeKeydownListener() {
    lastItemVisited = undefined;
    window.removeEventListener("keydown", keydownListener);
  };
}
