/* =============================================
   STORAGE KEYS
   ============================================= */

const STORAGE_KEYS = {
  state: "calculator.state",
  history: "calculator.history",
  theme: "calculator.theme",
  sciOpen: "calculator.sciOpen",
};

/* =============================================
   DOM REFERENCES
   ============================================= */

const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const historyListEl = document.getElementById("history-list");
const themeToggleBtn = document.getElementById("theme-toggle");
const themePanel = document.getElementById("theme-panel");
const themePanelClose = document.getElementById("theme-panel-close");
const themeOptions = document.querySelectorAll(".theme-option");
const clearHistoryBtn = document.getElementById("clear-history");
const sciToggleBtn = document.getElementById("sci-toggle");
const sciButtonsEl = document.getElementById("sci-buttons");
const angleToggleBtn = document.getElementById("angle-toggle");
const memoryIndicatorEl = document.getElementById("memory-indicator");

const VALID_THEMES = ["light", "dark", "ocean", "sunset"];

/* =============================================
   CALCULATOR STATE
   ============================================= */

let state = {
  current: "0",
  previous: null,
  operator: null,
  overwrite: false,
  angleMode: "deg",
  memory: 0,
};

let history = [];

/* =============================================
   STATE PERSISTENCE
   ============================================= */

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.state));
    if (saved && typeof saved === "object") {
      state = { ...state, ...saved };
    }
  } catch (e) {
    state = {
      current: "0",
      previous: null,
      operator: null,
      overwrite: false,
      angleMode: "deg",
      memory: 0,
    };
  }
  angleToggleBtn.textContent = state.angleMode.toUpperCase();
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.state, JSON.stringify(state));
}

function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.history));
    history = Array.isArray(saved) ? saved : [];
  } catch (e) {
    history = [];
  }
}

function saveHistory() {
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
}

/* =============================================
   THEME SYSTEM
   - 4 themes: light, dark, ocean, sunset
   - Persists selection in localStorage
   - Updates CSS custom properties via data-theme attribute
   - Keyboard shortcut: Ctrl+Shift+T cycles through themes
   ============================================= */

function loadTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.theme);
  const theme = VALID_THEMES.includes(saved) ? saved : "light";
  applyTheme(theme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEYS.theme, theme);
  updateThemePanelActive(theme);
}

function updateThemePanelActive(activeTheme) {
  themeOptions.forEach((opt) => {
    opt.classList.toggle("active", opt.dataset.theme === activeTheme);
  });
}

function toggleThemePanel() {
  themePanel.classList.toggle("hidden");
}

function cycleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const idx = VALID_THEMES.indexOf(current);
  const next = VALID_THEMES[(idx + 1) % VALID_THEMES.length];
  applyTheme(next);
}

/* =============================================
   SCIENTIFIC PANEL
   ============================================= */

function loadSciPanel() {
  const isOpen = localStorage.getItem(STORAGE_KEYS.sciOpen) === "true";
  sciButtonsEl.classList.toggle("hidden", !isOpen);
  sciToggleBtn.classList.toggle("active", isOpen);
}

function toggleSciPanel() {
  const isOpen = !sciButtonsEl.classList.contains("hidden");
  sciButtonsEl.classList.toggle("hidden", isOpen);
  sciToggleBtn.classList.toggle("active", !isOpen);
  localStorage.setItem(STORAGE_KEYS.sciOpen, String(!isOpen));
}

function toggleAngleMode() {
  state.angleMode = state.angleMode === "deg" ? "rad" : "deg";
  angleToggleBtn.textContent = state.angleMode.toUpperCase();
  saveState();
}

/* =============================================
   CALCULATOR LOGIC
   ============================================= */

const OP_SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷", "^": "^" };

function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function applyUnary(op) {
  const x = Number(state.current);
  const toRad = (deg) => (deg * Math.PI) / 180;
  const angle = state.angleMode === "deg" ? toRad(x) : x;
  let result;
  switch (op) {
    case "sqrt":
      result = x < 0 ? NaN : Math.sqrt(x);
      break;
    case "square":
      result = x * x;
      break;
    case "reciprocal":
      result = x === 0 ? NaN : 1 / x;
      break;
    case "sin":
      result = Math.sin(angle);
      break;
    case "cos":
      result = Math.cos(angle);
      break;
    case "tan":
      result = Math.tan(angle);
      break;
    case "log":
      result = x <= 0 ? NaN : Math.log10(x);
      break;
    case "ln":
      result = x <= 0 ? NaN : Math.log(x);
      break;
    case "factorial":
      result = factorial(x);
      break;
    case "negate":
      result = x * -1;
      break;
    case "pi":
      result = Math.PI;
      break;
    case "e":
      result = Math.E;
      break;
    default:
      result = x;
  }
  state.current = Number.isFinite(result) ? String(result) : "Error";
  state.overwrite = true;
  saveState();
  render();
}

function formatNumber(numStr) {
  if (numStr === "" || numStr === "-") return numStr;
  const num = Number(numStr);
  if (Number.isNaN(num)) return numStr;
  const parts = numStr.split(".");
  const intPart = parts[0];
  const sign = intPart.startsWith("-") ? "-" : "";
  const intDigits = sign ? intPart.slice(1) : intPart;
  const formattedInt = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  let out = sign + formattedInt;
  if (parts.length > 1) out += "." + parts[1];
  return out;
}

function render() {
  resultEl.textContent = formatNumber(state.current);
  if (state.operator && state.previous !== null) {
    expressionEl.textContent = `${formatNumber(state.previous)} ${OP_SYMBOLS[state.operator]}`;
  } else {
    expressionEl.textContent = "";
  }
  memoryIndicatorEl.classList.toggle("hidden", !state.memory);
}

