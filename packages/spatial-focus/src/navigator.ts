import { Stack, Unit, UnitIndex } from "./stack";

export enum Direction {
  UP,
  RIGHT,
  DOWN,
  LEFT,
}

class Navigator {
  private getCurrentItem(data: Stack): UnitIndex | undefined {
    const focusItem = document.activeElement;

    return data.findUnitByNode(focusItem);
  }

  private unselectNode(node: HTMLElement): void {
    node.blur();
  }

  private selectNode(oldUnit: Unit | undefined, unit: Unit): void {
    if (oldUnit) {
      this.unselectNode(oldUnit.node);
    }

    unit.node.focus();

    unit.node.addEventListener("blur", () => {
      this.unselectNode(unit.node);
    });
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
    const candidate = currentItem! ?? fromItem!;
    const { unit: prevUnit } = candidate;

    let newItem: HTMLElement | undefined;

    switch (direction) {
      case Direction.DOWN: {
        const unit = data.findColumn(candidate, { prev: false });

        if (unit) {
          this.selectNode(prevUnit, unit);
          newItem = unit.node;
        }

        break;
      }

      case Direction.UP: {
        const unit = data.findColumn(candidate, { prev: true });

        if (unit) {
          this.selectNode(prevUnit, unit);
          newItem = unit.node;
        }

        break;
      }

      case Direction.RIGHT: {
        const unit = data.findRow(candidate, { prev: false });

        if (unit) {
          this.selectNode(prevUnit, unit);
          newItem = unit.node;
        }

        break;
      }

      case Direction.LEFT: {
        const unit = data.findRow(candidate, { prev: true });

        if (unit) {
          this.selectNode(prevUnit, unit);
          newItem = unit.node;
        }

        break;
      }
    }

    return newItem;
  }
}

export { Navigator };
