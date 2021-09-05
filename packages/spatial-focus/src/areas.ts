class Areas {
  areas: HTMLElement[] = [];

  public add(node: HTMLElement): () => void {
    this.areas.push(node);

    return () => {
      this.areas = this.areas.filter((cacheNode) => cacheNode !== node);
    };
  }
}

export { Areas };
