type Position = Record<"x" | "y" | "width" | "height", number>;
type TailHead = Record<"x" | "y", number>;

export class Unit {
  position: Position;
  node: HTMLElement;

  constructor(node: HTMLElement, position: Position) {
    this.node = node;
    this.position = position;
  }
}

class Column {
  items: Unit[] = [];

  head: TailHead = { x: 0, y: 0 };
  tail: TailHead = { x: 0, y: 0 };

  findByIndex(index: number): Unit {
    const indexOrLast = Math.min(Math.max(index, 0), this.items.length - 1);

    return this.items[indexOrLast];
  }

  add(unit: Unit): void {
    if (this.items.length === 0) {
      this.items = [unit];

      this.head = unit.position;
      this.tail = {
        x: unit.position.x + unit.position.width,
        y: unit.position.y + unit.position.height,
      };

      return;
    }

    const fitIndex = this.items.findIndex((item) => {
      return item.position.y >= this.head.y && item.position.y <= this.tail.y;
    });

    // Add head
    if (unit.position.y < this.items[0].position.y) {
      this.items = [unit, ...this.items];
      this.head = unit.position;

      // Add tail
    } else if (unit.position.y > this.items[this.items.length - 1].position.y) {
      this.items = [...this.items, unit];
      this.tail = {
        x: unit.position.x + unit.position.width,
        y: unit.position.y + unit.position.height,
      };

      return;
    } else {
      // Add middle
      this.items = this.items.reduce((acc, curr, index) => {
        acc.push(curr);

        if (fitIndex === index) {
          acc.push(unit);
        }

        return acc;
      }, [] as Unit[]);
    }
  }
}

export class DataStructure {
  private items: Column[] = [];
  private cacheItems: HTMLElement[] = [];

  private getPosition(node: HTMLElement): Position {
    const { x, y, width, height } = node.getBoundingClientRect();

    return { x, y, width, height };
  }

  private addToItems(node: HTMLElement) {
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

      return unit.position.x >= head.x && unit.position.x <= tail.x;
    });

    if (fitIndex > -1) {
      this.items[fitIndex].add(unit);
      return;
    }

    const column = new Column();
    column.add(unit);

    // Add head
    if (unit.position.x < this.items[0].head.x) {
      this.items = [column, ...this.items];
      // Add tail
    } else if (unit.position.x > this.items[this.items.length - 1].tail.x) {
      this.items = [...this.items, column];
    }
  }

  public repositionAll(): void {
    this.items = [];

    this.cacheItems.forEach((node) => {
      this.addToItems(node);
    });

    this.log();
  }

  public add(node: HTMLElement): () => void {
    this.cacheItems.push(node);
    this.repositionAll();

    const removeItem = () => {
      this.cacheItems = this.cacheItems.filter(
        (cacheNode) => cacheNode !== node
      );
      this.repositionAll();
    };

    return removeItem;
  }

  findByIndex(x: number, y: number): Unit {
    const indexOrLast = Math.min(Math.max(x, 0), this.items.length - 1);
    const column = this.items[indexOrLast];

    return column.findByIndex(y);
  }

  findByNode(
    node?: Element | null
  ): { unit: Unit; indexX: number; indexY: number } | undefined {
    if (!node) return undefined;

    let unit: Unit | undefined;
    let indexX = -1;
    let indexY = -1;

    this.items.forEach((column, itemIndexX) => {
      column.items.forEach((item, itemIndexY) => {
        if (item.node === node) {
          unit = item;
          indexX = itemIndexX;
          indexY = itemIndexY;
        }
      });
    });

    if (!unit) return undefined;

    return { unit, indexX, indexY };
  }

  log(): void {
    // console.log(this.items, this.cacheItems);
  }
}
