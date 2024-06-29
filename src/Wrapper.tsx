import React, { forwardRef } from "react";

import createManager from "./createManager";
import ManagerContext from "./ManagerContext";

import specialAssign from "./specialAssign";

export interface WrapperState {
  isOpen: boolean;
}

export interface WrapperProps<T extends HTMLElement>
  extends React.HTMLAttributes<T> {
  /**
   * A callback to run when the user makes a selection
   * (i.e. clicks or presses Enter or Space on a `MenuItem`).
   * It will be passed the value of the selected `MenuItem` and
   * the React `SyntheticEvent`.
   */
  onSelection?(value: unknown, event: React.SyntheticEvent<T>): void;

  /**
   * A callback to run when the menu is opened or closed.
   */
  onMenuToggle?(obj: WrapperState): void;

  /**
   * By default, it does automatically close.
   * If false, the menu will not automatically close when a
   * selection is made. Default: `true`.
   */
  closeOnSelection?: boolean;

  /**
   * By default, it does automatically close.
   * If false, the menu will not automatically close when it
   * blurs. Default: `true`.
   */
  closeOnBlur?: boolean;

  tag?: "div" | "span";

  id: string;
}

/**
 * A simple component to group a `Button`/`Menu`/`MenuItem` set,
 * coordinating their interactions. It should wrap your entire menu button
 * widget.
 * All `Button`, `Menu`, and `MenuItem` components must be nested within a
 * `Wrapper` component.
 * Each wrapper can contain only one `Button`, only one `Menu`, and
 * multiple `MenuItem`s.
 */
export interface Wrapper
  extends WrapperProps<HTMLDivElement | HTMLSpanElement> {}

const managerOptionsFromProps = (props: Wrapper) => {
  return {
    onMenuToggle: props.onMenuToggle,
    onSelection: props.onSelection,
    closeOnSelection: props.closeOnSelection,
    closeOnBlur: props.closeOnBlur,
    id: props.id,
  };
};

export const Wrapper: React.FC<Wrapper> = (props) => {
  const manager = React.useRef(createManager(managerOptionsFromProps(props)));
  const Tag = props.tag ?? "div";
  React.useEffect(() => {
    manager.current.updateOptions(managerOptionsFromProps(props));
  }, [props]);

  return (
    <ManagerContext.Provider value={manager}>
      <Tag {...props}>{props.children}</Tag>
    </ManagerContext.Provider>
  );
};