function handleMemory(action) {
  const value = Number(state.current);
  switch (action) {
    case "clear":
      state.memory = 0;
      break;
    case "recall":
      state.current = String(state.memory);
      state.overwrite = true;
      break;
    case "add":
      state.memory += value;
      state.overwrite = true;
      break;
    case "subtract":
      state.memory -= value;
      state.overwrite = true;
      break;
  }
  saveState();
  render();
}

function inputNumber(digit) {
  if (state.overwrite) {
    state.current = digit === "." ? "0." : digit;
    state.overwrite = false;
  } else if (digit === "0" && state.current === "0") {
    return;
  } else if (state.current === "0" && digit !== ".") {
    state.current = digit;
  } else {
    state.current += digit;
  }
  saveState();
  render();
}

function inputDecimal() {
  if (state.overwrite) {
    state.current = "0.";
    state.overwrite = false;
  } else if (!state.current.includes(".")) {
    state.current += ".";
  }
  saveState();
  render();
}

function clearAll() {
  state = { ...state, current: "0", previous: null, operator: null, overwrite: false };
  saveState();
  render();
}

function deleteLast() {
  if (state.overwrite) return;
  if (state.current.length <= 1 || (state.current.length === 2 && state.current.startsWith("-"))) {
    state.current = "0";
  } else {
    state.current = state.current.slice(0, -1);
  }
  saveState();
  render();
}

function toPercent() {
  state.current = String(Number(state.current) / 100);
  saveState();
  render();
}

function compute(a, b, op) {
  const x = Number(a);
  const y = Number(b);
  switch (op) {
    case "+":
      return x + y;
    case "-":
      return x - y;
    case "*":
      return x * y;
    case "/":
      return y === 0 ? NaN : x / y;
    case "^":
      return Math.pow(x, y);
    default:
      return y;
  }
}

function chooseOperator(op) {
  if (state.operator && !state.overwrite) {
    const result = compute(state.previous, state.current, state.operator);
    state.current = String(result);
    state.previous = result;
  } else {
    state.previous = state.current;
  }
  state.operator = op;
  state.overwrite = true;
  saveState();
  render();
}

function equals() {
  if (state.operator === null || state.previous === null) return;
  const a = state.previous;
  const b = state.current;
  const op = state.operator;
  const result = compute(a, b, op);
  const resultStr = Number.isFinite(result) ? String(result) : "Error";

  const entry = {
    expression: `${formatNumber(String(a))} ${OP_SYMBOLS[op]} ${formatNumber(String(b))}`,
    result: formatNumber(resultStr),
    ts: Date.now(),
  };
  history.unshift(entry);
  if (history.length > 50) history.pop();
  saveHistory();
  renderHistory();

  state.current = resultStr;
  state.previous = null;
  state.operator = null;
  state.overwrite = true;
  saveState();
  render();
}

/* =============================================
   HISTORY
   ============================================= */

function renderHistory() {
  historyListEl.innerHTML = "";
  if (history.length === 0) {
    const empty = document.createElement("div");
    empty.className = "history-empty";
    empty.textContent = "No history yet";
    historyListEl.appendChild(empty);
    return;
  }
  history.forEach((entry) => {
    const li = document.createElement("li");
    li.innerHTML = `<div class="h-expr">${entry.expression}</div><div class="h-result">${entry.result}</div>`;
    li.addEventListener("click", () => {
      state.current = String(Number(entry.result.replace(/,/g, "")));
      state.previous = null;
      state.operator = null;
      state.overwrite = true;
      saveState();
      render();
    });
    historyListEl.appendChild(li);
  });
}

function clearHistory() {
  history = [];
  saveHistory();
  renderHistory();
}

/* =============================================
   EVENT LISTENERS
   ============================================= */

// Button clicks (calculator actions)
document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    const value = btn.dataset.value;
    if (action === "number") inputNumber(value);
    else if (action === "decimal") inputDecimal();
    else if (action === "clear") clearAll();
    else if (action === "delete") deleteLast();
    else if (action === "percent") toPercent();
    else if (action === "operator") chooseOperator(value);
    else if (action === "equals") equals();
    else if (action === "unary") applyUnary(value);
    else if (action === "toggle-angle") toggleAngleMode();
    else if (action === "memory") handleMemory(value);
  });
});

// Theme panel toggle
themeToggleBtn.addEventListener("click", toggleThemePanel);
themePanelClose.addEventListener("click", toggleThemePanel);

// Theme option selection
themeOptions.forEach((opt) => {
  opt.addEventListener("click", () => {
    applyTheme(opt.dataset.theme);
    toggleThemePanel();
  });
});

// History & sci panel
clearHistoryBtn.addEventListener("click", clearHistory);
sciToggleBtn.addEventListener("click", toggleSciPanel);

// Close theme panel when clicking outside
document.addEventListener("click", (e) => {
  if (
    !themePanel.classList.contains("hidden") &&
    !themePanel.contains(e.target) &&
    e.target !== themeToggleBtn
  ) {
    themePanel.classList.add("hidden");
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl+Shift+T: cycle through themes
  if (e.ctrlKey && e.shiftKey && e.key === "T") {
    e.preventDefault();
    cycleTheme();
    return;
  }
  if (e.key >= "0" && e.key <= "9") inputNumber(e.key);
  else if (e.key === ".") inputDecimal();
  else if (["+", "-", "*", "/"].includes(e.key)) chooseOperator(e.key);
  else if (e.key === "Enter" || e.key === "=") equals();
  else if (e.key === "Backspace") deleteLast();
  else if (e.key === "Escape") clearAll();
  else if (e.key === "%") toPercent();
});

/* =============================================
   INITIALIZATION
   ============================================= */

loadTheme();
loadState();
loadHistory();
loadSciPanel();
render();
renderHistory();
