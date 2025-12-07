import { createBoardWithRows, createFigure, createRandomFiguresArr } from "./main.js";

export class GameState {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.tileSize = 50;
    this.board = createBoardWithRows(rows, cols, this.tileSize); // клетки с { animating: false }
    this.figures = [];
    this.selectedFigure = null;
    this.score = 0;
    this.animations = []; // { cells: Cell[], progress: 0..1 }
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
    this.animations = [];
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
            const cell = this.board[`row${by + 1}`][bx];
            // считаем анимирующиеся клетки занятыми
            if (cell.filled || cell.animating) {
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
    const cellsToAnimate = new Set();
    let clearedRowCount = 0;
    let clearedColCount = 0;

    // Полные строки
    for (let r = 0; r < this.rows; r++) {
      const row = this.board[`row${r + 1}`];
      if (row.every(cell => cell.filled && !cell.animating)) {
        clearedRowCount++;
        for (const cell of row) {
          cellsToAnimate.add(cell);
        }
      }
    }

    // Полные столбцы
    for (let c = 0; c < this.cols; c++) {
      let full = true;
      for (let r = 0; r < this.rows; r++) {
        const cell = this.board[`row${r + 1}`][c];
        if (!cell.filled || cell.animating) {
          full = false;
          break;
        }
      }
      if (full) {
        clearedColCount++;
        for (let r = 0; r < this.rows; r++) {
          cellsToAnimate.add(this.board[`row${r + 1}`][c]);
        }
      }
    }

    if (cellsToAnimate.size > 0) {
      // помечаем клетки как анимирующиеся
      const cells = Array.from(cellsToAnimate);
      for (const cell of cells) {
        cell.animating = true;
      }
      this.animations.push({ cells, progress: 0 });
      this.score += (clearedRowCount + clearedColCount) * 100;
    }
  }

  updateAnimations() {
    if (this.animations.length === 0) return;
    for (const anim of this.animations) {
      anim.progress = Math.min(1, anim.progress + 0.06); // ~16fps -> ~1s
      if (anim.progress >= 1) {
        for (const cell of anim.cells) {
          cell.filled = false;
          cell.type = null;
          cell.animating = false;
        }
      }
    }
    // удаляем завершённые
    this.animations = this.animations.filter(a => a.progress < 1);
  }
}
