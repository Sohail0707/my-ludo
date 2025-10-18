// Create Dice
export const dice = document.createElement("div");
dice.className = "dice";

// Append dice to spinner
const diceSpinner = document.createElement("div");
diceSpinner.className = "dice-spinner";
diceSpinner.appendChild(dice);

// Append dice spinner to container
export const diceContainer = document.createElement("div");
diceContainer.className = "dice-container";
diceContainer.appendChild(diceSpinner);

diceContainer.addEventListener("click", () => {
  rollDice();
});

// Create Dice Faces
for (let i = 1; i <= 6; i++) {
  const face = document.createElement("div");
  face.className = `face face-${i}`;

  for (let j = 1; j <= i; j++) {
    // Create Dots
    const dot = document.createElement("div");
    dot.className = "dot";
    face.appendChild(dot);
  }

  switch (i) {
    // Assign face positions
    case 1:
      face.classList.add("front");
      break;
    case 2:
      face.classList.add("right");
      break;
    case 3:
      face.classList.add("top");
      break;
    case 4:
      face.classList.add("bottom");
      break;
    case 5:
      face.classList.add("left");
      break;
    case 6:
      face.classList.add("back");
      break;
  }

  dice.appendChild(face); // Append face to dice
}

// Function Show Dice Face
function showDiceFace(faceNumber) {
  let rotateX = 0;
  let rotateY = 0;

  // Set rotation values for each face
  switch (faceNumber) {
    case 1: // Front face (1 dot)
      rotateX = 0;
      rotateY = 0;
      break;
    case 2: // Right face (2 dots)
      rotateX = 0;
      rotateY = -90;
      break;
    case 3: // Top face (3 dots)
      rotateX = -90;
      rotateY = 0;
      break;
    case 4: // Bottom face (4 dots)
      rotateX = 90;
      rotateY = 0;
      break;
    case 5: // Left face (5 dots)
      rotateX = 0;
      rotateY = 90;
      break;
    case 6: // Back face (6 dots)
      rotateX = 0;
      rotateY = 180;
      break;
  }

  // Apply the rotation
  dice.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

// Function Roll Dice
function rollDice() {
  // Use multiple sources of randomness for extra randomness
  const time = Date.now();
  const random1 = Math.random();
  const random2 = Math.random();
  const random3 = Math.random();

  // Combine different random sources
  const seed = (time * random1 * random2 * random3) % 1;
  freezeDice(); // Freeze dice during roll
  // Generate number between 1-6
  const randomDiceValue = Math.floor(seed * 6) + 1;

  diceSpinner.classList.add("spin");
  showDiceFace(randomDiceValue);
  setTimeout(() => {
    diceSpinner.classList.remove("spin");
    // App.diceValue = randomDiceValue;
    // App.updateGame();
    App.handleDiceValue(randomDiceValue);
  }, 500);
}

// Freeze dice
export function freezeDice() {
  diceContainer.style.pointerEvents = "none";
}

// Unfreeze dice
export function unfreezeDice() {
  diceContainer.style.pointerEvents = "auto";
}
