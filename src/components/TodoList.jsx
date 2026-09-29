import TodoItem from "./TodoItem.jsx";

/** Renders the (already filtered) tasks. Keys are stable task ids, never indexes. */
export default function TodoList({ todos, onToggle, onUpdate, onDelete }) {
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
