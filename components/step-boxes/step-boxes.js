// IMPORTS
import { board } from "../../layout/board.js";

// STEP BOXES GENERATION
export function generateStepBoxes() {
  for (let i = 0; i < 72; i++) {
    const stepBox = document.createElement("div");
    stepBox.classList.add("step-boxes");

    if ([4, 5, 7, 10, 13, 16].includes(i)) {
      stepBox.classList.add("position-1");
    }
    if ([36, 37, 38, 39, 40, 52].includes(i)) {
      stepBox.classList.add("position-2");
    }
    if ([55, 58, 61, 64, 66, 67].includes(i)) {
      stepBox.classList.add("position-3");
    }
    if ([19, 31, 32, 33, 34, 35].includes(i)) {
      stepBox.classList.add("position-4");
    }

    if ([6, 27, 44, 65].includes(i)) {
      stepBox.innerHTML = `<svg
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
    board.appendChild(stepBox);
  }
}
