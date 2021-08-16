type Position = Record<"x" | "y" | "width" | "height", number>;
type TailHead = Record<"x" | "y", number>;

export class Atom {
  position: Position;
  node: HTMLElement;

  constructor(node: HTMLElement, position: Position) {
    this.node = node;
    this.position = position;
  }
}

class Row {
  items: Atom[] = [];

  head: TailHead = { x: 0, y: 0 };
  tail: TailHead = { x: 0, y: 0 };

  findByIndex(index: number): Atom {
    const indexOrLast = Math.min(Math.max(index, 0), this.items.length - 1);

    return this.items[indexOrLast];
  }

  add(unit: Atom): void {
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
      return item.position.x >= this.head.x && item.position.x <= this.tail.x;
    });

    // Add head
    if (unit.position.x < this.items[0].position.x) {
      this.items = [unit, ...this.items];
      this.head = unit.position;

      // Add tail
    } else if (unit.position.x > this.items[this.items.length - 1].position.x) {
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
      }, [] as Atom[]);
    }
  }
}

export class Stack {
  private items: Row[] = [];
  private cacheItems: HTMLElement[] = [];

  private getPosition(node: HTMLElement): Position {
    const { x, y, width, height } = node.getBoundingClientRect();

    return { x, y, width, height };
  }

  private addToItems(node: HTMLElement) {
    const position = this.getPosition(node);
    const unit = new Atom(node, position);

    if (this.items.length === 0) {
      const row = new Row();
      row.add(unit);

      this.items = [row];

      return;
    }

    const fitIndex = this.items.findIndex((row) => {
      const { tail, head } = row;

      return unit.position.y >= head.y && unit.position.y <= tail.y;
    });

    if (fitIndex > -1) {
      this.items[fitIndex].add(unit);
      return;
    }

    const row = new Row();
    row.add(unit);

    // Add head
    if (unit.position.x < this.items[0].head.x) {
      this.items = [row, ...this.items];
      // Add tail
    } else if (unit.position.y > this.items[this.items.length - 1].tail.y) {
      this.items = [...this.items, row];
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

  findByIndex(x: number, y: number): Atom {
    const indexOrLast = Math.min(Math.max(y, 0), this.items.length - 1);
    const row = this.items[indexOrLast];

    return row.findByIndex(x);
  }

  findByNode(
    node?: Element | null
  ): { unit: Atom; indexX: number; indexY: number } | undefined {
    if (!node) return undefined;

    let unit: Atom | undefined;
    let indexX = -1;
    let indexY = -1;

    this.items.forEach((row, itemIndexY) => {
      row.items.forEach((item, itemIndexX) => {
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
    console.log(this.items, this.cacheItems);
  }
}
