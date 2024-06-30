import * as React from "react";

import createTapListener from "teeny-tap";
import type { Manager } from "./types";
import ManagerContext from "./ManagerContext";

export interface AriaMenuButtonMenuProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  children: React.ReactNode | ((props: { isOpen: boolean }) => React.ReactNode);
}

const AriaMenuButtonMenu: React.FC<
  AriaMenuButtonMenuProps & {
    ambManager: React.RefObject<Manager>;
    forwardedRef?: React.ForwardedRef<HTMLDivElement>;
  }
> = ({ ambManager, children, forwardedRef, ...props }) => {
  const innerRef = React.useRef<HTMLDivElement>();
  const tapListenerRef = React.useRef<ReturnType<typeof createTapListener>>();
  const [isOpen, setIsOpen] = React.useState(false);

  const addTapListener = React.useCallback(() => {
    const handleTap = (event: Event) => {
      if (innerRef.current?.contains(event.target as Node)) return;
      if (ambManager.current?.button?.element.contains(event.target as Node))
        return;
      ambManager.current?.closeMenu();
    };
    const el = innerRef.current;
    if (!el) return;
    const doc = el.ownerDocument;
    if (!doc) return;
    tapListenerRef.current = createTapListener(doc.documentElement, handleTap);
  }, [innerRef, tapListenerRef, ambManager]);

  React.useEffect(() => {
    const managerRef = ambManager.current;
    if (innerRef.current) {
      managerRef.menu = {
        element: innerRef.current,
        functions: {
          setState: (state) => {
            if (ambManager.current) {
              ambManager.current.isOpen = state.isOpen;
              setIsOpen(state.isOpen);
            }
          },
        },
      };
      if (!managerRef?.options?.closeOnBlur) return;
      if (isOpen && !tapListenerRef.current) {
        addTapListener();
      } else if (!isOpen && tapListenerRef.current) {
        tapListenerRef.current.remove();
      }

      if (!isOpen) {
        // Clear the ambManager's items, so they
        // can be reloaded next time this menu opens
        ambManager.current?.clearItems();
      }
    }
    return () => {
      if (tapListenerRef.current) tapListenerRef.current.remove();
      managerRef.menu = null;
      managerRef.destroy();
    };
  }, [ambManager, innerRef, setIsOpen, addTapListener, isOpen]);

  React.useEffect(() => {
    addTapListener();
    return () => {
      tapListenerRef.current?.remove();
    };
  }, [tapListenerRef, addTapListener]);

  const setRef = (instance: HTMLDivElement) => {
    innerRef.current = instance;
    if (typeof forwardedRef === "function") {
      forwardedRef(instance);
    } else if (forwardedRef) {
      forwardedRef.current = instance;
    }
  };

  const menuProps = {
    onKeyDown: ambManager.current?.handleMenuKey,
    role: "menu",
    tabIndex: -1,
    onBlur: ambManager.current?.handleBlur,
  };

  return (
    <div {...props} {...menuProps} ref={setRef}>
      {typeof children === "function"
        ? children({ isOpen: ambManager.current?.isOpen ?? false })
        : ambManager.current?.isOpen
          ? children
          : null}
    </div>
  );
};

export const Menu = React.forwardRef<HTMLDivElement, AriaMenuButtonMenuProps>(
  ({ children, ...props }, ref) => {
    const managerCtx = React.useContext(ManagerContext);
    if (!managerCtx || !managerCtx.managerRef) {
      throw new Error(
        "ManagerContext not found, `<Button/>` must be used inside of a `<Wrapper/>` component",
      );
    }

    return (
      <AriaMenuButtonMenu
        ambManager={managerCtx.managerRef}
        forwardedRef={ref}
        {...props}
      >
        {children}
      </AriaMenuButtonMenu>
    );
  },
);
