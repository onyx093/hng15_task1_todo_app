import { useCallback } from "react";

import { MAX_TEXT_LENGTH, STORAGE_KEY } from "../constants.js";
import { useLocalStorage } from "./useLocalStorage.js";

/** A stored entry is usable only when it has a non-empty id and text. */
function isValidTodo(todo) {
  return (
    todo !== null &&
    typeof todo === "object" &&
    typeof todo.id === "string" &&
    todo.id.length > 0 &&
    typeof todo.text === "string" &&
    todo.text.trim().length > 0
  );
}

/** Coerce a stored entry into the exact shape the app expects. */
function normalizeTodo(todo) {
  return {
    id: todo.id,
    text: todo.text.trim().slice(0, MAX_TEXT_LENGTH),
    completed: todo.completed === true,
    createdAt: typeof todo.createdAt === "number" ? todo.createdAt : Date.now(),
  };
}

function sanitizeTodos(value) {
  return Array.isArray(value) ? value.filter(isValidTodo).map(normalizeTodo) : [];
}

/** Collision-resistant id, with a fallback for environments without randomUUID. */
function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `todo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Trim + cap incoming text; returns "" when there is nothing worth saving. */
function cleanText(rawText) {
  return String(rawText ?? "")
    .trim()
    .slice(0, MAX_TEXT_LENGTH);
}

/**
 * The todo list: state, persistence and every mutation, in one hook.
 *
 * All updates are immutable and functional (no read-modify-write of stale state),
 * so rapid interactions and StrictMode double-invocation stay correct.
 */
export function useTodos() {
  const [todos, setTodos] = useLocalStorage(STORAGE_KEY, [], sanitizeTodos);

  const addTodo = useCallback(
    (rawText) => {
      const text = cleanText(rawText);
      if (!text) return;

      setTodos((current) => [
        ...current,
        { id: createId(), text, completed: false, createdAt: Date.now() },
      ]);
    },
    [setTodos],
  );

  const toggleTodo = useCallback(
    (id) => {
      setTodos((current) =>
        current.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
      );
    },
    [setTodos],
  );

  /** Rename a task. An empty/blank value keeps the previous text. */
  const updateTodoText = useCallback(
    (id, rawText) => {
      const text = cleanText(rawText);
      if (!text) return;

      setTodos((current) => current.map((todo) => (todo.id === id ? { ...todo, text } : todo)));
    },
    [setTodos],
  );

  const deleteTodo = useCallback(
    (id) => {
      setTodos((current) => current.filter((todo) => todo.id !== id));
    },
    [setTodos],
  );

  const clearCompleted = useCallback(() => {
    setTodos((current) => current.filter((todo) => !todo.completed));
  }, [setTodos]);

  return { todos, addTodo, toggleTodo, updateTodoText, deleteTodo, clearCompleted };
}
