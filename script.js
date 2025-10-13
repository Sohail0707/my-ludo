// =============================================================================
// LUDO GAME - Complete Implementation
// =============================================================================

// =============================================================================
// RESPONSIVE BOARD SIZE CALCULATION
// =============================================================================

function calculateOptimalBoardSize() {
  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Use 90% of the smaller dimension to leave some padding
  const availableSize = Math.min(viewportWidth, viewportHeight) * 0.9;

  // Find the largest number divisible by 15 that fits in the available space
  const gridUnit = Math.floor(availableSize / 15);
  const optimalSize = gridUnit * 15;

  // Ensure minimum size for playability (minimum 600px)
  const minSize = 600;
  const finalSize = Math.max(optimalSize, minSize);

  // If we had to use minimum size, recalculate to ensure divisibility by 15
  const finalGridUnit = Math.floor(finalSize / 15);
  const responsiveBoardSize = finalGridUnit * 15;

  return responsiveBoardSize;
}

function setResponsiveBoardSize() {
  const boardSize = calculateOptimalBoardSize();
  document.documentElement.style.setProperty("--board-size", `${boardSize}px`);

  // Calculate dice size based on board size
  setResponsiveDiceSize(boardSize);
}

function setResponsiveDiceSize(boardSize) {
  // Dice should be proportional to board size
  // The dice container is 60% of center area, and center is 3/15 of board
  // So dice area = board * (3/15) * 0.6 = board * 0.12
  const diceSize = Math.floor(boardSize * 0.12); // Increased from 0.08 to 0.12 (12% of board size)
  const diceHalf = Math.floor(diceSize / 2);
  const dicePadding = Math.floor(diceSize * 0.15); // 15% of dice size
  const dotSize = Math.floor(diceSize * 0.16); // 16% of dice size

  // Set CSS custom properties for dice sizing
  document.documentElement.style.setProperty("--dice-size", `${diceSize}px`);
  document.documentElement.style.setProperty("--dice-half", `${diceHalf}px`);
  document.documentElement.style.setProperty(
    "--dice-padding",
    `${dicePadding}px`
  );
  document.documentElement.style.setProperty("--dot-size", `${dotSize}px`);
}

// Set initial board size
setResponsiveBoardSize();

// Recalculate on window resize
window.addEventListener("resize", () => {
  setResponsiveBoardSize();
});

// Game Configuration
let playerCount = 4;
let currentPlayer = 1;
let diceValue = 0;
let gameState = "waiting"; // "waiting", "rolling", "moving", "finished"
let hasRolledSix = false;
let moveableTokens = [];

// Consecutive sixes tracking for each player
let consecutiveSixes = {
  player1: 0,
  player2: 0,
  player3: 0,
  player4: 0,
};

// Ranking System
let playerRankings = []; // Array to store players in finishing order [1st, 2nd, 3rd]
let finishedPlayers = new Set(); // Set to track which players have finished

// Initialize the game board
const container = document.querySelector(".board");
// Create 72 grid items (15x15)
for (let i = 0; i < 72; i++) {
  const gridItem = document.createElement("div");
  gridItem.classList.add("grid-item");
  // gridItem.textContent = i; // Optional: Add numbers to grid items for reference
  if ([4, 5, 7, 10, 13, 16].includes(i)) {
    gridItem.classList.add("player-1");
  }
  if ([36, 37, 38, 39, 40, 52].includes(i)) {
    gridItem.classList.add("player-2");
  }
  if ([55, 58, 61, 64, 66, 67].includes(i)) {
    gridItem.classList.add("player-3");
  }
  if ([19, 31, 32, 33, 34, 35].includes(i)) {
    gridItem.classList.add("player-4");
  }

  if ([6, 27, 44, 65].includes(i)) {
    gridItem.innerHTML = `<svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    class="star">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
    />
  </svg>`;
  }
  container.appendChild(gridItem);
}

// =============================================================================
// TOKEN MANAGEMENT & GAME DATA
// =============================================================================

