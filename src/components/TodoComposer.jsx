import { useId, useState } from "react";

import { MAX_TEXT_LENGTH } from "../constants.js";

/** Input + submit button for creating a task. */
export default function TodoComposer({ onAdd }) {
  const [text, setText] = useState("");
  const inputId = useId();

  function handleSubmit(event) {
    event.preventDefault();
    if (!text.trim()) return;

    onAdd(text);
    setText("");
  }

  return (
    <form className="composer" onSubmit={handleSubmit} autoComplete="off" noValidate>
      <label className="sr-only" htmlFor={inputId}>
        New task
      </label>
      <input
        id={inputId}
        className="composer__input"
        name="todo"
        type="text"
        placeholder="What needs to be done?"
        maxLength={MAX_TEXT_LENGTH}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <button className="composer__submit" type="submit">
        Add
      </button>
    </form>
  );
}
