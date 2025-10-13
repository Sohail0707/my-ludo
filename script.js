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

  console.log(`🎮 Board size calculation:
    Viewport: ${viewportWidth}x${viewportHeight}
    Available: ${availableSize}px
    Grid unit: ${finalGridUnit}px
    Final board: ${responsiveBoardSize}px`);

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

  console.log(`🎲 Dice size calculation:
    Board size: ${boardSize}px
    Dice size: ${diceSize}px
    Dice half: ${diceHalf}px  
    Padding: ${dicePadding}px
    Dot size: ${dotSize}px`);
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
  // Base z-index for tokens is 10
  // Add position value to make tokens further along the path appear on top
  // Add extra boost for moveable tokens
  const baseZIndex = 10;
  const positionBonus = Math.max(0, position); // Ensure non-negative
  const moveableBonus = tokenElement.classList.contains("moveable") ? 1000 : 0;

  const finalZIndex = baseZIndex + positionBonus + moveableBonus;
  tokenElement.style.zIndex = finalZIndex;

  console.log(
    `🔧 Token z-index updated: position=${position}, final z-index=${finalZIndex}, moveable=${tokenElement.classList.contains(
      "moveable"
    )}`
  );
}

function updateAllTokenZIndices() {
  // Update z-index for all active tokens based on their current positions
  for (let p = 1; p <= 4; p++) {
    const playerTokens = tokens[`player${p}`];
    for (const tokenKey in playerTokens) {
      const token = playerTokens[tokenKey];
      if (token.element && token.active && !token.finished) {
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

  console.log(
    `🔍 Finding moveable tokens for Player ${playerNumber}, dice: ${diceValue}`
  );

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
      console.log(`✅ ${tokenKey}: Can exit home (dice=6)`);
    }
    // If token is on board and won't exceed the path
    else if (token.active && !token.finished) {
      const playerData = getPlayerData(playerNumber);
      const newPosition = token.position + diceValue;
      const pathLength = playerData.positions.length;
      const finishPosition = pathLength - 1; // Last index in positions array is the finish

      console.log(
        `🔍 ${tokenKey}: position=${token.position}, dice=${diceValue}, newPosition=${newPosition}, pathLength=${pathLength}, finishPosition=${finishPosition}`
      );

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
        console.log(`✅ ${tokenKey}: Can make normal move`);
      } else if (newPosition === finishPosition) {
        // Token can finish only if it lands EXACTLY on the finish position
        moveableTokens.push({
          token,
          tokenKey,
          canMove: true,
          reason: "finish",
        });
        console.log(`✅ ${tokenKey}: Can finish (exact position)`);
      } else {
        // If newPosition > finishPosition, token cannot move
        console.log(
          `❌ ${tokenKey}: Cannot move - would overshoot (${newPosition} > ${finishPosition})`
        );
      }
      // This prevents overshooting the finish line
    } else {
      console.log(
        `⏭️ ${tokenKey}: Skipped - active=${token.active}, finished=${token.finished}`
      );
    }
  }

  console.log(
    `🎯 Player ${playerNumber} moveable tokens: ${moveableTokens.length}`
  );
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

    // Fast and smooth animation for slide effect
    await sleep(50);
  }

  // Final slide to home position
  capturedToken.element.dataset.x = initialPos[0];
  capturedToken.element.dataset.y = initialPos[1];
  capturedToken.element.style.setProperty("--data-x", initialPos[0]);
  capturedToken.element.style.setProperty("--data-y", initialPos[1]);

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

  if (finishedCount === 4) {
    gameState = "finished";
    showMessage(`🎉 Player ${playerNumber} WINS! 🎉`, "success");

    // Disable further dice rolls
    const cube = document.querySelector(".cube");
    cube.style.pointerEvents = "none";
    cube.style.opacity = "0.5";
  }
}

function nextTurn() {
  if (gameState === "finished") return;

  // Clear visual highlights
  clearTokenHighlights();

  if (!hasRolledSix) {
    // Move to next player
    if (playerCount === 2) {
      currentPlayer = currentPlayer === 1 ? 3 : 1;
    } else {
      currentPlayer = currentPlayer >= 4 ? 1 : currentPlayer + 1;
    }
  }

  hasRolledSix = false;
  gameState = "waiting";
  updateCurrentPlayerDisplay();
  // Removed turn announcement message for immediate switching
}

function updateCurrentPlayerDisplay() {
  // Remove current player highlight from all homes
  document.querySelectorAll(".home").forEach((home) => {
    home.classList.remove("current-player");
  });

  // Add highlight to current player's home
  const currentHome = document.querySelector(`.home.player-${currentPlayer}`);
  if (currentHome) {
    currentHome.classList.add("current-player");
  }

  // Move dice to current player's control box
  moveDiceToCurrentPlayer();
}

