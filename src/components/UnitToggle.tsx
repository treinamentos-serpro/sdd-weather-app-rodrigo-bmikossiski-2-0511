import type { Unit } from "../types/weather";

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div
      aria-label="Unidade de temperatura"
      className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-md"
      role="group"
    >
      <button
        aria-label="Celsius"
        aria-pressed={unit === "celsius"}
        className="min-w-12 rounded-lg px-3 py-2 font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 aria-pressed:bg-accent-500 aria-pressed:text-night-900 aria-pressed:hover:bg-accent-400"
        onClick={() => onChange("celsius")}
        type="button"
      >
        °C
      </button>
      <button
        aria-label="Fahrenheit"
        aria-pressed={unit === "fahrenheit"}
        className="min-w-12 rounded-lg px-3 py-2 font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 aria-pressed:bg-accent-500 aria-pressed:text-night-900 aria-pressed:hover:bg-accent-400"
        onClick={() => onChange("fahrenheit")}
        type="button"
      >
        °F
      </button>
    </div>
  );
}