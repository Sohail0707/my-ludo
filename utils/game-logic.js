// Import token functions
import { moveToken } from "../components/token/token.js";

// Game Configuration - Use an object to maintain references
export const gameState = {
  playerCount: 4,
  currentPlayer: 1,
  diceValue: 0,
  activeTokens: [], // Tokens that can be moved in the current turn
};

// Export individual variables for backward compatibility
export let playerCount = gameState.playerCount;
export let currentPlayer = gameState.currentPlayer;
export let diceValue = gameState.diceValue;
export let activeTokens = gameState.activeTokens;

// Export a getter function to ensure we always get the current value
export const getCurrentPlayer = () => gameState.currentPlayer;

// Consecutive sixes tracking for each player
export let consecutiveSixes = {
  player1: 0,
  player2: 0,
  player3: 0,
  player4: 0,
};

// Ranking System
export let playerRankings = []; // Array to store players in finishing order [1st, 2nd, 3rd]
export let finishedPlayers = new Set(); // Set to track which players have finished

export function switchToNextPlayer() {
  gameState.currentPlayer = (gameState.currentPlayer % 4) + 1;
  currentPlayer = gameState.currentPlayer; // Keep the exported variable in sync

  // Update the App object with the new current player
  if (window.App) {
    window.App.currentPlayer = gameState.currentPlayer;
    window.App.gameState = gameState; // Also expose the gameState object
  }

  // shift the dice to the next player
  document
    .querySelector(`.dice-control.position-${gameState.currentPlayer}`)
    .appendChild(App.diceContainer);
  App.unfreezeDice(); // Unfreeze dice for next player
}

// =============================================================================
// GAME BRAIN - Central game logic controller
// =============================================================================

/**
 * Main game brain function - handles all game logic after dice roll
 * This is the central controller that manages token states, player switching, etc.
 */
export function gameBrain(diceValue) {
  console.log(
    `🎮 Game Brain: Player ${gameState.currentPlayer} rolled ${diceValue}`
  );

  // Update game state
  gameState.diceValue = diceValue;

  // Step 1: Find all moveable tokens for current player
  const moveableTokens = findMoveableTokens(gameState.currentPlayer, diceValue);

  // Step 2: Handle different scenarios based on moveable tokens
  if (moveableTokens.length === 0) {
    // No tokens can move - switch to next player
    handleNoMoveableTokens();
  } else if (moveableTokens.length === 1) {
    // Only one token can move - auto-move it
    handleSingleMoveableToken(moveableTokens[0], diceValue);
  } else {
    // Multiple tokens can move - activate them for player choice
    handleMultipleMoveableTokens(moveableTokens, diceValue);
  }

  // Step 3: Handle special dice rules (sixes, consecutive sixes, etc.)
  handleSpecialDiceRules(diceValue);
}

/**
 * Find all tokens that can move for the current player
 */
function findMoveableTokens(playerNumber, diceValue) {
  const moveableTokens = [];

  if (!App.tokens) return moveableTokens;

  App.tokens.forEach((token) => {
    if (parseInt(token.dataset.player) !== playerNumber) return;

    const currentPosition = parseInt(token.dataset.position);
    const isAtHome = currentPosition === -1;

    if (isAtHome && diceValue === 6) {
      // Token at home can only move with a 6
      moveableTokens.push({
        token: token,
        moveType: "exit_home",
        canMove: true,
      });
    } else if (!isAtHome && currentPosition >= 0) {
      // Token on board - check if it can move without overshooting finish
      const playerData = getPlayerData(playerNumber);
      const newPosition = currentPosition + diceValue;
      const maxPosition = playerData.positions.length - 1;

      if (newPosition <= maxPosition) {
        moveableTokens.push({
          token: token,
          moveType: newPosition === maxPosition ? "finish" : "normal_move",
          canMove: true,
          newPosition: newPosition,
        });
      }
    }
  });

  return moveableTokens;
}

/**
 * Handle case when no tokens can move
 */
function handleNoMoveableTokens() {
  console.log(`🚫 No moveable tokens for Player ${gameState.currentPlayer}`);

  // Deactivate all tokens using token.js function
  App.deactivateAllTokens();

  // Switch to next player after a short delay
  setTimeout(() => {
    switchToNextPlayer();
  }, 300);
}

