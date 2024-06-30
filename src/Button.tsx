import * as React from "react";

import ManagerContext from "./ManagerContext";

import type { Manager } from "./types";

export interface ButtonProps<T extends HTMLElement>
  extends React.HTMLAttributes<T> {
  /**
   * If true, the element is disabled
   * (aria-disabled='true', not in tab order, clicking has no effect).
   */
  disabled?: boolean | undefined;
}

/**
 * A React component to wrap the content of your
 * menu-button-pattern's button.
 * The `Button` component itself acts as a UI button (with tab-index, role, etc.),
 * so you probably do not want to pass an HTML `<button>` element as its child.
 * Each `Button` must be wrapped in a Wrapper, and each Wrapper can wrap only
 * one `Button`.
 */
const AriaMenuButtonButton: React.FC<
  ButtonProps<HTMLButtonElement> & {
    ambManager: React.RefObject<Manager>;
    forwardedRef?: React.ForwardedRef<HTMLButtonElement>;
  }
> = ({ ambManager, children, forwardedRef, ...props }) => {
  const innerRef = React.useRef<HTMLElement>();
  const [isOpen, setIsOpen] = React.useState(false);
  React.useEffect(() => {
    const managerRef = ambManager.current;
    if (innerRef.current) {
      managerRef.button = {
        element: innerRef.current,
        functions: {
          focus: () => {
            innerRef.current?.focus();
          },
          setState: (state) => {
            if (managerRef) {
              managerRef.isOpen = state.menuOpen;
              setIsOpen(state.menuOpen);
            }
          },
        },
      };
    }
    return () => {
      managerRef.button = null;
      managerRef.destroy();
    };
  }, [ambManager, setIsOpen, innerRef, isOpen]);

  const managerExists = !!ambManager.current;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (props.disabled) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          ambManager.current?.openMenu();
        } else {
          ambManager.current?.focusItem(0);
        }

        break;
      case "Enter":
      case " ":
        event.preventDefault();
        ambManager.current?.toggleMenu();
        break;
      case "Escape":
        if (ambManager.current?.handleMenuKey) {
          ambManager.current.handleMenuKey(event);
        }
        break;
      default:
        // (Potential) letter keys
        ambManager.current?.handleButtonNonArrowKey(event);
    }
  };

  const handleClick = () => {
    if (props.disabled) return;
    ambManager.current.toggleMenu({}, { focusMenu: false });
  };

  const setRef = (instance: HTMLButtonElement) => {
    innerRef.current = instance;
    if (typeof forwardedRef === "function") {
      forwardedRef(instance);
    } else if (forwardedRef) {
      forwardedRef.current = instance;
    }
  };

  const buttonProps = {
    role: "button",
    tabIndex: props.disabled ? -1 : 0,
    "aria-haspopup": true,
    "aria-expanded": isOpen,
    "aria-disabled": props.disabled,
    onKeyDown: handleKeyDown,
    onClick: handleClick,
    onBlur:
      managerExists && ambManager.current.options.closeOnBlur
        ? ambManager.current.handleBlur
        : undefined,
    ref: setRef,
  };

  return (
    <button {...props} {...buttonProps}>
      {children}
    </button>
  );
};

export const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps<HTMLElement>
>(({ children, ...props }, ref) => {
  const managerCtx = React.useContext(ManagerContext);
  if (!managerCtx || !managerCtx.managerRef) {
    throw new Error(
      "ManagerContext not found, `<Button/>` must be used inside of a `<Wrapper/>` component",
    );
  }

  return (
    <AriaMenuButtonButton
      ambManager={managerCtx.managerRef}
      forwardedRef={ref}
      {...props}
    >
      {children}
    </AriaMenuButtonButton>
  );
});
