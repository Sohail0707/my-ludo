// Test file to verify all imports are working
import { diceContainer } from "./components/dice/dice.js";
import { generateStepBoxes } from "./components/step-boxes/step-boxes.js";
import { initializeTokens } from "./components/token/token.js";
import { gameState, initializeGame } from "./utils/game-logic.js";

console.log("✅ All imports successful!");
console.log("diceContainer:", diceContainer);
console.log("generateStepBoxes:", typeof generateStepBoxes);
console.log("initializeTokens:", typeof initializeTokens);
console.log("gameState:", gameState);
console.log("initializeGame:", typeof initializeGame);
