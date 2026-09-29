import { useEffect, useState } from "react";

/**
 * useState that mirrors its value into localStorage.
 *
 * - The initial value is read lazily (once, during the first render).
 * - `sanitize` turns whatever was stored — possibly corrupt or hand-edited — into
 *   the exact shape the app expects.
 * - Reads and writes are guarded, so an unavailable or full localStorage (private
 *   browsing, quota, disabled storage) degrades to memory-only instead of throwing.
 *
 * @param {string} key localStorage key
 * @param {*} initialValue value to use when nothing valid is stored
 * @param {(value: *) => *} [sanitize] normalises a parsed value
 * @returns {[*, React.Dispatch<React.SetStateAction<*>>]} tuple like useState
 */
export function useLocalStorage(key, initialValue, sanitize = (value) => value) {
  const [value, setValue] = useState(() => readStored(key, initialValue, sanitize));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Could not write "${key}" to localStorage:`, error);
    }
  }, [key, value]);

  return [value, setValue];
}

/** Read + sanitize a stored value, falling back to `initialValue`. Never throws. */
function readStored(key, initialValue, sanitize) {
  let stored;

  try {
    stored = window.localStorage.getItem(key);
  } catch (error) {
    console.warn(`Could not read "${key}" from localStorage:`, error);
    return sanitize(initialValue);
  }

  if (stored === null) return sanitize(initialValue);

  try {
    return sanitize(JSON.parse(stored));
  } catch (error) {
    console.warn(`Ignoring unreadable value for "${key}":`, error);
    return sanitize(initialValue);
  }
}
