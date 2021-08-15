import { DataStructure, Unit } from "./data";

export enum Direction {
  UP,
  RIGHT,
  DOWN,
  LEFT,
}

class Navigator {
  getCurrentItem(data: DataStructure): Unit | undefined {
    const focusItem = document.activeElement;

    return focusItem ? data.findByNode(focusItem) : undefined;
  }

  unselect(unit: Unit): void {
    unit.node.blur();
    unit.node.classList.remove("select");
  }

  select(oldUnit: Unit | undefined, unit: Unit): void {
    if (oldUnit) {
      this.unselect(oldUnit);
    }

    unit.node.classList.add("select");
    unit.node.focus();
  }

  goTo(data: DataStructure, direction: Direction): void {
    const currentItem = this.getCurrentItem(data);

    if (!currentItem) {
      this.select(currentItem, data?.findByIndex(0, 0));

      return;
    }

    switch (direction) {
      case Direction.DOWN:
        this.select(currentItem, data?.findByIndex(0, 1));
        break;

      case Direction.UP:
        this.select(currentItem, data?.findByIndex(0, 0));
        break;
    }
  }
}

export { Navigator };
