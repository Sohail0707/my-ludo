export const board = document.querySelector(".board");
board.setAttribute("current-player", "1");

export function updateCurrentPlayerOnBoard(playerNumber) {
  board.setAttribute("current-player", `${playerNumber}`);
}

export function removeBoardCurrentPlayer() {
  board.removeAttribute("current-player");
}

export function makePlayerWin(playerNumber, winnerPosition) {
  board.setAttribute("winner-player", `${playerNumber}`);
  board.setAttribute("winner-position", `${winnerPosition}`);
}
