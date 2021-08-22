type Position = Record<"x" | "y" | "width" | "height", number>;
type TailHead = Record<"x" | "y", number>;
type Size = Record<"x1" | "x2" | "y1" | "y2", number>;
export type UnitIndex = { unit: Unit; indexX: number; indexY: number };

export class Unit {
  position: Position;
  node: HTMLElement;

  constructor(node: HTMLElement, position: Position) {
    this.node = node;
    this.position = position;
  }
}

class Row {
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

  // TODO - improve it
  // private threshold = 10;

  private getPosition(node: HTMLElement): Position {
    const { x, y, width, height } = node.getBoundingClientRect();

    return { x, y, width, height };
  }

  private addToItems(node: HTMLElement) {
    const position = this.getPosition(node);
    const unit = new Unit(node, position);

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

  private createSize(unit: Unit): Size {
    return {
      x1: unit.position.x,
      x2: unit.position.x + unit.position.width,
      y1: unit.position.y,
      y2: unit.position.y + unit.position.height,
    };
  }

  private rowFindCloserUnit(row: Row, unit: Unit): Unit | undefined {
    let unitCandidate: undefined | Unit;

    for (const itemRow of row.items) {
      if (unitCandidate) {
        const candidateSize = this.createSize(unitCandidate);
        const unitSize = this.createSize(unit);
        const itemRowSize = this.createSize(itemRow);

        /**
         * As it never overlaps, it must be on the right of left
         */
        if (itemRowSize.x1 > unitSize.x1) {
          /**
           * Right
           */
          const diffCandidateToUnit = unitSize.x1 - candidateSize.x2;
          const diffItemRowToUnit = itemRowSize.x1 - unitSize.x2;

          if (diffItemRowToUnit < diffCandidateToUnit) {
            unitCandidate = itemRow;
          }
        } else {
          /**
           * Left
           */
          const diffCandidateToUnit = unitSize.x1 - candidateSize.x2;
          const diffItemRowToUnit = itemRowSize.x2 - unitSize.x1;

          if (diffItemRowToUnit < diffCandidateToUnit) {
            unitCandidate = itemRow;
          }
        }
      } else {
        unitCandidate = itemRow;
      }
    }

    return unitCandidate;
  }

  private unitsOverlapPosition(prevUnit: Unit, nextUnit: Unit): boolean {
    const prevSize = this.createSize(prevUnit);
    const nextSize = this.createSize(nextUnit);

    /**
     * [-- prevUnit --]
     * [-- nextUnit --]
     */
    const fitInTailHead =
      nextSize.x1 >= prevSize.x1 && nextSize.x2 <= prevSize.x2;

    /**
     *     [-- prevUnit --]
     * [-- nextUnit --]
     */
    const fitHead = prevSize.x1 >= nextSize.x1 && prevSize.x1 <= nextSize.x2;

    /**
     *  [-- prevUnit --]
     *            [-- nextUnit --]
     */
    const fitTail = prevSize.x2 >= nextSize.x1 && prevSize.x2 <= nextSize.x2;

    return fitInTailHead || fitHead || fitTail;
  }

  public findColumn(
    lookUp: UnitIndex,
    options: { prev: boolean }
  ): Unit | undefined {
    const unitSize = this.createSize(lookUp.unit);
    const { indexY } = lookUp;

    // last item
    if (indexY === this.items.length - 1 && !options.prev) return;

    // first item for reverse
    if (indexY === 0 && options.prev) return;

    let unitCandidate: undefined | Unit;

    const items = options.prev ? [...this.items].reverse() : this.items;
    for (const row of items) {
      const isSameRow = row.items.map((e) => e.node).includes(lookUp.unit.node);

      const onlyGreater = row.tail.y >= unitSize.y2;
      const onlySmaller = row.head.y <= unitSize.y2;
      const filterConstraint = options.prev ? onlySmaller : onlyGreater;

      if (!isSameRow && filterConstraint) {
        const fitsUnit = row.items.find((unitItem) =>
          this.unitsOverlapPosition(unitItem, lookUp.unit)
        );

        if (fitsUnit) {
          unitCandidate = fitsUnit;

          break;
        }
      }
    }

    if (unitCandidate) return unitCandidate;

    /**
     * still not found, so find closer one
     */
    if (options.prev) {
      let indexAttempt = indexY;

      while (!unitCandidate && indexAttempt > 0) {
        indexAttempt--;

        const closerUnit = this.rowFindCloserUnit(
          this.items[indexAttempt],
          lookUp.unit
        );

        if (closerUnit) {
          unitCandidate = closerUnit;
        }
      }
    } else {
      let indexAttempt = indexY;

      while (!unitCandidate && indexAttempt < this.items.length - 1) {
        indexAttempt++;

        const closerUnit = this.rowFindCloserUnit(
          this.items[indexAttempt],
          lookUp.unit
        );

        if (closerUnit) {
          unitCandidate = closerUnit;
        }
      }
    }

    return unitCandidate;
  }

  private log(): void {
    console.log(this.items, this.nodeList);
  }
}
