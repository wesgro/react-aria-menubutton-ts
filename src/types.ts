import React from "react";
export interface OpenOptions {
  focusMenu?: boolean;
}
export interface CloseOptions {
  focusButton?: boolean;
}
export interface Manager {
  init(options: ManagerOptions): void;
  updateOptions(options: ManagerOptions): void;
  focusItem(index: number): void;
  addItem(item: HTMLElement): void;
  clearItems(): void;
  handleButtonNonArrowKey(event: KeyboardEvent): void;
  destroy(): void;
  update(): void;
  openMenu(openOptions?: OpenOptions): void;
  closeMenu(closeOptions?: CloseOptions): void;
  toggleMenu(closeOptions?: CloseOptions, openOptions?: OpenOptions): void;
  handleBlur?(): void;
  handleSelection?(value: any, event: React.SyntheticEvent<HTMLElement>): void;
  handleMenuKey?(event: KeyboardEvent): void;
  button?: null | React.RefObject<any>;
  menu?: null | React.RefObject<any>;
  isOpen?: boolean;
  focusGroup?: any;
  options?: ManagerOptions;
  blurTimer?: number;
  moveFocusTimer?: number;
}

export interface ManagerOptions {
  closeOnSelection?: boolean;
  closeOnBlur?: boolean;
  id: string;
  onMenuToggle?: (state: { isOpen: boolean }) => void;
  onSelection?: (value: any, event: React.SyntheticEvent<HTMLElement>) => void;
}
