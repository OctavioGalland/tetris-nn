const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 21;
const board = [...Array(BOARD_WIDTH)].map(_ => [...Array(BOARD_HEIGHT)].map(_ => 0));

const canvas = document.getElementById('board');
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const ctx = canvas.getContext('2d')

const CELL_EMPTY = 0;
const CELL_FALLING = 1;
const CELL_FIXED = -1;

let gameOver = false;
let score = 0;

function boardForEach(f) {
  board.forEach((col, colIdx) => {
    col.forEach((cell, rowIdx) => {
      f(cell, rowIdx, colIdx);
    });
  });
}

function renderGame() {
  const blockSize = 20; // pixels
  const padding = 3; // pixels
  ctx.fillStyle = 'gray';
  ctx.fillRect(0, 0, BOARD_WIDTH * (blockSize + padding), (BOARD_HEIGHT - 1) * (blockSize + padding));
  ctx.fillStyle = 'red';
  boardForEach((cell, rowIdx, colIdx) => {
    if (rowIdx > 0 && cell == CELL_FALLING) {
      ctx.fillRect(colIdx * (blockSize + padding), (rowIdx - 1) * (blockSize + padding), blockSize, blockSize);
    }
  });
  ctx.fillStyle = 'black';
  boardForEach((cell, rowIdx, colIdx) => {
    if (rowIdx > 0 && cell == CELL_FIXED) {
      ctx.fillRect(colIdx * (blockSize + padding), (rowIdx - 1) * (blockSize + padding), blockSize, blockSize);
    }
  });

  const scoreX = BOARD_WIDTH * (blockSize + padding) + padding;
  const scoreY = 50
  ctx.fillStyle = 'white';
  ctx.fillRect(scoreX, scoreY - 50, 200, 100);
  ctx.fillStyle = 'black';
  ctx.font = "24px serif";
  ctx.fillText(`Score: ${score}`, scoreX, scoreY);
}

function minDistanceToGround() {
  let minDistance = Infinity;
  for (let colIdx = 0; colIdx < BOARD_WIDTH; colIdx++) {
    let lowestFallingBlock = 0;
    let topFixedBlock = 21;
    for (let rowIdx = BOARD_HEIGHT - 1; rowIdx > 0; rowIdx--) {
      const cell = board[colIdx][rowIdx];
      if (rowIdx > lowestFallingBlock && cell == CELL_FALLING) {
        lowestFallingBlock = rowIdx;
      } else if (rowIdx > lowestFallingBlock && rowIdx < topFixedBlock && cell == CELL_FIXED) {
        topFixedBlock = rowIdx;
      }
    }

    const distance = topFixedBlock - lowestFallingBlock;
    if (distance < minDistance) {
      minDistance = distance;
    }
  }
  return minDistance;
}

function fallDown() {
  let fallenBlocks = 0;
  for (let rowIdx = BOARD_HEIGHT - 1; rowIdx > 0; rowIdx--) {
    for (let colIdx = 0; colIdx < BOARD_WIDTH; colIdx++) {
      if (board[colIdx][rowIdx - 1] == CELL_FALLING) {
        board[colIdx][rowIdx - 1] = CELL_EMPTY;
        board[colIdx][rowIdx] = CELL_FALLING;
        fallenBlocks += 1;
        if (fallenBlocks == 4) {
          return;
        }
      }
    }
  }
  return;
}

function dragBoardDownFrom(from) {
  for (let rowIdx = from; rowIdx > 0; rowIdx--) {
    for (let colIdx = 0; colIdx < BOARD_WIDTH; colIdx++) {
      board[colIdx][rowIdx] = board[colIdx][rowIdx - 1];
      board[colIdx][rowIdx - 1] = CELL_EMPTY;
    }
  }
}

function canSpawnPiece() {
  for (let colIdx = 0; colIdx < BOARD_WIDTH; colIdx++) {
    if (board[colIdx][1] != CELL_EMPTY) {
      return false;
    }
  }
  return true;
}

function clearBoard() {
  boardForEach((_, rowIdx, colIdx) => board[colIdx][rowIdx] = CELL_EMPTY)
}

function resetGame() {
  score = 0;
  nextSpawn = 0;
  clearBoard();
  gameOver = false;
  spawnNextRound = true;
}

