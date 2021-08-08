import { initNavigation } from "navigation";

import {
  FC,
  Children,
  createElement,
  isValidElement,
  useEffect,
  useRef,
  ReactElement,
} from "react";

const NavigationAnchor: FC = ({ children }) => {
  const ref = useRef<HTMLElement>();

  Children.only(children);

  useEffect(() => {
    const instance = initNavigation();

    if (ref.current) {
      const removeItem = instance.add(ref.current);

      return removeItem;
    }

    return () => null;
  }, []);

  return Children.map(children, (child) => {
    if (isValidElement(child)) {
      return createElement(child.type, { ...child.props, ref });
    }

    return child;
  }) as unknown as ReactElement;
};

export { NavigationAnchor };
