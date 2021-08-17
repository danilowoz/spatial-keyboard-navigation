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

    const newItems = [...this.items, unit];
    this.items = newItems.sort((a, b) => {
      const sizeA = a.position.x + a.position.width;
      const sizeB = b.position.x + b.position.width;

      if (sizeA < sizeB) {
        return -1;
      }

      if (sizeA > sizeB) {
        return 1;
      }

      return 0;
    });

    const lastItem = this.items[this.items.length - 1];
    this.head = this.items[0].position;
    this.tail = {
      x: lastItem.position.x + lastItem.position.width,
      y: lastItem.position.y + lastItem.position.height,
    };
  }
}

export class Stack {
  private items: Row[] = [];
  private nodeList: HTMLElement[] = [];
  private threshold = 10;

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

      return (
        unit.position.y + this.threshold >= head.y &&
        unit.position.y + this.threshold <= tail.y
      );
    });

    if (fitIndex > -1) {
      this.items[fitIndex].add(unit);
      return;
    }

    const row = new Row();
    row.add(unit);

    const newItems = [...this.items, row];
    this.items = newItems.sort((a, b) => {
      if (a.head.y < b.head.y) {
        return -1;
      }
      if (a.head.y > b.head.y) {
        return 1;
      }

      return 0;
    });
  }

  public repositionAll(): void {
    this.items = [];

    this.nodeList.forEach((node) => {
      this.addToItems(node);
    });

    this.log();
  }

  public add(node: HTMLElement): () => void {
    this.nodeList.push(node);
    this.repositionAll();

    const removeItem = () => {
      this.nodeList = this.nodeList.filter((cacheNode) => cacheNode !== node);
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
    console.log(this.items, this.nodeList);
  }
}