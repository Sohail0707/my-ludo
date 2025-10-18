// IMPORTS
import { board } from "../../layout/board.js";
import { unfreezeDice, freezeDice } from "../dice/dice.js";
import {
  player1,
  player2,
  player3,
  player4,
  safe_index,
  getPlayerData,
} from "../../utils/player-data.js";
import {
  gameState,
  playerCount,
  switchToNextPlayer,
  checkWinCondition,
} from "../../utils/game-logic.js";

// TOKEN STATE
export const tokens = [];

export function initializeTokens() {
  // Initialize tokens for active players
  if (playerCount == 2 || playerCount == 4) {
    if (player1.initialPositions) {
      init(player1, 1);
    }
    if (player3.initialPositions) {
      init(player3, 3);
    }
  }
  if (playerCount == 4) {
    if (player2.initialPositions) {
      init(player2, 2);
    }
    if (player4.initialPositions) {
      init(player4, 4);
    }
  }

  function init(player, playerNumber) {
    player.initialPositions.forEach((pos, index) => {
      const [x, y] = pos;

      const tokenElement = document.createElement("div");
      tokenElement.classList.add(
        "token",
        "safe",
        `token-${index + 1}`,
        `player-${playerNumber}`,
        `position-${playerNumber}`
      );

      tokenElement.style.setProperty("--data-x", x);
      tokenElement.style.setProperty("--data-y", y);
      tokenElement.dataset.player = playerNumber;
      tokenElement.dataset.tokenNumber = index + 1;
      tokenElement.dataset.active = false;
      tokenElement.dataset.position = -1; // -1 indicates home position
      tokenElement.dataset.steps = 0;

      // Initialize z-index based on --data-x value + 2
      tokenElement.style.zIndex = x + 2;
      const tokenInnerElement = document.createElement("div");
      tokenInnerElement.classList.add("token-inner");
      tokenInnerElement.innerHTML = `<img src="assets/token${playerNumber}.svg" alt="P${playerNumber} Token ${
        index + 1
      }">`;

      tokenElement.appendChild(tokenInnerElement);
      tokens.push(tokenElement);
      board.appendChild(tokenElement);
    });
  }

  // Initialize token click handling after all tokens are created
  initializeTokenClickHandler();
}

export function activateToken(token) {
  token.dataset.active = true;
  token.classList.add("active");
}

export function deactivateToken(token) {
  token.dataset.active = false;
  token.classList.remove("active");
  token.dataset.steps = 0;
}

export function deactivateAllTokens() {
  tokens.forEach((token) => {
    deactivateToken(token);
  });
}

export function checkTokenSafty() {
  tokens.forEach((token) => {
    const currentPosition = parseInt(token.dataset.position);
    const isBeingCaptured = token.classList.contains("being-captured");

    // Tokens being captured are never safe during their journey back
    if (isBeingCaptured) {
      token.classList.remove("safe");
      return;
    }

    // Tokens are safe in these conditions:
    // 1. At home (position -1)
    // 2. At starting position (position 0)
    // 3. On safe star positions (safe_index)
    if (
      currentPosition === -1 ||
      currentPosition === 0 ||
      safe_index.includes(parseInt(currentPosition))
    ) {
      token.classList.contains("safe") ? "" : token.classList.add("safe");
      console.log(`Token at position ${currentPosition} is SAFE`);
    } else {
      token.classList.remove("safe");
      console.log(`Token at position ${currentPosition} is NOT SAFE`);
    }
  });
}

