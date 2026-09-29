import { FILTER_OPTIONS } from "../constants.js";

/** Filter buttons plus the live "remaining" counter. */
export default function TodoToolbar({ filter, onFilterChange, total, remaining }) {
  const counterText = total === 0 ? "No tasks yet" : `${remaining} of ${total} remaining`;

  return (
    <div className="toolbar">
      <div className="filters" role="group" aria-label="Filter tasks">
        {FILTER_OPTIONS.map((option) => {
          const isActive = option.value === filter;

          return (
            <button
              key={option.value}
              type="button"
              className={`filter${isActive ? " is-active" : ""}`}
              aria-pressed={isActive}
              onClick={() => onFilterChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="counter" role="status" aria-live="polite">
        {counterText}
      </p>
    </div>
  );
}
