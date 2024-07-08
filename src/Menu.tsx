import * as React from "react";
import { flushSync } from "react-dom";
import { useMenuManager } from "./hooks";

export interface AriaMenuButtonMenuProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  children: React.ReactNode | ((props: { isOpen: boolean }) => React.ReactNode);
}

function eventTargetIsNode(e: EventTarget | null): asserts e is Node {
  if (!e || !("nodeType" in e)) {
    throw new Error(`Node expected`);
  }
}
const CLICK_OUTSIDE_EVENTS = ["click"] as const;
const AriaMenuButtonMenu: React.FC<
  AriaMenuButtonMenuProps & {
    forwardedRef?: React.ForwardedRef<HTMLDivElement>;
  }
> = ({ children, forwardedRef, ...props }) => {
  const menuManagerRef = useMenuManager();
  const innerRef = React.useRef<HTMLDivElement>();
  const [isOpen, setIsOpen] = React.useState(false);
  // setup clickoutside which will tell the manager to close the menu
  React.useEffect(() => {
    if (!innerRef.current) {
      return;
    }
    const el = innerRef.current;
    if (!el) return;
    const doc = el.ownerDocument;
    if (!doc) return;
    const Manager = menuManagerRef.current;
    const handleDown = (event: Event) => {
      const target = event.target;
      eventTargetIsNode(target);

      if (
        innerRef.current.contains(target) ||
        Manager.button.element.contains(target) ||
        !Manager?.options?.closeOnBlur
      ) {
        return;
      }

      Manager?.closeMenu();
    };
    const cleanup = () => {
      for (const event of CLICK_OUTSIDE_EVENTS) {
        doc.removeEventListener(event, handleDown);
      }
    };

    for (const event of CLICK_OUTSIDE_EVENTS) {
      doc.addEventListener(event, handleDown, { passive: true });
    }

    return cleanup;
  }, [innerRef, menuManagerRef]);

  React.useEffect(() => {
    if (!innerRef.current) {
      return;
    }
    const Manager = menuManagerRef.current;

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

    if (!isOpen) {
      // Clear the ambManager's items, so they
      // can be reloaded next time this menu opens
      Manager?.clearItems();
    }
  }, [menuManagerRef, innerRef, setIsOpen, isOpen]);

  const setRef = (node: HTMLDivElement) => {
    innerRef.current = node;
    if (typeof forwardedRef === "function") {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };

  const menuProps = {
    onKeyDown: menuManagerRef.current?.handleMenuKey,
    role: isOpen ? "menu" : "presentation",
    tabIndex: -1,
    onBlur: (e) => {
      if (menuManagerRef.current?.options?.closeOnBlur) {
        menuManagerRef.current?.handleBlur();
      }
      if (props.onBlur) {
        props.onBlur(e);
      }
    },
  };

  return (
    <div {...props} {...menuProps} ref={setRef}>
      {typeof children === "function"
        ? children({ isOpen: menuManagerRef.current?.isOpen ?? false })
        : menuManagerRef.current?.isOpen
          ? children
          : null}
    </div>
  );
};

export const Menu = React.forwardRef<HTMLDivElement, AriaMenuButtonMenuProps>(
  ({ children, ...props }, ref) => {
    return (
      <AriaMenuButtonMenu forwardedRef={ref} {...props}>
        {children}
      </AriaMenuButtonMenu>
    );
  },
);
