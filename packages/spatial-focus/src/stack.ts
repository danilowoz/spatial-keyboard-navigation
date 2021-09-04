import {
  createBoundaries,
  getPosition,
  rowFindCloserUnit,
  unitsOverlap,
} from "./utils";

export type Position = Record<"x" | "y" | "width" | "height", number>;
export type UnitIndex = { unit: Unit; indexX: number; indexY: number };

export class Unit {
  constructor(public node: HTMLElement, public position: Position) {
    this.node = node;
    this.position = position;
  }
}

export class Row {
  public units: Unit[] = [];

  public head: Record<"x" | "y", number> = { x: 0, y: 0 };
  public tail: Record<"x" | "y", number> = { x: 0, y: 0 };

  public findByIndex(index: number): Unit {
    const indexOrLast = Math.min(Math.max(index, 0), this.units.length - 1);

    return this.units[indexOrLast];
  }

  public add(unit: Unit): void {
    if (this.units.length === 0) {
      this.units = [unit];

      const boundaries = createBoundaries(unit);

      this.head = { x: boundaries.x1, y: boundaries.y1 };
      this.tail = { x: boundaries.x2, y: boundaries.y2 };

      return;
    }

    const newItems = [...this.units, unit];
    this.units = newItems.sort((a, b) => {
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

    const lastItem = this.units[this.units.length - 1];
    const firstItemBoundaries = createBoundaries(this.units[0]);
    const lastItemBoundaries = createBoundaries(lastItem);

    this.head = { x: firstItemBoundaries.x1, y: firstItemBoundaries.y1 };
    this.tail = { x: lastItemBoundaries.x2, y: lastItemBoundaries.y2 };
  }
}

export class Stack {
  private rows: Row[] = [];
  private nodeList: HTMLElement[] = [];

  private minHead = Infinity;
  private maxTail = -Infinity;

  private calculateBoundaries() {
    let lenMin = this.rows.length;
    let lenMix = this.rows.length;

    // Find min head
    while (lenMin--) {
      if (this.rows[lenMin].head.x < this.minHead) {
        this.minHead = this.rows[lenMin].head.x;
      }
    }

    // Find max tail
    while (lenMix--) {
      if (this.rows[lenMix].tail.x > this.maxTail) {
        this.maxTail = this.rows[lenMix].tail.x;
      }
    }
  }

  private addToRows(node: HTMLElement) {
    const position = getPosition(node);
    const unit = new Unit(node, position);

    if (this.rows.length === 0) {
      const row = new Row();
      row.add(unit);

      this.rows = [row];

      return;
    }

    const fitIndex = this.rows.findIndex((row) => {
      const { tail, head } = row;

      return (
        unit.position.y >= head.y &&
        unit.position.y + unit.position.height <= tail.y
      );
    });

    if (fitIndex > -1) {
      this.rows[fitIndex].add(unit);
      return;
    }

    const row = new Row();
    row.add(unit);

    const newItems = [...this.rows, row];
    this.rows = newItems.sort((a, b) => {
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
    this.rows = [];

    this.nodeList.forEach((node) => {
      this.addToRows(node);
    });

    this.calculateBoundaries();
    this.log();
  }

  public add(node: HTMLElement): () => void {
    this.nodeList.push(node);
    this.repositionAll();

    return () => {
      this.nodeList = this.nodeList.filter((cacheNode) => cacheNode !== node);
      this.repositionAll();
    };
  }

  public findByIndex(x: number, y: number): Unit {
    const indexOrLast = Math.min(Math.max(y, 0), this.rows.length - 1);
    const row = this.rows[indexOrLast];

    return row.findByIndex(x);
  }

  public findUnitByNode(node?: Element | null): UnitIndex | undefined {
    if (!node) return undefined;

    let payload: undefined | UnitIndex;

    for (let itemIndexY = 0; itemIndexY < this.rows.length; itemIndexY++) {
      const row = this.rows[itemIndexY];

      for (let itemIndexX = 0; itemIndexX < row.units.length; itemIndexX++) {
        const item = row.units[itemIndexX];

        if (item.node === node) {
          payload = {
            unit: item,
            indexX: itemIndexX,
            indexY: itemIndexY,
          };

          break;
        }
      }
    }

    return payload;
  }

  public findColumn(
    lookUp: UnitIndex,
    options: { prev: boolean }
  ): Unit | undefined {
    // last item
    if (lookUp.indexY === this.rows.length - 1 && !options.prev) return;

    // first item for reverse
    if (lookUp.indexY === 0 && options.prev) return;

    let unitCandidate: undefined | Unit;
    let indexAttempt = lookUp.indexY;

    while (
      !unitCandidate &&
      (options.prev ? indexAttempt > 0 : indexAttempt < this.rows.length - 1)
    ) {
      if (options.prev) {
        indexAttempt--;
      } else {
        indexAttempt++;
      }

      unitCandidate = this.rows[indexAttempt].units.find((unitItem) =>
        unitsOverlap(unitItem, lookUp.unit, "x")
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
      this.rows[lookUp.indexY].units[lookUp.indexX + (options.prev ? -1 : 1)];
    if (nextItemSameLine) {
      return nextItemSameLine;
    }

    let unitCandidate: undefined | Unit;

    /**
     * Visit the closest rows, a previous and a next one, one at time
     * and then try to find a Unit that satisfy the conditional
     */
    let prevIndex = lookUp.indexY;
    let nextIndex = lookUp.indexY;

    while (
      !unitCandidate &&
      (prevIndex > 0 || nextIndex < this.rows.length - 1)
    ) {
      const findInRow = (index: number) => {
        const items = options.prev
          ? [...this.rows[index].units].reverse()
          : this.rows[index].units;

        return items.find((unitItem) => {
          const itemBoundaries = createBoundaries(unitItem);

          const constraint = options.prev
            ? itemBoundaries.x1 < unitBoundaries.x2
            : itemBoundaries.x1 > unitBoundaries.x2;

          return (
            constraint &&
            unitsOverlap(unitItem, lookUp.unit, "y") &&
            !unitsOverlap(unitItem, lookUp.unit, "x")
          );
        });
      };

      // Do prev
      if (prevIndex > 0) {
        prevIndex--;

        unitCandidate = findInRow(prevIndex);
      }

      // Do next
      if (nextIndex < this.rows.length - 1) {
        nextIndex++;

        const nextCandidate = findInRow(nextIndex);

        if (nextCandidate && unitCandidate) {
          // Compare which one is the closest one
          unitCandidate = rowFindCloserUnit(
            [nextCandidate, unitCandidate],
            lookUp.unit,
            "x"
          );
        } else if (!unitCandidate) {
          unitCandidate = nextCandidate;
        }
      }
    }

    return unitCandidate;
  }

  private log(): void {
    console.log(this.rows.length, this.nodeList.length);
  }
}
