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

## 2026-08-29 (later still) — Memory feature

### What I worked on
- Added a standard calculator memory feature: `MC` (memory clear), `MR` (memory recall), `M+`
  (memory add), `M-` (memory subtract), as an always-visible row between the display and the
  scientific panel.
- Added a small "M" indicator badge in the display that appears whenever the stored memory value
  is non-zero, so it's always clear when memory holds something.
- Persisted the memory value as a `memory` field on the existing `calculator.state` object —
  no new `localStorage` key needed since it's part of the same in-progress-calculation state.

### Decisions made
- Made the memory row **always visible** rather than tucking it inside the collapsible scientific
  panel, since memory recall/store is a standard everyday calculator feature, not an advanced one.
- `AC` (clear-all) intentionally does **not** clear memory — only `MC` does. This matches how
  physical and OS calculators behave: clearing the current calculation shouldn't wipe a value the
  user deliberately stored. This required changing `clearAll()` to spread the existing state
  (`{ ...state, ... }`) instead of replacing it outright, so `memory` and `angleMode` survive an
  `AC` press.
- `M+`/`M-`/`MR` set the `overwrite` flag (same convention used after `=` and unary functions), so
  typing a new digit afterward starts a fresh number instead of appending to whatever was on
  screen.

### Challenges & solutions
- **`clearAll()` previously replaced the whole state object**, which would have silently reset
  `memory` (and `angleMode`) back to defaults every time the user pressed `AC` — a subtle bug that
  would only show up once memory support was added. Solved by switching `clearAll()` to spread the
  current state and only override the calculation-related fields.
- **Showing memory status without cluttering the display** → a compact bordered "M" badge that
  toggles visibility based on `!!state.memory`, reusing the existing `render()` pass so it never
  gets out of sync with the actual stored value.

### Next steps / ideas (not yet implemented)
- Consider unit tests for `applyUnary()`, `factorial()`, `handleMemory()`, and the degree/radian
  conversion.

## 2026-09-03 — Multi-theme system

### What I worked on
- Expanded the theme system from a two-state light/dark toggle to a four-theme selector supporting
  Light, Dark, Ocean, and Sunset themes.
- Added two new CSS variable blocks: `[data-theme="ocean"]` (deep navy backgrounds, sky-blue
  operators, teal equals) and `[data-theme="sunset"]` (dark purple backgrounds, amber operators,
  orange equals). Each block defines the same set of custom properties so all themed elements
  transition smoothly.
- Replaced the single `#theme-toggle` button (which toggled between light/dark) with a `🎨` button
  that opens a theme selector panel. The panel contains four option buttons, each showing a circular
  color preview and a label. The active theme is highlighted with a colored border matching the
  theme's accent.
- Added `applyTheme(theme)` to set the `data-theme` attribute, persist the choice to `localStorage`,
  and update the active indicator. Added `cycleTheme()` to loop through themes in order for the
  keyboard shortcut.
- Implemented a `Ctrl+Shift+T` keyboard shortcut that cycles through all four themes without
  opening the panel.
- Added click-outside-to-close behavior for the theme panel so it dismisses naturally.
- Added three new CSS custom properties (`--theme-panel-bg`, `--theme-panel-border`,
  `--theme-option-active-border`) to each theme block, so the panel itself adapts its background,
  border, and active indicator color per theme.
- Improved theme selector visibility in light mode by switching the preview circle border from
  `1px solid rgba(0,0,0,0.1)` to `2px solid var(--border)` and bumping label font-weight to `600`.

### Decisions made
- Chose a selector panel with visual previews over a `<select>` dropdown so users can see each
  theme's color palette before choosing it — more informative and more visually consistent with the
  calculator's design.
- Placed the panel as an absolutely-positioned element inside `.app` (which has `position: relative`)
  so it overlays the calculator without affecting layout.
- Kept the same `calculator.theme` localStorage key and just changed the stored values from
  `"light"`/`"dark"` to any of the four valid theme names, maintaining backward compatibility
  (a saved `"light"` or `"dark"` value still works; unknown values fall back to `"light"`).
- Used a `VALID_THEMES` array and `indexOf` + modular arithmetic for `cycleTheme()` so adding a
  fifth theme later only requires adding it to the array and its CSS block — no logic changes
  needed.

### Challenges & solutions
- **Theme preview circles invisible in light mode** → the `1px solid rgba(0,0,0,0.1)` border was
  too faint against the white panel background, and the light theme preview showed `#ffffff` which
  blended in. Solved by using `2px solid var(--border)` so the border color adapts to each theme,
  and bumping label font-weight for readability.
- **Panel positioning** → needed the panel to float above the calculator without pushing other
  elements around. Solved by adding `position: relative` to `.app` and using `position: absolute`
  with `top`/`right` on the panel.

### Next steps / ideas (not yet implemented)
- Consider adding a fifth "high contrast" or "pastel" theme.
- Consider adding theme transition animations on individual elements (e.g. a brief flash or fade)
  rather than relying solely on CSS transition properties.
