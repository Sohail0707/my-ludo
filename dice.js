// Queue system for showDiceFace function
let faceQueue = [];
let isProcessingQueue = false;

// Function to process the queue
function processQueue() {
  if (faceQueue.length === 0) {
    isProcessingQueue = false;
    return;
  }

  isProcessingQueue = true;
  const faceNumber = faceQueue.shift(); // Get the first item from queue

  // Execute the actual face change
  executeShowDiceFace(faceNumber);

  // Process next item after 0.3s delay
  setTimeout(() => {
    processQueue();
  }, 500);
}

// Original showDiceFace logic moved to executeShowDiceFace
function executeShowDiceFace(faceNumber) {
  const cube = document.querySelector(".cube");
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
  cube.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

// Modified showDiceFace function that uses the queue
function showDiceFace(faceNumber) {
  // Add to queue
  faceQueue.push(faceNumber);

  // Start processing if not already processing
  if (!isProcessingQueue) {
    processQueue();
  }
}

// Make functions available globally
window.showDiceFace = showDiceFace;
window.shuffleCube = shuffleCube;

// Function to shuffle the cube with random face selections
function shuffleCube(predeterminedValue = null) {
  const outerCube = document.querySelector(".outer-cube");
  const cubeContainer = document.querySelector(".cube-container");
  const diceContainer = document.querySelector(".dice-container");

  // Use predetermined value if provided, otherwise generate random
  const finalDiceValue = predeterminedValue || generateVeryRandomDiceNumber();
  // Generate first random face for shuffle animation (different from final)
  let firstRandomFace = generateVeryRandomDiceNumber();
  // Ensure first face is different from final for better visual effect
  while (firstRandomFace === finalDiceValue) {
    firstRandomFace = generateVeryRandomDiceNumber();
  }

  executeShowDiceFace(firstRandomFace);

  // Get current transform values or default to 0
  const currentOuterTransform = outerCube.style.transform || "rotateX(0deg)";
  const currentContainerTransform =
    cubeContainer.style.transform || "rotateY(0deg)";

  // Toggle between 0deg and 360deg
  const newOuterRotation = currentOuterTransform.includes("360deg")
    ? "rotateX(0deg)"
    : "rotateX(360deg)";
  const newContainerRotation = currentContainerTransform.includes("360deg")
    ? "rotateY(0deg)"
    : "rotateY(360deg)";

  // Execute rotations
  diceContainer.style.animation = "bounce-up 0.5s";

  // Remove animation after it completes to reset for next time
  setTimeout(() => {
    diceContainer.style.animation = "";
  }, 500); // Match the animation duration
  outerCube.style.transform = newOuterRotation;
  cubeContainer.style.transform = newContainerRotation;

  // After 200ms, reset scale to normal and show final face
  setTimeout(() => {
    // Reset scale to normal
    const cube = document.querySelector(".cube");
    const currentTransform = cube.style.transform.replace(
      / scale\([^)]*\)/g,
      ""
    );
    cube.style.transform = currentTransform;

    // Show the final dice value
    executeShowDiceFace(finalDiceValue);
  }, 200);

  // Return the final dice value for the game logic
  return finalDiceValue;
}

// Function to generate a very random dice number (1-6)
function generateVeryRandomDiceNumber() {
  // Use multiple sources of randomness for extra randomness
  const time = Date.now();
  const random1 = Math.random();
  const random2 = Math.random();
  const random3 = Math.random();

  // Combine different random sources
  const seed = (time * random1 * random2 * random3) % 1;

  // Generate number between 1-6
  return Math.floor(seed * 6) + 1;
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  const cube = document.querySelector(".cube");

  // Note: Click event for cube is now handled in script.js for game integration
});
