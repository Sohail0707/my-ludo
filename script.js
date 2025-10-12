let playerCount = 2;

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

// token State and Positions
const tokens = {
  player1: {
    token1: {
      element: null,
      position: null,
      active: false,
      safe: true,
      finished: false,
    },
    token2: {
      element: null,
      position: null,
      active: false,
      safe: true,
      finished: false,
    },
    token3: {
      element: null,
      position: null,
      active: false,
      safe: true,
      finished: false,
    },
    token4: {
      element: null,
      position: null,
      active: false,
      safe: true,
      finished: false,
    },
  },
  player2: {
    token1: {
      element: null,
      position: null,
      active: false,
      safe: true,
      finished: false,
    },
    token2: {
      element: null,
      position: null,
      active: false,
      safe: true,
      finished: false,
    },
    token3: {
      element: null,
      position: null,
      active: false,
      safe: true,
      finished: false,
    },
    token4: {
      element: null,
      position: null,
      active: false,
      safe: true,
      finished: false,
    },
  },
  player3: {
    token1: {
      element: null,
      position: null,
      active: false,
      safe: true,
      finished: false,
    },
    token2: {
      element: null,
      position: null,
      active: false,
      safe: true,
      finished: false,
    },
    token3: {
      element: null,
      position: null,
      active: false,
      safe: true,
      finished: false,
    },
    token4: {
      element: null,
      position: null,
      active: false,
      safe: true,
      finished: false,
    },
  },
  player4: {
    token1: {
      element: null,
      position: null,
      active: false,
      safe: true,
      finished: false,
    },
    token2: {
      element: null,
      position: null,
      active: false,
      safe: true,
      finished: false,
    },
    token3: {
      element: null,
      position: null,
      active: false,
      safe: true,
      finished: false,
    },
    token4: {
      element: null,
      position: null,
      active: false,
      safe: true,
      finished: false,
    },
  },
};

let currentPlayer = 1;
let diceValue = 0;

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

const safe_index = [8, 13, 21, 26, 34, 39, 47];

// Initialize tokens for all players
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

// Initialize tokens for all players
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

    const tokenInnerElement = document.createElement("div");
    tokenInnerElement.classList.add("token-inner");

    tokenElement.appendChild(tokenInnerElement);
    tokens[`player${playerNumber}`][`token${index + 1}`].element = tokenElement;
    board.appendChild(tokenElement);
  });
}

// Function to move a token from home to the starting position
function moveTokenFromHome(player, token, playerNumber) {
  const startX = player.positions[0][0];
  const startY = player.positions[0][1];

  token.dataset.x = startX;
  token.dataset.y = startY;

  // Set CSS custom properties
  token.style.setProperty("--data-x", startX);
  token.style.setProperty("--data-y", startY);
}

// Function to move a token along its path
async function moveToken(path, token, diceRoll) {
  // Find the current position of the token on its path
  const currentX = parseInt(token.dataset.x);
  const currentY = parseInt(token.dataset.y);
  const currentIndex = path.findIndex(
    (coords) => coords[0] === currentX && coords[1] === currentY
  );

  // Determine the starting index for the move
  const startIndex = currentIndex === -1 ? 0 : currentIndex + 1;
  const endIndex = Math.min(startIndex + diceRoll, path.length);

  for (let i = startIndex; i < endIndex; i++) {
    const coords = path[i];
    const [x, y] = coords;
    token.dataset.x = x;
    token.dataset.y = y;

    // Set CSS custom properties
    token.style.setProperty("--data-x", x);
    token.style.setProperty("--data-y", y);

    if (safe_index.includes(i)) {
      setTimeout(() => {
        token.classList.add("safe");
      }, 200);
      await sleep(500);
    } else {
      token.classList.remove("safe");
    }

    await sleep(500);
  }
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const diceRoller = document.querySelector(".dice-roller");
diceRoller.addEventListener("click", () => {
  const roll = Math.floor(Math.random() * 6) + 1;
  diceValue = roll;
  diceRoller.textContent = roll;
});

// Example usage:
document.querySelectorAll(".token").forEach((tokenElement) => {
  tokenElement.addEventListener("click", async (event) => {
    const element = event.currentTarget;
    let player, playerNumber, token, tokenNumber;

    // Find which player and token this element belongs to
    for (const pKey in tokens) {
      for (const tKey in tokens[pKey]) {
        if (tokens[pKey][tKey].element === element) {
          playerNumber = pKey.replace("player", "");
          tokenNumber = tKey.replace("token", "");
          player = eval(`player${playerNumber}`); // Gets the player path object e.g., player1
          token = tokens[pKey][tKey];
          break;
        }
      }
      if (player) break;
    }

    if (!token) return;

    // If token is at home (not active)
    if (!token.active) {
      // A dice roll of 6 is required to move out of home
      // For this example, we'll assume a 6 was rolled.
      moveTokenFromHome(player, element, playerNumber);
      token.active = true;
      token.position = 0; // Starting position index
      token.safe = true; // Starting position is always safe
    } else {
      // If token is already on the board, move it 6 steps
      await moveToken(player.positions, element, diceValue);
      // Update token's position index after the move
      const currentX = parseInt(element.dataset.x);
      const currentY = parseInt(element.dataset.y);
      const newIndex = player.positions.findIndex(
        (pos) => pos[0] === currentX && pos[1] === currentY
      );
      if (newIndex !== -1) {
        token.position = newIndex;
        token.safe = safe_index.includes(newIndex);
      }
    }
  });
});
