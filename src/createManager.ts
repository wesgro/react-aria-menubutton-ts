import createFocusGroup from "focus-group";
import * as externalStateControl from "./externalStateControl";
import {
  ButtonRef,
  MenuRef,
  Manager as ManagerInterface,
  ManagerOptions,
} from "./types";

class Manager implements ManagerInterface {
  private focusGroup: ReturnType<typeof createFocusGroup>;
  private _button: ButtonRef = null;
  private _menu: MenuRef = null;
  private _isOpen: boolean = false;
  private _options?: ManagerOptions;
  private blurTimer: number;
  private moveFocusTimer: number;

  constructor(options: ManagerOptions) {
    this.init(options);
  }

  private init(options: ManagerOptions) {
    this.handleBlur = this.handleBlur.bind(this);
    this.handleSelection = this.handleSelection.bind(this);
    this.handleMenuKey = this.handleMenuKey.bind(this);
    this.addItem = this.addItem.bind(this);
    this.focusItem = this.focusItem.bind(this);
    this.handleButtonNonArrowKey = this.handleButtonNonArrowKey.bind(this);
    this.update = this.update.bind(this);
    this.openMenu = this.openMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
    this.updateOptions = this.updateOptions.bind(this);

    this.updateOptions(options);

    this.focusGroup = createFocusGroup({
      wrap: true,
      stringSearch: true,
    });
  }

  get button() {
    if (!this._button) throw new Error("Button not set");
    return this._button;
  }

  set button(button: ButtonRef) {
    this._button = button;
  }

  get menu() {
    if (!this._menu) throw new Error("Menu not set");
    return this._menu;
  }

  set menu(menu: MenuRef) {
    this._menu = menu;
  }

  get isOpen() {
    return this._isOpen;
  }

  set isOpen(isOpen: boolean) {
    if (isOpen === true) {
      this.openMenu();
    } else {
      this.closeMenu();
    }
  }

  get options() {
    return this._options;
  }

  set options(options: ManagerOptions) {
    this._options = options;
  }

  public updateOptions(options: ManagerOptions) {
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
  }

  public focusItem(index: number) {
    this.focusGroup.focusNodeAtIndex(index);
  }

  public addItem(item: { node: HTMLElement; text: string }) {
    this.focusGroup.addMember(item);
  }

  public removeItem(node: HTMLElement | number) {
    this.focusGroup.removeMember(node);
  }

  public clearItems() {
    this.focusGroup.clearMembers();
  }

  public handleButtonNonArrowKey(
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) {
    this.focusGroup._handleUnboundKey(event);
  }

  public destroy() {
    clearTimeout(this.blurTimer);
    clearTimeout(this.moveFocusTimer);
  }

  public update() {
    this.menu.functions.setState({ isOpen: this.isOpen });
    this.button.functions.setState({ menuOpen: this.isOpen });
    this.options.onMenuToggle?.({ isOpen: this.isOpen });
  }

  public openMenu(openOptions?: { focusMenu?: boolean }) {
    if (this.isOpen) return;
    openOptions = openOptions || {};
    if (openOptions.focusMenu === undefined) {
      openOptions.focusMenu = true;
    }
    this._isOpen = true;
    this.update();
    this.focusGroup.activate();
    if (openOptions.focusMenu) {
      this.moveFocusTimer = setTimeout(() => {
        this.focusItem(0);
      }, 0);
    }
  }

  public closeMenu(closeOptions?: { focusButton?: boolean }) {
    if (!this.isOpen) return;

    closeOptions = closeOptions || {};
    this._isOpen = false;
    this.update();
    this.focusGroup.deactivate();
    if (closeOptions.focusButton) {
      this.button.functions.focus();
    }
  }

  public toggleMenu(
    closeOptions?: { focusButton?: boolean },
    openOptions?: { focusMenu?: boolean },
  ) {
    closeOptions = closeOptions || {};
    openOptions = openOptions || {};
    if (this.isOpen) {
      this.closeMenu(closeOptions);
    } else {
      this.openMenu(openOptions);
    }
  }

  public handleBlur() {
    if (this.options.closeOnBlur === false) return;
    this.blurTimer = setTimeout(() => {
      if (!this.button) return;
      const buttonNode = this.button.element;
      if (!buttonNode) return;
      const activeEl = buttonNode.ownerDocument.activeElement;
      if (buttonNode && activeEl === buttonNode) return;
      const menuNode = this.menu.element;
      if (menuNode === activeEl) {
        this.focusItem(0);
        return;
      }
      if (menuNode && menuNode.contains(activeEl)) return;
      if (this.isOpen) this.closeMenu({ focusButton: false });
    }, 0);
  }

  public handleSelection(
    value: unknown,
    event: React.SyntheticEvent<HTMLElement>,
  ) {
    if (this.options.closeOnSelection) this.closeMenu({ focusButton: true });
    if (this.options.onSelection) this.options.onSelection(value, event);
  }

  public handleMenuKey(event: React.KeyboardEvent<HTMLElement>) {
    if (this.isOpen) {
      switch (event.key) {
        case "Escape":
          event.preventDefault();
          this.closeMenu({ focusButton: true });
          break;
        case "Home":
          event.preventDefault();
          this.focusGroup.moveFocusToFirst();
          break;
        case "End":
          event.preventDefault();
          this.focusGroup.moveFocusToLast();
          break;
      }
    }
  }
}

export default function createManager(options: ManagerOptions) {
  return new Manager(options);
}
