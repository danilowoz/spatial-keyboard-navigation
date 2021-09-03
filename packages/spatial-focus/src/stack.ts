import { createBoundaries, getPosition, unitsOverlapPosition } from "./utils";

export type Position = Record<"x" | "y" | "width" | "height", number>;
type TailHead = Record<"x" | "y", number>;

export type UnitIndex = { unit: Unit; indexX: number; indexY: number };

export class Unit {
  position: Position;
  node: HTMLElement;

  constructor(node: HTMLElement, position: Position) {
    this.node = node;
    this.position = position;
  }
}

export class Row {
  items: Unit[] = [];

  head: TailHead = { x: 0, y: 0 };
  tail: TailHead = { x: 0, y: 0 };

  public findByIndex(index: number): Unit {
    const indexOrLast = Math.min(Math.max(index, 0), this.items.length - 1);

    return this.items[indexOrLast];
  }

  public add(unit: Unit): void {
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
    this.head = { x: this.items[0].position.x, y: this.items[0].position.y };
    this.tail = {
      x: lastItem.position.x + lastItem.position.width,
      y: lastItem.position.y + lastItem.position.height,
    };
  }
}

export class Stack {
  private items: Row[] = [];
  private nodeList: HTMLElement[] = [];

  private minHead = Infinity;
  private maxTail = -Infinity;

  private calculateBoundaries() {
    let lenMin = this.items.length;
    let lenMix = this.items.length;

    // Find min head
    while (lenMin--) {
      if (this.items[lenMin].head.x < this.minHead) {
        this.minHead = this.items[lenMin].head.x;
      }
    }

    // Find max tail
    while (lenMix--) {
      if (this.items[lenMix].tail.x > this.maxTail) {
        this.maxTail = this.items[lenMix].tail.x;
      }
    }
  }

  private addToItems(node: HTMLElement) {
    const position = getPosition(node);
    const unit = new Unit(node, position);

    if (this.items.length === 0) {
      const row = new Row();
      row.add(unit);

      this.items = [row];

      return;
    }

    const fitIndex = this.items.findIndex((row) => {
      const { tail, head } = row;

      return (
        unit.position.y >= head.y &&
        unit.position.y + unit.position.height <= tail.y
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

  private repositionAll(): void {
    this.items = [];

    this.nodeList.forEach((node) => {
      this.addToItems(node);
    });

    this.calculateBoundaries();
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

  public findByIndex(x: number, y: number): Unit {
    const indexOrLast = Math.min(Math.max(y, 0), this.items.length - 1);
    const row = this.items[indexOrLast];

    return row.findByIndex(x);
  }

  public findUnitByNode(node?: Element | null): UnitIndex | undefined {
    if (!node) return undefined;

    let unit: Unit | undefined;
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

  public findColumn(
    lookUp: UnitIndex,
    options: { prev: boolean }
  ): Unit | undefined {
    // last item
    if (lookUp.indexY === this.items.length - 1 && !options.prev) return;

    // first item for reverse
    if (lookUp.indexY === 0 && options.prev) return;

    let unitCandidate: undefined | Unit;
    let indexAttempt = lookUp.indexY;

    while (
      !unitCandidate &&
      (options.prev ? indexAttempt >= 0 : indexAttempt < this.items.length - 1)
    ) {
      if (options.prev) {
        indexAttempt--;
      } else {
        indexAttempt++;
      }

      unitCandidate = this.items[indexAttempt].items.find((unitItem) =>
        unitsOverlapPosition(unitItem, lookUp.unit, "x")
      );
    }

    return unitCandidate;
  }

  public findRow(
    lookUp: UnitIndex,
    options: { prev: boolean }
  ): Unit | undefined {
    const unitBoundaries = createBoundaries(lookUp.unit);

    // First
    if (unitBoundaries.x1 === this.minHead && options.prev) return;

    // Last
    if (unitBoundaries.x2 === this.maxTail && !options.prev) return;

    // Same row
    const nextItemSameLine =
      this.items[lookUp.indexY].items[lookUp.indexX + (options.prev ? -1 : 1)];
    if (nextItemSameLine) {
      return nextItemSameLine;
    }

    let unitCandidate: undefined | Unit;

    const findInRow = (index: number) => {
      const items = options.prev
        ? [...this.items[index].items].reverse()
        : this.items[index].items;

      // return this.rowFindCloserUnit(this.items[index], lookUp.unit, "y");

      return items.find(
        (unitItem) =>
          unitsOverlapPosition(unitItem, lookUp.unit, "y") &&
          !unitsOverlapPosition(unitItem, lookUp.unit, "x")
      );
    };

    /**
     * Visit the closest rows, a previous and a next one, one at time
     * and then try to find a Unit that satisfy the conditional
     */
    let prevIndex = lookUp.indexY;
    let nextIndex = lookUp.indexY;

    while (
      !unitCandidate &&
      (prevIndex >= 0 || nextIndex < this.items.length - 1)
    ) {
      // Do prev
      if (prevIndex >= 0) {
        prevIndex--;

        unitCandidate = findInRow(prevIndex);
      }

      // Do next
      if (!unitCandidate && nextIndex < this.items.length - 1) {
        nextIndex++;

        unitCandidate = findInRow(prevIndex);
      }
    }

    return unitCandidate;
  }

  private log(): void {
    // console.log(this.items);
  }
}
