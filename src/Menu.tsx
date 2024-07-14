import * as React from "react";
import { flushSync } from "react-dom";
import { useMenuManager } from "./hooks";
import { ValidElements } from "./types";

export interface MenuProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  children: React.ReactNode | ((props: { isOpen: boolean }) => React.ReactNode);
  tag?: Exclude<ValidElements, "button">;
}

function eventTargetIsNode(e: EventTarget | null): asserts e is Node {
  if (!e || !("nodeType" in e)) {
    throw new Error(`Node expected`);
  }
}
const AriaMenuButtonMenu: React.FC<
  MenuProps & {
    forwardedRef?: React.ForwardedRef<HTMLDivElement>;
  }
> = ({ children, forwardedRef, onKeyDown, tag: Tag = "div", ...props }) => {
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
          Manager?.button?.element.contains(target) ||
          !Manager?.options?.closeOnBlur
        ) {
          return;
        }

        Manager?.closeMenu();
      };

      doc.addEventListener("pointerdown", handleDown, { passive: true });

      return () => {
        doc.removeEventListener("pointerdown", handleDown);
      };
    },
    [el, menuManagerRef],
  );

  React.useEffect(() => {
    if (!el || isOpen === false) {
      listenerCleanupRef.current && listenerCleanupRef.current();
      return;
    }
    const doc = el.ownerDocument;
    listenerCleanupRef.current = attach(doc);
    return listenerCleanupRef.current;
  }, [el, attach, listenerCleanupRef, isOpen]);

  const setRef = React.useCallback(
    (node: HTMLDivElement) => {
      setEl(node);
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef, setEl],
  );

  return (
    <Tag
      role={isOpen ? "menu" : "presentation"}
      tabIndex={-1}
      // @ts-expect-error Complaining about HTML attributes and this isn't worth fixing correctly atm
      onBlur={(e) => {
        if (menuManagerRef.current?.options?.closeOnBlur) {
          menuManagerRef.current?.handleBlur();
        }
        if (props.onBlur) {
          props.onBlur(e);
        }
      }}
      onKeyDown={(e) => {
        menuManagerRef.current?.handleMenuKey(e);
        if (onKeyDown) {
          onKeyDown(e);
        }
      }}
      {...props}
      // @ts-expect-error Complaining about HTML attributes and this isn't worth fixing correctly atm
      ref={setRef}
    >
      {typeof children === "function"
        ? children({ isOpen: menuManagerRef.current.isOpen })
        : menuManagerRef.current.isOpen
          ? children
          : null}
    </Tag>
  );
};

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(
  ({ children, ...props }, ref) => {
    return (
      <AriaMenuButtonMenu forwardedRef={ref} {...props}>
        {children}
      </AriaMenuButtonMenu>
    );
  },
);
