// --- Board ---
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// --- Bird ---
let birdWidth = 34; // width/height ratio = 17/12 if you want to preserve proportions
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = (boardHeight - birdHeight) / 2; // centered vertically
let birdImg;

// --- Physics ---
let velocity = 0;
let gravity = 0.5;
let jumpStrength = -8;

// --- Pipes (static for now) ---
let pipeWidth = 64; // width/height ratio = 1/8 for the given sprites
let pipeHeight = 250;
let pipeX = boardWidth - pipeWidth; // 296, so pipes are visible
let pipeY = 0; // top pipe at the top

let topPipeImg;
let bottomPipeImg;

// --- Game State ---
const START = "START";
const RUNNING = "RUNNING";
const GAME_OVER = "GAME_OVER";
let gameState = START;

// --- UI Elements ---
let startBtn, restartBtn;

window.onload = function () {
  // Setup canvas
  board = document.getElementById("board");
  board.width = boardWidth;
  board.height = boardHeight;
  context = board.getContext("2d");

  // Get UI elements
  startBtn = document.getElementById("startBtn");
  restartBtn = document.getElementById("restartBtn");

  // Load images
  birdImg = new Image();
  birdImg.src = "./flappybird.png";

  topPipeImg = new Image();
  topPipeImg.src = "./toppipe.png";

  bottomPipeImg = new Image();
  bottomPipeImg.src = "./bottompipe.png";

  // Only draw once everything needed is ready
  // This ensures sprites appear even on a cold load.
  let assetsLoaded = 0;
  const totalAssets = 3;

  const tryDraw = () => {
    assetsLoaded++;
    if (assetsLoaded === totalAssets) {
      drawScene();
    }
  };

  birdImg.onload = tryDraw;
  topPipeImg.onload = tryDraw;
  bottomPipeImg.onload = tryDraw;

  // Button handlers
  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", restart);

  // Input handlers
  document.addEventListener("keydown", function (evt) {
    if (evt.code === "Space" || evt.code === "ArrowUp") {
      if (gameState === RUNNING) {
        velocity = jumpStrength;
      }
    }
    if (evt.code === "KeyR") {
      if (gameState === GAME_OVER) {
        restart();
      }
    }
  });

  // Click/tap handler for flapping
  board.addEventListener("click", function () {
    if (gameState === RUNNING) {
      velocity = jumpStrength;
    }
  });

  update();
};

function startGame() {
  gameState = RUNNING;
  startBtn.disabled = true;
  restartBtn.disabled = true;
}

function drawScene() {
  // Clear the board
  context.clearRect(0, 0, boardWidth, boardHeight);

  // Draw the bird
  drawBird();

  // Draw pipe pair on the right side
  context.drawImage(topPipeImg, pipeX, pipeY, pipeWidth, pipeHeight);

  const bottomPipeY = boardHeight - pipeHeight;
  context.drawImage(bottomPipeImg, pipeX, bottomPipeY, pipeWidth, pipeHeight);

  // Draw game over text if applicable
  if (gameState === GAME_OVER) {
    context.fillStyle = "white";
    context.font = "40px sans-serif";
    context.textAlign = "center";
    context.fillText("GAME OVER", boardWidth / 2, boardHeight / 2 - 20);
    context.font = "20px sans-serif";
    context.fillText(
      "Press R or Click to Restart",
      boardWidth / 2,
      boardHeight / 2 + 20
    );
  }
}

function drawBird() {
  context.drawImage(birdImg, birdX, birdY, birdWidth, birdHeight);
}

function update() {
  if (gameState === START) {
    drawScene();
    requestAnimationFrame(update);
    return;
  }

  if (gameState === GAME_OVER) {
    drawScene();
    requestAnimationFrame(update);
    return;
  }

  // Apply physics
  velocity += gravity;
  birdY += velocity;

  // Clamp to canvas bounds
  if (birdY < 0) {
    birdY = 0;
    velocity = 0;
    endGame();
  }

  if (birdY + birdHeight > boardHeight) {
    birdY = boardHeight - birdHeight;
    velocity = 0;
    endGame();
  }

  // Redraw the entire scene
  drawScene();

  requestAnimationFrame(update);
}

function endGame() {
  gameState = GAME_OVER;
  restartBtn.disabled = false;
}

function restart() {
  // Reset bird position and physics
  birdY = (boardHeight - birdHeight) / 2;
  velocity = 0;

  // Reset game state
  gameState = RUNNING;
  restartBtn.disabled = true;

  // Redraw
  drawScene();
}
