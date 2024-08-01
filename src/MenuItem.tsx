/* eslint-disable react/display-name */
import * as React from "react";
import { ValidElements } from "./types";
import { useMenuManager } from "./hooks";

export interface MenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  text?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  tag?: Exclude<ValidElements, "button">;
}

const AriaMenuButtonMenuItem: React.FC<
  MenuItemProps & {
    forwardedRef?: React.ForwardedRef<HTMLDivElement>;
  }
> = ({
  children,
  forwardedRef,
  text,
  value,
  tag: Tag = "div",
  onKeyDown,
  onClick,
  ...props
}) => {
  const innerRef = React.useRef<HTMLDivElement>();
  const menuManagerRef = useMenuManager();
  React.useEffect(() => {
    if (!innerRef.current) {
      return;
    }
    const el = innerRef.current;
    const manager = menuManagerRef.current;
    manager.addItem({
      node: el,
      text: text,
    });

    return () => {
      manager.removeItem(el);
    };
  }, [menuManagerRef, text, innerRef]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (onKeyDown) {
      onKeyDown(event);
    }
    if (event.key !== "Enter" && event.key !== " ") return;
    if ((event.target as HTMLAnchorElement).href) return;
    event.preventDefault();
    // If there's no value, we'll send the child
    const selectedValue = typeof value !== "undefined" ? value : children;

    if (menuManagerRef.current?.handleSelection) {
      menuManagerRef.current.handleSelection(selectedValue, event);
    }
  };

  const selectItem = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // If there's no value, we'll send the child
    const selectedValue = typeof value !== "undefined" ? value : children;

    if (menuManagerRef.current?.handleSelection) {
      menuManagerRef.current.handleSelection(selectedValue, event);
    }
    if (onClick) {
      onClick(event);
    }
  };

  const setRef = (node: HTMLDivElement) => {
    innerRef.current = node;
    if (typeof forwardedRef === "function") {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };

  const menuItemProps = {
    onClick: selectItem,
    onKeyDown: handleKeyDown,
    role: "menuitem",
    tabIndex: -1,
    ref: setRef,
  };

  return (
    // @ts-expect-error Complaining about HTML attributes and this isn't worth fixing correctly atm
    <Tag {...menuItemProps} {...props}>
      {children}
    </Tag>
  );
};

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  ({ children, ...props }, ref) => {
    return (
      <AriaMenuButtonMenuItem forwardedRef={ref} {...props}>
        {children}
      </AriaMenuButtonMenuItem>
    );
  },
);
