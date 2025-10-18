// ==========================================================
// =================IMPORTS AND DEPENDENCIES=================
import { moveToken } from "../components/token/token.js";

// ==========================================================
// ==================GAME STATE MANAGEMENT==================
export const gameState = {
  playerCount: 4,
  currentPlayer: 1,
  diceValue: 0,
  activeTokens: [], // Tokens that can be moved in the current turn
};
export let playerCount = gameState.playerCount;
export let currentPlayer = gameState.currentPlayer;
export let diceValue = gameState.diceValue;
export let activeTokens = gameState.activeTokens;
export const getCurrentPlayer = () => gameState.currentPlayer;

export let finishedPlayers = new Set(); // Set to track which players have finished
export let playerRankings = []; // Array to store players in finishing order [1st, 2nd, 3rd]

// ==========================================================
// =================SWITCH TO NEXT PLAYER=================
export function switchToNextPlayer() {
  let nextPlayer = gameState.currentPlayer;
  let attempts = 0;
  const maxAttempts = 4; // Prevent infinite loop

  do {
    nextPlayer = (nextPlayer % 4) + 1;
    attempts++;
  } while (finishedPlayers.has(nextPlayer) && attempts < maxAttempts);

  // If all players are finished, don't switch
  if (attempts >= maxAttempts) {
    console.log("⚠️ All players finished - no player switching needed");
    return;
  }

  gameState.currentPlayer = nextPlayer;
  currentPlayer = gameState.currentPlayer; // Keep the exported variable in sync

  // Update the App object with the new current player
  if (window.App) {
    window.App.currentPlayer = gameState.currentPlayer;
    window.App.gameState = gameState; // Also expose the gameState object
  }

  // Move dice to the next player's position
  document
    .querySelector(`.dice-control.position-${gameState.currentPlayer}`)
    .appendChild(App.diceContainer);

  App.unfreezeDice(); // Unfreeze dice for next player
  App.updateCurrentPlayerOnBoard(gameState.currentPlayer);

  console.log(`🔄 Switched to Player ${gameState.currentPlayer}`);
}

// ============================================================================
// MAIN GAME BRAIN - CENTRAL CONTROLLER
// The core game logic that orchestrates all game mechanics after dice roll
// ============================================================================
export function gameBrain(diceValue) {
  console.log(
    `🎮 Game Brain: Player ${gameState.currentPlayer} rolled ${diceValue}`
  );

  // Update game state with dice value
  gameState.diceValue = diceValue;

  // Find all tokens that can move for current player
  const moveableTokens = App.findMoveableTokens(
    gameState.currentPlayer,
    diceValue
  );

  // Handle different scenarios based on number of moveable tokens
  if (moveableTokens.length === 0) {
    App.handleNoMoveableTokens();
  } else if (moveableTokens.length === 1) {
    App.handleSingleMoveableToken(moveableTokens[0], diceValue);
  } else {
    App.handleMultipleMoveableTokens(moveableTokens, diceValue);
  }

  // Note: Special dice rules (consecutive sixes) are now handled before gameBrain() is called
}

// ============================================================================
// WIN CONDITION MANAGEMENT
// Functions to check for game completion and handle end-game scenarios
// ============================================================================

/**
 * Check if a player has won the game
 * Determines if all 4 tokens of a player have reached the finish
 *
 * @param {number} playerNumber - Player number to check for win condition
 */
function checkWinCondition(playerNumber) {
  const playerTokens = App.tokens.filter(
    (token) => parseInt(token.dataset.player) === playerNumber
  );

  const finishedTokens = playerTokens.filter((token) =>
    token.classList.contains("finished")
  );

  if (finishedTokens.length === 4) {
    // Player has finished all tokens - they win!
    const winnerPosition = playerRankings.length + 1; // 1st, 2nd, 3rd position

    console.log(
      `🏆 Player ${playerNumber} wins ${getOrdinalPosition(
        winnerPosition
      )} place!`
    );

    // Record the win
    finishedPlayers.add(playerNumber);
    playerRankings.push(playerNumber);

    // Mark player as winner on the board
    App.makePlayerWin(playerNumber, winnerPosition);

    // Deactivate the winning player - they can't play anymore
    deactivateFinishedPlayer(playerNumber);

    // Check if we should end the game
    checkGameEndCondition();
  }
}

/**
 * Deactivate a finished player from further gameplay
 * Removes all their tokens from active play
 *
 * @param {number} playerNumber - Player number to deactivate
 */
