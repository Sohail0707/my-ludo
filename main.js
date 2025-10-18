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

document
  .querySelector(".dice-control.position-1")
  .appendChild(App.diceContainer);

// Initialize the game
App.initializeGame();
