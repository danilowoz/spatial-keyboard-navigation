import {
  createBoundaries,
  getPosition,
  rowFindCloserUnit,
  unitsOverlap,
} from "./utils";

export type Position = Record<"x" | "y" | "width" | "height", number>;
export type ItemIndex = { unit: Unit; indexX: number; indexY: number };
export enum UnitType {
  AREA,
  CLICKABLE,
}

/**
 * Basic unit to the stack, which might be an area or an clickable item,
 * and it stores its node, parent node, children stack and position
 */
export class Unit {
  public children?: Stack;

  constructor(
    public node: HTMLElement,
    public position: Position,
    public type: UnitType,
    public parent?: Unit
  ) {
    this.node = node;
    this.position = position;
    this.type = type;
    this.parent = parent;

    if (type === UnitType.AREA) {
      this.children = new Stack();
    }
  }
}

/**
 * Collection of units and its boundaries values
 */
export class Row {
  public units: Unit[] = [];

  public head: Record<"x" | "y", number> = { x: Infinity, y: Infinity };
  public tail: Record<"x" | "y", number> = { x: -Infinity, y: -Infinity };

  /**
   * Returns an unit for a given position
   */
  public findByIndex(index: number): Unit | undefined {
    const indexOrLast = Math.min(Math.max(index, 0), this.units.length - 1);

    return this.units[indexOrLast];
  }

  /**
   * It adds a given unit in a new row or in an one that it fits
   */
  public add(unit: Unit): void {
    if (this.units.length === 0) {
      this.units = [unit];
    } else {
      /**
       * Add to a whatever index and then sort to ensure
       * that it's visually sorted, take only into account the X axis
       */
      this.units = [...this.units, unit].sort((a, b) => {
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

  /**
   * Calculate the rows boundaries, max and min of head and tail
   */
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

/**
 * Collection of rows
 * Also provides methods to manage the rows
 * and a way to navigate through the units row
 */
export class Stack {
  private rows: Row[] = [];
  private nodeList: Unit[] = [];

  private minHead = Infinity;
  private maxTail = -Infinity;

  /**
   * Calculate the rows boundaries - max and min of head and tail -
   * but only take into account the X axis (as the Y axis boundaries is index based)
   */
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

  /**
   * ## Add flow ##
   *
   * 1. Given a node and its type, create an Unit and then
   * add it to the node list, which will be iterate later.
   */
  public register(
    node: HTMLElement,
    type: UnitType,
    parentUnit?: Unit
  ): () => void {
    const position = getPosition(node);
    const unit = new Unit(node, position, type, parentUnit);

    // Add to the node list
    this.nodeList.push(unit);

    // Sort items by height
    this.sortNodeList();

    // Iterate node list and create the rows
    this.repositionAll();

    /**
     * Unregister node
     */
    return () => {
      this.nodeList = this.nodeList.filter(
        (cacheNode) => cacheNode.node !== node
      );
      this.sortNodeList();
      this.repositionAll();
    };
  }

  /**
   * ## Add flow ##
   *
   * 1.1 Ensure the highest items come first in the list
   * This is very important because these items will define
   * wether to create a new row or to be append to an existing one
   */
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

  /**
   * ## Add flow ##
   *
   * 2. Take the node list items and add each Unit to a proper row
   */
  private repositionAll(): void {
    this.rows = [];

    this.nodeList.forEach((unit) => {
      this.addToRow(unit);
    });

    this.calculateBoundaries();
    // this.debug();
  }

  /**
   * ## Add flow ##
   *
   * 3. Calculate where the given unit belongs to.
   * It might create a new row or append it to an existing one
   */
  private addToRow(unit: Unit) {
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

  /**
   * Find by index - returns an unit for a given position
   */
  public findByIndex(x: number, y: number): Unit | undefined {
    const indexOrLast = Math.min(Math.max(y, 0), this.rows.length - 1);
    const row = this.rows[indexOrLast];

    return row?.findByIndex(x);
  }

  /**
   * Find by node - look for an Unit recursively in the stack in its children stack
   */
  public findByNode(
    node?: Element | null,
    rows: Row[] = this.rows
  ): ItemIndex | undefined {
    if (!node) return undefined;

    let payload: undefined | ItemIndex;

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
          const childrenUnit = this.findByNode(node, item.children.rows);

          if (childrenUnit) {
            payload = childrenUnit;
          }
        }
      }
    }

    return payload;
  }

  /**
   * Find column - find the prev or next Unit on the Y axis
   */
  public findColumn(
    baseUnit: ItemIndex,
    options: { prev: boolean }
  ): Unit | undefined {
    // Last item
    if (baseUnit.indexY === this.rows.length - 1 && !options.prev) return;

    // First item for prev navigation
    if (baseUnit.indexY === 0 && options.prev) return;

    let unitCandidate: undefined | Unit;
    let indexAttempt = baseUnit.indexY;

    /**
     * Walk through all items until it satisfies predicate to find an Unit
     *
     * Starts from the current based unit and continue looking for the next item
     * index by index until overlaps the based-unit and the candidate-unit boundaries
     */
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
        unitsOverlap(unitItem, baseUnit.unit, "x")
      );
    }

    return unitCandidate;
  }

  /**
   * Find row - find the prev or next Unit on the X axis
   */
  public findRow(
    basedUnit: ItemIndex,
    options: { prev: boolean }
  ): Unit | undefined {
    const unitBoundaries = createBoundaries(basedUnit.unit);

    // First
    if (unitBoundaries.x1 === this.minHead && options.prev) return;

    // Last
    if (unitBoundaries.x2 === this.maxTail && !options.prev) return;

    /**
     * Try first to find a unit in the same row,
     * which can be the closest item from the based unit
     */
    const nextItemSameLine =
      this.rows[basedUnit.indexY].units[
        basedUnit.indexX + (options.prev ? -1 : 1)
      ];
    if (nextItemSameLine) {
      return nextItemSameLine;
    }

    let unitCandidate: undefined | Unit;

    /**
     * Visit the closest rows (the previous and a next one, once at time)
     * and then try to find a Unit that satisfy the conditional
     */
    let prevIndex = basedUnit.indexY;
    let nextIndex = basedUnit.indexY;

    while (
      !unitCandidate &&
      (prevIndex > 0 || nextIndex < this.rows.length - 1)
    ) {
      /**
       * Given an index, get the row and try to find the
       * closest Unit in the row from the based-unit boundaries
       */
      const findInRow = (index: number) => {
        const items = options.prev
          ? [...this.rows[index].units].reverse()
          : this.rows[index].units;

        return items.find((unitItem) => {
          const itemBoundaries = createBoundaries(unitItem);

          /**
           * Only item in the left or in the right,
           * depending on the direction
           */
          const constraint = options.prev
            ? itemBoundaries.x2 < unitBoundaries.x1
            : itemBoundaries.x1 > unitBoundaries.x2;

          /**
           * 1. Only higher or lower items
           * 2. Overlap in the Y axios - as this is a row
           */
          return constraint && unitsOverlap(unitItem, basedUnit.unit, "y");
        });
      };

      // Visit prev row
      if (prevIndex > 0) {
        prevIndex--;

        unitCandidate = findInRow(prevIndex);
      }

      // Visit next row
      if (nextIndex < this.rows.length - 1) {
        nextIndex++;

        const nextCandidate = findInRow(nextIndex);

        if (nextCandidate && unitCandidate) {
          /**
           * As it found Units in the prev and next row
           * it needs to find which one is the closest unit from based-unit
           */
          unitCandidate = rowFindCloserUnit(
            [nextCandidate, unitCandidate],
            basedUnit.unit,
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
