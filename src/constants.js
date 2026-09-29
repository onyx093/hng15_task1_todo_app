/**
 * Shared constants.
 *
 * STORAGE_KEY is intentionally kept as "todo-list:v1" so tasks saved by earlier
 * versions of this app are still picked up after the move to React.
 */
export const STORAGE_KEY = "todo-list:v1";

export const MAX_TEXT_LENGTH = 200;

export const FILTERS = {
  ALL: "all",
  ACTIVE: "active",
  COMPLETED: "completed",
};

export const FILTER_OPTIONS = [
  { value: FILTERS.ALL, label: "All" },
  { value: FILTERS.ACTIVE, label: "Active" },
  { value: FILTERS.COMPLETED, label: "Completed" },
];

/** Predicate per filter, so a filter only has to be described once. */
export const FILTER_PREDICATES = {
  [FILTERS.ALL]: () => true,
  [FILTERS.ACTIVE]: (todo) => !todo.completed,
  [FILTERS.COMPLETED]: (todo) => todo.completed,
};

export const EMPTY_MESSAGES = {
  [FILTERS.ALL]: "Nothing here yet — add your first task above.",
  [FILTERS.ACTIVE]: "All caught up. Nothing left to do.",
  [FILTERS.COMPLETED]: "No completed tasks yet.",
};
