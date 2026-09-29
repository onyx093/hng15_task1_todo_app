import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App.jsx";
import { STORAGE_KEY } from "./constants.js";

/** Render the app and return a fresh user-event session. */
function renderApp() {
  const user = userEvent.setup();
  render(<App />);
  return { user };
}

async function addTask(user, text) {
  await user.type(screen.getByLabelText("New task"), text);
  await user.click(screen.getByRole("button", { name: "Add" }));
}

/** The checkbox whose aria-label starts with `Mark "<text>"`. */
function taskCheckbox(text) {
  return screen.getByRole("checkbox", { name: new RegExp(`mark "${text}"`, "i") });
}

function readStoredTodos() {
  return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("adding tasks", () => {
  it("shows the empty state and a zero counter when there is nothing to do", () => {
    renderApp();

    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("No tasks yet");
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("adds a task, clears the input and persists it to localStorage", async () => {
    const { user } = renderApp();

    await addTask(user, "Buy milk");

    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(screen.getByLabelText("New task")).toHaveValue("");
    expect(screen.getByRole("status")).toHaveTextContent("1 of 1 remaining");

    await waitFor(() => {
      const stored = readStoredTodos();
      expect(stored).toHaveLength(1);
      expect(stored[0]).toMatchObject({ text: "Buy milk", completed: false });
    });
  });

  it("trims whitespace and ignores blank submissions", async () => {
    const { user } = renderApp();

    await addTask(user, "   ");
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);

    await addTask(user, "   Padded task   ");
    expect(screen.getByText("Padded task")).toBeInTheDocument();
  });

  it("keeps several tasks in the order they were added", async () => {
    const { user } = renderApp();

    await addTask(user, "First");
    await addTask(user, "Second");
    await addTask(user, "Third");

    const renderedTexts = screen.getAllByRole("listitem").map((item) => item.textContent);

    expect(renderedTexts).toEqual(["FirstEditDelete", "SecondEditDelete", "ThirdEditDelete"]);
  });

  it("caps task text at 200 characters", async () => {
    const { user } = renderApp();

    await addTask(user, "x".repeat(250));

    await waitFor(() => {
      expect(readStoredTodos()[0].text).toHaveLength(200);
    });
  });
});

describe("completing tasks", () => {
  it("toggles a task and updates the counter", async () => {
    const { user } = renderApp();
    await addTask(user, "Walk the dog");

    await user.click(taskCheckbox("Walk the dog"));

    expect(taskCheckbox("Walk the dog")).toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent("0 of 1 remaining");

    await waitFor(() => {
      expect(readStoredTodos()[0].completed).toBe(true);
    });
  });

  it("toggles a task back to active", async () => {
    const { user } = renderApp();
    await addTask(user, "Walk the dog");

    await user.click(taskCheckbox("Walk the dog"));
    await user.click(taskCheckbox("Walk the dog"));

    expect(taskCheckbox("Walk the dog")).not.toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent("1 of 1 remaining");
  });
});

describe("filtering", () => {
  it("narrows the list to active or completed tasks", async () => {
    const { user } = renderApp();
    await addTask(user, "Task A");
    await addTask(user, "Task B");
    await user.click(taskCheckbox("Task B"));

    await user.click(screen.getByRole("button", { name: "Active" }));
    expect(screen.getByText("Task A")).toBeInTheDocument();
    expect(screen.queryByText("Task B")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Completed" }));
    expect(screen.getByText("Task B")).toBeInTheDocument();
    expect(screen.queryByText("Task A")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByText("Task A")).toBeInTheDocument();
    expect(screen.getByText("Task B")).toBeInTheDocument();
  });

  it("marks the selected filter as pressed", async () => {
    const { user } = renderApp();

    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Completed" }));

    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Completed" })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows a filter-specific empty state when everything is completed", async () => {
    const { user } = renderApp();
    await addTask(user, "Task A");
    await user.click(taskCheckbox("Task A"));

    await user.click(screen.getByRole("button", { name: "Active" }));

    expect(screen.getByText(/all caught up/i)).toBeInTheDocument();
  });
});

describe("editing tasks", () => {
  it("edits a task by double-clicking and saves with Enter", async () => {
    const { user } = renderApp();
    await addTask(user, "Old text");

    await user.dblClick(screen.getByText("Old text"));
    const editor = screen.getByRole("textbox", { name: "Edit task" });
    expect(editor).toHaveValue("Old text");

    await user.clear(editor);
    await user.type(editor, "New text{Enter}");

    expect(screen.getByText("New text")).toBeInTheDocument();
    expect(screen.queryByText("Old text")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(readStoredTodos()[0].text).toBe("New text");
    });
  });

  it("can also be started from the Edit button", async () => {
    const { user } = renderApp();
    await addTask(user, "Task A");

    await user.click(screen.getByRole("button", { name: 'Edit "Task A"' }));

    expect(screen.getByRole("textbox", { name: "Edit task" })).toHaveValue("Task A");
  });

  it("saves the draft when the field loses focus", async () => {
    const { user } = renderApp();
    await addTask(user, "Task A");

    await user.dblClick(screen.getByText("Task A"));
    const editor = screen.getByRole("textbox", { name: "Edit task" });
    await user.clear(editor);
    await user.type(editor, "Task A edited");
    await user.tab();

    expect(screen.getByText("Task A edited")).toBeInTheDocument();
  });

  it("cancels the edit with Escape", async () => {
    const { user } = renderApp();
    await addTask(user, "Keep me");

    await user.dblClick(screen.getByText("Keep me"));
    const editor = screen.getByRole("textbox", { name: "Edit task" });
    await user.clear(editor);
    await user.type(editor, "Discard me{Escape}");

    expect(screen.getByText("Keep me")).toBeInTheDocument();
    expect(screen.queryByText("Discard me")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(readStoredTodos()[0].text).toBe("Keep me");
    });
  });

  it("keeps the previous text when the edit is blank", async () => {
    const { user } = renderApp();
    await addTask(user, "Keep me");

    await user.dblClick(screen.getByText("Keep me"));
    const editor = screen.getByRole("textbox", { name: "Edit task" });
    await user.clear(editor);
    await user.type(editor, "   {Enter}");

    expect(screen.getByText("Keep me")).toBeInTheDocument();
  });
});

describe("deleting tasks", () => {
  it("deletes a single task", async () => {
    const { user } = renderApp();
    await addTask(user, "One");
    await addTask(user, "Two");

    await user.click(screen.getByRole("button", { name: 'Delete "One"' }));

    expect(screen.queryByText("One")).not.toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("1 of 1 remaining");
  });

  it("only clears completed tasks", async () => {
    const { user } = renderApp();
    await addTask(user, "Keep");
    await addTask(user, "Remove");
    await user.click(taskCheckbox("Remove"));

    await user.click(screen.getByRole("button", { name: "Clear completed" }));

    expect(screen.queryByText("Remove")).not.toBeInTheDocument();
    expect(screen.getByText("Keep")).toBeInTheDocument();

    await waitFor(() => {
      expect(readStoredTodos()).toHaveLength(1);
    });
  });

  it("hides Clear completed until there is a task, then disables it until one is done", async () => {
    const { user } = renderApp();
    expect(screen.queryByRole("button", { name: "Clear completed" })).not.toBeInTheDocument();

    await addTask(user, "Task A");
    expect(screen.getByRole("button", { name: "Clear completed" })).toBeDisabled();

    await user.click(taskCheckbox("Task A"));
    expect(screen.getByRole("button", { name: "Clear completed" })).toBeEnabled();
  });
});

describe("persistence", () => {
  it("restores saved tasks on mount", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: "a", text: "Saved task", completed: false, createdAt: 1 },
        { id: "b", text: "Done task", completed: true, createdAt: 2 },
      ]),
    );

    renderApp();

    expect(screen.getByText("Saved task")).toBeInTheDocument();
    expect(taskCheckbox("Done task")).toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent("1 of 2 remaining");
  });

  it("falls back to an empty list when the stored value is corrupt", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    window.localStorage.setItem(STORAGE_KEY, "{not json");

    renderApp();

    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument();
  });

  it("falls back to an empty list when the stored value is not an array", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ text: "nope" }));

    renderApp();

    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument();
  });

  it("drops stored entries without usable text", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: "a", text: "   ", completed: false },
        { id: "b", text: "Valid task", completed: false },
        { text: "missing id", completed: false },
        null,
        "not an object",
      ]),
    );

    renderApp();

    expect(screen.getByText("Valid task")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("keeps working when localStorage writes fail", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    const { user } = renderApp();
    await addTask(user, "In memory only");

    expect(screen.getByText("In memory only")).toBeInTheDocument();
    expect(warn).toHaveBeenCalled();
  });
});

