class Navigation {
  add(node: HTMLElement): void {
    console.log("foo");
    console.log(node);
  }
}

let navigationInstance: null | Navigation;

const initNavigation = (): Navigation => {
  if (navigationInstance) {
    return navigationInstance;
  }

  navigationInstance = new Navigation();

  return navigationInstance;
};

export { initNavigation };
