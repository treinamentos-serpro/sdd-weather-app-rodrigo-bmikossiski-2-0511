import { useId, useState, type FormEvent } from "react";

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({
  onSearch,
  disabled = false,
}: SearchBarProps) {
  const inputId = useId();
  const validationId = useId();
  const [query, setQuery] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled) return;

    const city = query.trim();
    if (city.length === 0) {
      setValidationMessage("Digite uma cidade para buscar.");
      return;
    }

    setValidationMessage("");
    onSearch(city);
  }

  return (
    <form
      aria-label="Buscar cidade"
      className="flex w-full flex-col items-stretch gap-3 rounded-xl border border-white/10 bg-white/5 p-3 shadow-lg backdrop-blur-md sm:flex-row sm:items-end"
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="min-w-0 flex-1">
        <label
          className="mb-1.5 block text-sm font-medium text-white/85"
          htmlFor={inputId}
        >
          Cidade
        </label>
        <input
          autoComplete="off"
          className="w-full rounded-lg border border-white/15 bg-night-900 px-3 py-2.5 text-white placeholder:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          id={inputId}
          aria-describedby={validationMessage ? validationId : undefined}
          aria-invalid={validationMessage ? true : undefined}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            if (event.currentTarget.value.trim().length > 0) {
              setValidationMessage("");
            }
          }}
          placeholder="Digite o nome da cidade"
          type="search"
          value={query}
        />
        {validationMessage && (
          <p className="mt-1.5 text-sm text-red-200" id={validationId} role="alert">
            {validationMessage}
          </p>
        )}
      </div>
      <button
        className="w-full shrink-0 rounded-lg bg-accent-500 px-4 py-2.5 font-medium text-night-900 transition-colors hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        disabled={disabled}
        type="submit"
      >
        Buscar
      </button>
    </form>
  );
}