import { diceContainer } from "./components/dice/dice.js";
import { generateStepBoxes } from "./components/step-boxes/step-boxes.js";
import { initializeTokens } from "./components/token/token.js";
import { initializeGame } from "./utils/game-logic.js";

// Initialize game components
generateStepBoxes();
initializeTokens();

document.querySelector(".dice-control.position-1").appendChild(diceContainer);

// Initialize the game
initializeGame();
