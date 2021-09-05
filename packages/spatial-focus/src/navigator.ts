import { Stack, Unit, UnitIndex } from "./stack";

export enum Direction {
  UP,
  RIGHT,
  DOWN,
  LEFT,
  ENTER_AREA,
  LEAVE_AREA,
}

class Navigator {
  private getCurrentItem(data: Stack): UnitIndex | undefined {
    const focusArea = document.querySelector(".area-selected");
    const focusItem = document.activeElement;

    return data.findUnitByNode(focusArea ?? focusItem);
  }

  private unselectItem(node: HTMLElement): void {
    node.blur();
    node.classList.remove("area-selected");
  }

  private selectNode(oldUnit: Unit | undefined, unit: Unit): void {
    if (oldUnit) {
      this.unselectItem(oldUnit.node);
    }

    if (unit.type === "item") {
      unit.node.focus();

      unit.node.addEventListener("blur", () => {
        this.unselectItem(unit.node);
      });
    } else if (unit.type === "area") {
      unit.node.classList.add("area-selected");
    }
  }

  public goTo(
    data: Stack,
    direction: Direction,
    from?: HTMLElement
  ): HTMLElement | undefined {
    const currentItem = this.getCurrentItem(data);
    const fromItem = data.findUnitByNode(from);

    if (!currentItem && !fromItem) {
      const unit = data?.findByIndex(0, 0);
      this.selectNode(undefined, unit);

      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const candidate = fromItem! ?? currentItem!;
    const { unit: prevUnit } = candidate;

    const stackCandidate =
      data.findUnitByNode(candidate.unit.parent?.node)?.unit.children ?? data;

    let newItem: HTMLElement | undefined;

    switch (direction) {
      case Direction.DOWN: {
        const unit = stackCandidate.findColumn(candidate, { prev: false });

        if (unit) {
          this.selectNode(prevUnit, unit);
          newItem = unit.node;
        }

        break;
      }

      case Direction.UP: {
        const unit = stackCandidate.findColumn(candidate, { prev: true });

        if (unit) {
          this.selectNode(prevUnit, unit);
          newItem = unit.node;
        }

        break;
      }

      case Direction.RIGHT: {
        const unit = stackCandidate.findRow(candidate, { prev: false });

        if (unit) {
          this.selectNode(prevUnit, unit);
          newItem = unit.node;
        }

        break;
      }

      case Direction.LEFT: {
        const unit = stackCandidate.findRow(candidate, { prev: true });

        if (unit) {
          this.selectNode(prevUnit, unit);
          newItem = unit.node;
        }

        break;
      }

      case Direction.ENTER_AREA: {
        const childrenStack = stackCandidate.findUnitByNode(prevUnit.node);
        const childrenUnit = childrenStack?.unit.children?.findByIndex(0, 0);

        if (childrenStack && childrenUnit) {
          this.selectNode(prevUnit, childrenUnit);
          newItem = childrenUnit.node;
        }

        break;
      }

      case Direction.LEAVE_AREA: {
        if (candidate.unit.parent) {
          this.selectNode(prevUnit, candidate.unit.parent);
          newItem = candidate.unit.parent.node;
        }

        break;
      }
    }

    return newItem;
  }
}

export { Navigator };
