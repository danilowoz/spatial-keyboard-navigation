type Position = Record<"x" | "y", number>;

class Unit {
  position: Position;
  node: HTMLElement;

  constructor(node: HTMLElement, position: Position) {
    this.node = node;
    this.position = position;
  }
}

class Column {
  items: Unit[] = [];

  tail = 0;
  head = 0;

  add(unit: Unit): void {
    if (this.items.length === 0) {
      this.items = [unit];
      this.tail = unit.position.x;
      this.head = unit.position.x;

      return;
    }

    const fitIndex = this.items.findIndex((row) => {
      return this.tail >= row.position.y && this.head <= row.position.y;
    });

    if (fitIndex === -1) {
      this.head = unit.position.x;
      this.items = [...this.items, unit];
    } else {
      this.items = this.items.reduce((acc, curr, index) => {
        acc.push(curr);

        if (fitIndex === index) {
          this.tail = unit.position.x;
          acc.push(unit);
        }

        return acc;
      }, [] as Unit[]);
    }
  }
}

class Navigation {
  items: Column[] = [];

  getPosition(node: HTMLElement): Record<"x" | "y", number> {
    const { x, y } = node.getBoundingClientRect();

    return { x, y };
  }

  add(node: HTMLElement): void {
    const position = this.getPosition(node);
    const unit = new Unit(node, position);

    if (this.items.length === 0) {
      const column = new Column();
      column.add(unit);

      this.items = [column];

      return;
    }

    const fitIndex = this.items.findIndex((column) => {
      const { tail, head } = column;

      return position.x >= head && position.x <= tail;
    });

    if (fitIndex > -1) {
      this.items[fitIndex].add(unit);
      return;
    }

    const column = new Column();
    column.add(unit);

    // Add head
    if (unit.position.x < this.items[0].head) {
      this.items = [column, ...this.items];
      // Add tail
    } else if (unit.position.x > this.items[this.items.length - 1].tail) {
      this.items = [...this.items, column];
    }
  }
}

let navigationInstance: null | Navigation;

const initNavigation = (): Navigation => {
  if (navigationInstance) {
    return navigationInstance;
  }

  navigationInstance = new Navigation();

  return navigationInstance;
};

export { initNavigation };
