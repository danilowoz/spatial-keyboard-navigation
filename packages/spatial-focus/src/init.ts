import { Stack } from "./stack";
import { Direction, Navigator } from "./navigator";
import { History } from "./history";

/**
 * History instance
 */
const history = new History();

/**
 * Create a new Stack or retrieve an exiting one
 */
let stackInstance: null | Stack;
function initStack(): Stack {
  if (stackInstance) {
    return stackInstance;
  }

  stackInstance = new Stack();

  return stackInstance;
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
function initEventListener(): () => void {
  function keydownListener({ key }: { key: string }) {
    const stack = initStack();
    const nav = new Navigator(history);

    switch (key) {
      case "Tab":
        /**
         * TODO: Maybe in the future it makes sense support tab
         * but for now it turns the history not reliable
         */
        history.clean();

        break;
      case "Escape":
        lastItemVisited = nav.navigate(
          stack,
          Direction.LEAVE_AREA,
          lastItemVisited
        );

        break;
      case "Enter":
      case " ": // Space
        lastItemVisited = nav.navigate(
          stack,
          Direction.ENTER_AREA,
          lastItemVisited
        );

        break;
      case "ArrowUp":
        lastItemVisited = nav.navigate(stack, Direction.UP, lastItemVisited);

        break;
      case "ArrowRight":
        lastItemVisited = nav.navigate(stack, Direction.RIGHT, lastItemVisited);

        break;
      case "ArrowDown":
        lastItemVisited = nav.navigate(stack, Direction.DOWN, lastItemVisited);

        break;
      case "ArrowLeft":
        lastItemVisited = nav.navigate(stack, Direction.LEFT, lastItemVisited);

        break;
    }

    if (lastItemVisited) {
      window.dispatchEvent(
        new CustomEvent("spatial-focus-navigate", {
          detail: { node: lastItemVisited },
        })
      );
    }
  }

  window.addEventListener("keydown", keydownListener);

  return function removeKeydownListener() {
    lastItemVisited = undefined;
    window.removeEventListener("keydown", keydownListener);
  };
}

export { initStack, initEventListener };
