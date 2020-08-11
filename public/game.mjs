import Player from "./Player.mjs";
import Collectible from "./Collectible.mjs";

const socket = io();
const canvas = document.getElementById("game-window");
const context = canvas.getContext("2d");

const FPS = 60;

const playerRadius = 20;
const playerColor = "#33ccff";
var startingPosX = 300;
var startingPosY = 300;

const collectibleRadius = 5;
const collectibleColor = "#FFD700";
var collectPosX = 250;
var collectPosY = 250;

var movement = {
  up: false,
  down: false,
  left: false,
  right: false,
};
const keyDownHandler = (e) => {
  // ArrowKeys --> WASD
  if (e.keyCode == 39 || e.keyCode == 68) {
    movement.right = true;
  } else if (e.keyCode == 37 || e.keyCode == 65) {
    movement.left = true;
  } else if (e.keyCode == 38 || e.keyCode == 87) {
    movement.up = true;
  } else if (e.keyCode == 40 || e.keyCode == 83) {
    movement.down = true;
  }
};

const keyUpHandler = (e) => {
  // ArrowKeys --> WASD
  if (e.keyCode == 39 || e.keyCode == 68) {
    movement.right = false;
  } else if (e.keyCode == 37 || e.keyCode == 65) {
    movement.left = false;
  } else if (e.keyCode == 38 || e.keyCode == 87) {
    movement.up = false;
  } else if (e.keyCode == 40 || e.keyCode == 83) {
    movement.down = false;
  }
};
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

socket.emit("newPlayer");

setInterval(function () {
  socket.emit("playerAction", movement);
}, 1000 / FPS);

socket.on("gameRunning", ({ players, collectible }) => {
  collectPosX = collectible.x;
  collectPosY = collectible.y;
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawCanvas();
  drawCollectible();

  var scoreboard = [];

  for (var id in players) {
    var player = players[id];
    drawPlayer(player.x, player.y);
    drawScore(player.x, player.y, player.score);
    scoreboard.push(player.score);

    if (collissionDetection(player.x, player.y)) {
      socket.emit("collectibleFound", id);
    }
  }
  scoreboard.sort((a, b) => b - a);
  for (var id in players) {
    var player = players[id];
    var rank = scoreboard.indexOf(player.score) + 1;
    var totalplayers = scoreboard.length;
    drawRank(player.x, player.y, rank, totalplayers);
  }
});

const drawPlayer = (x, y) => {
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

var collissionDetection = (x, y) => {
  if (
    x + (playerRadius + collectibleRadius) >= collectPosX &&
    x - (playerRadius + collectibleRadius) <= collectPosX &&
    y + (playerRadius + collectibleRadius) >= collectPosY &&
    y - (playerRadius + collectibleRadius) <= collectPosY
  ) {
    return true;
  }
  return false;
};

const drawCanvas = () => {
  context.beginPath();
  context.fillStyle = "#d3d3d3";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.rect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "rgba(0, 0, 255, 0.5)";
  context.stroke();
  context.closePath();
};

const drawScore = (x, y, score) => {
  context.font = "16px Arial";
  context.fillStyle = "#fc03c2";
  context.fillText("Score: " + score, x - 35, y);
};

const drawRank = (x, y, rank, totalplayers) => {
  context.font = "16px Arial";
  context.fillStyle = "#fc03c2";
  context.fillText(`Rank: ${rank}/${totalplayers}`, x - 35, y - 16);
};
