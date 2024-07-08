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
const AriaMenuButtonMenu: React.FC<
  AriaMenuButtonMenuProps & {
    forwardedRef?: React.ForwardedRef<HTMLDivElement>;
  }
> = ({ children, forwardedRef, ...props }) => {
  const menuManagerRef = useMenuManager();
  const [isOpen, setIsOpen] = React.useState(false);
  const [el, setEl] = React.useState<HTMLElement | null>(null);
  const listenerCleanupRef = React.useRef<() => void | undefined>();

  React.useEffect(() => {
    if (!el) {
      return;
    }
    const Manager = menuManagerRef.current;

    Manager.menu = {
      element: el,
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
  }, [menuManagerRef, el, setIsOpen, isOpen]);

  const attach = React.useCallback(
    (doc: Document) => {
      const Manager = menuManagerRef.current;
      const handleDown = (event: Event) => {
        const target = event.target;
        eventTargetIsNode(target);

        if (
          el.contains(target) ||
          Manager.button.element.contains(target) ||
          !Manager?.options?.closeOnBlur
        ) {
          return;
        }

        Manager?.closeMenu();
      };

      doc.addEventListener("pointerdown", handleDown, { passive: true });

      return () => {
        doc.addEventListener("pointerdown", handleDown, { passive: true });
      };
    },
    [el, menuManagerRef],
  );

  React.useEffect(() => {
    if (!el) {
      listenerCleanupRef.current && listenerCleanupRef.current();
      return;
    }
    const doc = el.ownerDocument;
    listenerCleanupRef.current = attach(doc);

    return listenerCleanupRef.current;
  }, [el, attach, listenerCleanupRef]);

  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      setEl(node);
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef, setEl],
  );

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