function moveDiceToCurrentPlayer() {
  // Find the dice container
  const diceContainer = document.querySelector(".dice-container");
  if (!diceContainer) {
    console.warn("Dice container not found");
    return;
  }

  // Find the current player's control box
  const currentPlayerControl = document.querySelector(
    `.player-control.player-${currentPlayer}`
  );
  if (!currentPlayerControl) {
    console.warn(`Player control box for player ${currentPlayer} not found`);
    return;
  }

  // Check if dice is already in the correct location
  if (currentPlayerControl.contains(diceContainer)) {
    return; // Already in the right place
  }

  // Remove dice from current location and add to current player's control
  diceContainer.remove();
  currentPlayerControl.appendChild(diceContainer);

  console.log(`🎲 Dice moved to Player ${currentPlayer}'s control box`);
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

  gameState = "rolling";

  // Use the shuffle animation and get the dice value
  if (window.shuffleCube) {
    diceValue = window.shuffleCube();
  } else {
    // Fallback if shuffleCube is not available
    diceValue = Math.floor(Math.random() * 6) + 1;
    if (window.showDiceFace) {
      showDiceFace(diceValue);
    }
  }

  // After dice animation, check for moveable tokens
  setTimeout(() => {
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
  }, 1000); // Reduced timeout since we're not calling showDiceFace separately
}

// =============================================================================
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

// =============================================================================
// DEBUG FUNCTIONS - COMPREHENSIVE TESTING SYSTEM
// =============================================================================