const moves = [
  [[[1, 0], [0, 1], [1, 1], [2, 1]], [[0, 0], [0, 1], [0, 2], [1, 1]], [[1, 1], [0, 0], [1, 0], [2, 0]], [[0, 1], [1, 0], [1, 1], [1, 2]]],
  [[[1, 0], [1, 1], [0, 1], [0, 2]], [[0, 0], [1, 0], [1, 1], [2, 1]]],
  [[[0, 0], [0, 1], [1, 1], [1, 2]], [[0, 1], [1, 1], [1, 0], [2, 0]]],
  [[[0, 0], [0, 1], [1, 1], [2, 1]], [[0, 0], [0, 1], [0, 2], [1, 0]], [[0, 0], [1, 0], [2, 0], [2, 1]], [[1, 0], [1, 1], [1, 2], [0, 2]]],
  [[[2, 0], [0, 1], [1, 1], [2, 1]], [[0, 0], [0, 1], [0, 2], [1, 2]], [[0, 0], [1, 0], [2, 0], [0, 1]], [[1, 0], [1, 1], [1, 2], [0, 0]]],
  [[[0, 0], [0, 1], [1, 0], [1, 1]]],
  [[[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [0, 1], [0, 2], [0, 3]]],
];

let nextSpawn = 0;
let lastSpawn = 0;
let spawnNextRound = true;


function update(shouldRender, nn) {
  if (isKeyPressed('space')) {
    resetGame();
  }
  if (gameOver) {
    return;
  }

  if (nn) {
    // One-hot encoding
    // const x = board.map(col => col.slice(1)).map(col => col.map(cell => [cell == CELL_EMPTY, cell == CELL_FALLING, cell == CELL_FIXED])).flat().flat();
    // One-hot encoding dropping empty columns
    // const x = board.map(col => col.slice(1)).map(col => col.map(cell => [cell == CELL_FALLING, cell == CELL_FIXED])).flat().flat();
    // Map state
    const x = board.map(col => col.slice(1)).flat();
    // Gray-scale conversion
    // const maxVal = Math.max(CELL_EMPTY, CELL_FALLING, CELL_FIXED);
    // const minVal = Math.min(CELL_EMPTY, CELL_FALLING, CELL_FIXED)
    // const x = board.map(col => col.slice(1).map(cell => (cell - minVal) / (maxVal - minVal))).flat();

    const y = predict(x, nn);
    neuronKeys = new Map();
    neuronKeys.set(0, 'right');
    neuronKeys.set(1, 'down');
    neuronKeys.set(2, 'left');
    neuronKeys.set(3, 'up');
    y.forEach((v, idx) => {
      let key = neuronKeys.get(idx);
      handleInputRelease(key);
      if (v > 0.5) {
        handleInputPress(key);
      }
    });
  }

  if (isKeyPressed('up')) {
    let alreadyMoved = false;
    const piece = lastSpawn;
    const positionsForPiece = moves[piece];

    for (let colIdx = 0; colIdx < BOARD_WIDTH && !alreadyMoved; colIdx++) {
      for (let rowIdx = 0; rowIdx < BOARD_HEIGHT && !alreadyMoved; rowIdx++) {
        for (let position = 0; position < positionsForPiece.length; position++) {
          const idxs = moves[piece][position];

          const pieceSpotted = idxs.every(idx => {
            let colOffset = idx[0];
            let rowOffset = idx[1];
            let newCol = colIdx + colOffset;
            let newRow = rowIdx + rowOffset;
            let res = newCol < BOARD_WIDTH && newRow < BOARD_HEIGHT && board[newCol][newRow] == CELL_FALLING;
            return res;
          });

          if (pieceSpotted) {
            const nextPosition = (position + 1) % positionsForPiece.length;
            const nextIdxs = moves[piece][nextPosition];

            const canMove = nextIdxs.every(idx => {
              let colOffset = idx[0];
              let rowOffset = idx[1];
              let newCol = colIdx + colOffset;
              let newRow = rowIdx + rowOffset;
              let res = newCol < BOARD_WIDTH && newRow < BOARD_HEIGHT && board[newCol][newRow] != CELL_FIXED;
              return res;
            });

            if (canMove) {
              idxs.forEach(idx => {
                board[colIdx + idx[0]][rowIdx + idx[1]] = CELL_EMPTY;
              });
              nextIdxs.forEach(idx => {
                board[colIdx + idx[0]][rowIdx + idx[1]] = CELL_FALLING;
              });
            }

            break;
          }
        }
      }
    }
  }

  if ((isKeyPressed('left') || isKeyPressed('right')) && !(isKeyPressed('left') && isKeyPressed('right'))) {
    const isLeftPressed = isKeyPressed('left');
    let isMovementLegal = true;
    for (let rowIdx = 0; rowIdx < BOARD_HEIGHT; rowIdx++) {
      for (let colIdx = 0; colIdx < BOARD_WIDTH; colIdx++) {
        if (board[colIdx][rowIdx] == CELL_FALLING) {
          if (isLeftPressed) {
            isMovementLegal &= colIdx > 0 && board[colIdx - 1][rowIdx] != CELL_FIXED;
          } else {
            isMovementLegal &= colIdx < BOARD_WIDTH - 1 && board[colIdx + 1][rowIdx] != CELL_FIXED;
          }
        }
      }
    }

    if (isMovementLegal) {
      const start = (isLeftPressed ? 0 : BOARD_WIDTH - 1)
      const lowerBound = (isLeftPressed ? 0 : 1);
      const upperBound = BOARD_WIDTH - (isLeftPressed ? 1 : 0);
      const increment = isLeftPressed ? 1 : -1;

      for (let colIdx = start; lowerBound <= colIdx && colIdx < upperBound; colIdx += increment) {
        for (let rowIdx = 0; rowIdx < BOARD_HEIGHT; rowIdx++) {
          targetColIdx = colIdx + increment;
          if (board[targetColIdx][rowIdx] == CELL_FALLING) {
            board[colIdx][rowIdx] = board[targetColIdx][rowIdx];
            board[targetColIdx][rowIdx] = CELL_EMPTY;
          }
        }
      }
    }
  }

  const distToGround = minDistanceToGround();
  // reward every frame survived (when pressing down make it double) so as to
  // have a relatively smooth fitness function
  if (distToGround > 1) {
    score += 1;
    fallDown();
    if (isKeyDown('down') && distToGround > 2) {
      score += 1;
      fallDown();
    }
  }

  const oldSpawnNextRound = spawnNextRound;
  if (distToGround == 1) {
    spawnNextRound = true;
    for (let rowIdx = BOARD_HEIGHT - 1; rowIdx >= 0; rowIdx--) {
      for (let colIdx = 0; colIdx < BOARD_WIDTH; colIdx++) {
        if (board[colIdx][rowIdx] == CELL_FALLING) {
          board[colIdx][rowIdx] = CELL_FIXED;
        }
      }
    }
  }

  let fullRows = [];
  const fullRowsScores = [0, 1000, 3000, 5000, 10000];
  for (let rowIdx = BOARD_HEIGHT - 1; rowIdx >= 0; rowIdx--) {
    let rowFull = true;
    for (let colIdx = 0; colIdx < BOARD_WIDTH; colIdx++) {
      rowFull = rowFull && board[colIdx][rowIdx] == CELL_FIXED;
    }
    if (rowFull) {
      fullRows.push(rowIdx);
    }
  }

  score += fullRowsScores[fullRows.length];

  fullRows.reverse().forEach(rowIdx => dragBoardDownFrom(rowIdx));

  if (oldSpawnNextRound) {
    if (canSpawnPiece()) {
      spawnNextRound = false;
      // const nextSpawn = Math.floor(Math.random() * 7);
      lastSpawn = nextSpawn;
      if (nextSpawn == 0) {
        board[5][0] = CELL_FALLING;
        board[4][1] = CELL_FALLING;
        board[5][1] = CELL_FALLING;
        board[6][1] = CELL_FALLING;
      } else if (nextSpawn == 1) {
        board[4][0] = CELL_FALLING;
        board[5][0] = CELL_FALLING;
        board[5][1] = CELL_FALLING;
        board[6][1] = CELL_FALLING;
      } else if (nextSpawn == 2) {
        board[4][1] = CELL_FALLING;
        board[5][1] = CELL_FALLING;
        board[5][0] = CELL_FALLING;
        board[6][0] = CELL_FALLING;
      } else if (nextSpawn == 3) {
        board[4][0] = CELL_FALLING;
        board[4][1] = CELL_FALLING;
        board[5][1] = CELL_FALLING;
        board[6][1] = CELL_FALLING;
      } else if (nextSpawn == 4) {
        board[6][0] = CELL_FALLING;
        board[4][1] = CELL_FALLING;
        board[5][1] = CELL_FALLING;
        board[6][1] = CELL_FALLING;
      } else if (nextSpawn == 5) {
        board[4][0] = CELL_FALLING;
        board[4][1] = CELL_FALLING;
        board[5][0] = CELL_FALLING;
        board[5][1] = CELL_FALLING;
      } else if (nextSpawn == 6) {
        board[4][1] = CELL_FALLING;
        board[5][1] = CELL_FALLING;
        board[6][1] = CELL_FALLING;
        board[7][1] = CELL_FALLING;
      }
      nextSpawn = (nextSpawn + 1) % 7;
    } else {
      gameOver = true;
    }
  }

  if (shouldRender) {
    renderGame();
  }
  updateKeyboardState();
}
