// Debug Dice Control
// Allows setting dice value manually for testing

let debugMode = false;
let debugValue = null;

export function activateDebugMode() {
  debugMode = true;
}

export function deactivateDebugMode() {
  debugMode = false;
  debugValue = null;
}

export function isDebugMode() {
  return debugMode;
}

export function setDebugDiceValue(value) {
  debugValue = value;
}

export function getDebugDiceValue() {
  return debugValue;
}

// Patch dice roll function
export function overrideDiceRoll(originalRollFunction) {
  return function () {
    if (debugMode && debugValue !== null) {
      return debugValue;
    }
    return originalRollFunction();
  };
}
