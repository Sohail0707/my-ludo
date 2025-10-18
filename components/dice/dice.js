// IMPORTS
import {
  gameState,
  gameBrain,
  switchToNextPlayer,
} from "../../utils/game-logic.js";
import { removeBoardCurrentPlayer } from "../../layout/board.js";
import { isDebugMode, getDebugDiceValue } from "../../debug/debug.js";
import { setupDebugUI } from "../../debug/debug-ui.js";

// DICE ELEMENTS
export const dice = document.createElement("div");
dice.className = "dice";

// Append dice to spinner
const diceSpinner = document.createElement("div");
diceSpinner.className = "dice-spinner";
diceSpinner.appendChild(dice);

// Append dice spinner to container
export const diceContainer = document.createElement("div");
diceContainer.className = "dice-container";
diceContainer.appendChild(diceSpinner);

diceContainer.addEventListener("click", () => {
  rollDice();
});

// Inject debug UI on game start
window.addEventListener("DOMContentLoaded", () => {
  setupDebugUI();
});

// Create Dice Faces
for (let i = 1; i <= 6; i++) {
  const face = document.createElement("div");
  face.className = `face face-${i}`;

  for (let j = 1; j <= i; j++) {
    // Create Dots
    const dot = document.createElement("div");
    dot.className = "dot";
    face.appendChild(dot);
  }

  switch (i) {
    // Assign face positions
    case 1:
      face.classList.add("front");
      break;
    case 2:
      face.classList.add("right");
      break;
    case 3:
      face.classList.add("top");
      break;
    case 4:
      face.classList.add("bottom");
      break;
    case 5:
      face.classList.add("left");
      break;
    case 6:
      face.classList.add("back");
      break;
  }

  dice.appendChild(face); // Append face to dice
}

// Function Show Dice Face
function showDiceFace(faceNumber) {
  let rotateX = 0;
  let rotateY = 0;

  // Set rotation values for each face
  switch (faceNumber) {
    case 1: // Front face (1 dot)
      rotateX = 0;
      rotateY = 0;
      break;
    case 2: // Right face (2 dots)
      rotateX = 0;
      rotateY = -90;
      break;
    case 3: // Top face (3 dots)
      rotateX = -90;
      rotateY = 0;
      break;
    case 4: // Bottom face (4 dots)
      rotateX = 90;
      rotateY = 0;
      break;
    case 5: // Left face (5 dots)
      rotateX = 0;
      rotateY = 90;
      break;
    case 6: // Back face (6 dots)
      rotateX = 0;
      rotateY = 180;
      break;
  }

  // Apply the rotation
  dice.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

// Function Roll Dice
function rollDice() {
  let diceValue;
  if (isDebugMode() && getDebugDiceValue() !== null) {
    diceValue = getDebugDiceValue();
    // Bypass dice animation for debug mode
    handleDiceValue(diceValue);
    removeBoardCurrentPlayer();
    return;
  } else {
    // Use multiple sources of randomness for extra randomness
    const time = Date.now();
    const random1 = Math.random();
    const random2 = Math.random();
    const random3 = Math.random();

    // Combine different random sources
    const seed = (time * random1 * random2 * random3) % 1;
    diceValue = Math.floor(seed * 6) + 1;
  }
  freezeDice(); // Freeze dice during roll
  diceSpinner.classList.add("spin");
  showDiceFace(diceValue);
  setTimeout(() => {
    diceSpinner.classList.remove("spin");
    handleDiceValue(diceValue);
    removeBoardCurrentPlayer();
  }, 500);
}

// Freeze dice
export function freezeDice() {
  diceContainer.style.pointerEvents = "none";
}

// Unfreeze dice
export function unfreezeDice() {
  diceContainer.style.pointerEvents = "auto";
}

// DICE RULES
export let consecutiveSixes = {
  player1: 0,
  player2: 0,
  player3: 0,
  player4: 0,
};

export function handleSpecialDiceRules(diceValue) {
  const playerKey = `player${gameState.currentPlayer}`;

  if (diceValue === 6) {
    consecutiveSixes[playerKey]++;
    console.log(
      `🎲 Player ${gameState.currentPlayer} rolled a 6! (${consecutiveSixes[playerKey]} in a row)`
    );

    // Three consecutive sixes = forfeit turn
    if (consecutiveSixes[playerKey] >= 3) {
      console.log(
        `⚠️ Player ${gameState.currentPlayer} rolled 3 sixes in a row! Turn forfeited.`
      );
      consecutiveSixes[playerKey] = 0;
      setTimeout(() => {
        switchToNextPlayer();
      }, 500);
      return true; // Return true to indicate turn is forfeited
    }
  } else {
    // Reset consecutive sixes counter for any non-six roll
    consecutiveSixes[playerKey] = 0;
  }

  return false; // Return false if turn continues normally
}

// Handle dice value and trigger game brain
export function handleDiceValue(value) {
  // Check for consecutive sixes first, before activating tokens
  const isTurnForfeited = handleSpecialDiceRules(value);

  // Only activate tokens if turn is not forfeited
  if (!isTurnForfeited) {
    gameBrain(value);
  } else {
    console.log(
      "🚫 Tokens not activated - turn forfeited due to consecutive 6's"
    );
  }
}
