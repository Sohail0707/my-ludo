// Token State and Positions
export const tokens = [];

export function initializeTokens() {
  // Initialize tokens for active players
  if (App.playerCount == 2 || App.playerCount == 4) {
    if (App.player1.initialPositions) {
      init(App.player1, 1);
    }
    if (App.player3.initialPositions) {
      init(App.player3, 3);
    }
  }
  if (App.playerCount == 4) {
    if (App.player2.initialPositions) {
      init(App.player2, 2);
    }
    if (App.player4.initialPositions) {
      init(App.player4, 4);
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
      addTokenEventListeners(tokenElement);
      App.board.appendChild(tokenElement);
    });
  }

  // Initialize token click handling after all tokens are created
  initializeTokenClickHandler();
}

function addTokenEventListeners(token) {
  // Token click handling is managed by initializeTokenClickHandler()
  // This function is kept for future individual token event listener needs
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
  App.tokens.forEach((token) => {
    const currentPosition = parseInt(token.dataset.position);

    // Tokens are safe in these conditions:
    // 1. At home (position -1)
    // 2. At starting position (position 0)
    // 3. On safe star positions (App.safe_index)
    if (
      currentPosition === -1 ||
      currentPosition === 0 ||
      App.safe_index.includes(parseInt(currentPosition))
    ) {
      token.classList.contains("safe") ? "" : token.classList.add("safe");
      console.log(`Token at position ${currentPosition} is SAFE`);
    } else {
      token.classList.remove("safe");
      console.log(`Token at position ${currentPosition} is NOT SAFE`);
    }
  });
}

// Function to move token by specified steps with animation
export async function moveToken(token, steps) {
  const playerNumber = parseInt(token.dataset.player);
  const player = App[`player${playerNumber}`];

  let currentPosition = parseInt(token.dataset.position);
  for (let step = 1; step <= steps; step++) {
    if (step === 1) analyzeAndArrangeAllTokens();
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
  App.unfreezeDice(); // Unfreeze dice after token movement
  analyzeAndArrangeAllTokens();
}

// ============================================================
// ==========TOKEN POSITIONING AND OVERLAP MANAGEMENT==========
export function analyzeAndArrangeAllTokens() {
  console.log("called analyse token");

  if (!App.tokens) return;

  // Add small delay to ensure DOM updates are complete
  setTimeout(() => {
    arrangeTokensNow();
  }, 50);
}

// Alternative synchronous version with forced style recalculation
export function analyzeAndArrangeAllTokensSync() {
  console.log("called analyse token (sync)");

  if (!App.tokens) return;

  // Force browser to recalculate styles by accessing offsetHeight
  App.tokens.forEach((token) => {
    token.offsetHeight; // Forces style recalculation
  });

  arrangeTokensNow();
}

function arrangeTokensNow() {
  // Step 1: Reset all tokens to default positioning
  App.tokens.forEach((token) => {
    token.style.setProperty("--size-value", "1.5");
    token.style.setProperty("--position-value", "0");
  });

  // Step 2: Group tokens by their x,y coordinates
  const positionGroups = new Map();

  App.tokens.forEach((token) => {
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

// =============================================================
// ===================TOKEN MOVEMENT ANALYSIS===================
export function findMoveableTokens(playerNumber, diceValue) {
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
      const playerData = App.getPlayerData(playerNumber);
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
  console.log(
    `🚫 No moveable tokens for Player ${App.gameState.currentPlayer}`
  );

  App.deactivateAllTokens();

  setTimeout(() => {
    App.switchToNextPlayer();
  }, 300);
}

export function handleSingleMoveableToken(moveableTokenInfo, diceValue) {
  console.log(
    `🎯 Auto-moving single token for Player ${App.gameState.currentPlayer}`
  );

  const { token, moveType } = moveableTokenInfo;

  App.deactivateAllTokens();

  // Calculate steps: tokens exiting home move 1 step, others move dice value
  const steps = moveType === "exit_home" ? 1 : diceValue;

  handleTokenMovement(token, steps);
}

export function handleMultipleMoveableTokens(moveableTokens, diceValue) {
  console.log(
    `🎲 Player ${App.gameState.currentPlayer} has ${moveableTokens.length} moveable tokens`
  );

  App.deactivateAllTokens();

  // Activate moveable tokens and set their movement steps
  moveableTokens.forEach(({ token, moveType }) => {
    const steps = moveType === "exit_home" ? 1 : diceValue;
    App.activateToken(token);
    token.dataset.steps = steps;
  });

  // Store for reference during user selection
  App.gameState.activeTokens = moveableTokens;
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
    const playerData = App.getPlayerData(playerNumber);
    const newPosition = currentPosition + steps;
    const maxPosition = playerData.positions.length - 1;
    if (newPosition === maxPosition) {
      moveType = "finish";
    }
  }

  // Execute movement using existing token function
  await moveToken(token, steps);

  // Handle all post-movement game logic
  await App.handlePostMovementLogic(token, playerNumber, moveType);
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
export async function handlePostMovementLogic(token, playerNumber, moveType) {
  let shouldGetExtraTurn = false;

  // Handle finishing a token
  if (moveType === "finish") {
    console.log(`🏁 Player ${playerNumber} token reached finish!`);
    token.classList.add("finished");
    shouldGetExtraTurn = true;
    App.checkWinCondition(playerNumber);
  }

  // Check for token captures
  const captureResult = checkForCapture(token, playerNumber);
  if (captureResult) {
    await handleCapture(captureResult);
    shouldGetExtraTurn = true;
  }

  // Determine next turn based on extra turn conditions and dice value
  if (!shouldGetExtraTurn && App.gameState.diceValue !== 6) {
    setTimeout(() => {
      App.switchToNextPlayer();
    }, 300);
  } else {
    console.log(`🎲 Player ${playerNumber} gets another turn!`);
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
export function checkForCapture(movingToken, playerNumber) {
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
export async function handleCapture(captureResult) {
  const { capturedToken, capturedPlayer } = captureResult;

  console.log(
    `💥 Player ${App.gameState.currentPlayer} captured Player ${capturedPlayer}'s token!`
  );

  // Move captured token back to its home position
  const playerData = App.getPlayerData(capturedPlayer);
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
// TOKEN CLICK HANDLING
// Functions to handle token click events and user interactions
// ============================================================================

/**
 * Initialize token click event listener
 * This should be called after tokens are created
 */
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
    if (playerNumber === App.gameState.currentPlayer) {
      handleTokenClick(token, steps);
    }
  }
}

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
