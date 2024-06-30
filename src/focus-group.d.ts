declare module "focus-group" {
  interface Keybinding {
    keyCode: number;
    metaKey?: boolean;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
  }

  interface Keybindings {
    next?: Keybinding | Keybinding[];
    prev?: Keybinding | Keybinding[];
    first?: Keybinding;
    last?: Keybinding;
  }

  interface FocusGroupOptions {
    keybindings?: Keybindings;
    wrap?: boolean;
    stringSearch?: boolean;
    stringSearchDelay?: number;
    members?: HTMLElement[];
  }

  interface FocusGroup {
    activate(): FocusGroup;
    deactivate(): FocusGroup;
    moveFocusForward(): number;
    moveFocusBack(): number;
    moveFocusToFirst(): void;
    moveFocusToLast(): void;
    moveFocusByString(str: string): void;
    focusNodeAtIndex(index: number): FocusGroup;
    addMember(
      memberData: HTMLElement | { node: HTMLElement; text?: string },
      index?: number,
    ): FocusGroup;
    removeMember(member: HTMLElement | number): FocusGroup;
    clearMembers(): FocusGroup;
    setMembers(nextMembers: HTMLElement[]): FocusGroup;
    getMembers(): HTMLElement[];
    _handleUnboundKey(event: React.KeyboardEvent<HTMLButtonElement>): void;
  }

  function createFocusGroup(options?: FocusGroupOptions): FocusGroup;

  export = createFocusGroup;
}
