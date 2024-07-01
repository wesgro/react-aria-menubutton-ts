import * as React from "react";
import { flushSync } from "react-dom";
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

  React.useEffect(() => {
    if (!innerRef.current) {
      return;
    }
    const Manager = ambManager.current;
    const tapListener = tapListenerRef.current;
    const addTapListener = () => {
      const handleTap = (event: Event) => {
        if (innerRef.current?.contains(event.target as Node)) return;
        if (Manager?.button?.element.contains(event.target as Node)) return;
        Manager?.closeMenu();
      };
      const el = innerRef.current;
      if (!el) return;
      const doc = el.ownerDocument;
      if (!doc) return;
      tapListenerRef.current = createTapListener(
        doc.documentElement,
        handleTap,
      );
    };

    Manager.menu = {
      element: innerRef.current,
      functions: {
        setState: (state) => {
          flushSync(() => {
            if (Manager) {
              Manager.isOpen = state.isOpen;
              setIsOpen(state.isOpen);
            }
          });
        },
      },
    };
    if (!Manager?.options?.closeOnBlur) return;
    if (isOpen && !tapListener) {
      addTapListener();
    } else if (!isOpen && tapListener) {
      tapListener.remove();
    }

    if (!isOpen) {
      // Clear the ambManager's items, so they
      // can be reloaded next time this menu opens
      Manager?.clearItems();
    }

    return () => {
      if (tapListener) tapListener.remove();
    };
  }, [ambManager, innerRef, setIsOpen, isOpen]);

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
    role: isOpen ? "menu" : "presentation",
    tabIndex: -1,
    onBlur: (e) => {
      if (ambManager.current?.options?.closeOnBlur) {
        ambManager.current?.handleBlur();
      }
      if (props.onBlur) {
        props.onBlur(e);
      }
    },
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