// TOKEN MOVEMENT
export async function moveToken(token, steps) {
  const playerNumber = parseInt(token.dataset.player);
  const player = getPlayerData(playerNumber);

  let currentPosition = parseInt(token.dataset.position);
  for (let step = 1; step <= steps; step++) {
    analyzeAndArrangeAllTokens();
    currentPosition++;
    const [x, y] = player.positions[currentPosition];
    token.style.setProperty("--data-x", x);
    token.style.setProperty("--data-y", y);
    token.style.zIndex = x + 2;
    token.dataset.position = currentPosition;

    checkTokenSafty();

    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  token.dataset.steps = 0;
  unfreezeDice(); // Unfreeze dice after token movement
  // analyzeAndArrangeAllTokens();
}

// TOKEN POSITIONING
export function analyzeAndArrangeAllTokens() {
  if (!tokens) return;

  // Add small delay to ensure DOM updates are complete
  setTimeout(() => {
    arrangeTokensNow();
  }, 50);
}
export function analyzeAndArrangeAllTokensSync() {
  if (!tokens) return;

  // Force browser to recalculate styles by accessing offsetHeight
  tokens.forEach((token) => {
    token.offsetHeight; // Forces style recalculation
  });

  arrangeTokensNow();
}

function arrangeTokensNow() {
  // Step 1: Reset all tokens to default positioning
  tokens.forEach((token) => {
    token.style.setProperty("--size-value", "1.5");
    token.style.setProperty("--position-value", "0");
  });

  // Step 2: Group tokens by their x,y coordinates
  const positionGroups = new Map();

  tokens.forEach((token) => {
    const x = parseInt(token.style.getPropertyValue("--data-x"));
    const y = parseInt(token.style.getPropertyValue("--data-y"));
    const position = parseInt(token.dataset.position);

    // Skip tokens at home position (-1) as they have individual positions
    if (position === -1) return;

    const key = `${x},${y}`;

    if (!positionGroups.has(key)) {
      positionGroups.set(key, []);
    }
    positionGroups.get(key).push(token);
  });

  // Step 3: Arrange overlapping token groups
  positionGroups.forEach((tokens) => {
    if (tokens.length > 1) {
      const tokenCount = tokens.length;
      let sizeValue, positions;

      // Calculate arrangement parameters based on number of tokens
      switch (tokenCount) {
        case 2:
          sizeValue = 2.0;
          positions = [-1.0, 1.0];
          break;

        case 3:
          sizeValue = 2.5;
          positions = [-1.2, 0, 1.2];
          break;

        case 4:
          sizeValue = 3.0;
          positions = [-1.4, -0.5, 0.5, 1.4];
          break;

        default:
          sizeValue = 3.5;
          positions = [];
          for (let i = 0; i < tokenCount; i++) {
            positions.push(-1.6 + (3.2 * i) / (tokenCount - 1));
          }
      }

      // Apply positioning to each token in the group
      tokens.forEach((token, index) => {
        token.style.setProperty("--size-value", sizeValue.toString());
        token.style.setProperty(
          "--position-value",
          positions[index].toString()
        );
      });

      console.log(`🔄 Arranged ${tokenCount} overlapping tokens`);
    }
  });
}

// MOVEMENT ANALYSIS
export function findMoveableTokens(playerNumber, diceValue) {
  const moveableTokens = [];

  if (!tokens) return moveableTokens;

  tokens.forEach((token) => {
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

export function handleNoMoveableTokens() {
  console.log(`🚫 No moveable tokens for Player ${gameState.currentPlayer}`);

  deactivateAllTokens();

  setTimeout(() => {
    switchToNextPlayer();
  }, 300);
}

export function handleSingleMoveableToken(moveableTokenInfo, diceValue) {
  console.log(
    `🎯 Auto-moving single token for Player ${gameState.currentPlayer}`
  );

  const { token, moveType } = moveableTokenInfo;

  deactivateAllTokens();

  // Calculate steps: tokens exiting home move 1 step, others move dice value
  const steps = moveType === "exit_home" ? 1 : diceValue;

  handleTokenMovement(token, steps);
}

export function handleMultipleMoveableTokens(moveableTokens, diceValue) {
  console.log(
    `🎲 Player ${gameState.currentPlayer} has ${moveableTokens.length} moveable tokens`
  );

  deactivateAllTokens();

  // Activate moveable tokens and set their movement steps
  moveableTokens.forEach(({ token, moveType }) => {
    const steps = moveType === "exit_home" ? 1 : diceValue;
    activateToken(token);
    token.dataset.steps = steps;
  });

  // Store for reference during user selection
  gameState.activeTokens = moveableTokens;
}

// MOVEMENT EXECUTION
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

// POST-MOVEMENT LOGIC
export async function handlePostMovementLogic(token, playerNumber, moveType) {
  let shouldGetExtraTurn = false;

  // Handle finishing a token
  if (moveType === "finish") {
    console.log(`🏁 Player ${playerNumber} token reached finish!`);
    token.classList.add("finished");
    shouldGetExtraTurn = true;
    const wasWinner = checkWinCondition(playerNumber);
    // If player just won, switch to next player immediately
    if (wasWinner) {
      setTimeout(() => {
        switchToNextPlayer();
      }, 300);
      return;
    }
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

// CAPTURE MECHANICS
/**
 * Move captured token back to home following the reverse path with animation
 * Updates all token properties (position, coordinates, classes) during the journey
 * @param {HTMLElement} token - The captured token to move back
 */
export async function moveCapturedTokenToHome(token) {
  const playerNumber = parseInt(token.dataset.player);
  const player = getPlayerData(playerNumber);
  let currentPosition = parseInt(token.dataset.position);

  console.log(
    `🏠 Moving Player ${playerNumber}'s token back home from position ${currentPosition}`
  );

  // Mark token as being captured to prevent interference
  token.classList.add("being-captured");
  token.classList.remove("active", "finished", "safe");

  // Increase z-index to show captured token on top during animation
  token.style.zIndex = 1000;

  // Move backwards step by step from current position to starting position (0)
  while (currentPosition > 0) {
    currentPosition--;
    const [x, y] = player.positions[currentPosition];

    token.style.setProperty("--data-x", x);
    token.style.setProperty("--data-y", y);
    token.style.zIndex = x + 2;
    token.dataset.position = currentPosition;

    // Update token arrangements during movement
    analyzeAndArrangeAllTokens();

    // Animation delay for smooth movement
    await new Promise((resolve) => setTimeout(resolve, 90));
  }

  // If token was captured at starting position, add brief pause there
  if (parseInt(token.dataset.position) === 0) {
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // Final move from starting position (0) to home position (-1)
  const playerData = getPlayerData(playerNumber);
  const homePosition =
    playerData.initialPositions[parseInt(token.dataset.tokenNumber) - 1];

  token.style.setProperty("--data-x", homePosition[0]);
  token.style.setProperty("--data-y", homePosition[1]);
  token.dataset.position = "-1";
  token.dataset.steps = 0;

  // Reset z-index to normal home position value
  token.style.zIndex = homePosition[0] + 2;

  // Remove capture state and add safe class for home
  token.classList.remove("being-captured", "active", "finished");
  token.classList.add("safe");

  console.log(`✅ Player ${playerNumber}'s token safely returned home`);

  // Brief pause to show token at home before continuing
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Final arrangement after reaching home
  analyzeAndArrangeAllTokens();
}

export function checkForCapture(movingToken, playerNumber) {
  const tokenX = parseInt(movingToken.style.getPropertyValue("--data-x"));
  const tokenY = parseInt(movingToken.style.getPropertyValue("--data-y"));

  // Check collision with all opponent tokens
  for (const token of tokens) {
    const otherPlayer = parseInt(token.dataset.player);
    if (otherPlayer === playerNumber) continue; // Skip own tokens

    const otherX = parseInt(token.style.getPropertyValue("--data-x"));
    const otherY = parseInt(token.style.getPropertyValue("--data-y"));
    const otherPosition = parseInt(token.dataset.position);

    // Check for same position collision (exclude home tokens)
    // Only capture if opponent token is NOT safe
    if (
      otherX === tokenX &&
      otherY === tokenY &&
      otherPosition >= 0 &&
      !token.classList.contains("safe")
    ) {
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
export async function handleCapture(captureResult) {
  const { capturedToken, capturedPlayer } = captureResult;

  console.log(
    `💥 Player ${gameState.currentPlayer} captured Player ${capturedPlayer}'s token!`
  );

  // Animate the captured token moving back to home following the path
  await moveCapturedTokenToHome(capturedToken);
}

// TOKEN CLICK HANDLING
export function initializeTokenClickHandler() {
  // Add token click handling
  document.addEventListener("click", handleTokenClickEvent);
}

/**
 * Handle token click events
 */
function handleTokenClickEvent(event) {
  const token = event.target.closest(".token");
  if (!token) return;

  // Check if token is active
  if (token.dataset.active === "true") {
    const playerNumber = parseInt(token.dataset.player);
    const steps = parseInt(token.dataset.steps);

    // Only allow current player to move their tokens
    if (playerNumber === gameState.currentPlayer) {
      handleTokenClick(token, steps);
    }
  }
}

/**
 * Handle token click for movement
 */
function handleTokenClick(token, steps) {
  // Deactivate all tokens
  deactivateAllTokens();

  // Execute the movement using the new game logic handler
  handleTokenMovement(token, steps);

  // Freeze dice during movement
  freezeDice();
}
