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
};

function drawScene() {
  // Clear the board
  context.clearRect(0, 0, boardWidth, boardHeight);

  // Draw the bird (centered vertically, near the left)
  context.drawImage(birdImg, birdX, birdY, birdWidth, birdHeight);

  // Draw pipe pair on the right side.
  // Top pipe at y=0:
  context.drawImage(topPipeImg, pipeX, pipeY, pipeWidth, pipeHeight);

  // Bottom pipe aligned to the bottom of the board.
  // (No "gap" logic yet—just static placement.)
  const bottomPipeY = boardHeight - pipeHeight;
  context.drawImage(bottomPipeImg, pipeX, bottomPipeY, pipeWidth, pipeHeight);
}
