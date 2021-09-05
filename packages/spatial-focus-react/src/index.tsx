import { initAreas, initEventListener } from "spatial-focus";

import React, {
  FC,
  Children,
  createElement,
  createContext,
  isValidElement,
  useEffect,
  useRef,
  ReactElement,
  // useContext,
  useState,
} from "react";

/**
 * Area
 */
const AreaProvider = createContext<{ parent?: HTMLElement }>({
  parent: undefined,
});

// const useAreaContext = () => useContext(AreaProvider);

const Area: FC = ({ children }) => {
  const [ref, setParent] = useState<HTMLElement>();

  Children.only(children);

  useEffect(() => {
    const areas = initAreas();

    if (ref) {
      const removeItem = areas.add(ref, "area");

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return removeItem;
    }

    return () => null;
  }, [ref]);

  return (
    <AreaProvider.Provider value={{ parent: ref }}>
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

/**
 * Anchor
 */
const Anchor: FC = ({ children }) => {
  type MaybeButton = HTMLElement & { disabled: boolean };
  const ref = useRef<MaybeButton>();
  // const { parent } = useAreaContext();

  Children.only(children);

  // useEffect(() => {
  //   const stack = initStack();

  //   if (ref.current && !ref.current.disabled) {
  //     const removeItem = stack.add(ref.current, parent);

  //     return removeItem;
  //   }

  //   return () => null;
  // }, [parent]);

  return Children.map(children, (child) => {
    if (isValidElement(child)) {
      return createElement(child.type, { ...child.props, ref });
    }

    return child;
  }) as unknown as ReactElement;
};

/**
 * Provider
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Provider: React.FC = ({ children }) => {
  useEffect(() => {
    const remove = initEventListener();

    return remove;
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return children;
};

export { Anchor, Area, Provider };
