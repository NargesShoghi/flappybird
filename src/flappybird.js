// --- Board ---
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// --- Bird ---
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
  x: birdX,
  y: birdY,
  width: birdWidth,
  height: birdHeight,
};

// --- Physics ---
let velocityY = 0;
let velocityX = -1;
let gravity = 0.2;
let reduceVelocityY = -4;
let pipeIntervalTime = 2000;
let pipeGaps = 4;

// --- Pipes ---
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// --- Game State ---
const START = "START";
const RUNNING = "RUNNING";
const GAME_OVER = "GAME_OVER";
let gameState = START;
let score = 0;

// --- UI Elements ---
let startBtn, restartBtn;
let pipeInterval;

// This function runs when the page loads
window.onload = function () {
  // Get the board element to set the width and height
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  // Get Start and Restart buttons
  startBtn = document.getElementById("startBtn");
  restartBtn = document.getElementById("restartBtn");

  // Load images
  // Draw the Bird in the starting position when the page is loaded first time
  birdImg = new Image();
  birdImg.src = "./flappybird.png";
  birdImg.onload = function () {
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  };

  // Create pipe images
  topPipeImg = new Image();
  topPipeImg.src = "./toppipe.png";
  bottomPipeImg = new Image();
  bottomPipeImg.src = "./bottompipe.png";

  // Add the Input handlers for handling flapping and restarting
  document.addEventListener("keydown", function (e) {
    // Handling flapping on Space or Up arrow key if the game is running
    if (e.code === "Space" || e.code === "ArrowUp") {
      if (gameState === RUNNING) {
        velocityY = reduceVelocityY;
      }

      // Start the game if it's in START state
      if (gameState === START) {
        startGame();
      }
    }
    // Handling restart on R key if the game is over
    if (e.code === "KeyR") {
      if (gameState === GAME_OVER) {
        restart();
      }
    }
  });

  // Click/tap handler for flapping
  board.addEventListener("click", function () {
    // Handling flapping on click/tap if the game is running
    if (gameState === RUNNING) {
      velocityY = reduceVelocityY;
    }
    // Handling restart on click/tap if the game is over
    if (gameState === GAME_OVER) {
      restart();
    }

    // Start the game if it's in START state
    if (gameState === START) {
      startGame();
    }
  });

  // Start the game loop
  requestAnimationFrame(update);

  // Set default difficulty to Easy
  this.document.getElementById("difficulty-easy").click();
};

function startGame() {
  // Change game state to RUNNING
  gameState = RUNNING;

  // Disable Start and Restart buttons
  startBtn.disabled = true;
  restartBtn.disabled = true;

  // Start placing pipes at intervals
  pipeInterval = setInterval(placePipes, pipeIntervalTime);

  // Disable difficulty buttons as it's already started
  disableDifficultyButtons();
}

function update() {
  requestAnimationFrame(update);

  // Clear the board
  context.clearRect(0, 0, board.width, board.height);

  // Handle different game states

  // START state
  if (gameState === START) {
    // Draw bird in starting position
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    return;
  }

  // GAME OVER state
  if (gameState === GAME_OVER) {
    // Draw everything frozen

    // Draw bird
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Draw pipes
    for (let i = 0; i < pipeArray.length; i++) {
      const pipe = pipeArray[i];
      context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
    }

    // Score
    context.fillStyle = "white";
    context.font = "30px sans-serif";
    context.fillText(score, 5, 45);

    // Game over text
    context.font = "40px sans-serif";
    context.textAlign = "center";
    context.fillText("GAME OVER", boardWidth / 2, boardHeight / 2 - 20);
    context.font = "20px sans-serif";
    context.fillText(
      "Press R to Restart",
      boardWidth / 2,
      boardHeight / 2 + 20
    );
    context.textAlign = "left";
    return;
  }

  // Game is running

  // Bird
  // Apply gravity to bird
  velocityY += gravity;
  bird.y = Math.max(bird.y + velocityY, 0); // Apply gravity, limit to top of canvas

  // Draw bird
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  // Check for collision with ground
  if (bird.y > board.height) {
    endGame();
  }

  // Pipes
  // Move and draw pipes
  for (let i = 0; i < pipeArray.length; i++) {
    const pipe = pipeArray[i];
    // Move pipe to left
    pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    // Check for score
    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5; // 0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
      pipe.passed = true;
    }

    // Check for collision between bird and pipes
    if (detectCollision(bird, pipe)) {
      endGame();
    }
  }

  // Clear pipes that are out of the board
  while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
    pipeArray.shift(); // Removes first element from the array
  }

  // Score
  context.fillStyle = "white";
  context.font = "30px sans-serif";
  context.fillText(score, 5, 45);
}

function endGame() {
  // Set game state to GAME_OVER
  gameState = GAME_OVER;

  // Enable Restart button
  restartBtn.disabled = false;

  // Stop pipe generation
  clearInterval(pipeInterval);

  // Enable difficulty buttons to allow changing difficulty before restarting
  enableDifficultyButtons();
}

// Restart the game
function restart() {
  // Reset bird position and physics
  bird.y = birdY;
  velocityY = 0;

  // Reset pipes and score
  pipeArray = [];
  score = 0;

  // Reset game state
  gameState = RUNNING;
  restartBtn.disabled = true;

  // Restart pipe generation
  pipeInterval = setInterval(placePipes, pipeIntervalTime);

  // Disable difficulty buttons as it's already started
  disableDifficultyButtons();
}

function placePipes() {
  if (gameState !== RUNNING) {
    return;
  }

  // (0-1) * pipeHeight/2.
  // 0 -> -128 (pipeHeight/4)
  // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
  let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
  let openingSpace = board.height / pipeGaps; // Space between top and bottom pipes

  let topPipe = {
    img: topPipeImg,
    x: pipeX,
    y: randomPipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(topPipe);

  let bottomPipe = {
    img: bottomPipeImg,
    x: pipeX,
    y: randomPipeY + pipeHeight + openingSpace,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(bottomPipe);
}

// AABB collision detection
function detectCollision(a, b) {
  return (
    a.x < b.x + b.width && // a's top left corner doesn't reach b's top right corner
    a.x + a.width > b.x && // a's top right corner passes b's top left corner
    a.y < b.y + b.height && // a's top left corner doesn't reach b's bottom left corner
    a.y + a.height > b.y
  ); // a's bottom left corner passes b's top left corner
}

function setDifficulty(btn, level) {
  // Set game parameters based on selected difficulty
  switch (level.toLowerCase()) {
    case "easy":
      gravity = 0.2;
      pipeIntervalTime = 5000;
      pipeGaps = 4;
      reduceVelocityY = -4;
      break;
    case "medium":
      gravity = 0.4;
      pipeIntervalTime = 4000;
      pipeGaps = 5;
      reduceVelocityY = -5;
      break;
    case "hard":
      gravity = 0.6;
      pipeIntervalTime = 3200;
      pipeGaps = 6;
      reduceVelocityY = -6;
      break;
  }

  // Update selected button UI (highlight selected difficulty)
  document.querySelectorAll(".difficulty-btn").forEach((bt) => {
    bt.classList.remove("selected-difficulty");
  });
  btn.classList.add("selected-difficulty");
}

function disableDifficultyButtons() {
  // Disable difficulty buttons
  document.querySelectorAll(".difficulty-btn").forEach((btn) => {
    btn.disabled = true;
  });
}

function enableDifficultyButtons() {
  // Enable difficulty buttons
  document.querySelectorAll(".difficulty-btn").forEach((btn) => {
    btn.disabled = false;
  });
}
