import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import { Button } from "./Button";
import { Menu } from "./Menu";
import { MenuItem } from "./MenuItem";
import { Wrapper } from "./Wrapper";

const OPTIONS = ["apple", "banana", "cherry"] as const;
const initialValue = "apple";
type StageProps = {
  closeOnBlur?: boolean;
  disabled?: boolean;
};
const Stage: React.FC<StageProps> = ({ closeOnBlur = true, disabled }) => {
  const [currentOption, setCurrentOption] = React.useState(initialValue);
  return (
    <div>
      <Wrapper
        closeOnBlur={closeOnBlur}
        onSelection={(value) => setCurrentOption(String(value))}
      >
        <Button disabled={disabled}>Select a word</Button>
        <Menu>
          <ul>
            {OPTIONS.map((item) => (
              <MenuItem key={item} text={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </ul>
        </Menu>
        <output role="note">{currentOption}</output>
      </Wrapper>
    </div>
  );
};

test("clicking the `Button` opens the menu and allows selection", async () => {
  render(<Stage />);
  expect(screen.getByRole("note")).toHaveTextContent(initialValue);
  const button = screen.getByRole("button", { name: "Select a word" });
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();

  await userEvent.click(button);

  expect(screen.getByRole("menu")).toBeInTheDocument();
  const menuItem = screen.getByText("banana");
  await userEvent.click(menuItem);
  expect(screen.getByRole("note")).toHaveTextContent("banana");
});

test("Click away from the menu to close it", async () => {
  render(<Stage />);
  const button = screen.getByRole("button", { name: "Select a word" });
  await userEvent.click(button);
  expect(screen.getByRole("menu")).toBeInTheDocument();

  await userEvent.click(document.body);
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});

test("Pressing the Escape key closes the menu", async () => {
  render(<Stage />);
  const button = screen.getByRole("button", { name: "Select a word" });
  await userEvent.click(button);
  expect(screen.getByRole("menu")).toBeInTheDocument();

  await userEvent.type(document.body, "{esc}");
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});

test("Clicking away from the menu does not close it when `closeOnBlur` is false", async () => {
  render(<Stage closeOnBlur={false} />);
  const button = screen.getByRole("button", { name: "Select a word" });
  await userEvent.click(button);
  expect(screen.getByRole("menu")).toBeInTheDocument();

  await userEvent.click(document.body);
  expect(screen.getByRole("menu")).toBeInTheDocument();
});

test("Disabled button does not open a menu", async () => {
  render(<Stage disabled />);
  const button = screen.getByRole("button", { name: "Select a word" });
  await userEvent.click(button);
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});

test("Down arrow opens the menu", async () => {
  render(<Stage />);
  const button = screen.getByRole("button", { name: "Select a word" });
  await userEvent.type(button, "{arrowdown}");
  expect(screen.getByRole("menu")).toBeInTheDocument();
});

test("Down arrow while the menu is open keeps the menu open", async () => {
  render(<Stage closeOnBlur={false} />);
  const button = screen.getByRole("button", { name: "Select a word" });
  await userEvent.click(button);
  expect(screen.getByRole("menu")).toBeInTheDocument();
  await userEvent.type(button, "{arrowdown}");
  expect(screen.getByRole("menu")).toBeInTheDocument();
});
