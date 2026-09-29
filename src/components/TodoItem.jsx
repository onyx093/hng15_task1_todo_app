import { useId, useRef, useState } from "react";

import { MAX_TEXT_LENGTH } from "../constants.js";

/**
 * A single task row: checkbox, text (double-click to edit) and row actions.
 *
 * The edit draft is component-local so typing does not re-render the whole list,
 * and it is committed only on Enter or blur — never on each keystroke.
 * `finishedRef` guarantees a single outcome per edit, so the blur that follows
 * Enter (or Escape) can never save an abandoned draft.
 */
export default function TodoItem({ todo, onToggle, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const finishedRef = useRef(false);
  const editInputId = `${useId()}-edit`;

  function beginEdit() {
    finishedRef.current = false;
    setDraft(todo.text);
    setIsEditing(true);
  }

  function commitEdit() {
    if (finishedRef.current) return; // Already committed or cancelled.
    finishedRef.current = true;

    if (todo.text !== draft.trim()) onUpdate(todo.id, draft);
    setIsEditing(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    commitEdit();
  }

  function handleKeyDown(event) {
    if (event.key !== "Escape") return;

    event.preventDefault();
    finishedRef.current = true;
    setDraft(todo.text);
    setIsEditing(false);
  }

  return (
    <li className={`todo${todo.completed ? " todo--completed" : ""}`}>
      <input
        className="todo__checkbox"
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label={`Mark "${todo.text}" as ${todo.completed ? "active" : "completed"}`}
      />

      {isEditing ? (
        <form className="todo__edit" onSubmit={handleSubmit} noValidate>
          <label className="sr-only" htmlFor={editInputId}>
            Edit task
          </label>
          <input
            id={editInputId}
            className="todo__edit-input"
            type="text"
            value={draft}
            maxLength={MAX_TEXT_LENGTH}
            autoFocus
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
          />
        </form>
      ) : (
        <span className="todo__text" onDoubleClick={beginEdit} title="Double-click to edit">
          {todo.text}
        </span>
      )}

      <div className="todo__actions">
        <button
          type="button"
          className="todo__action"
          onClick={beginEdit}
          disabled={isEditing}
          aria-label={`Edit "${todo.text}"`}
        >
          Edit
        </button>
        <button
          type="button"
          className="todo__action todo__action--delete"
          onClick={() => onDelete(todo.id)}
          aria-label={`Delete "${todo.text}"`}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
