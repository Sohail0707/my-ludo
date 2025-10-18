// ============================================================================
// IMPORTS AND DEPENDENCIES
// ============================================================================
import { moveToken } from "../components/token/token.js";

// ============================================================================
// GAME STATE MANAGEMENT
// Central state object to maintain all game variables and references
// ============================================================================
export const gameState = {
  playerCount: 4,
  currentPlayer: 1,
  diceValue: 0,
  activeTokens: [], // Tokens that can be moved in the current turn
};

// Legacy exports for backward compatibility
export let playerCount = gameState.playerCount;
export let currentPlayer = gameState.currentPlayer;
export let diceValue = gameState.diceValue;
export let activeTokens = gameState.activeTokens;

// Getter function to ensure we always get the current value
export const getCurrentPlayer = () => gameState.currentPlayer;

// ============================================================================
// GAME TRACKING SYSTEMS
// Objects to track special game conditions and player progress
// ============================================================================

// Track consecutive sixes for each player (3 in a row = forfeit turn)
export let consecutiveSixes = {
  player1: 0,
  player2: 0,
  player3: 0,
  player4: 0,
};

// Player ranking and completion tracking
export let playerRankings = []; // Array to store players in finishing order [1st, 2nd, 3rd]
export let finishedPlayers = new Set(); // Set to track which players have finished

// ============================================================================
// PLAYER TURN MANAGEMENT
// Handles switching between players and updating UI elements
// ============================================================================

/**
 * Switch to the next player in turn order
 * Updates game state, UI elements, and dice position
 * Skips players who have finished all their tokens
 */
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

/**
 * Main game brain function - Central controller for all game logic
 * Analyzes dice roll, finds moveable tokens, and determines next actions
 *
 * @param {number} diceValue - The value rolled on the dice (1-6)
 */
export function gameBrain(diceValue) {
  console.log(
    `🎮 Game Brain: Player ${gameState.currentPlayer} rolled ${diceValue}`
  );

  // Update game state with dice value
  gameState.diceValue = diceValue;

  // Find all tokens that can move for current player
  const moveableTokens = findMoveableTokens(gameState.currentPlayer, diceValue);

  // Handle different scenarios based on number of moveable tokens
  if (moveableTokens.length === 0) {
    handleNoMoveableTokens();
  } else if (moveableTokens.length === 1) {
    handleSingleMoveableToken(moveableTokens[0], diceValue);
  } else {
    handleMultipleMoveableTokens(moveableTokens, diceValue);
  }

  // Apply special dice rules (consecutive sixes, etc.)
  handleSpecialDiceRules(diceValue);
}

// ============================================================================
// TOKEN MOVEMENT ANALYSIS
// Functions to analyze which tokens can move and determine movement types
// ============================================================================

/**
 * Find all tokens that can move for the current player
 * Analyzes each token's position and determines if movement is valid
 *
 * @param {number} playerNumber - Player number (1-4)
 * @param {number} diceValue - Dice roll value (1-6)
 * @returns {Array} Array of moveable token objects with move type info
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

// ============================================================================
// MOVEMENT SCENARIO HANDLERS
// Functions to handle different token movement scenarios
// ============================================================================

/**
 * Handle scenario when no tokens can move
 * Automatically switches to next player after brief delay
 */
function handleNoMoveableTokens() {
  console.log(`🚫 No moveable tokens for Player ${gameState.currentPlayer}`);

  App.deactivateAllTokens();

  setTimeout(() => {
    switchToNextPlayer();
  }, 300);
}

/**
 * Handle scenario when only one token can move
 * Automatically moves the token without user interaction
 *
 * @param {Object} moveableTokenInfo - Token object with move type information
 * @param {number} diceValue - Dice roll value
 */
function handleSingleMoveableToken(moveableTokenInfo, diceValue) {
  console.log(
    `🎯 Auto-moving single token for Player ${gameState.currentPlayer}`
  );

  const { token, moveType } = moveableTokenInfo;

  App.deactivateAllTokens();

  // Calculate steps: tokens exiting home move 1 step, others move dice value
  const steps = moveType === "exit_home" ? 1 : diceValue;

  handleTokenMovement(token, steps);
}

/**
 * Handle scenario when multiple tokens can move
 * Activates tokens for player selection and waits for user input
 *
 * @param {Array} moveableTokens - Array of moveable token objects
 * @param {number} diceValue - Dice roll value
 */
function handleMultipleMoveableTokens(moveableTokens, diceValue) {
  console.log(
    `🎲 Player ${gameState.currentPlayer} has ${moveableTokens.length} moveable tokens`
  );

  App.deactivateAllTokens();

  // Activate moveable tokens and set their movement steps
  moveableTokens.forEach(({ token, moveType }) => {
    const steps = moveType === "exit_home" ? 1 : diceValue;
    App.activateToken(token);
    token.dataset.steps = steps;
  });

  // Store for reference during user selection
  gameState.activeTokens = moveableTokens;
}

