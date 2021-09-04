import { initStack, initEventListener } from "spatial-focus";

import React, {
  FC,
  Children,
  createElement,
  createContext,
  isValidElement,
  useEffect,
  useRef,
  ReactElement,
  useContext,
  useState,
} from "react";

const useAreaContext = () => useContext(AreaProvider);

const Area: FC = ({ children }) => {
  const [parent, setParent] = useState<HTMLElement>();

  Children.only(children);

  return (
    <AreaProvider.Provider value={{ parent }}>
      {
        Children.map(children, (child) => {
          if (isValidElement(child)) {
            return createElement(child.type, {
              ...child.props,
              ref: setParent,
            });
          }

          return child;
        }) as unknown as ReactElement
      }
    </AreaProvider.Provider>
  );
};

const Anchor: FC = ({ children }) => {
  type MaybeButton = HTMLElement & { disabled: boolean };
  const ref = useRef<MaybeButton>();
  useAreaContext();

  Children.only(children);

  useEffect(() => {
    const stack = initStack();

    if (ref.current && !ref.current.disabled) {
      const removeItem = stack.add(ref.current);

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

const AreaProvider = createContext<{ parent?: HTMLElement }>({
  parent: undefined,
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Provider: React.FC = ({ children }) => {
  useEffect(() => {
    const remove = initEventListener();

    return remove;
  }, []);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return children;
};

export { Anchor, Area, Provider };
