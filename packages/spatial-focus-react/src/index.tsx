import { initAreas, initEventListener, UnitType } from "spatial-focus";

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

/**
 * Area - collect the parent ref
 */
const AreaProvider = createContext<{ parent?: HTMLElement }>({
  parent: undefined,
});

const useAreaContext = () => useContext(AreaProvider);

const Area: FC = ({ children }) => {
  const [ref, setParent] = useState<HTMLElement>();

  Children.only(children);

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
 * Anchor - collect the children ref and its parent-are element
 * Also, it register the ref in the Stack
 */
const Anchor: FC = ({ children }) => {
  type MaybeButton = HTMLElement & { disabled: boolean };
  const ref = useRef<MaybeButton>();
  const { parent } = useAreaContext();

  Children.only(children);

  useEffect(() => {
    if (!ref) return;

    const stack = initAreas();

    /**
     * If there is Area in the parent, but this is the
     * first time to interact with, register the area first
     */
    if (parent && !stack.findByNode(parent)) {
      stack.register(parent, UnitType.AREA);
    }

    if (ref.current && !ref.current.disabled) {
      /**
       * Register the clickable in the area
       */
      if (parent) {
        const { unit: parentUnit } = stack.findByNode(parent)!;

        const removeItem = parentUnit.children?.register(
          ref.current,
          UnitType.CLICKABLE,
          parentUnit
        );

        return removeItem;
      } else {
        /**
         * Register the clickable without any area
         */
        const removeItem = stack.register(ref.current, UnitType.CLICKABLE);

        return removeItem;
      }
    }

    return;
  }, [parent]);

  return Children.map(children, (child) => {
    if (isValidElement(child)) {
      return createElement(child.type, { ...child.props, ref });
    }

    return child;
  }) as unknown as ReactElement;
};

/**
 * Provider - manage the listeners
 */
// @ts-ignore
const Provider: React.FC = ({ children }) => {
  useEffect(() => {
    const remove = initEventListener();

    return remove;
  });

  return children;
};

export { Anchor, Area, Provider };
