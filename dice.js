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

  // Log the current face
  console.log(`Showing dice face: ${faceNumber}`);
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

// Function to shuffle the cube with random face selections
function shuffleCube() {
  const outerCube = document.querySelector(".outer-cube");
  const cubeContainer = document.querySelector(".cube-container");

  console.log("🎲 Starting cube shuffle...");

  // Generate first random dice number and show it immediately
  const firstRandomFace = generateVeryRandomDiceNumber();
  console.log(`🎯 First random face: ${firstRandomFace}`);
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
  outerCube.style.transform = newOuterRotation;
  cubeContainer.style.transform = newContainerRotation;

  // After 200ms, reset scale to normal and show final face
  setTimeout(() => {
    // Reset scale to normal
    const currentTransform = cube.style.transform.replace(
      / scale\([^)]*\)/g,
      ""
    );
    cube.style.transform = currentTransform;

    // Generate second very random dice number
    const secondRandomFace = generateVeryRandomDiceNumber();
    console.log(
      `🎯 Cube shuffle complete! Final rolling face: ${secondRandomFace}`
    );

    // Show the second random face
    executeShowDiceFace(secondRandomFace);
  }, 200);
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

  // Add click event to cube for shuffling
  cube.addEventListener("click", function () {
    shuffleCube();
  });
});
