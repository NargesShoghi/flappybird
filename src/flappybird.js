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

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  // Get UI elements
  startBtn = document.getElementById("startBtn");
  restartBtn = document.getElementById("restartBtn");

  // Load images
  birdImg = new Image();
  birdImg.src = "./flappybird.png";
  birdImg.onload = function () {
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  };

  topPipeImg = new Image();
  topPipeImg.src = "./toppipe.png";

  bottomPipeImg = new Image();
  bottomPipeImg.src = "./bottompipe.png";

  // Button handlers
  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", restart);

  // Input handlers
  document.addEventListener("keydown", function (e) {
    if (e.code === "Space" || e.code === "ArrowUp") {
      if (gameState === RUNNING) {
        velocityY = reduceVelocityY;
      }
    }
    if (e.code === "KeyR") {
      if (gameState === GAME_OVER) {
        restart();
      }
    }
  });

  // Click/tap handler for flapping
  board.addEventListener("click", function () {
    if (gameState === RUNNING) {
      velocityY = reduceVelocityY;
    }
    if (gameState === GAME_OVER) {
      restart();
    }
  });

  requestAnimationFrame(update);
  this.document.getElementById("difficulty-easy").click();
};

function startGame() {
  gameState = RUNNING;
  startBtn.disabled = true;
  restartBtn.disabled = true;
  pipeInterval = setInterval(placePipes, pipeIntervalTime);
  disableDifficultyButtons();
}

function update() {
  requestAnimationFrame(update);

  context.clearRect(0, 0, board.width, board.height);

  if (gameState === START) {
    // Draw bird in starting position
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    return;
  }

  if (gameState === GAME_OVER) {
    // Draw everything frozen
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Draw pipes
    for (let i = 0; i < pipeArray.length; i++) {
      let pipe = pipeArray[i];
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
  velocityY += gravity;
  bird.y = Math.max(bird.y + velocityY, 0); // Apply gravity, limit to top of canvas
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  if (bird.y > board.height) {
    endGame();
  }

  // Pipes
  for (let i = 0; i < pipeArray.length; i++) {
    let pipe = pipeArray[i];
    pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5; // 0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
      pipe.passed = true;
    }

    if (detectCollision(bird, pipe)) {
      endGame();
    }
  }

  // Clear pipes
  while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
    pipeArray.shift(); // Removes first element from the array
  }

  // Score
  context.fillStyle = "white";
  context.font = "30px sans-serif";
  context.fillText(score, 5, 45);
}

function endGame() {
  gameState = GAME_OVER;
  restartBtn.disabled = false;
  clearInterval(pipeInterval);
  enableDifficultyButtons();
}

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

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width && // a's top left corner doesn't reach b's top right corner
    a.x + a.width > b.x && // a's top right corner passes b's top left corner
    a.y < b.y + b.height && // a's top left corner doesn't reach b's bottom left corner
    a.y + a.height > b.y
  ); // a's bottom left corner passes b's top left corner
}

function setDifficulty(btn, level) {
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
  document.querySelectorAll(".difficulty-btn").forEach((bt) => {
    bt.classList.remove("selected-difficulty");
  });

  btn.classList.add("selected-difficulty");
}

function disableDifficultyButtons() {
  document.querySelectorAll(".difficulty-btn").forEach((btn) => {
    btn.disabled = true;
  });
}

function enableDifficultyButtons() {
  document.querySelectorAll(".difficulty-btn").forEach((btn) => {
    btn.disabled = false;
  });
}
