// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

import channel from "./socket"

const MAP_WIDTH = 500;
const MAP_HEIGHT = 500;
const OFF_X = Math.round(MAP_WIDTH / 2);
const OFF_Y = Math.round(MAP_HEIGHT / 2);
const SCALE = Math.round(MAP_WIDTH / 100);

//////////////////////////////////////////////////////////////
// MOVEMENT
//////////////////////////////////////////////////////////////

let movePlayer = (x, y) => {
  state.player.x = x;
  state.player.y = y;
}

// NOTE: Y plane is inverted on purpose
let moveUpLeft    = () => movePlayer(state.player.x - 1, state.player.y - 1);
let moveUp        = () => movePlayer(state.player.x + 0, state.player.y - 1);
let moveUpRight   = () => movePlayer(state.player.x + 1, state.player.y - 1);
let moveLeft      = () => movePlayer(state.player.x - 1, state.player.y + 0);
let moveRight     = () => movePlayer(state.player.x + 1, state.player.y + 0);
let moveDownLeft  = () => movePlayer(state.player.x - 1, state.player.y + 1);
let moveDown      = () => movePlayer(state.player.x + 0, state.player.y + 1);
let moveDownRight = () => movePlayer(state.player.x + 1, state.player.y + 1);

let calculateDirection = (xDiff, yDiff) => {
  if (xDiff > 0 && yDiff > 0) {
    return "UpLeft";
  } else if (xDiff === 0 && yDiff > 0) {
    return "Up";
  } else if (xDiff < 0 && yDiff > 0) {
    return "UpRight";
  } else if (xDiff > 0 && yDiff === 0) {
    return "Left";
  } else if (xDiff < 0 && yDiff === 0) {
    return "Right";
  } else if (xDiff > 0 && yDiff < 0) {
    return "DownLeft";
  } else if (xDiff === 0 && yDiff < 0) {
    return "Down";
  } else if (xDiff < 0 && yDiff < 0) {
    return "DownRight";
  }
}

let moves = {
  "UpLeft": moveUpLeft,
  "Up": moveUp,
  "ArrowUp": moveUp,
  "UpRight": moveUpRight,
  "ArrowLeft": moveLeft,
  "Left": moveLeft,
  "ArrowRight": moveRight,
  "Right": moveRight,
  "DownLeft": moveDownLeft,
  "ArrowDown": moveDown,
  "Down": moveDown,
  "DownRight": moveDownRight
};

let movePlayerToMove = move => moves[calculateDirection(OFF_X - move.x, OFF_Y - move.y)]();

////////////////////////////////////////////////////
// STATE
////////////////////////////////////////////////////

let state = {
  coins: [],
  move: {x: 0, y: 0},
  player: {x: 0, y: 0, coins: 0}
};

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

function drawCoin(ctx, x, y){
  ctx.beginPath();
  ctx.fillStyle = "#FFFF00";
  ctx.arc(x, y, 2, 0, 2 * Math.PI);
  ctx.fill();
}

function drawPerson(ctx, x, y){
  ctx.beginPath();
  ctx.fillStyle = "black";
  ctx.moveTo(x - 3, y - 3);
  ctx.lineTo(x + 3, y - 3);
  ctx.lineTo(x + 3, y + 3);
  ctx.lineTo(x - 3, y + 3);
  ctx.closePath();
  ctx.stroke();
}

function drawStats(coins, ctx, x, y){
  ctx.beginPath();
  ctx.fillStyle = "black";
  ctx.fillText(`$: ${coins}`, x, y);
}

let drawMoveDestination = (ctx, x, y) => {
  if (!x || !y) {
    return false;
  }

  ctx.beginPath();
  ctx.fillStyle = "#ff000";

  ctx.moveTo(x - 8, y - 8);
  ctx.lineTo(x + 8, y + 8);
  ctx.stroke();

  ctx.moveTo(x + 8, y - 8);
  ctx.lineTo(x - 8, y + 8);
  ctx.stroke();
}

function render(ctx, state) {
  ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
  ctx.beginPath();

  ctx.fillStyle = "#00CC00";
  ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  if (state.move.x > 0 && (OFF_X !== state.move.x || OFF_Y !== state.move.y)) {
    movePlayerToMove(state.move);
  }

  drawPerson(ctx, OFF_X, OFF_Y);

  state.coins.forEach(coin => {
    if (Math.abs(coin.x - state.player.x) <= 50 && Math.abs(coin.y - state.player.y) <= 50) {
      drawCoin(ctx, (coin.x - state.player.x) * SCALE + OFF_X, (coin.y - state.player.y) * SCALE + OFF_Y);
    }
  });

  drawStats(state.player.coins, ctx, 0, MAP_HEIGHT);

  if (state.move.x > 0) {
    drawMoveDestination(ctx, (state.move.x - state.player.x) * SCALE + OFF_X, (state.move.y - state.player.y) * SCALE + OFF_Y);
  }
}

function initWorld(){
  channel.push("coins")
    .receive("ok", (msg) => { state.coins = msg.coins })
}

function checkCollisions(){
  let collidedCoin = state.coins.find(coin => coin.x === state.player.x && coin.y === state.player.y);

  if (collidedCoin) {
    state.player.coins++;
    state.coins = state.coins.filter(coin => coin.x !== collidedCoin.x && coin.y !== collidedCoin.y);
  }
}

document.addEventListener("keydown", (evt) => {
  if (evt.key.match("Arrow")) {
    moves[evt.key]();
    checkCollisions();
  }
});

canvas.addEventListener("mouseup", (evt) => {
  state.move.x = evt.pageX - canvas.offsetLeft;
  state.move.y = evt.pageY - canvas.offsetTop;
});

function gameLoop(){
  render(ctx, state);
  requestAnimationFrame(gameLoop);
}

initWorld();
requestAnimationFrame(gameLoop);
