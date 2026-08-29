# Calculator

## What this project is

A browser-based calculator built with plain HTML, CSS, and JavaScript. It supports the four basic
arithmetic operations, percentages, keyboard input, a light/dark theme toggle, and a calculation
history — all of which persist between visits using the browser's Web Storage (`localStorage`).

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
