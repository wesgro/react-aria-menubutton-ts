import React from "react";
export interface OpenOptions {
  focusMenu?: boolean;
}
export interface CloseOptions {
  focusButton?: boolean;
}

export type ButtonRef = null | {
  element: HTMLElement;
  functions: {
    focus: () => void;
    setState: (state: { menuOpen: boolean }) => void;
  };
};

export type MenuRef = null | {
  element: HTMLElement;
  functions: {
    setState: (state: { isOpen: boolean }) => void;
  };
};

export interface Manager {
  focusItem(index: number): void;
  addItem({ node, text }: { node: HTMLElement; text: string }): void;
  removeItem(node: HTMLElement | number): void;
  clearItems(): void;
  destroy(): void;
  handleButtonNonArrowKey(event: React.KeyboardEvent<HTMLButtonElement>): void;
  update(): void;
  openMenu(openOptions?: OpenOptions): void;
  closeMenu(closeOptions?: CloseOptions): void;
  toggleMenu(closeOptions?: CloseOptions, openOptions?: OpenOptions): void;
  handleSelection?(
    value: unknown,
    event: React.SyntheticEvent<HTMLElement>,
  ): void;
  handleMenuKey?(event: React.KeyboardEvent<HTMLElement>): void;
  handleBlur(): void;
  updateOptions(options: ManagerOptions): void;
  isOpen: boolean;
  button: ButtonRef;
  menu: MenuRef;
  options?: ManagerOptions;
}

export interface ManagerOptions {
  closeOnSelection?: boolean;
  closeOnBlur?: boolean;
  id?: string;
  onMenuToggle?: (state: { isOpen: boolean }) => void;
  onSelection?: (
    value: unknown,
    event: React.SyntheticEvent<HTMLElement>,
  ) => void;
}

export type ValidElements = "li" | "button" | "div" | "span" | "ul";
