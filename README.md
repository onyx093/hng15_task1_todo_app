# Simple Todo List

A small todo list web app built with **React + Vite**, persisted in the browser with
`localStorage`. No backend, no accounts — just open it and it works.

## Features

- **Add** tasks from the input at the top (Enter or the *Add* button).
- **Complete** a task with its checkbox; finished tasks get struck through.
- **Edit** a task by double-clicking its text (or the *Edit* button) — Enter or blur
  saves, Escape cancels.
- **Delete** a single task, or **Clear completed** to remove all finished ones at once.
- **Filter** between *All*, *Active* and *Completed*.
- **Autosave** — tasks are written to `localStorage` and restored on reload.
- **Responsive** layout with automatic light/dark theming.
- **Accessible** — keyboard operable, labelled controls, ARIA live counter.

## Getting started

```sh
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Script            | What it does                                    |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with hot reload        |
| `npm run build`   | Production build into `dist/`                    |
| `npm run preview` | Serve the production build on port 4173          |
| `npm test`        | Run the Vitest + React Testing Library suite     |
| `npm run test:watch` | Re-run tests on change                       |

## Project structure

```
index.html               Vite entry HTML (<div id="root">)
vite.config.js           Vite plugins, dev/preview ports and Vitest config
src/
  main.jsx               React root, StrictMode, global CSS import
  App.jsx                Composes the app; owns the active filter
  App.css                Component styles
  index.css              Design tokens, reset, app shell
  constants.js           Storage key, filters, predicates, empty messages
  hooks/
    useLocalStorage.js   useState that mirrors into localStorage
    useTodos.js          Task state + all mutations (add/toggle/edit/delete/clear)
  components/
    TodoComposer.jsx     New-task form
    TodoToolbar.jsx      Filter buttons + remaining counter
    TodoList.jsx         Maps tasks to rows
    TodoItem.jsx         One task: checkbox, text, inline editor, actions
  test/
    setup.js             jest-dom matchers for Vitest
  App.test.jsx           Behaviour tests (add, complete, edit, delete, filters, storage)
```

## How state and persistence work

- `useTodos` is the single source of truth for tasks; every mutation uses a functional
  state update so rapid clicks and StrictMode's double invocation stay correct.
- `useLocalStorage` reads its initial value lazily and writes through an effect. Reads
  and writes are wrapped in `try`/`catch`, so unavailable or full storage degrades to
  memory-only instead of throwing.
- Data is stored under the key `todo-list:v1` as a JSON array of
  `{ id, text, completed, createdAt }`. Values read back are sanitised: non-arrays,
  unparsable JSON and entries without an id or text are discarded.
- Derived data (filtered list, counts) is computed with `useMemo`, never stored.

## Keyboard and accessibility

| Interaction                      | Result                       |
| -------------------------------- | ---------------------------- |
| `Enter` in the add field         | Add the task                 |
| Double-click task text           | Start editing                |
| `Enter` while editing            | Save                         |
| `Escape` while editing           | Cancel (previous text kept)  |
| `Tab` / `Shift`+`Tab`            | Move through controls        |

Task text is rendered as React children, so it can never inject markup (no
`innerHTML` anywhere).

## Notes and limitations

- Tasks are stored in the browser's `localStorage`, so they are per-browser and
  per-device. Clearing site data removes them.
- Editing a task to a blank value keeps the previous text — use *Delete* to remove it.
- Task text is capped at 200 characters.
- Storage key `todo-list:v1` was kept unchanged from the earlier plain-HTML version,
  so tasks saved by it still load.
- No accounts, sync, due dates, priorities or subtasks — it is deliberately simple.
