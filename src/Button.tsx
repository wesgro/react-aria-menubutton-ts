import * as React from "react";
import { flushSync } from "react-dom";
import { useMenuManager } from "./hooks";
import { ValidElements } from "./types";
export interface ButtonProps<T extends HTMLElement>
  extends React.HTMLAttributes<T> {
  /**
   * If true, the element is disabled
   * (aria-disabled='true', not in tab order, clicking has no effect).
   */
  disabled?: boolean | undefined;

  tag?: ValidElements;
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
    forwardedRef?: React.ForwardedRef<HTMLButtonElement>;
  }
> = ({ children, forwardedRef, tag: Tag = "button", ...props }) => {
  const menuManager = useMenuManager();
  const innerRef = React.useRef<HTMLElement>();
  const [isOpen, setIsOpen] = React.useState(false);
  React.useEffect(() => {
    const managerRef = menuManager.current;
    if (innerRef.current) {
      managerRef.button = {
        element: innerRef.current,
        functions: {
          focus: () => {
            innerRef.current?.focus();
          },
          setState: (state) => {
            flushSync(() => {
              if (managerRef) {
                managerRef.isOpen = state.menuOpen;
                setIsOpen(state.menuOpen);
              }
            });
          },
        },
      };
    }
    return () => {
      managerRef.destroy();
    };
  }, [menuManager, setIsOpen, innerRef, isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (props.disabled) return;

    const Manager = menuManager.current;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          Manager.openMenu();
        } else {
          Manager.focusItem(0);
        }

        break;
      case "Enter":
      case " ":
        event.preventDefault();
        Manager.toggleMenu();
        break;
      case "Escape":
        if (Manager.handleMenuKey) {
          Manager.handleMenuKey(event);
        }
        break;
      default:
        // (Potential) letter keys
        Manager.handleButtonNonArrowKey(event);
    }
  };

  const handleClick = () => {
    if (props.disabled) return;
    menuManager.current.toggleMenu({}, { focusMenu: false });
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
    tabIndex: props.disabled ? -1 : 0,
    "aria-haspopup": true,
    "aria-expanded": isOpen,
    "aria-disabled": props.disabled,
    onKeyDown: handleKeyDown,
    onClick: handleClick,
    onBlur: (e) => {
      if (menuManager.current?.options?.closeOnBlur) {
        menuManager.current?.handleBlur();
      }
      if (props.onBlur) {
        props.onBlur(e);
      }
    },
    ref: setRef,
  };

  return (
    // @ts-expect-error This is complaining about props ending up on the wrong tag
    // but fixing it with types is more annoying than its worth
    <Tag role="button" {...props} {...buttonProps}>
      {children}
    </Tag>
  );
};

export const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps<HTMLElement>
>(({ children, ...props }, ref) => {
  return (
    <AriaMenuButtonButton forwardedRef={ref} {...props}>
      {children}
    </AriaMenuButtonButton>
  );
});