const debugFunctions = {
  // Toggle debug panel visibility
  togglePanel() {
    const panel = document.getElementById("debug-panel");
    panel.classList.toggle("open");
  },

  // Create multiple tokens stacked in same position
  createStackedTokens() {
    console.log("🛠️ Debug: Creating stacked tokens scenario");

    // Clear any existing highlights
    this.clearDebugHighlights();

    // Position multiple tokens from different players at the same board position
    const targetPosition = 10; // Middle of the path
    const targetCoords = player1.positions[targetPosition];

    // Get tokens from different players
    const player1Token = tokens.player1.token1;
    const player3Token = tokens.player3.token1;

    // Move them to the same position on the board
    this.moveTokenToPosition(player1Token, 1, targetPosition, targetCoords);
    this.moveTokenToPosition(player3Token, 3, targetPosition, targetCoords);

    // Highlight the stacked tokens
    player1Token.element.classList.add("debug-highlight");
    player3Token.element.classList.add("debug-highlight");

    showMessage("🛠️ Debug: Created stacked tokens at position 10", "info");

    // Log the scenario
    this.logDebugScenario("Stacked Tokens", {
      position: targetPosition,
      coordinates: targetCoords,
      tokensInvolved: ["Player 1 Token 1", "Player 3 Token 1"],
    });
  },

  // Create chase scenario - one token just behind another
  createChaseScenario() {
    console.log("🛠️ Debug: Creating chase scenario");

    this.clearDebugHighlights();

    // Position tokens in chase formation
    const leadPosition = 15;
    const chasePosition = 14;

    const leadToken = tokens.player1.token1;
    const chaseToken = tokens.player3.token1;

    // Move lead token
    this.moveTokenToPosition(
      leadToken,
      1,
      leadPosition,
      player1.positions[leadPosition]
    );

    // Move chasing token
    this.moveTokenToPosition(
      chaseToken,
      3,
      chasePosition,
      player3.positions[chasePosition]
    );

    // Highlight tokens
    leadToken.element.classList.add("debug-highlight");
    chaseToken.element.classList.add("debug-highlight");

    showMessage("🛠️ Debug: Chase scenario - Player 3 chasing Player 1", "info");

    this.logDebugScenario("Chase Scenario", {
      leadToken: { player: 1, position: leadPosition },
      chaseToken: { player: 3, position: chasePosition },
      distance: leadPosition - chasePosition,
    });
  },

  // Create attack scenario - token in position to capture another
  createAttackScenario() {
    console.log("🛠️ Debug: Creating attack scenario");

    this.clearDebugHighlights();

    // Position vulnerable token
    const vulnerablePosition = 20;
    const attackerPosition = 15; // 5 steps away - perfect for a 5 or 6 roll

    const vulnerableToken = tokens.player1.token1;
    const attackerToken = tokens.player3.token1;

    // Move vulnerable token to unsafe position
    this.moveTokenToPosition(
      vulnerableToken,
      1,
      vulnerablePosition,
      player1.positions[vulnerablePosition]
    );
    vulnerableToken.safe = false;
    vulnerableToken.element.classList.remove("safe");

    // Move attacker to striking distance
    this.moveTokenToPosition(
      attackerToken,
      3,
      attackerPosition,
      player3.positions[attackerPosition]
    );

    // Highlight tokens
    vulnerableToken.element.classList.add("debug-highlight");
    attackerToken.element.classList.add("debug-highlight");

    // Set current player to attacker and force a good dice roll
    currentPlayer = 3;
    updateCurrentPlayerDisplay();
    diceValue = 5; // Perfect for attack

    showMessage(
      "🛠️ Debug: Attack scenario ready - Player 3 can capture Player 1",
      "warning"
    );

    this.logDebugScenario("Attack Scenario", {
      vulnerable: { player: 1, position: vulnerablePosition, safe: false },
      attacker: { player: 3, position: attackerPosition },
      diceNeeded: vulnerablePosition - attackerPosition,
      currentDice: diceValue,
    });
  },

  // Send a token back to home area
  sendTokenHome() {
    console.log("🛠️ Debug: Sending token home");

    this.clearDebugHighlights();

    // Find an active token to send home
    const activeToken = this.findActiveToken();

    if (activeToken) {
      const { token, player, tokenKey } = activeToken;

      // Use the existing capture animation
      const captureInfo = {
        player: player,
        token: token,
        tokenKey: tokenKey,
      };

      // Highlight before sending home
      token.element.classList.add("debug-highlight");

      setTimeout(() => {
        slideTokenBackToHome(captureInfo);
        showMessage(`🛠️ Debug: Player ${player} token sent home!`, "warning");
      }, 1000);

      this.logDebugScenario("Send Token Home", {
        player: player,
        tokenKey: tokenKey,
        fromPosition: token.position,
      });
    } else {
      showMessage("🛠️ Debug: No active tokens found to send home", "error");
    }
  },

  // Create finish line scenario - token near the end
  createFinishLineScenario() {
    console.log("🛠️ Debug: Creating finish line scenario");

    this.clearDebugHighlights();

    // Position tokens near the finish line
    const playerData = getPlayerData(1);
    const pathLength = playerData.positions.length; // Total path positions
    const finishPosition = pathLength - 1; // Last index is the actual finish position

    // Position tokens at different distances from finish
    const token1 = tokens.player1.token1;
    const token2 = tokens.player1.token2;

    // Token 1: Exactly 1 step before finish (can win with dice = 1)
    const oneStepBeforeFinish = finishPosition - 1;
    this.moveTokenToPosition(
      token1,
      1,
      oneStepBeforeFinish,
      playerData.positions[oneStepBeforeFinish]
    );

    // Token 2: Exactly 3 steps before finish (can only win with dice = 3)
    const threeStepsBeforeFinish = finishPosition - 3;
    this.moveTokenToPosition(
      token2,
      1,
      threeStepsBeforeFinish,
      playerData.positions[threeStepsBeforeFinish]
    );

    // Highlight both tokens
    token1.element.classList.add("debug-highlight");
    token2.element.classList.add("debug-highlight");

    // Set current player to player 1
    currentPlayer = 1;
    updateCurrentPlayerDisplay();

    showMessage(
      "🛠️ Debug: Finish line scenario - Test with different dice values!",
      "info"
    );

    this.logDebugScenario("Finish Line Scenario", {
      token1: {
        position: oneStepBeforeFinish,
        needsToFinish: 1,
        canWinWith: [1],
      },
      token2: {
        position: threeStepsBeforeFinish,
        needsToFinish: 3,
        canWinWith: [3],
        cannotWinWith: [4, 5, 6],
      },
      pathLength: pathLength,
      finishPosition: finishPosition,
    });
  },

  // Create Player 2 specific finish line test (like in the screenshot)
  testPlayer2FinishLine() {
    console.log("🛠️ Debug: Testing Player 2 finish line scenario");

    this.clearDebugHighlights();

    // Position Player 2 token exactly like in the screenshot
    const playerData = getPlayerData(2);
    const pathLength = playerData.positions.length; // Should be 57 positions (0-56)
    const finishPosition = pathLength - 1; // Last index is the actual finish position

    console.log(`Player 2 path length: ${pathLength}`);
    console.log(`Player 2 finish position: ${finishPosition}`);

    // If token needs exactly 1 to finish, it should be 1 step before the finish position
    const needsOneToFinish = finishPosition - 1; // One step before finish position
    const token = tokens.player2.token1;

    this.moveTokenToPosition(
      token,
      2,
      needsOneToFinish,
      playerData.positions[needsOneToFinish]
    );

    // Highlight the token
    token.element.classList.add("debug-highlight");

    // Set current player to player 2
    currentPlayer = 2;
    updateCurrentPlayerDisplay();

    showMessage(
      "🛠️ Debug: Player 2 needs exactly 1 to finish - test with dice 2+!",
      "warning"
    );

    this.logDebugScenario("Player 2 Finish Line Test", {
      player: 2,
      tokenPosition: needsOneToFinish,
      pathLength: pathLength,
      needsToFinish: 1, // needs exactly 1 to finish
      canWinWith: [1],
      cannotWinWith: [2, 3, 4, 5, 6],
      finishPosition: finishPosition,
      calculation: `position ${needsOneToFinish} + dice 1 = ${
        needsOneToFinish + 1
      } (finish at ${finishPosition})`,
    });
  },

  // Force specific dice values
  setDiceValue(value) {
    diceValue = value;
    if (window.showDiceFace) {
      showDiceFace(value);
    }
    showMessage(`🛠️ Debug: Dice forced to ${value}`, "info");
    console.log(`🛠️ Debug: Dice value set to ${value}`);
  },

  // Switch to specific player
  switchPlayer(playerNum) {
    currentPlayer = playerNum;
    gameState = "waiting";
    hasRolledSix = false;
    updateCurrentPlayerDisplay();
    showMessage(`🛠️ Debug: Switched to Player ${playerNum}`, "info");
    console.log(`🛠️ Debug: Current player changed to ${playerNum}`);
  },

  // Show comprehensive game state
  showGameState() {
    const gameStateInfo = {
      currentPlayer: currentPlayer,
      gameState: gameState,
      diceValue: diceValue,
      hasRolledSix: hasRolledSix,
      playerTokens: {},
    };

    // Collect token states for all players
    for (let p = 1; p <= 4; p++) {
      const playerTokens = tokens[`player${p}`];
      gameStateInfo.playerTokens[`player${p}`] = {};

      for (const tokenKey in playerTokens) {
        const token = playerTokens[tokenKey];
        gameStateInfo.playerTokens[`player${p}`][tokenKey] = {
          position: token.position,
          active: token.active,
          safe: token.safe,
          finished: token.finished,
        };
      }
    }

    // Display in a formatted way
    const formattedInfo = JSON.stringify(gameStateInfo, null, 2);
    console.log("🛠️ Debug: Current Game State:", gameStateInfo);

    // Create a temporary info display
    this.showInfoPanel("Current Game State", formattedInfo);
  },

  // Reset game to initial state
  resetGame() {
    console.log("🛠️ Debug: Resetting game");

    // Reset game variables
    currentPlayer = 1;
    diceValue = 0;
    gameState = "waiting";
    hasRolledSix = false;
    moveableTokens = [];

    // Reset all tokens to initial positions
    for (let p = 1; p <= 4; p++) {
      const playerTokens = tokens[`player${p}`];
      const playerData = getPlayerData(p);

      for (const tokenKey in playerTokens) {
        const token = playerTokens[tokenKey];
        const tokenIndex = parseInt(tokenKey.replace("token", "")) - 1;
        const initialPos = playerData.initialPositions[tokenIndex];

        // Reset token state
        token.position = -1;
        token.active = false;
        token.safe = true;
        token.finished = false;

        // Reset visual position
        token.element.style.setProperty("--data-x", initialPos[0]);
        token.element.style.setProperty("--data-y", initialPos[1]);
        token.element.dataset.x = initialPos[0];
        token.element.dataset.y = initialPos[1];

        // Reset visual classes
        token.element.classList.remove(
          "safe",
          "moveable",
          "finished",
          "debug-highlight",
          "sliding-back"
        );
      }
    }

    // Reset dice visual
    if (window.showDiceFace) {
      showDiceFace(1);
    }

    // Reset UI
    updateCurrentPlayerDisplay();
    clearTokenHighlights();

    showMessage("🛠️ Debug: Game reset to initial state", "success");
  },

  // Helper function to move token to specific position
  moveTokenToPosition(tokenData, playerNum, position, coordinates) {
    if (!tokenData || !tokenData.element) return;

    const [x, y] = coordinates;

    // Update visual position
    tokenData.element.style.setProperty("--data-x", x);
    tokenData.element.style.setProperty("--data-y", y);
    tokenData.element.dataset.x = x;
    tokenData.element.dataset.y = y;

    // Update token state
    tokenData.position = position;
    tokenData.active = true;
    tokenData.safe = safe_index.includes(position);
    tokenData.finished = false;

    // Update visual classes
    if (tokenData.safe) {
      tokenData.element.classList.add("safe");
    } else {
      tokenData.element.classList.remove("safe");
    }

    // Update z-index based on position
    updateTokenZIndex(tokenData.element, position);

    console.log(
      `🛠️ Debug: Moved Player ${playerNum} token to position ${position} at coordinates [${x}, ${y}]`
    );
  },

  // Find an active token for testing
  findActiveToken() {
    for (let p = 1; p <= 4; p++) {
      const playerTokens = tokens[`player${p}`];
      for (const tokenKey in playerTokens) {
        const token = playerTokens[tokenKey];
        if (token.active && !token.finished) {
          return { token, player: p, tokenKey };
        }
      }
    }
    return null;
  },

  // Clear debug highlights
  clearDebugHighlights() {
    document.querySelectorAll(".token.debug-highlight").forEach((token) => {
      token.classList.remove("debug-highlight");
    });
  },

  // Log debug scenarios
  logDebugScenario(scenarioName, details) {
    console.log(`🛠️ Debug Scenario: ${scenarioName}`);
    console.log("📊 Scenario Details:", details);
    console.log("🎮 Current Game State:", {
      currentPlayer,
      gameState,
      diceValue,
      hasRolledSix,
    });
  },

  // Show temporary info panel
  showInfoPanel(title, content) {
    // Remove existing info panel
    const existingPanel = document.querySelector(".debug-info-overlay");
    if (existingPanel) {
      existingPanel.remove();
    }

    // Create new info panel
    const overlay = document.createElement("div");
    overlay.className = "debug-info-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;

    const panel = document.createElement("div");
    panel.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 10px;
      max-width: 80%;
      max-height: 80%;
      overflow: auto;
    `;

    panel.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #333;">${title}</h3>
      <div class="debug-info">${content}</div>
      <button onclick="this.closest('.debug-info-overlay').remove()" 
              style="margin-top: 15px; padding: 10px 20px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Close
      </button>
    `;

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // Auto-close after 10 seconds
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.remove();
      }
    }, 10000);
  },

  // Test board rotation for different players
  testBoardRotation() {
    console.log("🔄 Debug: Testing board rotation system");

    let currentRotation = 1;
    const rotationInterval = setInterval(() => {
      // Update the global variable
      window.BOTTOM_LEFT_PLAYER = currentRotation;

      // Apply the rotation
      setBoardRotation();

      console.log(`🔄 Rotation test: Player ${currentRotation} at bottom-left`);

      currentRotation++;
      if (currentRotation > 4) {
        currentRotation = 1;
        clearInterval(rotationInterval);
        console.log("🔄 Board rotation test completed - reset to Player 1");
      }
    }, 2000); // Change every 2 seconds
  },

  // Test dice movement between players
  testDiceMovement() {
    console.log("🎲 Debug: Testing dice movement between players");

    let testPlayer = 1;
    const moveInterval = setInterval(() => {
      // Switch to the test player
      currentPlayer = testPlayer;
      updateCurrentPlayerDisplay();

      console.log(`🎲 Dice moved to Player ${testPlayer}`);

      testPlayer++;
      if (testPlayer > 4) {
        testPlayer = 1;
        clearInterval(moveInterval);
        console.log("🎲 Dice movement test completed - reset to Player 1");
      }
    }, 1500); // Change every 1.5 seconds
  },
};

// Make debug functions globally available
window.debugFunctions = debugFunctions;
window.setBoardRotation = setBoardRotation;

// Add keyboard shortcuts for debug functions
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey) {
    switch (e.key) {
      case "D":
        debugFunctions.togglePanel();
        e.preventDefault();
        break;
      case "S":
        debugFunctions.createStackedTokens();
        e.preventDefault();
        break;
      case "C":
        debugFunctions.createChaseScenario();
        e.preventDefault();
        break;
      case "A":
        debugFunctions.createAttackScenario();
        e.preventDefault();
        break;
      case "F":
        debugFunctions.createFinishLineScenario();
        e.preventDefault();
        break;
      case "R":
        debugFunctions.resetGame();
        e.preventDefault();
        break;
    }
  }
});

console.log("🛠️ Debug System Loaded!");
console.log("🔧 Keyboard shortcuts:");
console.log("   Ctrl+Shift+D: Toggle debug panel");
console.log("   Ctrl+Shift+S: Create stacked tokens");
console.log("   Ctrl+Shift+C: Create chase scenario");
console.log("   Ctrl+Shift+A: Create attack scenario");
console.log("   Ctrl+Shift+F: Create finish line scenario");
console.log("   Ctrl+Shift+R: Reset game");
