import React from "react";
import type FocusGroup from "focus-group";
export interface OpenOptions {
  focusMenu?: boolean;
}
export interface CloseOptions {
  focusButton?: boolean;
}

export type ButtonRef =
  | null
  | (Element & {
      focus: () => void;
      setState: ({ menuOpen }: { menuOpen: boolean }) => void;
    });
export type MenuRef =
  | null
  | (Element & { setState: ({ isOpen }: { isOpen: boolean }) => void });
export interface Manager {
  init(options: ManagerOptions): void;
  updateOptions(options: ManagerOptions): void;
  focusItem(index: number): void;
  addItem({ node, text }: { node: HTMLElement; text: string }): void;
  clearItems(): void;
  handleButtonNonArrowKey(event: React.KeyboardEvent<HTMLButtonElement>): void;
  destroy(): void;
  update(): void;
  openMenu(openOptions?: OpenOptions): void;
  closeMenu(closeOptions?: CloseOptions): void;
  toggleMenu(closeOptions?: CloseOptions, openOptions?: OpenOptions): void;
  handleBlur?(): void;
  handleSelection?(
    value: unknown,
    event: React.SyntheticEvent<HTMLElement>,
  ): void;
  handleMenuKey?(event: React.KeyboardEvent<HTMLElement>): void;
  button?: ButtonRef;
  menu?: MenuRef;
  isOpen?: boolean;
  focusGroup?: ReturnType<typeof FocusGroup>;
  options?: ManagerOptions;
  blurTimer?: number;
  moveFocusTimer?: number;
}

export interface ManagerOptions {
  closeOnSelection?: boolean;
  closeOnBlur?: boolean;
  id: string;
  onMenuToggle?: (state: { isOpen: boolean }) => void;
  onSelection?: (
    value: unknown,
    event: React.SyntheticEvent<HTMLElement>,
  ) => void;
}
