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

// --- Pipes (static for now) ---
let pipeWidth = 64; // width/height ratio = 1/8 for the given sprites
let pipeHeight = 250;
let pipeX = boardWidth - pipeWidth; // 296, so pipes are visible
let pipeY = 0; // top pipe at the top

let topPipeImg;
let bottomPipeImg;
let gravity = 1;
let jumpVelocity = 50;

window.onload = function () {
  // Setup canvas
  board = document.getElementById("board");
  board.width = boardWidth;
  board.height = boardHeight;
  context = board.getContext("2d");

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

  this.addEventListener("keydown", function (evt) {
    if (evt.code === "Space" || evt.code === "ArrowUp") {
      birdY -= jumpVelocity; // Move bird up by 50 pixels
      if (birdY < 0) {
        birdY = 0; // Prevent bird from going above the board
      }
    }
  });

  update();
};

function drawScene() {
  // Clear the board
  context.clearRect(0, 0, boardWidth, boardHeight);

  // Draw the bird (centered vertically, near the left)
  drawBird();

  // Draw pipe pair on the right side.
  // Top pipe at y=0:
  context.drawImage(topPipeImg, pipeX, pipeY, pipeWidth, pipeHeight);

  // Bottom pipe aligned to the bottom of the board.
  // (No "gap" logic yet—just static placement.)
  const bottomPipeY = boardHeight - pipeHeight;
  context.drawImage(bottomPipeImg, pipeX, bottomPipeY, pipeWidth, pipeHeight);
}
// Function to draw the bird at its current position
function drawBird() {
  context.drawImage(birdImg, birdX, birdY, birdWidth, birdHeight);
}

// Main game loop
function update() {
  // Clears the entire canvas
  //context.clearRect(0, 0, board.width, board.height);
  // Clear only the bird's previous area (small padding to avoid artifacts)
  context.clearRect(birdX - 2, 0, birdWidth + 4, boardHeight);
  // Updates the bird's position
  birdY = birdY + gravity; // Gravity effect: bird falls down each frame
  if (birdY + birdHeight > boardHeight) {
    birdY = boardHeight - birdHeight; // Prevent bird from falling below the board
    alert("Game Over!");
    return; // Stop the game loop
  }
  // Draws the bird at its new position
  drawBird();
  requestAnimationFrame(update);
}
