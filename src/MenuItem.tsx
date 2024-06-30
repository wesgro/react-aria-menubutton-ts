/* eslint-disable react/display-name */
import * as React from "react";
import type { Manager } from "./types";
import ManagerContext from "./ManagerContext";

export interface MenuItemProps extends React.HTMLAttributes<HTMLDivElement>{
  children: React.ReactNode;
  text: string;
  value: string | number;
}

const AriaMenuButtonMenuItem: React.FC<
  MenuItemProps & {
    ambManager: React.RefObject<Manager>;
    forwardedRef?: React.ForwardedRef<HTMLDivElement>;
  }
> = ({ ambManager, children, forwardedRef, text, value, ...props }) => {
  const innerRef = React.useRef<HTMLDivElement>();

  React.useEffect(() => {
    if (innerRef.current) {
      ambManager.current?.addItem({
        node: innerRef.current,
        text: text,
      });
    }
  }, [ambManager, text]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if ((event.target as HTMLAnchorElement).href) return;
    event.preventDefault();
    selectItem(event);
  };

  const selectItem = (
    event:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.KeyboardEvent<HTMLDivElement>,
  ) => {
    // If there's no value, we'll send the child
    const selectedValue = typeof value !== "undefined" ? value : children;
    if (ambManager.current?.handleSelection) {
      ambManager.current.handleSelection(selectedValue, event);
    }
  };

  const setRef = (instance: HTMLDivElement) => {
    if (innerRef.current) {
      innerRef.current = instance;
      if (typeof forwardedRef === "function") {
        forwardedRef(instance);
      } else if (forwardedRef) {
        forwardedRef.current = instance;
      }
    }
  };

  const menuItemProps = {
    onClick: selectItem,
    onKeyDown: handleKeyDown,
    role: "menuitem",
    tabIndex: -1,
    ref: setRef,
  };

  return <div {...props} {...menuItemProps}>{children}</div>;
};

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  ({ children, ...props }, ref) => {
    const managerCtx = React.useContext(ManagerContext);
    if (!managerCtx || !managerCtx.managerRef) {
      throw new Error(
        "ManagerContext not found, `<Button/>` must be used inside of a `<Wrapper/>` component",
      );
    }

    return (
      <AriaMenuButtonMenuItem
        ambManager={managerCtx.managerRef}
        forwardedRef={ref}
        {...props}
      >
        {children}
      </AriaMenuButtonMenuItem>
    );
  },
);
