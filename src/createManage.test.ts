import createManager from "./createManager";
import type { ManagerOptions } from "./types";
import { test, vi, expect, beforeEach, afterEach } from "vitest";
import { fireEvent, createEvent } from "@testing-library/dom";

let mockNode: HTMLButtonElement;
let mockNode2: HTMLButtonElement;
let buttonNode: HTMLButtonElement;
let menuNode: HTMLDivElement;

beforeEach(() => {
  mockNode = document.createElement("button");
  mockNode2 = document.createElement("button");

  buttonNode = document.createElement("button");
  buttonNode.focus = vi.fn();
  menuNode = document.createElement("div");
  menuNode.focus = vi.fn();
  document.body.appendChild(buttonNode);
  document.body.appendChild(menuNode);
  vi.useFakeTimers();
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});

function createManagerWithMockedElements(options: ManagerOptions = {}) {
  const manager = createManager(options);
  manager.addItem({
    node: mockNode,
    text: "first",
  });
  manager.addItem({
    node: mockNode2,
    text: "second",
  });
  manager.button = {
    element: buttonNode,
    functions: {
      setState: vi.fn(),
      focus: () => buttonNode.focus(),
    },
  };
  manager.menu = {
    element: menuNode,
    functions: {
      setState: vi.fn(),
    },
  };
  manager.focusItem = vi.fn();
  return manager;
}

test("createManager initalizes", () => {
  const manager = createManagerWithMockedElements();
  expect(manager.isOpen).toBe(false);
  expect(manager.options.closeOnSelection).toBeTruthy();
  expect(manager.options.closeOnBlur).toBeTruthy();
});

test("Manager#update", () => {
  const manager = createManagerWithMockedElements({
    onMenuToggle: vi.fn(),
  });
  manager.update();
  expect(manager?.menu?.functions.setState).toHaveBeenCalledTimes(1);
  expect(manager?.menu?.functions.setState).toHaveBeenCalledWith({
    isOpen: manager.isOpen,
  });
  expect(manager?.button?.functions.setState).toHaveBeenCalledTimes(1);
  expect(manager?.button?.functions.setState).toHaveBeenCalledWith({
    menuOpen: manager.isOpen,
  });
  expect(manager.options.onMenuToggle).toHaveBeenCalledTimes(1);
  expect(manager.options.onMenuToggle).toHaveBeenCalledWith({
    isOpen: manager.isOpen,
  });
});

test("Manager#openMenu without focusing in menu", async () => {
  const manager = createManagerWithMockedElements();
  manager.openMenu({ focusMenu: false });
  expect(manager.isOpen).toBe(true);
  expect(manager?.menu?.functions.setState).toHaveBeenCalledTimes(1);
  expect(manager?.menu?.functions.setState).toHaveBeenCalledWith({
    isOpen: true,
  });
  expect(manager?.button?.functions.setState).toHaveBeenCalledTimes(1);
  expect(manager?.button?.functions.setState).toHaveBeenCalledWith({
    menuOpen: true,
  });
  await vi.runAllTimersAsync();
  expect(manager.focusItem).toHaveBeenCalledTimes(0);
});

test("Manager#openMenu focusing in menu", async () => {
  const manager = createManagerWithMockedElements();
  manager.openMenu();
  expect(manager.isOpen).toBe(true);
  expect(manager?.menu?.functions.setState).toHaveBeenCalledTimes(1);
  expect(manager?.menu?.functions.setState).toHaveBeenCalledWith({
    isOpen: true,
  });
  expect(manager?.button?.functions.setState).toHaveBeenCalledTimes(1);
  expect(manager?.button?.functions.setState).toHaveBeenCalledWith({
    menuOpen: true,
  });
  await vi.runAllTimersAsync();
  expect(manager.focusItem).toHaveBeenCalledTimes(1);
  expect(manager.focusItem).toHaveBeenCalledWith(0);
});

