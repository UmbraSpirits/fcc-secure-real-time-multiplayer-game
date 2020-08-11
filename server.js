require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const expect = require("chai");
const socket = require("socket.io");
const helmet = require("helmet");

const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner.js");

const app = express();

app.use(helmet());
app.use(helmet.noCache());
app.use(helmet.hidePoweredBy({ setTo: "PHP 7.4.3" }));

app.use("/public", express.static(process.cwd() + "/public"));
app.use("/assets", express.static(process.cwd() + "/assets"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Index page (static HTML)
app.route("/").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//For FCC testing purposes
fccTestingRoutes(app);

// 404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404).type("text").send("Not Found");
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log("Tests are not valid:");
        console.error(error);
      }
    }, 1500);
  }
});

// Running the game
const io = socket(server);
const FPS = 60;
const WIDTH = 640;
const HEIGHT = 480;
var players = {};
var movementSpeed = 5;
var playerRadius = 20;
var collectibleRadius = 5;
var collectible = {
  x:
    Math.floor(Math.random() * (WIDTH - collectibleRadius)) + collectibleRadius,
  y:
    Math.floor(Math.random() * (HEIGHT - collectibleRadius)) +
    collectibleRadius,
};

io.sockets.on("connection", (socket) => {
  console.log(`User with ID ${socket.id} has connected`);

  socket.on("newPlayer", () => {
    players[socket.id] = {
      x: Math.floor(Math.random() * (WIDTH - playerRadius)) + playerRadius,
      y: Math.floor(Math.random() * (HEIGHT - playerRadius)) + playerRadius,
      score: 0,
    };
  });

  socket.on("playerAction", (data) => {
    var player = players[socket.id] || {};
    if (data.left) {
      if (player.x - movementSpeed > playerRadius) {
        player.x -= movementSpeed;
      }
    }
    if (data.up) {
      if (player.y - movementSpeed > playerRadius) {
        player.y -= movementSpeed;
      }
    }
    if (data.right) {
      if (player.x + movementSpeed < 640 - playerRadius) {
        player.x += movementSpeed;
      }
    }
    if (data.down) {
      if (player.y + movementSpeed < 480 - playerRadius) {
        player.y += movementSpeed;
      }
    }
  });

  socket.on("collectibleFound", (playerFound) => {
    if (socket.id == playerFound) {
      var player = players[playerFound];
      (collectible.x =
        Math.floor(Math.random() * (WIDTH - collectibleRadius)) +
        collectibleRadius),
        (collectible.y =
          Math.floor(Math.random() * (HEIGHT - collectibleRadius)) +
          collectibleRadius),
        (players[playerFound].score += 1);
    }
  });

  socket.on("disconnect", () => {
    console.log(`A user with ID: ${socket.id} has disconnected`);
    delete players[socket.id];
  });
});

setInterval(() => {
  io.sockets.emit("gameRunning", { players, collectible });
}, 1000 / FPS);

module.exports = app; // For testing
