import { Direction } from "./navigator";

type Step = {
  direction: Direction;
  node?: HTMLElement;
};

class History {
  private steps: Step[] = [];
  private limit = 10;

  public add(step: Step): void {
    this.steps.push(step);

    this.steps = this.steps.slice(
      Math.max(this.steps.length - this.limit, 0),
      this.steps.length
    );
  }

  public log(): void {
    console.log(this.steps);
  }

  public prev(): Step | undefined {
    return this.steps[this.steps.length - 1];
  }

  public pop(): void {
    this.steps.pop();
  }

  public clean(): void {
    this.steps = [];
  }
}

export { History };
