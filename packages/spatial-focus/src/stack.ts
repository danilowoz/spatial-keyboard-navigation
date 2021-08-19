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

  // private rowInTheSameColumn(row: Row, unit: Unit): boolean {
  //   const unitSize = this.createSize(unit);

  //   const isSameRow = row.items.map((e) => e.node).includes(unit.node);

  //   /**
  //    * [------ row ------] - row (tail & head)
  //    *   [-- unit --]
  //    */
  //   const fitInTailHead =
  //     unitSize.x1 >= row.head.x && unitSize.x2 <= row.tail.x;

  //   /**
  //    *     [------ row ------] (tail & head)
  //    * [-- unit --]
  //    */
  //   const fitHead = row.head.x >= unitSize.x1 && row.head.x <= unitSize.x2;

  //   /**
  //    *  [------ row ------] (tail & head)
  //    *            [-- unit --]
  //    */
  //   const fitTail = row.tail.x >= unitSize.x1 && row.tail.x <= unitSize.x2;

  //   return !isSameRow && (fitInTailHead || fitHead || fitTail);
  // }

  private unitsOverlapPosition(prevUnit: Unit, nextUnit: Unit): boolean {
    const prevSize = this.createSize(prevUnit);
    const nextSize = this.createSize(nextUnit);

    /**
     * [------ prevUnit ------]
     *   [-- nextUnit --]
     */
    const fitInTailHead =
      nextSize.x1 >= prevSize.x1 && nextSize.x2 <= prevSize.x2;

    /**
     *     [------ prevUnit ------]
     * [-- nextUnit --]
     */
    const fitHead = prevSize.x1 >= nextSize.x1 && prevSize.x1 <= nextSize.x2;

    /**
     *  [------ prevUnit ------]
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

    // debugger;

    // still not found, look for until satisfy
    if (options.prev) {
      let indexAttempt = indexY;
      while (!unitCandidate && indexAttempt > 0) {
        indexAttempt--;
        const attempt = this.items[indexAttempt];

        const fitsUnit = attempt.items.find((rowItem) =>
          this.unitsOverlapPosition(rowItem, lookUp.unit)
        );

        if (fitsUnit) {
          unitCandidate = fitsUnit;

          break;
        }
      }
    } else {
      let indexAttempt = indexY;
      while (!unitCandidate && indexAttempt < this.items.length - 1) {
        indexAttempt++;
        const attempt = this.items[indexAttempt];

        const fitsUnit = attempt.items.find((rowItem) =>
          this.unitsOverlapPosition(rowItem, lookUp.unit)
        );

        if (fitsUnit) {
          unitCandidate = fitsUnit;

          break;
        }
      }
    }

    console.log(unitCandidate);

    // still not found, get straight next or prev
    // if (!rowCandidate) {
    //   if (options.prev) {
    //     rowCandidate = this.items[indexY - 1];
    //   } else {
    //     rowCandidate = this.items[indexY + 1];
    //   }
    // }

    // for (const unit of rowCandidate.items) {
    //   const fits = this.unitsOverlapPosition(lookUp.unit, unit);

    //   if (fits) {
    //     unitCandidate = unit;
    //     break;
    //   }
    // }

    if (!unitCandidate) return undefined;
    // // TODO get closer

    return unitCandidate;
  }

  private log(): void {
    // console.log(this.items, this.nodeList);
  }
}
