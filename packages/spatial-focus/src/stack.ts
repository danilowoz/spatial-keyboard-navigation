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

  // TODO - Turn an util
  private createSize(unit: Unit): Size {
    return {
      x1: unit.position.x,
      x2: unit.position.x + unit.position.width,
      y1: unit.position.y,
      y2: unit.position.y + unit.position.height,
    };
  }

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

  // TODO - Turn an util
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

  // TODO - Turn an util
  private rowFindCloserUnit(
    row: Row,
    unit: Unit,
    direction: "x" | "y"
  ): Unit | undefined {
    let unitCandidate: undefined | Unit;

    const invertDirection = direction === "x" ? "y" : "x";
    const position1 = `${invertDirection}1` as keyof Size;
    const position2 = `${invertDirection}2` as keyof Size;

    const unitSize = this.createSize(unit);

    for (const itemRow of row.items) {
      if (itemRow === unit) return;

      if (unitCandidate) {
        const candidateSize = this.createSize(unitCandidate);
        const itemRowSize = this.createSize(itemRow);

        if (itemRowSize[position1] > unitSize[position1]) {
          /**
           * Right / Bottom
           */
          const diffCandidateToUnit =
            unitSize[position1] - candidateSize[position2];
          const diffItemRowToUnit =
            itemRowSize[position1] - unitSize[position2];

          if (diffItemRowToUnit < diffCandidateToUnit) {
            unitCandidate = itemRow;
          }
        } else {
          /**
           * Left / Top
           */
          const diffCandidateToUnit =
            unitSize[position1] - candidateSize[position2];
          const diffItemRowToUnit =
            itemRowSize[position2] - unitSize[position1];

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

  // TODO - Turn an util
  private unitsOverlapPosition(
    prevUnit: Unit,
    nextUnit: Unit,
    direction: "x" | "y"
  ): boolean {
    if (prevUnit === nextUnit) return false;

    const prevSize = this.createSize(prevUnit);
    const nextSize = this.createSize(nextUnit);

    const position1 = `${direction}1` as keyof Size;
    const position2 = `${direction}2` as keyof Size;

    /**
     * [-- prevUnit --]
     * [-- nextUnit --]
     */
    const fitInTailHead =
      nextSize[position1] >= prevSize[position1] &&
      nextSize[position2] <= prevSize[position2];

    /**
     *     [-- prevUnit --]
     * [-- nextUnit --]
     */
    const fitHead =
      prevSize[position1] >= nextSize[position1] &&
      prevSize[position1] <= nextSize[position2];

    /**
     *  [-- prevUnit --]
     *            [-- nextUnit --]
     */
    const fitTail =
      prevSize[position2] >= nextSize[position1] &&
      prevSize[position2] <= nextSize[position2];

    return fitInTailHead || fitHead || fitTail;
  }

  public findColumn(
    lookUp: UnitIndex,
    options: { prev: boolean }
  ): Unit | undefined {
    const unitSize = this.createSize(lookUp.unit);

    // last item
    if (lookUp.indexY === this.items.length - 1 && !options.prev) return;

    // first item for reverse
    if (lookUp.indexY === 0 && options.prev) return;

    let unitCandidate: undefined | Unit;
    const items = options.prev ? [...this.items].reverse() : this.items;
    for (const row of items) {
      const isSameRow = row.items.map((e) => e.node).includes(lookUp.unit.node);

      const onlyGreater = row.tail.y > unitSize.y2;
      const onlySmaller = row.head.y < unitSize.y2;
      const filterConstraint = options.prev ? onlySmaller : onlyGreater;

      if (!isSameRow && filterConstraint) {
        const fitsUnit = row.items.find((unitItem) =>
          this.unitsOverlapPosition(unitItem, lookUp.unit, "x")
        );

        if (fitsUnit) {
          unitCandidate = fitsUnit;

          break;
        }
      }
    }

    if (unitCandidate) return unitCandidate;

    /**
     * still not found, so find the closest one
     */
    if (options.prev) {
      let indexAttempt = lookUp.indexY;

      while (!unitCandidate && indexAttempt > 0) {
        indexAttempt--;

        const closerUnit = this.rowFindCloserUnit(
          this.items[indexAttempt],
          lookUp.unit,
          "y"
        );

        if (closerUnit) {
          unitCandidate = closerUnit;
        }
      }
    } else {
      let indexAttempt = lookUp.indexY;

      while (!unitCandidate && indexAttempt < this.items.length - 1) {
        indexAttempt++;

        const closerUnit = this.rowFindCloserUnit(
          this.items[indexAttempt],
          lookUp.unit,
          "y"
        );

        if (closerUnit) {
          unitCandidate = closerUnit;
        }
      }
    }

    return unitCandidate;
  }

  public findRow(
    lookUp: UnitIndex,
    options: { prev: boolean }
  ): Unit | undefined {
    const unitSize = this.createSize(lookUp.unit);

    // First
    if (unitSize.x1 === this.minHead && options.prev) return;

    // Last
    if (unitSize.x2 === this.maxTail && !options.prev) return;

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
          this.unitsOverlapPosition(unitItem, lookUp.unit, "y") &&
          !this.unitsOverlapPosition(unitItem, lookUp.unit, "x")
      );
    };

    /**
     * Visit the closest rows, a previous one and a next, one at time
     * and then try to find a Unit that satisfy the conditional
     */
    let prevIndex = lookUp.indexY;
    let nextIndex = lookUp.indexY;

    while (
      !unitCandidate &&
      (prevIndex > 0 || nextIndex < this.items.length - 1)
    ) {
      // Do prev
      if (prevIndex > 0) {
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