// ============================================================================
// TOKEN MOVEMENT EXECUTION
// High-level token movement with integrated post-movement logic
// ============================================================================

/**
 * Execute token movement with comprehensive post-movement handling
 * Integrates with existing moveToken() function and handles game logic
 *
 * @param {HTMLElement} token - The token DOM element to move
 * @param {number} steps - Number of steps to move
 */
export async function handleTokenMovement(token, steps) {
  const playerNumber = parseInt(token.dataset.player);
  const currentPosition = parseInt(token.dataset.position);

  // Determine movement type based on current position and destination
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

  // Execute movement using existing token function
  await moveToken(token, steps);

  // Handle all post-movement game logic
  await handlePostMovementLogic(token, playerNumber, moveType);
}

// ============================================================================
// POST-MOVEMENT GAME LOGIC
// Handles captures, win conditions, and turn management after token movement
// ============================================================================

/**
 * Handle all game logic that occurs after a token movement
 * Checks for captures, win conditions, and manages turn switching
 *
 * @param {HTMLElement} token - The token that was moved
 * @param {number} playerNumber - Player who moved the token
 * @param {string} moveType - Type of move: "exit_home", "normal_move", "finish"
 */
async function handlePostMovementLogic(token, playerNumber, moveType) {
  let shouldGetExtraTurn = false;

  // Handle finishing a token
  if (moveType === "finish") {
    console.log(`🏁 Player ${playerNumber} token reached finish!`);
    token.classList.add("finished");
    shouldGetExtraTurn = true;
    checkWinCondition(playerNumber);
  }

  // Check for token captures
  const captureResult = checkForCapture(token, playerNumber);
  if (captureResult) {
    await handleCapture(captureResult);
    shouldGetExtraTurn = true;
  }

  // Determine next turn based on extra turn conditions and dice value
  if (!shouldGetExtraTurn && gameState.diceValue !== 6) {
    setTimeout(() => {
      switchToNextPlayer();
    }, 300);
  } else {
    console.log(`🎲 Player ${playerNumber} gets another turn!`);
  }
}

// ============================================================================
// DICE RULES AND SPECIAL CONDITIONS
// Handles special dice rules like consecutive sixes and forfeit conditions
// ============================================================================

/**
 * Handle special dice rules and consecutive six tracking
 * Manages the "three sixes in a row" forfeit rule
 *
 * @param {number} diceValue - The dice value that was rolled
 */
function handleSpecialDiceRules(diceValue) {
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
    }
  } else {
    // Reset consecutive sixes counter for any non-six roll
    consecutiveSixes[playerKey] = 0;
  }
}

// ============================================================================
// CAPTURE MECHANICS
// Functions to detect and handle token captures between players
// ============================================================================

/**
 * Check if the moving token captured any opponent tokens
 * Compares token positions to detect collisions with opponent pieces
 *
 * @param {HTMLElement} movingToken - The token that just moved
 * @param {number} playerNumber - Player number who owns the moving token
 * @returns {Object|null} Capture result object or null if no capture
 */
function checkForCapture(movingToken, playerNumber) {
  const tokenX = parseInt(movingToken.style.getPropertyValue("--data-x"));
  const tokenY = parseInt(movingToken.style.getPropertyValue("--data-y"));

  // Check collision with all opponent tokens
  for (const token of App.tokens) {
    const otherPlayer = parseInt(token.dataset.player);
    if (otherPlayer === playerNumber) continue; // Skip own tokens

    const otherX = parseInt(token.style.getPropertyValue("--data-x"));
    const otherY = parseInt(token.style.getPropertyValue("--data-y"));
    const otherPosition = parseInt(token.dataset.position);

    // Check for same position collision (exclude home tokens)
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
 * Execute token capture mechanics
 * Moves captured token back to home and handles visual updates
 *
 * @param {Object} captureResult - Object containing captured token info
 */
async function handleCapture(captureResult) {
  const { capturedToken, capturedPlayer } = captureResult;

  console.log(
    `💥 Player ${gameState.currentPlayer} captured Player ${capturedPlayer}'s token!`
  );

  // Move captured token back to its home position
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
function getPlayerData(playerNumber) {
  return App[`player${playerNumber}`];
}

// ============================================================================
// LEGACY COMPATIBILITY FUNCTIONS
// Maintained for backward compatibility with existing code
// ============================================================================

/**
 * Legacy function for handling dice values
 * @deprecated Use gameBrain() directly instead
 */
export function handleDiceValue(value) {
  gameBrain(value);
}

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
