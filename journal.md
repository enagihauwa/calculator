# Project Journal

## 2026-08-29

### What I worked on
- Set up the project structure: `index.html`, `style.css`, and `script.js` as three fully
  separate files (no inline styles or scripts).
- Built the calculator UI: display area (expression + result), a 4-column button grid (numbers,
  operators, `AC`, `DEL`, `%`, `=`), a theme toggle button, and a history panel.
- Implemented calculator logic in JavaScript: number entry, chained operations (`+ - * /`),
  percentage, delete-last-digit, and clear-all, all driven by a small state object
  (`current`, `previous`, `operator`, `overwrite`).
- Added keyboard support so the same actions work via typing (digits, operators, Enter,
  Backspace, Escape, `%`), reusing the exact same handler functions as the on-screen buttons.
- Implemented persistence with `localStorage`:
  - `calculator.state` — the in-progress calculation, restored on page load.
  - `calculator.history` — up to 50 past calculations, rendered as a clickable list.
  - `calculator.theme` — light/dark preference.
- Styled the app with plain CSS using **CSS custom properties** defined on `:root`, with a
  `[data-theme="dark"]` block overriding those variables for dark mode. Chose this over Tailwind
  to keep the project dependency-free and runnable by simply opening `index.html`.
- Manually tested in a browser: verified buttons, keyboard shortcuts, theme toggle, and that
  reloading the page restores the last calculation and history correctly.

### Decisions made
- Avoided `eval()` for evaluating expressions in favor of explicit state tracking and a
  `compute()` switch statement — safer and easier to reason about.
- Split `localStorage` into three separate keys (state/history/theme) instead of one blob, so
  each piece of data can be cleared or updated independently (e.g. "Clear" on history shouldn't
  wipe the theme setting).
- Capped history at 50 entries to keep storage bounded.
- Made history entries clickable to reload a past result into the display, rather than making
  history a passive read-only log.

### Challenges & solutions
- **Risk of corrupted/missing localStorage data crashing the app on load** → wrapped all
  `JSON.parse` calls reading from storage in `try/catch` with fallback defaults.
- **Thousands-separator formatting conflicting with raw calculation values** → kept a raw numeric
  string in state for all math, and only formatted numbers at render time via a separate
  `formatNumber()` function.
- **State getting inconsistent across chained operators (e.g. `5 + - 3`)** → added an `overwrite`
  flag to state so the code knows whether the next digit should start a new number or append to
  the current one.

### Next steps / ideas (not yet implemented)
- Consider adding scientific functions (sqrt, power, etc.) if the scope expands.
- Consider adding unit tests for the `compute()` and `formatNumber()` functions.
