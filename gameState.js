import { createBoardWithRows, createFigure, createRandomFiguresArr } from "./main.js";

export class GameState {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.tileSize = 50;
    this.board = createBoardWithRows(rows, cols, this.tileSize);
    this.figures = [];
    this.selectedFigure = null;
    this.score = 0;
  }

  initFigures() {
    const figureTypes = createRandomFiguresArr();
    const trayY = this.rows + 3;
    const gap = 6;
    const total = figureTypes.length;
    const lineWidth = (total - 1) * gap;
    const trayOffsetX = Math.floor((this.cols - lineWidth) / 2);

    this.figures = figureTypes.map((t, i) =>
      createFigure(t, window.FIGURES[t], trayOffsetX + i * gap, trayY)
    );
  }

  resetGame() {
    this.board = createBoardWithRows(this.rows, this.cols, this.tileSize);
    this.initFigures();
    this.score = 0;
  }

  canPlaceAnyFigure() {
    for (const figure of this.figures) {
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          let fits = true;
          for (const [dx, dy] of figure.shape) {
            const bx = c + dx;
            const by = r + dy;
            if (bx < 0 || bx >= this.cols || by < 0 || by >= this.rows) {
              fits = false;
              break;
            }
            if (this.board[`row${by + 1}`][bx].filled) {
              fits = false;
              break;
            }
          }
          if (fits) return true;
        }
      }
    }
    return false;
  }

  clearFullLines() {
    let clearedLines = 0;

    for (let r = 0; r < this.rows; r++) {
      const row = this.board[`row${r + 1}`];
      if (row.every(cell => cell.filled)) {
        for (const cell of row) {
          cell.filled = false;
          cell.type = null;
        }
        clearedLines++;
      }
    }

    for (let c = 0; c < this.cols; c++) {
      let full = true;
      for (let r = 0; r < this.rows; r++) {
        if (!this.board[`row${r + 1}`][c].filled) {
          full = false;
          break;
        }
      }
      if (full) {
        for (let r = 0; r < this.rows; r++) {
          this.board[`row${r + 1}`][c].filled = false;
          this.board[`row${r + 1}`][c].type = null;
        }
        clearedLines++;
      }
    }

    this.score += clearedLines * 100;
  }
}
