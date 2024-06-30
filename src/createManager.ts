import createFocusGroup from "focus-group";
import { type Manager, type ManagerOptions } from "./types";
import * as externalStateControl from "./externalStateControl";

const focusGroupOptions = {
  wrap: true,
  stringSearch: true,
};

const protoManager: Manager = {
  init(options) {
    this.updateOptions(options);

    this.handleBlur = handleBlur.bind(this);
    this.handleSelection = handleSelection.bind(this);
    this.handleMenuKey = handleMenuKey.bind(this);

    // "With focus on the drop-down menu, the Up and Down Arrow
    // keys move focus within the menu items, "wrapping" at the top and bottom."
    // "Typing a letter (printable character) key moves focus to the next
    // instance of a visible node whose title begins with that printable letter."
    //
    // All of the above is handled by focus-group.
    this.focusGroup = createFocusGroup(focusGroupOptions);

    // These component references are added when the relevant components mount
    this.button = null;
    this.menu = null;

    // State trackers
    this.isOpen = false;
  },

  updateOptions(options) {
    const oldOptions = this.options;
    this.options = options || this.options || {};
    if (typeof this.options.closeOnSelection === "undefined") {
      this.options.closeOnSelection = true;
    }
    if (typeof this.options.closeOnBlur === "undefined") {
      this.options.closeOnBlur = true;
    }
    if (this.options.id) {
      externalStateControl.registerManager(this.options.id, this);
    }
    if (oldOptions && oldOptions.id && oldOptions.id !== this.options.id) {
      externalStateControl.unregisterManager(this.options.id);
    }
  },

  focusItem(index) {
    debugger;
    this.focusGroup?.focusNodeAtIndex(index);
  },

  addItem(item) {
    this.focusGroup?.addMember(item);
  },

  clearItems() {
    this.focusGroup?.clearMembers();
  },

  handleButtonNonArrowKey(event) {
    this.focusGroup?._handleUnboundKey(event);
  },

  destroy() {
    this.button = null;
    this.menu = null;
    this.focusGroup?.deactivate();
    clearTimeout(this.blurTimer);
    clearTimeout(this.moveFocusTimer);
  },

  update() {
    this.menu?.setState({ isOpen: this.isOpen ?? false });
    this.button?.setState({ menuOpen: this.isOpen ?? false });
    this?.options?.onMenuToggle &&
      this.options.onMenuToggle({ isOpen: this.isOpen! });
  },

  openMenu(openOptions) {
    if (this.isOpen) return;
    openOptions = openOptions || {};
    if (openOptions.focusMenu === undefined) {
      openOptions.focusMenu = true;
    }
    this.isOpen = true;
    this.update();
    this.focusGroup?.activate();

    if (openOptions.focusMenu) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;

      this.moveFocusTimer = setTimeout(function () {
        self.focusItem(0);
      }, 0);
    }
  },

  closeMenu(closeOptions) {
    if (!this.isOpen) return;
    closeOptions = closeOptions || {};
    this.isOpen = false;
    this.update();
    if (closeOptions.focusButton) {
      this.button?.focus();
    }
  },

  toggleMenu(closeOptions, openOptions) {
    closeOptions = closeOptions || {};
    openOptions = openOptions || {};

    if (this.isOpen) {
      this.closeMenu(closeOptions);
    } else {
      this.openMenu(openOptions);
    }
  },
};

function handleBlur(this: Manager) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const self = this;
  self.blurTimer = setTimeout(function () {
    if (!self.button) return;
    const buttonNode = self.button;
    if (!buttonNode) return;
    const activeEl = buttonNode.ownerDocument.activeElement;
    if (buttonNode && activeEl === buttonNode) return;
    const menuNode = self.menu;
    if (menuNode === activeEl) {
      self.focusItem(0);
      return;
    }
    if (menuNode && menuNode.contains(activeEl)) return;
    if (self.isOpen) self.closeMenu({ focusButton: false });
  }, 0);
}

function handleSelection(
  this: Manager,
  value: unknown,
  event: React.SyntheticEvent<HTMLElement>,
) {
  if (this?.options?.closeOnSelection) this.closeMenu({ focusButton: true });
  if (this?.options?.onSelection) this.options.onSelection(value, event);
}

function handleMenuKey(
  this: Manager,
  event: React.KeyboardEvent<HTMLButtonElement>,
) {
  if (this.isOpen) {
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        this.closeMenu({ focusButton: true });
        break;
      case "Home":
        event.preventDefault();
        this.focusGroup?.moveFocusToFirst();
        break;
      case "End":
        event.preventDefault();
        this.focusGroup?.moveFocusToLast();
        break;
    }
  }
}

export default function createManager(options: ManagerOptions): Manager {
  const newManager = Object.create(protoManager);
  newManager.init(options);
  return newManager;
}
