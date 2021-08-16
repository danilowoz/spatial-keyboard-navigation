import { initStack, initEventListener } from "navigation";

import {
  FC,
  Children,
  createElement,
  isValidElement,
  useEffect,
  useRef,
  ReactElement,
} from "react";
import React = require("react");

const NavigationAnchor: FC = ({ children }) => {
  type MaybeButton = HTMLElement & { disabled: boolean };
  const ref = useRef<MaybeButton>();

  Children.only(children);

  useEffect(() => {
    const stack = initStack();

    if (ref.current && !ref.current.disabled) {
      const removeItem = stack.add(ref.current);

      return () => {
        removeItem();
      };
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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const NavigationProvider: React.FC = ({ children }) => {
  useEffect(() => {
    const remove = initEventListener();

    return () => {
      remove();
    };
  }, []);

  return children;
};

export { NavigationAnchor, NavigationProvider };
