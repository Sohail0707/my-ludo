import * as Dice from "./components/dice/dice.js";
import * as StepBoxes from "./components/step-boxes/step-boxes.js";
import * as Token from "./components/token/token.js";
import * as Board from "./layout/board.js";
import * as Player from "./utils/player-data.js";
import * as Game from "./utils/game-logic.js";

const App = {
  ...Dice,
  ...StepBoxes,
  ...Token,
  ...Board,
  ...Player,
  ...Game,
};
window.App = App;

// Ensure currentPlayer is properly accessible and expose gameState
App.currentPlayer = App.gameState
  ? App.gameState.currentPlayer
  : App.currentPlayer || 1;
App.gameState = App.gameState || { currentPlayer: 1 };

App.generateStepBoxes();
App.initializeTokens();

// Add token click handling
document.addEventListener("click", (event) => {
  const token = event.target.closest(".token");
  if (!token) return;

  // Check if token is active
  if (token.dataset.active === "true") {
    const playerNumber = parseInt(token.dataset.player);
    const steps = parseInt(token.dataset.steps);

    // Only allow current player to move their tokens
    if (playerNumber === App.gameState.currentPlayer) {
      handleTokenClick(token, steps);
    }
  }
});

/**
 * Handle token click for movement
 */
function handleTokenClick(token, steps) {
  // Deactivate all tokens
  App.deactivateAllTokens();

  // Execute the movement using the new game logic handler
  App.handleTokenMovement(token, steps);

  // Freeze dice during movement
  App.freezeDice();
}

document
  .querySelector(".dice-control.position-1")
  .appendChild(App.diceContainer);

// Initialize the game
App.initializeGame();
