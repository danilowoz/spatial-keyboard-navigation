import {
  createBoundaries,
  getPosition,
  rowFindCloserUnit,
  unitsOverlap,
} from "./utils";

export type Position = Record<"x" | "y" | "width" | "height", number>;
export type UnitIndex = { unit: Unit; indexX: number; indexY: number };
export type Type = "area" | "item";

export class Unit {
  public children?: Stack;

  constructor(
    public node: HTMLElement,
    public position: Position,
    public type: Type,
    public parent?: Unit
  ) {
    this.node = node;
    this.position = position;
    this.type = type;
    this.parent = parent;

    if (type === "area") {
      this.children = new Stack();
    }
  }
}

export class Row {
  public units: Unit[] = [];

  public head: Record<"x" | "y", number> = { x: Infinity, y: Infinity };
  public tail: Record<"x" | "y", number> = { x: -Infinity, y: -Infinity };

  public findByIndex(index: number): Unit {
    const indexOrLast = Math.min(Math.max(index, 0), this.units.length - 1);

    return this.units[indexOrLast];
  }

  public add(unit: Unit): void {
    if (this.units.length === 0) {
      this.units = [unit];
    } else {
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
    }

    this.calculateBoundaries("x");
    this.calculateBoundaries("y");
  }

  private calculateBoundaries(direction: "x" | "y") {
    let lenMin = this.units.length;
    let lenMax = this.units.length;

    // Find min head
    while (lenMin--) {
      if (this.units[lenMin].position[direction] < this.head[direction]) {
        this.head[direction] = this.units[lenMin].position[direction];
      }
    }

    // Find max tail
    while (lenMax--) {
      const tail =
        this.units[lenMax].position[direction] +
        this.units[lenMax].position[direction === "x" ? "width" : "height"];

      if (tail > this.tail[direction]) {
        this.tail[direction] = tail;
      }
    }
  }
}

export class Stack {
  private rows: Row[] = [];
  private nodeList: Unit[] = [];

  private minHead = Infinity;
  private maxTail = -Infinity;

  private calculateBoundaries() {
    let lenMin = this.rows.length;
    let lenMax = this.rows.length;

    // Find min head
    while (lenMin--) {
      if (this.rows[lenMin].head.x < this.minHead) {
        this.minHead = this.rows[lenMin].head.x;
      }
    }

    // Find max tail
    while (lenMax--) {
      if (this.rows[lenMax].tail.x > this.maxTail) {
        this.maxTail = this.rows[lenMax].tail.x;
      }
    }
  }

  private addToRows(unit: Unit) {
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

  private sortNodeList(): void {
    this.nodeList.sort((a, b) => {
      if (a.position.height < b.position.height) {
        return 1;
      }
      if (a.position.height > b.position.height) {
        return -1;
      }

      return 0;
    });
  }

  private repositionAll(): void {
    this.rows = [];

    this.nodeList.forEach((unit) => {
      this.addToRows(unit);
    });

    this.calculateBoundaries();
    // this.debug();
  }

  public add(node: HTMLElement, type: Type, parentUnit?: Unit): () => void {
    const position = getPosition(node);
    const unit = new Unit(node, position, type, parentUnit);

    this.nodeList.push(unit);
    this.sortNodeList();
    this.repositionAll();

    return () => {
      this.nodeList = this.nodeList.filter(
        (cacheNode) => cacheNode.node !== node
      );
      this.sortNodeList();
      this.repositionAll();
    };
  }

  public findByIndex(x: number, y: number): Unit {
    const indexOrLast = Math.min(Math.max(y, 0), this.rows.length - 1);
    const row = this.rows[indexOrLast];

    return row?.findByIndex(x);
  }

  public findUnitByNode(
    node?: Element | null,
    rows: Row[] = this.rows
  ): UnitIndex | undefined {
    if (!node) return undefined;

    let payload: undefined | UnitIndex;

    for (let itemIndexY = 0; itemIndexY < rows.length; itemIndexY++) {
      const row = rows[itemIndexY];

      for (let itemIndexX = 0; itemIndexX < row.units.length; itemIndexX++) {
        const item = row.units[itemIndexX];

        if (item.node === node) {
          payload = {
            unit: item,
            indexX: itemIndexX,
            indexY: itemIndexY,
          };

          break;
        } else if (item.children) {
          const childrenUnit = this.findUnitByNode(node, item.children.rows);

          if (childrenUnit) {
            payload = childrenUnit;
          }
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
            ? itemBoundaries.x2 < unitBoundaries.x1
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

  public debug(): void {
    console.log(this.rows);
    const prevContainer = document.querySelector(".container-debug");

    if (prevContainer) {
      prevContainer.remove();
    }

    const body = document.querySelector("body");
    const container = document.createElement("div");

    container.className = "container-debug";
    container.style.position = "absolute";
    container.style.top = `0px`;
    container.style.left = `0px`;
    container.style.right = `0px`;
    container.style.bottom = `0px`;

    for (let index = 0; index < this.rows.length; index++) {
      const row = this.rows[index];

      const placeholder = document.createElement("div");
      placeholder.style.position = "absolute";
      placeholder.style.width = `${row.tail.x - row.head.x}px`;
      placeholder.style.height = `${row.tail.y - row.head.y}px`;
      placeholder.style.top = `${row.head.y}px`;
      placeholder.style.left = `${row.head.x}px`;

      placeholder.style.backgroundColor = `rgba(255,200,0,.1)`;
      placeholder.style.border = `1px solid rgba(255,200,0,.1)`;
      placeholder.textContent = `${index}`;

      container?.append(placeholder);
    }

    body?.append(container);
  }
}
