import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SearchBar from "../../src/components/SearchBar";

describe("SearchBar", () => {
  it("exposes a named search landmark and labeled input", () => {
    render(<SearchBar onSearch={vi.fn()} />);

    expect(
      screen.getByRole("search", { name: "Buscar cidade" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Cidade" })).toBeInTheDocument();
  });

  it("trims the query and submits with the keyboard", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole("searchbox", { name: "Cidade" });
    await user.type(input, "  São Paulo  ");
    await user.keyboard("{Enter}");

    expect(onSearch).toHaveBeenCalledExactlyOnceWith("São Paulo");
  });

  it("does not submit an empty query and disables both controls when requested", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const { rerender } = render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole("searchbox", { name: "Cidade" });

    await user.click(screen.getByRole("button", { name: "Buscar" }));
    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Digite uma cidade para buscar.",
    );
    expect(screen.getByRole("searchbox", { name: "Cidade" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );

    rerender(<SearchBar disabled onSearch={onSearch} />);
    expect(screen.getByRole("searchbox", { name: "Cidade" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Buscar" })).toBeDisabled();
    expect(input).toBeDisabled();
  });

  it("rejects whitespace-only queries with an announced validation message", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByRole("searchbox", { name: "Cidade" }), "   ");
    await user.click(screen.getByRole("button", { name: "Buscar" }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Digite uma cidade para buscar.",
    );
  });
});