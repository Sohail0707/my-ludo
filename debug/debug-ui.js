// Debug UI for dice value input
import {
  activateDebugMode,
  deactivateDebugMode,
  setDebugDiceValue,
  isDebugMode,
} from "./debug.js";

export function setupDebugUI() {
  // Create debug controls container
  const container = document.createElement("div");
  container.id = "debug-controls";
  container.style.position = "fixed";
  container.style.top = "10px";
  container.style.right = "10px";
  container.style.background = "#fff8";
  container.style.border = "1px solid #ccc";
  container.style.padding = "10px";
  container.style.zIndex = 9999;
  container.style.borderRadius = "8px";
  container.style.boxShadow = "0 2px 8px #0002";

  // Debug mode toggle
  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.id = "debug-toggle";
  toggle.style.marginRight = "8px";

  const label = document.createElement("label");
  label.htmlFor = "debug-toggle";
  label.textContent = "Debug Dice";
  label.style.marginRight = "12px";

  // Dice value input
  const input = document.createElement("input");
  input.type = "number";
  input.id = "debug-dice-value";
  input.placeholder = "Dice value (any integer)";
  input.style.width = "100px";
  input.style.marginRight = "8px";
  input.disabled = true;

  // Activate/deactivate debug mode
  toggle.addEventListener("change", (e) => {
    if (toggle.checked) {
      activateDebugMode();
      input.disabled = false;
    } else {
      deactivateDebugMode();
      input.disabled = true;
      input.value = "";
    }
  });

  // Set dice value
  input.addEventListener("input", (e) => {
    const val = parseInt(input.value);
    if (isDebugMode() && !isNaN(val)) {
      setDebugDiceValue(val);
    }
  });

  container.appendChild(toggle);
  container.appendChild(label);
  container.appendChild(input);

  document.body.appendChild(container);
}
