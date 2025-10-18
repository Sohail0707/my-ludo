// IMPORTS
import {
  tokens,
  findMoveableTokens,
  handleNoMoveableTokens,
  handleSingleMoveableToken,
  handleMultipleMoveableTokens,
} from "../components/token/token.js";
import {
  diceContainer,
  freezeDice,
  unfreezeDice,
  consecutiveSixes,
} from "../components/dice/dice.js";
import {
  updateCurrentPlayerOnBoard,
  removeBoardCurrentPlayer,
  makePlayerWin,
} from "../layout/board.js";
import { getPlayerData } from "./player-data.js";

// GAME STATE
export const gameState = {
  playerCount: 4,
  currentPlayer: 1,
  diceValue: 0,
  activeTokens: [], // Tokens that can be moved in the current turn
  gameOver: false,
};
export let playerCount = gameState.playerCount;
export let currentPlayer = gameState.currentPlayer;
export let diceValue = gameState.diceValue;
export let activeTokens = gameState.activeTokens;
export const getCurrentPlayer = () => gameState.currentPlayer;

export let finishedPlayers = new Set(); // Set to track which players have finished
export let playerRankings = []; // Array to store players in finishing order [1st, 2nd, 3rd]

// PLAYER SWITCHING
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

  // Move dice to the next player's position
  document
    .querySelector(`.dice-control.position-${gameState.currentPlayer}`)
    .appendChild(diceContainer);

  unfreezeDice(); // Unfreeze dice for next player
  updateCurrentPlayerOnBoard(gameState.currentPlayer);

  console.log(`🔄 Switched to Player ${gameState.currentPlayer}`);
}

// GAME LOGIC
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

  // Note: Special dice rules (consecutive sixes) are now handled before gameBrain() is called
}

// WIN CONDITIONS

/**
 * Check if a player has won the game
 * Determines if all 4 tokens of a player have reached the finish
 *
 * @param {number} playerNumber - Player number to check for win condition
 */
export function checkWinCondition(playerNumber) {
  const playerTokens = tokens.filter(
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
    makePlayerWin(playerNumber, winnerPosition);

    // Deactivate the winning player - they can't play anymore
    deactivateFinishedPlayer(playerNumber);

    // Check if we should end the game
    checkGameEndCondition();
    return true;
  }
  return false;
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
  tokens.forEach((token) => {
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
      makePlayerWin(fourthPlace, 4);
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
      makePlayerWin(secondPlace, 2);
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
  gameState.gameOver = true;
  // Remove dice from DOM
  if (diceContainer && diceContainer.parentNode) {
    diceContainer.parentNode.removeChild(diceContainer);
  }
  // Add special class to board for game over animation
  const board = document.querySelector(".board");
  if (board) {
    board.classList.add("game-over");
  }
}

// GAME INITIALIZATION
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

  // Game state is already properly managed through exports

  console.log(`🎯 Game ready! Player ${gameState.currentPlayer} starts.`);
}
