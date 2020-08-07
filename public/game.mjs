import Player from "./Player.mjs";
import Collectible from "./Collectible.mjs";

const socket = io();
const canvas = document.getElementById("game-window");
const context = canvas.getContext("2d");

const WIDTH = 640;
const HEIGHT = 480;

var x = canvas.width / 2;
var y = canvas.height - 30;

var dx = 5;
var dy = 5;

var playerRadius = 20;
var playerColor = "#33ccff";

var collectibleRadius = 5;
var collectibleColor = "#FFD700";
var collectPosX = Math.floor(Math.random() * canvas.width);
var collectPosY = Math.floor(Math.random() * canvas.height);

var score = 0;

var rightMove = false;
var leftMove = false;
var upMove = false;
var downMove = false;

const keyDownHandler = (e) => {
  // ArrowKeys --> WASD
  if (e.keyCode == 39 || e.keyCode == 68) {
    rightMove = true;
  } else if (e.keyCode == 37 || e.keyCode == 65) {
    leftMove = true;
  } else if (e.keyCode == 38 || e.keyCode == 87) {
    upMove = true;
  } else if (e.keyCode == 40 || e.keyCode == 83) {
    downMove = true;
  }
};

const keyUpHandler = (e) => {
  // ArrowKeys --> WASD
  if (e.keyCode == 39 || e.keyCode == 68) {
    rightMove = false;
  } else if (e.keyCode == 37 || e.keyCode == 65) {
    leftMove = false;
  } else if (e.keyCode == 38 || e.keyCode == 87) {
    upMove = false;
  } else if (e.keyCode == 40 || e.keyCode == 83) {
    downMove = false;
  }
};

const drawPlayer = () => {
  context.beginPath();
  context.arc(x, y, playerRadius, 0, Math.PI * 2);
  context.fillStyle = playerColor;
  context.fill();
  context.strokeStyle = "rgba(0, 0, 255, 0.5)";
  context.stroke();
  context.closePath();
};

const drawCollectible = () => {
  context.beginPath();
  context.arc(collectPosX, collectPosY, collectibleRadius, 0, Math.PI * 2);
  context.fillStyle = collectibleColor;
  context.fill();
  context.strokeStyle = "rgba(0, 0, 255, 0.5)";
  context.stroke();
  context.closePath();
};

const collissionDetection = () => {
  if (
    x + (playerRadius + collectibleRadius) >= collectPosX &&
    x - (playerRadius + collectibleRadius) <= collectPosX &&
    y + (playerRadius + collectibleRadius) >= collectPosY &&
    y - (playerRadius + collectibleRadius) <= collectPosY
  ) {
    console.log(y, collectPosY);
    console.log("collided!");
    score += 1;
    collectPosX =
      Math.floor(Math.random() * (canvas.width - collectibleRadius)) +
      collectibleRadius / 2;
    collectPosY =
      Math.floor(Math.random() * (canvas.height - collectibleRadius)) +
      collectibleRadius / 2;
  }
};

const drawCanvas = () => {
  context.beginPath();
  context.fillStyle = "#d3d3d3";
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.rect(0, 0, WIDTH, HEIGHT);
  context.strokeStyle = "rgba(0, 0, 255, 0.5)";
  context.stroke();
  context.closePath();
};

const drawScore = () => {
  context.font = "16px Arial";
  context.fillStyle = "#fc03c2";
  context.fillText("Score: " + score, 8, 20);
};

const draw = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawCanvas();
  drawPlayer();
  drawCollectible();
  collissionDetection();
  drawScore();
  //   Movement of player
  if (rightMove) {
    if (x + dx < canvas.width - playerRadius) {
      x += dx;
    }
  } else if (leftMove) {
    if (x - dx > playerRadius) {
      x -= dx;
    }
  } else if (upMove) {
    if (y - dy > playerRadius) {
      y -= dy;
    }
  } else if (downMove) {
    if (y + dy < canvas.height - playerRadius) {
      y += dy;
    }
  }
};

socket.on("init", () => {
  console.log("game started");
  x =
    Math.floor(Math.random() * (canvas.width - playerRadius)) +
    playerRadius / 2;
  y =
    Math.floor(Math.random() * (canvas.height - playerRadius)) +
    playerRadius / 2;
  setInterval(draw, 10);

  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);
});
