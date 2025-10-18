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
}

function addTokenEventListeners(token) {
  // Token click handling is now managed by main.js
  // This function is kept for future event listener needs
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

// ============================================================================
// TOKEN POSITIONING AND OVERLAP MANAGEMENT
// ============================================================================
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