test("Manager#closeMenu focusing on button", async () => {
  const manager = createManagerWithMockedElements();
  manager.openMenu();
  await vi.runAllTimersAsync();
  manager.closeMenu({ focusButton: true });

  expect(manager.isOpen).toBe(false);
  expect(manager?.menu.functions.setState).toHaveBeenCalledTimes(2);
  expect(manager?.menu?.functions.setState).toHaveBeenCalledWith({
    isOpen: false,
  });
  expect(manager?.button?.functions.setState).toHaveBeenCalledTimes(2);
  expect(manager?.button?.functions.setState).toHaveBeenCalledWith({
    menuOpen: false,
  });
  await vi.runAllTimersAsync();
  expect(buttonNode.focus).toHaveBeenCalledTimes(1);
});

test("Manager#closeMenu without focusing on button", () => {
  mockNode.focus = vi.fn();

  const manager = createManagerWithMockedElements();
  manager.isOpen = true;
  manager.closeMenu({ focusButton: false });

  expect(mockNode.focus).not.toHaveBeenCalled();
});

test("Manager#toggleMenu when closed", () => {
  const manager = createManagerWithMockedElements();
  manager.openMenu = vi.fn();
  manager.closeMenu = vi.fn();
  manager.toggleMenu();
  expect(manager.openMenu).toHaveBeenCalledTimes(1);
  expect(manager.closeMenu).not.toHaveBeenCalled();
});

test("Manager#toggleMenu when open", () => {
  const manager = createManagerWithMockedElements();
  manager.isOpen = true;
  manager.openMenu = vi.fn();
  manager.closeMenu = vi.fn();
  manager.toggleMenu();
  expect(manager.openMenu).not.toHaveBeenCalled();
  expect(manager.closeMenu).toHaveBeenCalledTimes(1);
});

test("Manager#handleSelection A", () => {
  const mockOnSelection = vi.fn();
  const manager = createManagerWithMockedElements({
    onSelection: mockOnSelection,
  });
  manager.closeMenu = vi.fn();
  manager.handleSelection("foo", {
    bar: 1,
  } as unknown as React.SyntheticEvent<HTMLElement>);
  expect(manager.closeMenu).toHaveBeenCalledTimes(1);
  expect(manager.closeMenu).toHaveBeenCalledWith({ focusButton: true });
  expect(mockOnSelection).toHaveBeenCalledTimes(1);
  expect(mockOnSelection).toHaveBeenCalledWith("foo", { bar: 1 });
});

test("Manager#handleSelection B", () => {
  const mockOnSelection = vi.fn();
  const manager = createManagerWithMockedElements({
    onSelection: mockOnSelection,
    closeOnSelection: false,
  });
  manager.closeMenu = vi.fn();
  manager.handleSelection("foo", {
    bar: 1,
  } as unknown as React.SyntheticEvent<HTMLElement>);
  expect(manager.closeMenu).not.toHaveBeenCalled();
  expect(mockOnSelection).toHaveBeenCalledTimes(1);
  expect(mockOnSelection).toHaveBeenCalledWith("foo", { bar: 1 });
});

test("Manager#handleMenuKey on closed menu", () => {
  const escapeEvent = createEvent.keyDown(buttonNode, { key: "Escape" });
  fireEvent(buttonNode, escapeEvent);
  escapeEvent.preventDefault = vi.fn();
  const manager = createManagerWithMockedElements();
  manager.closeMenu = vi.fn();

  manager.handleMenuKey(
    escapeEvent as unknown as React.KeyboardEvent<HTMLElement>,
  );
  expect(escapeEvent.preventDefault).not.toHaveBeenCalled();
  expect(manager.closeMenu).not.toHaveBeenCalled();
});

test("Manager#handleMenuKey on open menu", () => {
  const escapeEvent = createEvent.keyDown(buttonNode, { key: "Escape" });
  fireEvent(buttonNode, escapeEvent);
  escapeEvent.preventDefault = vi.fn();
  const manager = createManagerWithMockedElements();
  manager.isOpen = true;
  manager.closeMenu = vi.fn();

  manager.handleMenuKey(
    escapeEvent as unknown as React.KeyboardEvent<HTMLElement>,
  );
  expect(escapeEvent.preventDefault).toHaveBeenCalledTimes(1);
  expect(manager.closeMenu).toHaveBeenCalledTimes(1);
  expect(manager.closeMenu).toHaveBeenCalledWith({ focusButton: true });
});
