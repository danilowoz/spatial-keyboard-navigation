import { Stack, Unit, UnitIndex } from "./stack";

export enum Direction {
  UP,
  RIGHT,
  DOWN,
  LEFT,
  AREA,
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

      // case Direction.AREA: {
      //   const area = candidate.unit.parent;

      //   if (area) {
      //     this.unselectNode(prevUnit.node);
      //     this.selectNode(area);
      //   }
      // }
    }

    return newItem;
  }
}

export { Navigator };
