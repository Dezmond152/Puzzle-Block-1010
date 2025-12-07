import { drawGameGrid, drawBoard, drawFigures, drawPanel } from "./drawing.js";
import { GameState } from "./gameState.js";

export function createBoardWithRows(rows, cols, tileSize = 50) {
  const board = {};
  for (let r = 0; r < rows; r++) {
    board[`row${r + 1}`] = Array.from({ length: cols }, (_, c) => ({
      x: c * tileSize,
      y: r * tileSize,
      filled: false,
      type: null
    }));
  }
  return board;
}

export function createFigure(type, shapeData, x, y) {
  return {
    type,
    shape: shapeData.shape,
    x: x - shapeData.anchorX,
    y: y - shapeData.anchorY,
    dragging: false,
    originalX: x - shapeData.anchorX,
    originalY: y - shapeData.anchorY,
  };
}

function preprocessShape(shape) {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (const [x, y] of shape) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const normalizedShape = shape.map(([x, y]) => [x - minX, y - minY]);

  const anchorX = Math.floor(width / 2);
  const anchorY = Math.floor(height / 2);

  return { shape: normalizedShape, anchorX, anchorY };
}

function addAnchors() {
  for (const key in window.FIGURES) {
    window.FIGURES[key] = preprocessShape(window.FIGURES[key].shape);
  }
}
addAnchors();

export function createRandomFiguresArr() {
  const keys = Object.keys(window.FIGURES);
  const randomKeys = [];
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * keys.length);
    randomKeys.push(keys[randomIndex]);
  }
  return randomKeys;
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 880;

const state = new GameState(8, 8);
state.initFigures();

const offsetX = (canvas.width - state.cols * state.tileSize) / 2;
const offsetY = (canvas.height - state.rows * state.tileSize) / 2 - 100;

export function getMousePosition(evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (evt.clientX - rect.left) * (canvas.width / rect.width),
    y: (evt.clientY - rect.top) * (canvas.height / rect.height),
  };
}

export function getHoveredTile(pos, figures, tileSize, offsetX = 0, offsetY = 0) {
  for (const figure of figures) {
    for (const [dx, dy] of figure.shape) {
      const px = (figure.x + dx) * tileSize + offsetX;
      const py = (figure.y + dy) * tileSize + offsetY;
      const size = tileSize;

      if (
        pos.x >= px &&
        pos.x < px + size &&
        pos.y >= py &&
        pos.y < py + size
      ) {
        return { figure, tile: [dx, dy] };
      }
    }
  }
  return null;
}

let draggedFigure = null;
let gameOver = false;

const overlay = document.getElementById("overlay");
const restartBtn = document.getElementById("restartBtn");

canvas.addEventListener("mousedown", (evt) => {
  if (gameOver) return;
  const pos = getMousePosition(evt);
  const hovered = getHoveredTile(pos, state.figures, state.tileSize, offsetX, offsetY);

  if (hovered) {
    draggedFigure = hovered.figure;
    draggedFigure.dragging = true;
    draggedFigure.originalX = draggedFigure.x;
    draggedFigure.originalY = draggedFigure.y;
  }
});

canvas.addEventListener("mousemove", (evt) => {
  if (gameOver) return;
  const pos = getMousePosition(evt);
  if (draggedFigure && draggedFigure.dragging) {
    draggedFigure.x = Math.floor((pos.x - offsetX) / state.tileSize);
    draggedFigure.y = Math.floor((pos.y - offsetY) / state.tileSize);
  }
  render();
});

canvas.addEventListener("mouseup", () => {
  if (gameOver) return;
  if (draggedFigure) {
    draggedFigure.dragging = false;

    let fits = true;
    const cellsToFill = [];

    for (const [dx, dy] of draggedFigure.shape) {
      const bx = draggedFigure.x + dx;
      const by = draggedFigure.y + dy;

      if (bx < 0 || bx >= state.cols || by < 0 || by >= state.rows) {
        fits = false;
        break;
      }
      const cell = state.board[`row${by + 1}`][bx];
      if (cell.filled) {
        fits = false;
        break;
      }
      cellsToFill.push(cell);
    }

    if (fits) {
      for (const cell of cellsToFill) {
        cell.filled = true;
        cell.type = draggedFigure.type;
      }

      state.figures = state.figures.filter((f) => f !== draggedFigure);
      state.clearFullLines();

      if (state.figures.length === 0) state.initFigures();
      if (!state.canPlaceAnyFigure()) {
        gameOver = true;
        overlay.classList.add("opacity-90", "pointer-events-auto");
        overlay.classList.remove("opacity-0", "pointer-events-none");
      }
    } else {
      draggedFigure.x = draggedFigure.originalX;
      draggedFigure.y = draggedFigure.originalY;
    }

    draggedFigure = null;
    render();
  }
});

restartBtn.addEventListener("click", () => {
  state.resetGame();
  gameOver = false;
  overlay.classList.add("opacity-0", "pointer-events-none");
  overlay.classList.remove("opacity-90", "pointer-events-auto");
  render();
});

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPanel(ctx, state.score, offsetX, offsetY, state.cols, state.tileSize);
  drawGameGrid(ctx, state.rows, state.cols, state.tileSize, offsetX, offsetY);
  drawBoard(ctx, state.board, state.rows, state.cols, state.tileSize, offsetX, offsetY);
  drawFigures(ctx, state.figures, state.tileSize, offsetX, offsetY);
}

render();
