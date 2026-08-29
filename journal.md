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
- Consider adding unit tests for the `compute()` and `formatNumber()` functions.

## 2026-08-29 (later) — Scientific functions

### What I worked on
- Expanded scope to a scientific calculator: added a collapsible "Sci" panel (toggled via a new
  `xʸ` button in the top bar) containing `sin`, `cos`, `tan`, `log`, `ln`, `√x`, `x²`, `xʸ`, `1/x`,
  `π`, `e`, `n!`, `±`, and a `DEG`/`RAD` toggle.
- Implemented unary operations (`sqrt`, `square`, `reciprocal`, `log`, `ln`, `sin`, `cos`, `tan`,
  `factorial`, `negate`, `pi`, `e`) via a single `applyUnary()` function, keeping them consistent
  with the existing state model (`current`, `overwrite`).
- Added `xʸ` (power) as a binary operator alongside `+ - * /`, handled by adding a `"^"` case to
  the existing `compute()` switch — no new code paths needed for chaining or `=`.
- Added degrees/radians support for trig functions, defaulting to degrees, with the mode
  persisted in the same `calculator.state` object already used for the rest of the calculator.
- Persisted whether the scientific panel is open/closed in a new `calculator.sciOpen`
  `localStorage` key, so the UI stays in the state the user left it in.

### Decisions made
- Treated the scientific panel as **collapsible and off by default** rather than always visible,
  to keep the basic calculator uncluttered for users who don't need it.
- Reused the existing `overwrite` state flag for unary results (same as pressing `=`), so typing a
  new number after e.g. `√x` starts fresh instead of appending digits.
- Put `xʸ` (power) through the same operator/compute pipeline as `+ - * /` instead of writing a
  separate code path, since it behaves identically as a binary operation.
- Defaulted trig functions to degrees (more intuitive for most casual users) with an explicit
  `DEG`/`RAD` toggle rather than silently assuming radians.

### Challenges & solutions
- **Ambiguity of sin/cos/tan input units** → added an explicit angle-mode toggle (`DEG`/`RAD`)
  stored in state, converting degrees to radians internally before calling `Math.sin/cos/tan`,
  so results are correct and predictable regardless of mode.
- **Invalid inputs to unary functions** (e.g. `sqrt` of a negative number, `log`/`ln` of a
  non-positive number, `1/x` of zero, `n!` of a negative or non-integer) → each case explicitly
  checks its domain and falls back to an `"Error"` display via the existing
  `Number.isFinite(result)` guard, rather than letting `NaN`/`Infinity` leak into the display or
  into `localStorage`.
- **Keeping the 4-column button grid layout consistent** when adding many new buttons → reused
  the existing `.buttons` grid CSS for a second `.sci-buttons` grid rather than inventing a new
  layout system, and reused the existing `.wide` (2-column span) class for `n!` and `±`.

### Next steps / ideas (not yet implemented)
- Consider unit tests for `applyUnary()`, `factorial()`, and the degree/radian conversion.
- Consider a memory feature (`M+`, `M-`, `MR`, `MC`) if scope expands further.
