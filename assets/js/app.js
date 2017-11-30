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
let moveUpLeft    = () => movePlayer(state.player.x - 1, state.player.y + 1);
let moveUp        = () => movePlayer(state.player.x + 0, state.player.y + 1);
let moveUpRight   = () => movePlayer(state.player.x + 1, state.player.y + 1);
let moveLeft      = () => movePlayer(state.player.x - 1, state.player.y + 0);
let moveRight     = () => movePlayer(state.player.x + 1, state.player.y + 0);
let moveDownLeft  = () => movePlayer(state.player.x - 1, state.player.y - 1);
let moveDown      = () => movePlayer(state.player.x + 0, state.player.y - 1);
let moveDownRight = () => movePlayer(state.player.x + 1, state.player.y - 1);

let calculateDirection = (pos1, pos2) => {
  if (pos1.x > pos2.x && pos1.y < pos2.y) {
    return "UpLeft";
  } else if (pos1.x === pos2.x && pos1.y < pos2.y) {
    return "Up";
  } else if (pos1.x < pos2.x && pos1.y < pos2.y) {
    return "UpRight";
  } else if (pos1.x > pos2.x && pos1.y === pos2.y) {
    return "Left";
  } else if (pos1.x < pos2.x && pos1.y === pos2.y) {
    return "Right";
  } else if (pos1.x > pos2.x && pos1.y > pos2.y) {
    return "DownLeft";
  } else if (pos1.x === pos2.x && pos1.y > pos2.y) {
    return "Down";
  } else if (pos1.x < pos2.x && pos1.y > pos2.y) {
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
  "DownRight": moveDownRight,
};

////////////////////////////////////////////////////
// STATE
////////////////////////////////////////////////////

let state = {
  coins: [],
  click: {x: null, y: null},
  player: {x: 0, y: 0, coins: 0}
};

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

function drawCoin(ctx, pos){
  let {x, y} = logicToPx(pos)
  ctx.beginPath();
  ctx.fillStyle = "#FFFF00";
  ctx.arc(x, y, 2, 0, 2 * Math.PI);
  ctx.fill();
}

function drawPerson(ctx){
  ctx.beginPath();
  ctx.fillStyle = "black";
  ctx.moveTo(OFF_X - 3, OFF_Y - 3);
  ctx.lineTo(OFF_X + 3, OFF_Y - 3);
  ctx.lineTo(OFF_X + 3, OFF_Y + 3);
  ctx.lineTo(OFF_X - 3, OFF_Y + 3);
  ctx.closePath();
  ctx.stroke();
}

function drawStats(coins, ctx, x, y){
  ctx.beginPath();
  ctx.fillStyle = "black";

  ctx.fillText(`$: ${coins}`, x, y);
  ctx.fillText(`click.x: ${state.click.x}, click.y: ${state.click.y}`, x, y - 15);
  ctx.fillText(`player.x: ${state.player.x}, player.y: ${state.player.y}`, x, y - 30);
}

let drawMoveDestination = (ctx, pos) => {
  if (!pos.x || !pos.y) {
    return false;
  }

  let {x, y} = logicToPx(pos);

  ctx.beginPath();
  ctx.fillStyle = "#ff000";

  ctx.moveTo(x - 5, y - 5);
  ctx.lineTo(x + 5, y + 5);
  ctx.stroke();

  ctx.moveTo(x + 5, y - 5);
  ctx.lineTo(x - 5, y + 5);
  ctx.stroke();
}

function moveToClick() {
  if (state.click.x && state.click.y) {
    if (state.click.x === state.player.x && state.click.y === state.player.y) {
      state.click = {x: null, y: null};
    } else {
      moves[calculateDirection(state.player, state.click)]();
    }
  }
}

function physics(state) {
  checkCoinCollisions();
  moveToClick();
}

function render(ctx, state) {
  ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
  ctx.beginPath();

  ctx.fillStyle = "#00CC00";
  ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  drawPerson(ctx);

  state.coins.forEach(coin => {
    if (Math.abs(coin.x - state.player.x) <= 50 && Math.abs(coin.y - state.player.y) <= 50) {
      drawCoin(ctx, coin);
    }
  });

  drawStats(state.player.coins, ctx, 0, MAP_HEIGHT);

  if (state.click.x) {
    drawMoveDestination(ctx, state.click);
  }
}

function pxToLogic({x, y}) {
  return {
    x: Math.round(state.player.x + (x - OFF_X) / SCALE),
    y: Math.round(state.player.y + (OFF_Y - y) / SCALE)
  }
}

function logicToPx({x, y}) {
  return {
    x: SCALE * (x - state.player.x) + OFF_X,
    y: SCALE * (state.player.y - y) + OFF_Y
  }
}

function initWorld(){
  channel.push("coins")
    .receive("ok", (msg) => { state.coins = msg.coins })
}

function checkCoinCollisions(){
  let collidedCoin = state.coins.find(coin => coin.x === state.player.x && coin.y === state.player.y);

  if (collidedCoin) {
    state.player.coins++;
    state.coins = state.coins.filter(coin => coin.x !== collidedCoin.x && coin.y !== collidedCoin.y);
  }
}

document.addEventListener("keydown", (evt) => {
  if (evt.key.match("Arrow")) {
    moves[evt.key]();
  }
});

canvas.addEventListener("mouseup", (evt) => {
  let rect = canvas.getBoundingClientRect();
  state.click = pxToLogic({x: evt.clientX - rect.left, y: evt.clientY - rect.top});
});

function gameLoop(){
  physics(state);
  render(ctx, state);
  requestAnimationFrame(gameLoop);
}

initWorld();
requestAnimationFrame(gameLoop);
