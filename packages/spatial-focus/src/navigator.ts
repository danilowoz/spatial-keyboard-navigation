import { History } from "./history";
import { Stack, Unit, ItemIndex, UnitType } from "./stack";

export enum Direction {
  UP,
  RIGHT,
  DOWN,
  LEFT,
  ENTER_AREA,
  LEAVE_AREA,
}

export interface Options {
  areaClassName?: string
}

/**
 * Stateless of group of methods that works as an
 * interface between the navigation events and a Stack
 */
class Navigator {
  private areaClassName = "area-selected";

  constructor(private history: History, options: Options) {
    this.history = history;
    
    if (options.areaClassName) {
      this.areaClassName = options.areaClassName
    }
  }

  /**
   * The Element which currently has focus,
   * expect body or null if there is no focused element
   */
  private getValidActiveElement() {
    const active = document.activeElement;

    if (active === null) return;
    if (active === document.body) return;

    return active;
  }

  /**
   * Get the select node and returns its unit from the Stack
   */
  private getActiveUnit(data: Stack): ItemIndex | undefined {
    const focusItem = this.getValidActiveElement();
    const focusArea = document.querySelector(`.${this.areaClassName}`);

    // Prevent duplicate selection
    if (focusItem && focusArea) {
      this.unselectItem(focusArea as HTMLElement);
    }

    return data.findByNode(focusItem ?? focusArea);
  }

  /**
   * Set a node as selected
   */
  private selectNode(oldUnit: Unit | undefined, unit: Unit): void {
    if (oldUnit) {
      this.unselectItem(oldUnit.node);
    }

    if (unit.type === UnitType.CLICKABLE) {
      unit.node.focus();

      unit.node.addEventListener("blur", () => {
        this.unselectItem(unit.node);
      });
    } else if (unit.type === UnitType.AREA) {
      unit.node.classList.add(this.areaClassName);
    }
  }

  /**
   * Revert selected changes
   */
  private unselectItem(node: HTMLElement): void {
    node.blur();
    node.classList.remove(this.areaClassName);
  }

  /**
   * Navigate in a Stack for given direction
   * and based on a node
   */
  public navigate(
    stack: Stack,
    direction: Direction,
    from?: HTMLElement
  ): HTMLElement | undefined {
    /**
     * Reference nodes
     */
    const activeUnit = this.getActiveUnit(stack);
    const fromItem = stack.findByNode(from);

    /**
     * History
     */
    let historyItem = this.history.prev();
    const historyUnit = historyItem && stack.findByNode(historyItem.node);
    // History is broken, due to some unmonted component
    if (historyItem && !historyUnit) {
      this.history.clean();
      historyItem = undefined;
    }

    /**
     * Third-parties support - the active element doesn't belong to a stack
     */
    if (this.getValidActiveElement() && !activeUnit) return;

    /**
     * Probably this is the first interaction,
     * so set the first Unit as selected
     */
    if (!activeUnit && !fromItem) {
      /**
       * Prevent Esc and Enter select an item
       */
      const inValidDirection = [
        Direction.ENTER_AREA,
        Direction.LEAVE_AREA,
      ].includes(direction);
      if (inValidDirection) return;

      const unit = stack?.findByIndex(0, 0);

      if (unit) {
        this.selectNode(undefined, unit);
      }

      return;
    }

    const candidate = activeUnit! ?? fromItem!;
    const { unit: prevUnit } = candidate;

    /**
     * Might be a children stack (clickable) or areas
     */
    const stackCandidate =
      stack.findByNode(candidate.unit.parent?.node)?.unit.children ?? stack;

    let selectedNode: HTMLElement | undefined;

    /**
     * Navigation
     */
    switch (direction) {
      case Direction.DOWN: {
        let unit: Unit | undefined;

        // From history - revert action and remove from history
        if (historyItem && historyItem.direction === Direction.UP) {
          unit = historyUnit!.unit;

          this.history.pop();
        } else {
          unit = stackCandidate.findColumn(candidate, { prev: false });

          if (unit) {
            this.history.add({
              direction: Direction.DOWN,
              node: from,
            });
          }
        }

        if (unit) {
          this.selectNode(prevUnit, unit);
          selectedNode = unit.node;
        }

        break;
      }

      case Direction.UP: {
        let unit: Unit | undefined;

        // From history - revert action and remove from history
        if (historyItem && historyItem.direction === Direction.DOWN) {
          unit = historyUnit!.unit;

          this.history.pop();
        } else {
          unit = stackCandidate.findColumn(candidate, { prev: true });

          if (unit) {
            this.history.add({
              direction: Direction.UP,
              node: from,
            });
          }
        }

        if (unit) {
          this.selectNode(prevUnit, unit);
          selectedNode = unit.node;
        }

        break;
      }

      case Direction.RIGHT: {
        let unit: Unit | undefined;

        // From history - revert action and remove from history
        if (historyItem && historyItem.direction === Direction.LEFT) {
          unit = historyUnit!.unit;
          this.history.pop();
        } else {
          unit = stackCandidate.findRow(candidate, { prev: false });

          if (unit) {
            this.history.add({
              direction: Direction.RIGHT,
              node: from,
            });
          }
        }

        if (unit) {
          this.selectNode(prevUnit, unit);
          selectedNode = unit.node;
        }

        break;
      }

      case Direction.LEFT: {
        let unit: Unit | undefined;

        // From history - revert action and remove from history
        if (historyItem && historyItem.direction === Direction.RIGHT) {
          unit = historyUnit!.unit;

          this.history.pop();
        } else {
          unit = stackCandidate.findRow(candidate, { prev: true });

          if (unit) {
            this.history.add({
              direction: Direction.LEFT,
              node: from,
            });
          }
        }

        if (unit) {
          this.selectNode(prevUnit, unit);
          selectedNode = unit.node;
        }

        break;
      }

      case Direction.ENTER_AREA: {
        const childrenStack = stackCandidate.findByNode(prevUnit.node);
        const childrenUnit = childrenStack?.unit.children?.findByIndex(0, 0);

        if (childrenStack && childrenUnit) {
          this.history.clean();

          this.selectNode(prevUnit, childrenUnit);
          selectedNode = childrenUnit.node;
        }

        break;
      }

      case Direction.LEAVE_AREA: {
        if (candidate.unit.parent) {
          this.history.clean();

          this.selectNode(prevUnit, candidate.unit.parent);
          selectedNode = candidate.unit.parent.node;
        }

        break;
      }
    }

    return selectedNode;
  }
}

export { Navigator };
