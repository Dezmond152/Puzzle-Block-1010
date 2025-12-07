export function drawGameGrid(ctx, rows, cols, tileSize = 50, offsetX = 0, offsetY = 0) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#000000ff";
  for (let i = 0; i <= rows; i++) {
    const y = i * tileSize + 0.5 + offsetY;
    ctx.beginPath();
    ctx.moveTo(offsetX, y);
    ctx.lineTo(offsetX + cols * tileSize, y);
    ctx.stroke();
  }
  for (let i = 0; i <= cols; i++) {
    const x = i * tileSize + 0.5 + offsetX;
    ctx.beginPath();
    ctx.moveTo(x, offsetY);
    ctx.lineTo(x, offsetY + rows * tileSize);
    ctx.stroke();
  }
}

export function drawTile(ctx, x, y, tileSize = 50, offsetX = 0, offsetY = 0, alpha = 1) {
  const X = x * tileSize + offsetX;
  const Y = y * tileSize + offsetY;
  const gradient = ctx.createLinearGradient(X, Y, X, Y + tileSize);
  gradient.addColorStop(0, "#2ed32eff");
  gradient.addColorStop(1, "#1d701dff");

  ctx.globalAlpha = alpha;
  ctx.fillStyle = gradient;
  ctx.fillRect(X, Y, tileSize, tileSize);

  ctx.strokeStyle = "#2d5a0fff";
  ctx.lineWidth = 2;
  ctx.strokeRect(X, Y, tileSize, tileSize);
  ctx.globalAlpha = 1;
}

export function drawFigures(ctx, figures, tileSize = 50, offsetX = 0, offsetY = 0) {
  for (const figure of figures) {
    for (const [dx, dy] of figure.shape) {
      drawTile(ctx, figure.x + dx, figure.y + dy, tileSize, offsetX, offsetY);
    }
  }
}

export function drawBoard(ctx, board, rows, cols, tileSize = 50, offsetX = 0, offsetY = 0) {
  for (let r = 0; r < rows; r++) {
    const row = board[`row${r + 1}`];
    for (let c = 0; c < cols; c++) {
      const cell = row[c];
      // не рисуем клетки, которые сейчас анимируются (их рисует drawAnimations)
      if (cell.filled && !cell.animating) {
        drawTile(ctx, c, r, tileSize, offsetX, offsetY);
      }
    }
  }
}

export function drawAnimations(ctx, animations, tileSize = 50, offsetX = 0, offsetY = 0) {
  for (const anim of animations) {
    for (const cell of anim.cells) {
      const c = cell.x / tileSize;
      const r = cell.y / tileSize;

      let alpha = 1;
      let size = tileSize;

      if (anim.progress < 0.3) {
        // вспышка
        ctx.fillStyle = "yellow";
      } else {
        ctx.fillStyle = "green";
        alpha = 1 - anim.progress;
        size = tileSize * (1 - anim.progress); // схлопывание
      }

      const X = c * tileSize + offsetX + (tileSize - size) / 2;
      const Y = r * tileSize + offsetY + (tileSize - size) / 2;

      ctx.globalAlpha = alpha;
      ctx.fillRect(X, Y, size, size);
      ctx.globalAlpha = 1;
    }
  }
}

export function drawPanel(ctx, score, offsetX, offsetY, cols, tileSize) {
  const panelHeight = 60;
  const panelWidth = cols * tileSize;
  const panelX = offsetX;
  const panelY = offsetY - panelHeight - 20;

  ctx.fillStyle = "#f0f0f0"; 
  ctx.strokeStyle = "#000000ff";
  ctx.lineWidth = 2;

  const radius = 5;
  ctx.beginPath();
  ctx.moveTo(panelX + radius, panelY);
  ctx.lineTo(panelX + panelWidth - radius, panelY);
  ctx.quadraticCurveTo(panelX + panelWidth, panelY, panelX + panelWidth, panelY + radius);
  ctx.lineTo(panelX + panelWidth, panelY + panelHeight - radius);
  ctx.quadraticCurveTo(panelX + panelWidth, panelY + panelHeight, panelX + panelWidth - radius, panelY + panelHeight);
  ctx.lineTo(panelX + radius, panelY + panelHeight);
  ctx.quadraticCurveTo(panelX, panelY + panelHeight, panelX, panelY + panelHeight - radius);
  ctx.lineTo(panelX, panelY + radius);
  ctx.quadraticCurveTo(panelX, panelY, panelX + radius, panelY);
  ctx.closePath();

  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Score: " + score, panelX + panelWidth / 2, panelY + panelHeight / 2 + 8);
  ctx.textAlign = "left";
}