// Token State and Positions
const tokens = {
  player1: {
    token1: {
      element: null,
      position: -1,
      active: false,
      safe: true,
      finished: false,
    },
    token2: {
      element: null,
      position: -1,
      active: false,
      safe: true,
      finished: false,
    },
    token3: {
      element: null,
      position: -1,
      active: false,
      safe: true,
      finished: false,
    },
    token4: {
      element: null,
      position: -1,
      active: false,
      safe: true,
      finished: false,
    },
  },
  player2: {
    token1: {
      element: null,
      position: -1,
      active: false,
      safe: true,
      finished: false,
    },
    token2: {
      element: null,
      position: -1,
      active: false,
      safe: true,
      finished: false,
    },
    token3: {
      element: null,
      position: -1,
      active: false,
      safe: true,
      finished: false,
    },
    token4: {
      element: null,
      position: -1,
      active: false,
      safe: true,
      finished: false,
    },
  },
  player3: {
    token1: {
      element: null,
      position: -1,
      active: false,
      safe: true,
      finished: false,
    },
    token2: {
      element: null,
      position: -1,
      active: false,
      safe: true,
      finished: false,
    },
    token3: {
      element: null,
      position: -1,
      active: false,
      safe: true,
      finished: false,
    },
    token4: {
      element: null,
      position: -1,
      active: false,
      safe: true,
      finished: false,
    },
  },
  player4: {
    token1: {
      element: null,
      position: -1,
      active: false,
      safe: true,
      finished: false,
    },
    token2: {
      element: null,
      position: -1,
      active: false,
      safe: true,
      finished: false,
    },
    token3: {
      element: null,
      position: -1,
      active: false,
      safe: true,
      finished: false,
    },
    token4: {
      element: null,
      position: -1,
      active: false,
      safe: true,
      finished: false,
    },
  },
};

