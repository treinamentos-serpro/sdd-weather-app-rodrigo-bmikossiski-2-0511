import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import UnitToggle from "../../src/components/UnitToggle";

describe("UnitToggle", () => {
  it("exposes the active unit in an accessible button group", () => {
    render(<UnitToggle unit="celsius" onChange={vi.fn()} />);

    const group = screen.getByRole("group", {
      name: "Unidade de temperatura",
    });
    const celsiusButton = within(group).getByRole("button", {
      name: "Celsius",
    });
    const fahrenheitButton = within(group).getByRole("button", {
      name: "Fahrenheit",
    });

    expect(celsiusButton).toHaveAttribute("aria-pressed", "true");
    expect(fahrenheitButton).toHaveAttribute("aria-pressed", "false");
  });

  it("notifies the selected unit when activated from the keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<UnitToggle unit="celsius" onChange={onChange} />);

    await user.tab();
    await user.tab();
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledExactlyOnceWith("fahrenheit");
  });

  it("updates aria-pressed from the controlled unit prop", () => {
    const { rerender } = render(
      <UnitToggle unit="celsius" onChange={vi.fn()} />,
    );

    rerender(<UnitToggle unit="fahrenheit" onChange={vi.fn()} />);

    const group = screen.getByRole("group", {
      name: "Unidade de temperatura",
    });
    expect(
      within(group).getByRole("button", { name: "Celsius" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      within(group).getByRole("button", { name: "Fahrenheit" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});