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
  const diceSize = Math.floor(boardSize * 0.08); // 8% of board size
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

      if (newPosition < playerData.positions.length) {
        moveableTokens.push({
          token,
          tokenKey,
          canMove: true,
          reason: "normal_move",
        });
      } else if (newPosition === playerData.positions.length) {
        moveableTokens.push({
          token,
          tokenKey,
          canMove: true,
          reason: "finish",
        });
      }
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

  showMessage(
    `Player ${capturedPlayer} token captured and sent home!`,
    "warning"
  );
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

  showMessage(`Player ${playerNumber} token entered the board!`, "success");
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
  const endIndex = Math.min(startIndex + diceRoll - 1, path.length - 1);

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

    await sleep(300);
  }

  // Update final position
  tokenData.position = endIndex;

  // Check if token finished
  if (endIndex === path.length - 1) {
    tokenData.finished = true;
    tokenElement.classList.add("finished");
    showMessage(`Player ${playerNumber} token reached home!`, "success");
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
  showMessage(`Player ${currentPlayer}'s turn`, "info");
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
}

function clearTokenHighlights() {
  document.querySelectorAll(".token").forEach((token) => {
    token.classList.remove("moveable");
  });
}

function highlightMoveableTokens(moveableTokens) {
  clearTokenHighlights();
  moveableTokens.forEach(({ token }) => {
    token.element.classList.add("moveable");
  });
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
    } else {
      highlightMoveableTokens(moveableTokens);
      showMessage(
        `Player ${currentPlayer} rolled ${diceValue}. Choose a token to move.`,
        "info"
      );

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

    showMessage(`Player ${playerNumber} token reached home!`, "success");
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

  // Move to next turn after animation
  setTimeout(nextTurn, 500);
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
