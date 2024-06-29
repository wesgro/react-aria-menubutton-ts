import * as React from "react";
import PropTypes from "prop-types";
import ManagerContext from "./ManagerContext";
import { refType } from "./propTypes";
import specialAssign from "./specialAssign";

const checkedProps = {
  ambManager: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  forwardedRef: refType,
  tag: PropTypes.string,
};

const disabledSupportedTags = () => [
  "button",
  "fieldset",
  "input",
  "optgroup",
  "option",
  "select",
  "textarea",
];

/**
 * A simple component to group a `Button`/`Menu`/`MenuItem` set,
 * coordinating their interactions. It should wrap your entire menu button
 * widget.
 * All `Button`, `Menu`, and `MenuItem` components must be nested within a
 * `Wrapper` component.
 * Each wrapper can contain only one `Button`, only one `Menu`, and
 * multiple `MenuItem`s.
 */
export class Wrapper extends React.Component<WrapperProps<HTMLElement>> {}

export interface ButtonProps<T extends HTMLElement> extends React.HTMLProps<T> {
  /**
   * If true, the element is disabled
   * (aria-disabled='true', not in tab order, clicking has no effect).
   */
  disabled?: boolean | undefined;

  /**
   * The HTML tag for this element. Default: 'div'.
   */
  tag?: T["tagName"] | undefined;
}

/**
 * A React component to wrap the content of your
 * menu-button-pattern's button.
 * The `Button` component itself acts as a UI button (with tab-index, role, etc.),
 * so you probably do not want to pass an HTML `<button>` element as its child.
 * Each `Button` must be wrapped in a Wrapper, and each Wrapper can wrap only
 * one `Button`.
 */

const AriaMenuButtonButton = (props) => {
  const ambManager = props.ambManager;
  const buttonRef = React.useRef();

  React.useEffect(() => {
    ambManager.button = buttonRef.current;
    return () => {
      ambManager.destroy();
    };
  }, [ambManager]);

  const handleKeyDown = (event) => {
    if (props.disabled) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!ambManager.isOpen) {
          ambManager.openMenu();
        } else {
          ambManager.focusItem(0);
        }
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        ambManager.toggleMenu();
        break;
      case "Escape":
        ambManager.handleMenuKey(event);
        break;
      default:
        // (Potential) letter keys
        ambManager.handleButtonNonArrowKey(event);
    }
  };

  const handleClick = () => {
    if (props.disabled) return;
    props.ambManager.toggleMenu({}, { focusMenu: false });
  };

  const setRef = (instance) => {
    buttonRef.current = instance;
    if (typeof props.forwardedRef === "function") {
      props.forwardedRef(instance);
    } else if (props.forwardedRef) {
      props.forwardedRef.current = instance;
    }
  };

  const buttonProps = {
    role: "button",
    tabIndex: props.disabled ? "" : "0",
    "aria-haspopup": true,
    "aria-expanded": ambManager.isOpen,
    "aria-disabled": props.disabled,
    onKeyDown: handleKeyDown,
    onClick: handleClick,
    onBlur: ambManager.options.closeOnBlur ? ambManager.handleBlur : undefined,
    ref: setRef,
  };

  const reserved = {};
  Object.assign(reserved, checkedProps);
  if (disabledSupportedTags().indexOf(props.tag) >= 0) {
    delete reserved.disabled;
  }
  Object.assign(buttonProps, props, reserved);

  return <props.tag {...buttonProps}>{props.children}</props.tag>;
};

export const ForwardRefButton: React.ForwardRefExoticComponent<
  ButtonProps<HTMLElement>
> = React.forwardRef((props, ref) => (
  <ManagerContext.Consumer>
    {(ambManager) => {
      const buttonProps = { ambManager, forwardedRef: ref };
      specialAssign(buttonProps, props, {
        ambManager: checkedProps.ambManager,
        children: checkedProps.children,
        forwardedRef: checkedProps.forwardedRef,
      });
      return (
        <AriaMenuButtonButton {...buttonProps}>
          {props.children}
        </AriaMenuButtonButton>
      );
    }}
  </ManagerContext.Consumer>
));
