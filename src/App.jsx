import { useMemo, useState } from "react";

import TodoComposer from "./components/TodoComposer.jsx";
import TodoList from "./components/TodoList.jsx";
import TodoToolbar from "./components/TodoToolbar.jsx";
import { EMPTY_MESSAGES, FILTER_PREDICATES, FILTERS } from "./constants.js";
import { useTodos } from "./hooks/useTodos.js";
import "./App.css";

/**
 * Todo list app: owns the list (via useTodos) and the active filter.
 * Filtered tasks and counts are derived, never stored.
 */
export default function App() {
  const { todos, addTodo, toggleTodo, updateTodoText, deleteTodo, clearCompleted } = useTodos();
  const [filter, setFilter] = useState(FILTERS.ALL);

  const visibleTodos = useMemo(
    () => todos.filter(FILTER_PREDICATES[filter] ?? FILTER_PREDICATES[FILTERS.ALL]),
    [todos, filter],
  );

  const remainingCount = useMemo(() => todos.filter((todo) => !todo.completed).length, [todos]);
  const completedCount = todos.length - remainingCount;

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  return (
    <main className="app">
      <header className="app__header">
        <h1 className="app__title">Todo List</h1>
        <p className="app__subtitle">{todayLabel}</p>
      </header>

      <TodoComposer onAdd={addTodo} />

      <TodoToolbar
        filter={filter}
        onFilterChange={setFilter}
        total={todos.length}
        remaining={remainingCount}
      />

      {visibleTodos.length > 0 ? (
        <TodoList
          todos={visibleTodos}
          onToggle={toggleTodo}
          onUpdate={updateTodoText}
          onDelete={deleteTodo}
        />
      ) : (
        <p className="empty-state">{EMPTY_MESSAGES[filter]}</p>
      )}

      <footer className="app__footer">
        {todos.length > 0 && (
          <button
            type="button"
            className="ghost-button"
            onClick={clearCompleted}
            disabled={completedCount === 0}
          >
            Clear completed
          </button>
        )}
        <p className="app__hint">Tasks are saved in this browser.</p>
      </footer>
    </main>
  );
}
