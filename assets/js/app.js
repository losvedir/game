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

// import socket from "./socket"

const MAP_WIDTH = 500;
const MAP_HEIGHT = 500;
const OFF_X = Math.round(MAP_WIDTH / 2);
const OFF_Y = Math.round(MAP_HEIGHT / 2);
const SCALE = Math.round(MAP_WIDTH / 100);

let state = {
  coins: [],
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

function render(ctx, state) {
  ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
  ctx.beginPath();

  ctx.fillStyle="#00CC00";
  ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  drawPerson(ctx, OFF_X, OFF_Y);

  for(let i = 0; i < state.coins.length; i++){
    let coin = state.coins[i];
    if (Math.abs(coin.x - state.player.x) <= 50 && Math.abs(coin.y - state.player.y) <= 50){
      drawCoin(ctx, (coin.x - state.player.x) * SCALE + OFF_X, (coin.y - state.player.y) * SCALE + OFF_Y )
    }
  }

  drawStats(state.player.coins, ctx, 0, MAP_HEIGHT);
}

function initWorld(){
  for (let i = 0; i < 100; i++) {
    let x = Math.round(Math.random() * 300) - 150;
    let y = Math.round(Math.random() * 300) - 150;
    state.coins.push({x: x, y: y});
  }
}

function checkCollisions(){
  let remove = null;
  for (let i = 0; i < state.coins.length; i++){
    let coin = state.coins[i];
    if (coin.x === state.player.x && coin.y === state.player.y){
      state.player.coins++;
      remove = i;
    }
  }
  if (remove){
    state.coins.splice(remove, 1);
  }
}

document.addEventListener("keydown", (evt) => {
  const key = evt.key;
  if (key === "ArrowLeft") {
    state.player.x = state.player.x - 1;
  } else if (key === "ArrowUp") {
    state.player.y = state.player.y - 1;
  } else if (key === "ArrowRight") {
    state.player.x = state.player.x + 1;
  } else if (key === "ArrowDown") {
    state.player.y = state.player.y + 1;
  }

  checkCollisions();
});

function gameLoop(){
  render(ctx, state);
  requestAnimationFrame(gameLoop);
}

initWorld();
requestAnimationFrame(gameLoop);
