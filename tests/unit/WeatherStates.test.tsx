import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EmptyState from "../../src/components/states/EmptyState";
import ErrorState from "../../src/components/states/ErrorState";
import LoadingState from "../../src/components/states/LoadingState";

describe("weather state components", () => {
  it("announces the loading message as a status", () => {
    render(<LoadingState />);

    expect(screen.getByRole("status")).toHaveTextContent("Carregando...");
  });

  it("shows the error message and invokes retry", () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Não foi possível carregar o clima." onRetry={onRetry} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível carregar o clima.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("shows the empty-state title and hint", () => {
    render(
      <EmptyState
        title="Nenhuma cidade encontrada"
        hint="Confira a grafia ou tente outra cidade."
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Nenhuma cidade encontrada" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Confira a grafia ou tente outra cidade."),
    ).toBeInTheDocument();
  });
});