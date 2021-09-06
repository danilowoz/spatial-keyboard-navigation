import { Stack, Unit, ItemIndex, UnitType } from "./stack";

export enum Direction {
  UP,
  RIGHT,
  DOWN,
  LEFT,
  ENTER_AREA,
  LEAVE_AREA,
}

/**
 * Stateless of group of methods that works as an
 * interface between the navigation events and a Stack
 */
class Navigator {
  areaClassName = "area-selected";

  /**
   * Get the select node and returns its unit from the Stack
   */
  private getCurrentItem(data: Stack): ItemIndex | undefined {
    const focusArea = document.querySelector(`.${this.areaClassName}`);
    const focusItem = document.activeElement;

    return data.findByNode(focusArea ?? focusItem);
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
    const currentItem = this.getCurrentItem(stack);
    const fromItem = stack.findByNode(from);

    /**
     * First interaction, so set the first Unit as selected
     */
    if (!currentItem && !fromItem) {
      const unit = stack?.findByIndex(0, 0);

      if (unit) {
        this.selectNode(undefined, unit);
      }

      return;
    }

    const candidate = fromItem! ?? currentItem!;
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
        const unit = stackCandidate.findColumn(candidate, { prev: false });

        if (unit) {
          this.selectNode(prevUnit, unit);
          selectedNode = unit.node;
        }

        break;
      }

      case Direction.UP: {
        const unit = stackCandidate.findColumn(candidate, { prev: true });

        if (unit) {
          this.selectNode(prevUnit, unit);
          selectedNode = unit.node;
        }

        break;
      }

      case Direction.RIGHT: {
        const unit = stackCandidate.findRow(candidate, { prev: false });

        if (unit) {
          this.selectNode(prevUnit, unit);
          selectedNode = unit.node;
        }

        break;
      }

      case Direction.LEFT: {
        const unit = stackCandidate.findRow(candidate, { prev: true });

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
          this.selectNode(prevUnit, childrenUnit);
          selectedNode = childrenUnit.node;
        }

        break;
      }

      case Direction.LEAVE_AREA: {
        if (candidate.unit.parent) {
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
