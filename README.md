# Calculator

## What this project is

A browser-based calculator built with plain HTML, CSS, and JavaScript. It supports the four basic
arithmetic operations, percentages, a collapsible scientific mode (square root, powers, trig
functions, logarithms, factorial, and constants), a memory feature (`MC`/`MR`/`M+`/`M-`), keyboard
input, a light/dark theme toggle, and a calculation history — all of which persist between visits
using the browser's Web Storage (`localStorage`).

## Who it's for

Anyone who wants a fast, no-install calculator that runs directly in a browser — and, from a
learning standpoint, anyone studying a small, dependency-free example of DOM manipulation and
client-side persistence (no frameworks, no build step).

## The problem it solves

Most simple calculator demos reset to zero on every page reload and forget your last calculation.
This project solves that by persisting the in-progress state, the full calculation history, and
the user's theme preference in `localStorage`, so closing and reopening the page (or refreshing it)
picks up exactly where you left off.

## Technologies and tools used

- **HTML** — structure/markup (`index.html`)
- **CSS** — styling via **CSS custom properties** (`:root` variables) for theming, with a
  `[data-theme="dark"]` override block for dark mode (`style.css`)
- **JavaScript (vanilla, no frameworks)** — calculator logic, event handling, and persistence
  (`script.js`)
- **Web Storage API (`localStorage`)** — persists calculator state, history, and theme

The three files are kept fully separate (no inline styles or scripts) so each concern — markup,
presentation, behavior — stays independent and easy to maintain.

## Important decisions

- **CSS variables over a framework.** Tailwind or a CSS-in-JS approach were options, but plain CSS
  with custom properties was chosen so the project has zero build tooling and zero external
  dependencies — it runs by just opening `index.html`. Variables still make theming (light/dark)
  and future re-skinning straightforward.
- **No `eval()` for math.** Rather than evaluating typed expressions as strings, the calculator
  tracks `previous`, `operator`, and `current` values explicitly and computes results with a
  `switch` statement. This avoids the security and correctness risks of evaluating arbitrary
  strings as JavaScript.
- **State persisted as JSON in `localStorage`.** Three separate keys are used
  (`calculator.state`, `calculator.history`, `calculator.theme`) so each concern can be read,
  written, and cleared independently (e.g. clearing history doesn't touch the current calculation
  or theme).
- **History capped at 50 entries.** Keeps `localStorage` usage bounded and the history panel
  scannable, rather than growing indefinitely.
- **Click-to-reuse history.** Clicking a past history entry loads its result back into the
  display, making the history functionally useful rather than just a log.
- **Scientific functions kept in a collapsible panel, off by default.** Rather than always
  showing sin/cos/tan/log/etc., they're tucked behind a toggle so the everyday calculator stays
  simple, while `xʸ` (power) is treated as a regular binary operator so it can reuse the existing
  operator/`compute()` pipeline instead of a separate code path.
- **Degrees by default for trig functions, with an explicit DEG/RAD toggle.** Silently assuming
  radians is a common source of "wrong answer" bugs in simple calculators; degrees are more
  intuitive for casual use, and the mode is shown on the toggle button itself so it's never
  ambiguous which one is active.
- **Memory row kept always visible, not hidden behind the scientific panel.** `MC`/`MR`/`M+`/`M-`
  is a standard everyday feature, not an advanced one, so it stays reachable regardless of whether
  scientific mode is open.
- **`AC` (clear-all) does not clear memory — only `MC` does.** Matches conventional calculator
  behavior: clearing the current calculation shouldn't discard a value the user deliberately
  stored.

## Challenges encountered and how they were solved

- **Restoring state safely on load.** Corrupted or missing `localStorage` data (e.g. first visit,
  or manually cleared storage) could crash the app on load. Solved by wrapping every
  `JSON.parse(localStorage.getItem(...))` call in a `try/catch` with a sane fallback default.
- **Formatting numbers without breaking calculations.** Adding thousands separators (e.g.
  `1,234`) for readability meant the *displayed* string could no longer be used directly as a
  number. Solved by keeping the raw numeric string in `state.current` for all calculations and
  only formatting for display via a dedicated `formatNumber()` function.
- **Preventing chained-operator glitches.** Pressing an operator, then another operator, then
  a number could leave the calculator in an inconsistent state (e.g. overwriting the wrong value).
  Solved with an `overwrite` flag on state that tracks whether the next digit typed should start a
  fresh number or append to the current one.
- **Keeping keyboard and button input consistent.** Both input paths needed to trigger identical
  logic. Solved by routing both the button click handlers and the `keydown` listener through the
  same shared functions (`inputNumber`, `chooseOperator`, `equals`, etc.) instead of duplicating
  logic.
- **Invalid inputs to scientific functions** (square root of a negative number, log/ln of a
  non-positive number, `1/x` of zero, factorial of a negative or non-integer). Solved by having
  each case in `applyUnary()` check its own domain and fall back to displaying `"Error"` rather
  than letting `NaN` or `Infinity` propagate into the display or get saved to `localStorage`.
- **`AC` silently resetting memory.** `clearAll()` originally replaced the entire state object,
  which would have wiped `memory` (and `angleMode`) every time `AC` was pressed. Fixed by spreading
  the existing state (`{ ...state, ... }`) and only overriding the calculation-related fields.