// Player paths and starting positions
// prettier-ignore
const player1 = {
  positions : [
    [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [7, 14], [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [14, 7], [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0], [7, 0], [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]
  ],
  initialPositions: [
    [1.5, 10.5], [1.5, 12.5], [3.5, 10.5], [3.5, 12.5]
  ],
}

// prettier-ignore
const player2 = {
  positions : [
    [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [14, 7], [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0], [7, 0], [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 7], [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [7, 14], [7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]
  ],
  initialPositions: [
    [10.5, 10.5], [10.5, 12.5], [12.5, 10.5], [12.5, 12.5]
  ],
}

// prettier-ignore
const player3 ={
  positions : [
    [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0], [7, 0], [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 7], [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [7, 14], [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [14, 7], [13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]
  ],
  initialPositions: [
    [10.5, 1.5], [10.5, 3.5], [12.5, 1.5], [12.5, 3.5]
  ],
}

// prettier-ignore
const player4 = {
  positions : [
    [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 7], [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [7, 14], [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [14, 7], [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0], [7, 0], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], 
  ],
  initialPositions: [
    [1.5, 1.5], [1.5, 3.5], [3.5, 1.5], [3.5, 3.5]
  ],
}

// Safe positions on the board (star positions and special safe zones)
const safe_index = [8, 13, 21, 26, 34, 39, 47];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getPlayerData(playerNumber) {
  return eval(`player${playerNumber}`);
}

function updateTokenZIndex(tokenElement, position) {
  // Get the --data-x value from the token element
  const dataX = parseInt(tokenElement.style.getPropertyValue("--data-x")) || 0;

  // Use --data-x + 2 as the base z-index to ensure it's always positive
  // Add extra boost for moveable tokens to ensure they're always on top
  const baseZIndex = dataX + 2;
  const moveableBonus = tokenElement.classList.contains("moveable") ? 1000 : 0;

  const finalZIndex = baseZIndex + moveableBonus;
  tokenElement.style.zIndex = finalZIndex;
}
function updateAllTokenZIndices() {
  // Update z-index for all active tokens based on their --data-x values
  for (let p = 1; p <= 4; p++) {
    const playerTokens = tokens[`player${p}`];
    for (const tokenKey in playerTokens) {
      const token = playerTokens[tokenKey];
      if (token.element) {
        updateTokenZIndex(token.element, token.position);
      }
    }
  }
}

function showMessage(text, type = "info") {
  // Create message element if it doesn't exist
  let messageEl = document.querySelector(".game-message");
  if (!messageEl) {
    messageEl = document.createElement("div");
    messageEl.className = "game-message";
    document.body.appendChild(messageEl);
  }

  messageEl.textContent = text;
  messageEl.className = `game-message ${type}`;
  messageEl.style.display = "block";

  // Auto-hide after 3 seconds
  setTimeout(() => {
    messageEl.style.display = "none";
  }, 3000);
}

// =============================================================================
// TOKEN INITIALIZATION
// =============================================================================

function initializePlayerTokens(player, playerNumber) {
  const board = document.querySelector(".board");
  player.initialPositions.forEach((pos, index) => {
    const [x, y] = pos;

    const tokenElement = document.createElement("div");
    tokenElement.classList.add(
      "token",
      `token-${index + 1}`,
      `player-${playerNumber}`
    );

    tokenElement.style.setProperty("--data-x", x);
    tokenElement.style.setProperty("--data-y", y);
    tokenElement.dataset.x = x;
    tokenElement.dataset.y = y;
    tokenElement.dataset.player = playerNumber;
    tokenElement.dataset.tokenNumber = index + 1;

    // Initialize z-index based on --data-x value + 2
    tokenElement.style.zIndex = x + 2;
    const tokenInnerElement = document.createElement("div");
    tokenInnerElement.classList.add("token-inner");
    tokenInnerElement.innerHTML = `<img src="assets/token${playerNumber}.svg" alt="P${playerNumber} Token ${
      index + 1
    }">`;

    tokenElement.appendChild(tokenInnerElement);
    tokens[`player${playerNumber}`][`token${index + 1}`].element = tokenElement;
    board.appendChild(tokenElement);
  });
}

// =============================================================================
// GAME LOGIC FUNCTIONS
// =============================================================================

function findMoveableTokens(playerNumber) {
  const playerTokens = tokens[`player${playerNumber}`];
  const moveableTokens = [];

  for (const tokenKey in playerTokens) {
    const token = playerTokens[tokenKey];

    // If token is at home and dice shows 6, it can move
    if (!token.active && diceValue === 6) {
      moveableTokens.push({
        token,
        tokenKey,
        canMove: true,
        reason: "exit_home",
      });
    }
    // If token is on board and won't exceed the path
    else if (token.active && !token.finished) {
      const playerData = getPlayerData(playerNumber);
      const newPosition = token.position + diceValue;
      const pathLength = playerData.positions.length;
      const finishPosition = pathLength - 1; // Last index in positions array is the finish

      // Token can only move if:
      // 1. It stays within the path (normal move)
      // 2. OR it lands exactly on the finish position (last index in positions array)
      if (newPosition < finishPosition) {
        moveableTokens.push({
          token,
          tokenKey,
          canMove: true,
          reason: "normal_move",
        });
      } else if (newPosition === finishPosition) {
        // Token can finish only if it lands EXACTLY on the finish position
        moveableTokens.push({
          token,
          tokenKey,
          canMove: true,
          reason: "finish",
        });
      } else {
        // If newPosition > finishPosition, token cannot move
      }
      // This prevents overshooting the finish line
    } else {
    }
  }

  return moveableTokens;
}

function checkForCapture(playerNumber, targetX, targetY) {
  // Check if any opponent token is at the target position
  for (let p = 1; p <= 4; p++) {
    if (p === playerNumber) continue; // Skip current player

    const playerTokens = tokens[`player${p}`];
    for (const tokenKey in playerTokens) {
      const token = playerTokens[tokenKey];
      if (token.active && !token.finished && !token.safe) {
        const tokenX = parseInt(token.element.dataset.x);
        const tokenY = parseInt(token.element.dataset.y);

        if (tokenX === targetX && tokenY === targetY) {
          return { player: p, token: token, tokenKey: tokenKey };
        }
      }
    }
  }
  return null;
}

async function slideTokenBackToHome(capturedTokenInfo) {
  const {
    player: capturedPlayer,
    token: capturedToken,
    tokenKey,
  } = capturedTokenInfo;
  const playerData = getPlayerData(capturedPlayer);
  const initialPos =
    playerData.initialPositions[parseInt(tokenKey.replace("token", "")) - 1];

  // Get current position
  const currentX = parseInt(capturedToken.element.dataset.x);
  const currentY = parseInt(capturedToken.element.dataset.y);

  // Find current position in the path
  const currentIndex = playerData.positions.findIndex(
    (pos) => pos[0] === currentX && pos[1] === currentY
  );

  if (currentIndex === -1) return; // Token not on valid path

  // Add special class for slide animation
  capturedToken.element.classList.add("sliding-back");

  // Create reverse path from current position back to start
  const reversePath = [];
  for (let i = currentIndex; i >= 0; i--) {
    reversePath.push(playerData.positions[i]);
  }

  // Animate through reverse path with faster, smoother movement
  for (let i = 0; i < reversePath.length; i++) {
    const [x, y] = reversePath[i];
    capturedToken.element.dataset.x = x;
    capturedToken.element.dataset.y = y;
    capturedToken.element.style.setProperty("--data-x", x);
    capturedToken.element.style.setProperty("--data-y", y);

    // Update z-index based on new --data-x value
    updateTokenZIndex(capturedToken.element, capturedToken.position);

    // Fast and smooth animation for slide effect
    await sleep(50);
  }

  // Final slide to home position
  capturedToken.element.dataset.x = initialPos[0];
  capturedToken.element.dataset.y = initialPos[1];
  capturedToken.element.style.setProperty("--data-x", initialPos[0]);
  capturedToken.element.style.setProperty("--data-y", initialPos[1]);

  // Update z-index for final home position
  updateTokenZIndex(capturedToken.element, capturedToken.position);

  // Reset token state
  capturedToken.position = -1;
  capturedToken.active = false;
  capturedToken.safe = true;
  capturedToken.finished = false;

  // Remove visual effects
  capturedToken.element.classList.remove("safe", "moveable", "sliding-back");

  // Removed capture message for immediate gameplay
}

function captureToken(capturedTokenInfo) {
  // Use the new slide animation instead of instant teleport
  return slideTokenBackToHome(capturedTokenInfo);
}

async function moveTokenFromHome(player, token, playerNumber) {
  const startX = player.positions[0][0];
  const startY = player.positions[0][1];

  token.dataset.x = startX;
  token.dataset.y = startY;
  token.style.setProperty("--data-x", startX);
  token.style.setProperty("--data-y", startY);

  // Update token state
  const tokenKey = `token${token.dataset.tokenNumber}`;
  tokens[`player${playerNumber}`][tokenKey].position = 0;
  tokens[`player${playerNumber}`][tokenKey].active = true;
  tokens[`player${playerNumber}`][tokenKey].safe = true; // Starting position is safe

  // Update z-index for newly active token
  updateTokenZIndex(token, 0);

  // Removed success message for immediate gameplay
}

async function moveToken(
  path,
  tokenElement,
  tokenData,
  diceRoll,
  playerNumber
) {
  const currentIndex = tokenData.position;
  const startIndex = currentIndex + 1;
  const finishPosition = path.length - 1; // Last index is the finish position
  const endIndex = Math.min(startIndex + diceRoll - 1, finishPosition);

  for (let i = startIndex; i <= endIndex; i++) {
    const coords = path[i];
    const [x, y] = coords;
    tokenElement.dataset.x = x;
    tokenElement.dataset.y = y;
    tokenElement.style.setProperty("--data-x", x);
    tokenElement.style.setProperty("--data-y", y);

    // Update safe status
    if (safe_index.includes(i)) {
      setTimeout(() => {
        tokenElement.classList.add("safe");
        tokenData.safe = true;
      }, 200);
    } else {
      tokenElement.classList.remove("safe");
      tokenData.safe = false;
    }

    // Update z-index based on new position
    updateTokenZIndex(tokenElement, i);

    await sleep(300);
  }

  // Update final position
  tokenData.position = endIndex;

  // Final z-index update
  updateTokenZIndex(tokenElement, endIndex);

  // Check if token finished
  if (endIndex === path.length - 1) {
    tokenData.finished = true;
    tokenElement.classList.add("finished");
    // Give extra turn for finishing a token
    hasRolledSix = true;
    // Removed finish message for immediate gameplay
    checkWinCondition(playerNumber);
  } else {
    // Check for capture
    const finalX = parseInt(tokenElement.dataset.x);
    const finalY = parseInt(tokenElement.dataset.y);
    const captureInfo = checkForCapture(playerNumber, finalX, finalY);

    if (captureInfo) {
      await captureToken(captureInfo);
      hasRolledSix = true; // Extra turn for capture
    }
  }
}

function checkWinCondition(playerNumber) {
  const playerTokens = tokens[`player${playerNumber}`];
  const finishedCount = Object.values(playerTokens).filter(
    (token) => token.finished
  ).length;

  // Check if player has finished all tokens
  if (finishedCount === 4) {
    // Player has finished - add to rankings if not already there
    if (!finishedPlayers.has(playerNumber)) {
      finishedPlayers.add(playerNumber);
      playerRankings.push(playerNumber);

      const position = getPositionText(playerRankings.length);
      showMessage(
        `🎉 Player ${playerNumber} finishes in ${position} place! 🎉`,
        "success"
      );
    }

    // Check if game should end
    if (shouldEndGame()) {
      endGame();
    }
  }
}

function getPositionText(position) {
  switch (position) {
    case 1:
      return "1st";
    case 2:
      return "2nd";
    case 3:
      return "3rd";
    case 4:
      return "4th";
    default:
      return `${position}th`;
  }
}

function shouldEndGame() {
  // For 2-player game: End when first player wins
  if (playerCount === 2) {
    return playerRankings.length >= 1;
  }

  // For 4-player game: End when we have 1st, 2nd, and 3rd place
  // (4th place is automatic for remaining player)
  if (playerCount === 4) {
    return playerRankings.length >= 3;
  }

  // For 3-player game: End when we have 1st and 2nd place
  if (playerCount === 3) {
    return playerRankings.length >= 2;
  }

  return false;
}

function endGame() {
  gameState = "finished";

  // Disable further dice rolls
  const cube = document.querySelector(".cube");
  if (cube) {
    cube.style.pointerEvents = "none";
    cube.style.opacity = "0.5";
  }

  // Show final results
  showFinalResults();
}

function showFinalResults() {
  let resultsMessage = "🏆 FINAL RESULTS 🏆\n\n";

  playerRankings.forEach((player, index) => {
    const position = getPositionText(index + 1);
    resultsMessage += `${position}: Player ${player}\n`;
  });

  // For 4-player game, determine 4th place automatically
  if (playerCount === 4 && playerRankings.length === 3) {
    const allPlayers = [1, 2, 3, 4];
    const fourthPlace = allPlayers.find((p) => !finishedPlayers.has(p));
    if (fourthPlace) {
      resultsMessage += `4th: Player ${fourthPlace}\n`;
    }
  }

  // For 3-player game, determine 3rd place automatically
  if (playerCount === 3 && playerRankings.length === 2) {
    const allPlayers = [1, 2, 3];
    const thirdPlace = allPlayers.find((p) => !finishedPlayers.has(p));
    if (thirdPlace) {
      resultsMessage += `3rd: Player ${thirdPlace}\n`;
    }
  }

  showMessage(resultsMessage, "success");
}

function nextTurn() {
  if (gameState === "finished") return;

  // Clear visual highlights
  clearTokenHighlights();

  const previousPlayer = currentPlayer;
  let playerChanged = false;

  if (!hasRolledSix) {
    // Move to next active player (skip finished players)
    let attempts = 0;
    const maxAttempts = playerCount;

    do {
      if (playerCount === 2) {
        currentPlayer = currentPlayer === 1 ? 3 : 1;
      } else {
        currentPlayer = currentPlayer >= 4 ? 1 : currentPlayer + 1;
      }
      attempts++;

      // Safety check to prevent infinite loop
      if (attempts >= maxAttempts) {
        break;
      }
    } while (finishedPlayers.has(currentPlayer) && attempts < maxAttempts);

    // Check if turn actually changed to a different player
    if (currentPlayer !== previousPlayer) {
      playerChanged = true;
      consecutiveSixes[`player${currentPlayer}`] = 0;
    }
  }

  hasRolledSix = false;
  gameState = "waiting";

  // Only show flush effect if turn actually changed to a different player
  if (playerChanged) {
    updateCurrentPlayerDisplay();
  } else {
    // Same player continuing - just move dice, no flush effect
    moveDiceToCurrentPlayer();
  }
}

function updateCurrentPlayerDisplay() {
  const mainContainer = document.querySelector(".main-container");
  if (!mainContainer) return;

  // Remove all flush classes
  mainContainer.classList.remove("flush-1", "flush-2", "flush-3", "flush-4");

  // Add the flush class for current player
  mainContainer.classList.add(`flush-${currentPlayer}`);

  // Move dice to current player's control box
  moveDiceToCurrentPlayer();
}

function moveDiceToCurrentPlayer() {
  // Find the dice container
  const diceContainer = document.querySelector(".dice-container");
  if (!diceContainer) {
    return;
  }

  // Find the current player's control box
  const currentPlayerControl = document.querySelector(
    `.player-control.player-${currentPlayer}`
  );
  if (!currentPlayerControl) {
    return;
  }

  // Check if dice is already in the correct location
  if (currentPlayerControl.contains(diceContainer)) {
    return; // Already in the right place
  }

  // Remove dice from current location and add to current player's control
  diceContainer.remove();
  currentPlayerControl.appendChild(diceContainer);
}

function clearTokenHighlights() {
  document.querySelectorAll(".token").forEach((token) => {
    token.classList.remove("moveable");
  });
  // Update z-indices after removing moveable class
  updateAllTokenZIndices();
}

function highlightMoveableTokens(moveableTokens) {
  clearTokenHighlights();
  moveableTokens.forEach(({ token }) => {
    token.element.classList.add("moveable");
  });
  // Update z-indices after highlighting to ensure proper layering
  updateAllTokenZIndices();
}

// =============================================================================
// DICE INTEGRATION
// =============================================================================

function rollDice() {
  if (gameState !== "waiting" || gameState === "finished") {
    return;
  }

  // Prevent finished players from rolling
  if (finishedPlayers.has(currentPlayer)) {
    return;
  }

  gameState = "rolling";

  // Remove flush class when dice starts shuffling
  const mainContainer = document.querySelector(".main-container");
  if (mainContainer) {
    mainContainer.classList.remove("flush-1", "flush-2", "flush-3", "flush-4");
  }

  // Generate a valid dice value first (respecting consecutive sixes rule)
  const validDiceValue = generateValidDiceValue();

  // Use the shuffle animation with our pre-determined valid value
  if (window.shuffleCube) {
    diceValue = window.shuffleCube(validDiceValue); // Pass our valid value
  } else {
    // Fallback if shuffleCube is not available
    diceValue = validDiceValue;
    if (window.showDiceFace) {
      showDiceFace(diceValue);
    }
  }

  // After dice animation, check for moveable tokens
  setTimeout(() => {
    processDiceResult();
  }, 1000); // Standard timeout for dice animation
}

function generateValidDiceValue() {
  let rolledValue;
  let attempts = 0;
  const maxAttempts = 10; // Prevent infinite loops

  do {
    // Generate random dice value (no animation here)
    rolledValue = Math.floor(Math.random() * 6) + 1;
    attempts++;

    // Check if this would be the third consecutive six
    if (rolledValue === 6 && consecutiveSixes[`player${currentPlayer}`] >= 2) {
      if (attempts < maxAttempts) {
        continue; // Re-generate
      } else {
        // Fallback: force a non-6 value if too many attempts
        rolledValue = Math.floor(Math.random() * 5) + 1;

        showMessage(`🎲 Player ${currentPlayer}: Third 6 avoided!`, "warning");
        break;
      }
    } else {
      break; // Valid roll
    }
  } while (attempts < maxAttempts);

  return rolledValue;
}

function processDiceResult() {
  // Update consecutive sixes counter
  if (diceValue === 6) {
    consecutiveSixes[`player${currentPlayer}`]++;
  } else {
    consecutiveSixes[`player${currentPlayer}`] = 0; // Reset counter for non-6 rolls
  }

  gameState = "moving";
  moveableTokens = findMoveableTokens(currentPlayer);
  if (moveableTokens.length === 0) {
    nextTurn(); // Immediate transition to next player
  } else if (moveableTokens.length === 1) {
    // Auto-move when only one token is moveable
    const moveableToken = moveableTokens[0];
    const tokenElement = moveableToken.token.element;
    const playerNumber = parseInt(tokenElement.dataset.player);
    const tokenNumber = parseInt(tokenElement.dataset.tokenNumber);

    // Execute the move automatically
    executeMoveToken(tokenElement, playerNumber, tokenNumber, moveableToken);

    if (diceValue === 6) {
      hasRolledSix = true;
    }
  } else {
    highlightMoveableTokens(moveableTokens);
    // Removed dice roll message for immediate gameplay

    if (diceValue === 6) {
      hasRolledSix = true;
    }
  }
} // =============================================================================
// EVENT HANDLERS
// =============================================================================

function handleTokenClick(event) {
  if (gameState !== "moving") return;

  const tokenElement = event.currentTarget;
  const playerNumber = parseInt(tokenElement.dataset.player);
  const tokenNumber = parseInt(tokenElement.dataset.tokenNumber);

  // Check if it's current player's token
  if (playerNumber !== currentPlayer) {
    return;
  }

  // Check if token is moveable
  const tokenKey = `token${tokenNumber}`;
  const moveableToken = moveableTokens.find(
    ({ tokenKey: key }) => key === tokenKey
  );

  if (!moveableToken) {
    return;
  }

  // Execute the move
  executeMoveToken(tokenElement, playerNumber, tokenNumber, moveableToken);
}

async function executeMoveToken(
  tokenElement,
  playerNumber,
  tokenNumber,
  moveableToken
) {
  gameState = "animating";
  clearTokenHighlights();

  const tokenKey = `token${tokenNumber}`;
  const tokenData = tokens[`player${playerNumber}`][tokenKey];
  const playerData = getPlayerData(playerNumber);

  if (moveableToken.reason === "exit_home") {
    await moveTokenFromHome(playerData, tokenElement, playerNumber);
  } else if (moveableToken.reason === "finish") {
    // Move to center (finish position)
    tokenData.finished = true;
    tokenElement.classList.add("finished");

    // Give extra turn for finishing a token
    hasRolledSix = true;

    // Move to center triangle
    const centerTriangle = document.querySelector(
      `.center-triangle.player-${playerNumber}`
    );
    if (centerTriangle) {
      const rect = centerTriangle.getBoundingClientRect();
      const boardRect = document
        .querySelector(".board")
        .getBoundingClientRect();
      const x =
        (rect.left + rect.width / 2 - boardRect.left) / (boardRect.width / 15);
      const y =
        (rect.top + rect.height / 2 - boardRect.top) / (boardRect.height / 15);

      tokenElement.style.setProperty("--data-x", x);
      tokenElement.style.setProperty("--data-y", y);

      // Update z-index based on new --data-x value
      updateTokenZIndex(tokenElement, tokenData.position);
    }

    // Removed finish message for immediate gameplay
    checkWinCondition(playerNumber);
  } else {
    await moveToken(
      playerData.positions,
      tokenElement,
      tokenData,
      diceValue,
      playerNumber
    );
  }

  // Move to next turn immediately after animation
  nextTurn();
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Initialize tokens for active players
if (playerCount == 2 || playerCount == 4) {
  if (player1.initialPositions) {
    initializePlayerTokens(player1, 1);
  }
  if (player3.initialPositions) {
    initializePlayerTokens(player3, 3);
  }
}
if (playerCount == 4) {
  if (player2.initialPositions) {
    initializePlayerTokens(player2, 2);
  }
  if (player4.initialPositions) {
    initializePlayerTokens(player4, 4);
  }
}

// Add event listeners to all tokens
document.addEventListener("click", (e) => {
  if (e.target.closest(".token")) {
    handleTokenClick({ currentTarget: e.target.closest(".token") });
  }
});

// Add dice click handler
document.addEventListener("click", (e) => {
  if (e.target.closest(".cube")) {
    rollDice();
  }
});

// Initialize game
updateCurrentPlayerDisplay();
showMessage(
  `Game started! Player ${currentPlayer}'s turn. Click the dice to roll.`,
  "info"
);