function deactivateFinishedPlayer(playerNumber) {
  console.log(
    `🚫 Player ${playerNumber} is now inactive (finished all tokens)`
  );

  // Deactivate all tokens for this player
  App.tokens.forEach((token) => {
    if (parseInt(token.dataset.player) === playerNumber) {
      token.classList.remove("active");
      token.dataset.active = "false";
    }
  });
}

/**
 * Check if the game should end based on current rankings
 * Game ends after 3rd place is determined (for 4-player game)
 */
function checkGameEndCondition() {
  const totalPlayers = gameState.playerCount;
  const finishedCount = playerRankings.length;

  if (totalPlayers === 4 && finishedCount >= 3) {
    // For 4-player game: stop after 3rd place (4th place is automatic)
    console.log("🎊 Game Complete! Final Rankings:");
    console.log(`🥇 1st Place: Player ${playerRankings[0]}`);
    console.log(`🥈 2nd Place: Player ${playerRankings[1]}`);
    console.log(`🥉 3rd Place: Player ${playerRankings[2]}`);

    // Find 4th place player
    const allPlayers = [1, 2, 3, 4];
    const fourthPlace = allPlayers.find((p) => !playerRankings.includes(p));
    if (fourthPlace) {
      console.log(`4️⃣ 4th Place: Player ${fourthPlace}`);
      playerRankings.push(fourthPlace);
      App.makePlayerWin(fourthPlace, 4);
    }

    handleGameEnd();
  } else if (totalPlayers === 2 && finishedCount >= 1) {
    // For 2-player game: stop after 1st place
    console.log("🎊 Game Complete!");
    console.log(`🥇 Winner: Player ${playerRankings[0]}`);

    // Find 2nd place player
    const allPlayers = [1, 3]; // Assuming 2-player uses players 1 and 3
    const secondPlace = allPlayers.find((p) => !playerRankings.includes(p));
    if (secondPlace) {
      console.log(`🥈 2nd Place: Player ${secondPlace}`);
      playerRankings.push(secondPlace);
      App.makePlayerWin(secondPlace, 2);
    }

    handleGameEnd();
  }
  // Game continues if we haven't reached the end condition
}

/**
 * Get ordinal position string (1st, 2nd, 3rd, etc.)
 * @param {number} position - Position number
 * @returns {string} Ordinal string
 */
function getOrdinalPosition(position) {
  const ordinals = {
    1: "1st",
    2: "2nd",
    3: "3rd",
    4: "4th",
  };
  return ordinals[position] || `${position}th`;
}

/**
 * Handle game end procedures
 * Executes final end-game logic when all rankings are determined
 */
function handleGameEnd() {
  console.log("🎊 Game Over! All rankings determined.");

  // Freeze dice to prevent further play
  App.freezeDice();

  // Remove current player indicator from board
  App.removeBoardCurrentPlayer();

  // Additional end game logic can be added here
  // Example: Show final results modal, save scores, etc.
}

// ============================================================================
// LEGACY COMPATIBILITY FUNCTIONS
// Maintained for backward compatibility with existing code
// ============================================================================

/**
 * Legacy game update function
 * @deprecated Use gameBrain() directly instead
 */
export function updateGame() {
  console.log("⚠️  updateGame() is deprecated. Use gameBrain() instead.");
  if (gameState.diceValue > 0) {
    gameBrain(gameState.diceValue);
  }
}

// ============================================================================
// GAME INITIALIZATION
// Functions to set up and reset the game to initial state
// ============================================================================

/**
 * Initialize or reset the game to starting conditions
 * Sets up initial game state, clears tracking variables, and prepares for play
 */
export function initializeGame() {
  console.log("🎮 Initializing Ludo Game...");

  // Reset core game state
  gameState.currentPlayer = 1;
  gameState.diceValue = 0;
  gameState.activeTokens = [];

  // Reset special condition tracking
  Object.keys(consecutiveSixes).forEach((key) => {
    consecutiveSixes[key] = 0;
  });

  // Reset game completion tracking
  playerRankings.length = 0;
  finishedPlayers.clear();

  // Ensure App object is properly synchronized
  if (window.App) {
    window.App.currentPlayer = gameState.currentPlayer;
    window.App.gameState = gameState;
  }

  console.log(`🎯 Game ready! Player ${gameState.currentPlayer} starts.`);
}

// ============================================================================
// UTILITY AND HELPER FUNCTIONS
// Small utility functions used throughout the game logic
// ============================================================================

/**
 * Get player data object by player number
 * Returns the player's position arrays and game data
 *
 * @param {number} playerNumber - Player number (1-4)
 * @returns {Object} Player data object with positions and initial positions
 */
export function getPlayerData(playerNumber) {
  return App[`player${playerNumber}`];
}
