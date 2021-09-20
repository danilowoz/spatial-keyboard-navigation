/* eslint-disable @typescript-eslint/no-explicit-any */
import { initStack, initEventListener, UnitType } from "spatial-focus";

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

const Area: FC = ({ children }) => {
  const [ref, setParent] = useState<HTMLElement>();

  Children.only(children);

  useEffect(
    function registerArea() {
      if (!ref) return;

      return function unregisterArea() {
        const stack = initStack();

        stack.unregister(ref);
      };
    },
    [ref]
  );

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
  const { parent } = useContext(AreaProvider);

  Children.only(children);

  useEffect(
    function registerItem() {
      if (!ref) return;

      const stack = initStack();

      /**
       * If there is Area in the parent, but this is the
       * first time to interact with, register the area first
       *
       * !Important: the unregister must be in the area component
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
        }

        /**
         * Register the clickable without any area
         */
        const removeItem = stack.register(ref.current, UnitType.CLICKABLE);

        return removeItem;
      }

      return;
    },
    [parent]
  );

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
type NavigationContext = {
  node?: HTMLElement;
};

const useNavigationContext = (): NavigationContext => {
  const [navigationContext, setNavigationContext] = useState<NavigationContext>(
    {}
  );

  useEffect(function listerEvents() {
    const handler = (payload: CustomEvent<{ node: HTMLElement }>) => {
      setNavigationContext({ node: payload.detail.node });
    };

    window.addEventListener("spatial-focus-navigate", handler as any);

    return () => {
      window.removeEventListener("spatial-focus-navigate", handler as any);
    };
  });

  return navigationContext;
};

// @ts-ignore
const Provider: React.FC = ({ children }) => {
  useEffect(function initEventListenerEffect() {
    const remove = initEventListener();

    return remove;
  }, []);

  return children;
};

export { Anchor, Area, Provider, useNavigationContext };
