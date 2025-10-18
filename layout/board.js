export const board = document.querySelector(".board");
board.setAttribute("current-player", "1");

export function updateCurrentPlayerOnBoard(playerNumber) {
  board.setAttribute("current-player", `${playerNumber}`);
}

export function removeBoardCurrentPlayer() {
  board.removeAttribute("current-player");
}

export function makePlayerWin(playerNumber, winnerPosition) {
  // Instead of setting global winner-player/winner-position, set attributes on the player's home element
  const home = document.querySelector(`.home.position-${playerNumber}`);
  if (home) {
    home.setAttribute("winner-player", `${playerNumber}`);
    home.setAttribute("winner-position", `${winnerPosition}`);
  }
}