/**
 * Handle case when only one token can move (auto-move)
 */
function handleSingleMoveableToken(moveableTokenInfo, diceValue) {
  console.log(
    `🎯 Auto-moving single token for Player ${gameState.currentPlayer}`
  );

  const { token, moveType } = moveableTokenInfo;

  // Deactivate all tokens first using token.js function
  App.deactivateAllTokens();

  // Move the token - tokens exiting home move 1 step, others move dice value
  const steps = moveType === "exit_home" ? 1 : diceValue;

  // Execute the movement with post-movement logic
  handleTokenMovement(token, steps);
}

/**
 * Handle case when multiple tokens can move (player choice required)
 */
function handleMultipleMoveableTokens(moveableTokens, diceValue) {
  console.log(
    `🎲 Player ${gameState.currentPlayer} has ${moveableTokens.length} moveable tokens`
  );

  // Deactivate all tokens first using token.js function
  App.deactivateAllTokens();

  // Activate only the moveable tokens using token.js function
  moveableTokens.forEach(({ token, moveType }) => {
    // Tokens at home only move 1 step (from home to start position)
    const steps = moveType === "exit_home" ? 1 : diceValue;
    App.activateToken(token);
    // Set the steps using token's dataset
    token.dataset.steps = steps;
  });

  // Store moveable tokens in game state for reference
  gameState.activeTokens = moveableTokens;
}

/**
 * Handle token movement with post-movement logic
 * This function can be called from token click handlers
 */
export async function handleTokenMovement(token, steps) {
  const playerNumber = parseInt(token.dataset.player);
  const currentPosition = parseInt(token.dataset.position);

  // Determine move type
  let moveType = "normal_move";
  if (currentPosition === -1) {
    moveType = "exit_home";
  } else {
    const playerData = getPlayerData(playerNumber);
    const newPosition = currentPosition + steps;
    const maxPosition = playerData.positions.length - 1;
    if (newPosition === maxPosition) {
      moveType = "finish";
    }
  }

  // Move the token using the existing moveToken function
  await moveToken(token, steps);

  // Handle post-movement logic
  await handlePostMovementLogic(token, playerNumber, moveType);
}

/**
 * Handle post-movement logic (captures, wins, etc.)
 * This function should be called after moveToken() completes
 */
async function handlePostMovementLogic(token, playerNumber, moveType) {
  let shouldGetExtraTurn = false;

  if (moveType === "finish") {
    console.log(`🏁 Player ${playerNumber} token reached finish!`);
    token.classList.add("finished");
    shouldGetExtraTurn = true;

    // Check for win condition
    checkWinCondition(playerNumber);
  }

  // Check for captures
  const captureResult = checkForCapture(token, playerNumber);
  if (captureResult) {
    await handleCapture(captureResult);
    shouldGetExtraTurn = true;
  }

  // Decide next turn
  if (!shouldGetExtraTurn && gameState.diceValue !== 6) {
    setTimeout(() => {
      switchToNextPlayer();
    }, 300);
  } else {
    // Player gets another turn - dice is already unfrozen by moveToken()
    console.log(`🎲 Player ${playerNumber} gets another turn!`);
  }
}

/**
 * Handle special dice rules (sixes, consecutive sixes)
 */
function handleSpecialDiceRules(diceValue) {
  const playerKey = `player${gameState.currentPlayer}`;

  if (diceValue === 6) {
    consecutiveSixes[playerKey]++;
    console.log(
      `🎲 Player ${gameState.currentPlayer} rolled a 6! (${consecutiveSixes[playerKey]} in a row)`
    );

    // Check for three consecutive sixes
    if (consecutiveSixes[playerKey] >= 3) {
      console.log(
        `⚠️ Player ${gameState.currentPlayer} rolled 3 sixes in a row! Turn forfeited.`
      );
      consecutiveSixes[playerKey] = 0;
      setTimeout(() => {
        switchToNextPlayer();
      }, 500);
    }
  } else {
    consecutiveSixes[playerKey] = 0;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get player data by number
 */
function getPlayerData(playerNumber) {
  return App[`player${playerNumber}`];
}

/**
 * Check for captures
 */
function checkForCapture(movingToken, playerNumber) {
  const tokenX = parseInt(movingToken.style.getPropertyValue("--data-x"));
  const tokenY = parseInt(movingToken.style.getPropertyValue("--data-y"));

  // Check if any opponent token is at the same position
  for (const token of App.tokens) {
    const otherPlayer = parseInt(token.dataset.player);
    if (otherPlayer === playerNumber) continue;

    const otherX = parseInt(token.style.getPropertyValue("--data-x"));
    const otherY = parseInt(token.style.getPropertyValue("--data-y"));
    const otherPosition = parseInt(token.dataset.position);

    if (otherX === tokenX && otherY === tokenY && otherPosition >= 0) {
      return {
        capturedToken: token,
        capturedPlayer: otherPlayer,
      };
    }
  }

  return null;
}

/**
 * Handle token capture
 */
async function handleCapture(captureResult) {
  const { capturedToken, capturedPlayer } = captureResult;

  console.log(
    `💥 Player ${gameState.currentPlayer} captured Player ${capturedPlayer}'s token!`
  );

  // Move captured token back to home
  const playerData = getPlayerData(capturedPlayer);
  const homePosition =
    playerData.initialPositions[
      parseInt(capturedToken.dataset.tokenNumber) - 1
    ];

  capturedToken.dataset.position = "-1";
  capturedToken.style.setProperty("--data-x", homePosition[0]);
  capturedToken.style.setProperty("--data-y", homePosition[1]);
  capturedToken.classList.remove("active", "finished");
}

/**
 * Check win condition
 */
function checkWinCondition(playerNumber) {
  const playerTokens = App.tokens.filter(
    (token) => parseInt(token.dataset.player) === playerNumber
  );

  const finishedTokens = playerTokens.filter((token) =>
    token.classList.contains("finished")
  );

  if (finishedTokens.length === 4) {
    console.log(`🏆 Player ${playerNumber} wins!`);
    finishedPlayers.add(playerNumber);
    playerRankings.push(playerNumber);

    // Handle game end logic here
    handleGameEnd();
  }
}

/**
 * Handle game end
 */
function handleGameEnd() {
  console.log("🎊 Game Over!");
  App.freezeDice();
  // Additional end game logic can be added here
}

// Legacy function for backward compatibility
export function handleDiceValue(value) {
  gameBrain(value);
}

/**
 * Legacy updateGame function - now uses the game brain
 */
export function updateGame() {
  console.log("⚠️  updateGame() is deprecated. Use gameBrain() instead.");
  // For backward compatibility, just call game brain if dice value is set
  if (gameState.diceValue > 0) {
    gameBrain(gameState.diceValue);
  }
}

/**
 * Initialize the game
 */
export function initializeGame() {
  console.log("🎮 Initializing Ludo Game...");

  // Reset game state
  gameState.currentPlayer = 1;
  gameState.diceValue = 0;
  gameState.activeTokens = [];

  // Reset consecutive sixes
  Object.keys(consecutiveSixes).forEach((key) => {
    consecutiveSixes[key] = 0;
  });

  // Reset rankings
  playerRankings.length = 0;
  finishedPlayers.clear();

  // Ensure current player is properly set in App
  if (window.App) {
    window.App.currentPlayer = gameState.currentPlayer;
    window.App.gameState = gameState;
  }

  console.log(`🎯 Game ready! Player ${gameState.currentPlayer} starts.`);
}

/**
 * Show game message to user
 */
export function showGameMessage(message, type = "info") {
  console.log(`💬 ${type.toUpperCase()}: ${message}`);

  // Create or update message element
  let messageEl = document.querySelector(".game-message");
  if (!messageEl) {
    messageEl = document.createElement("div");
    messageEl.className = "game-message";
    document.body.appendChild(messageEl);
  }

  messageEl.textContent = message;
  messageEl.className = `game-message ${type}`;
  messageEl.style.display = "block";

  // Auto-hide after 3 seconds
  setTimeout(() => {
    messageEl.style.display = "none";
  }, 3000);
}
