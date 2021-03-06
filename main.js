import { Isometric } from "./scripts/isometric.js";
import { DebugOptions } from "./scripts/debugOptions.js";
import { Coordinates } from "./scripts/coordinates.js";
import { Map } from "./scripts/map.js";
import { Player } from "./scripts/player.js";
import { Sprite } from "./scripts/sprite/sprite.js";
import { Tile } from "./scripts/tile.js";
import IsoConfig from "./isometricConfig.json" assert { type: "json" };
import SkeletonInfo from "./scripts/sprite/skeleton.json" assert {type: 'json'};
import PlayerInfo from "./scripts/sprite/player.json" assert {type: 'json'};
import { Keyboard } from "./scripts/keyboard.js";

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var cartCanvas = document.getElementById("cartesian");
var cartCtx = cartCanvas.getContext("2d");
var runCanvas = true;
let shouldPrintInfo = true;
//Info arrays
let infoArr = ["Debug =D"];
let tipsArr = ["Use WASD to walk", "Use R to run", "Move camera with mouse", "C to disable snap to player"];
//Grid tiles
class SelectedTile {
  constructor() {
    this.coord = new Coordinates();
    this.spriteInfo = new Tile(this.coord, SkeletonInfo.Sheet.S);
    // this.spriteIcon = new Tile(this.coord, SkeletonInfo.Sheet.N);
  }
}
const selectedTile = new SelectedTile();

const mouse = new Coordinates(canvas.width / 2, canvas.height / 2);
let printMouseCoordinates = false;
const keyboard = new Keyboard();
const player = new Player(keyboard);
const isometric = new Isometric(mouse, player);
const map = new Map(ctx, cartCtx, IsoConfig.gridEndAt, isometric, selectedTile);
const debugGrid = new DebugOptions(ctx, isometric);

//Cart
function runFrame() {
  isometric.updateCamera();

  map.printIsoFloor();
  map.printCartFloor();
  printMouseTile();

  player.movePlayer();
  map.printPlayer();

  updateInfo();
  printInfo();

  if (runCanvas) {
    requestAnimationFrame(runFrame);
  }
}

canvas.onmousemove = function (e) {
  mouse.x = e.offsetX;
  mouse.y = e.offsetY;
};

canvas.addEventListener('mousemove', function (e) {
  printMouseCoordinates = true;
  if (!runCanvas) {
    runCanvas = true;
    runFrame();
  }
});

canvas.addEventListener('mouseleave', function (e) {
  printMouseCoordinates = false;
  mouse.x = 400;
  mouse.y = 200;
});

function printMouseTile() {

  var rx = Math.max(IsoConfig.gridStartAt, Math.min(isometric.ScreenToIsoX(mouse.x, mouse.y), IsoConfig.gridEndAt));
  var ry = Math.max(IsoConfig.gridStartAt, Math.min(isometric.ScreenToIsoY(mouse.x, mouse.y), IsoConfig.gridEndAt));
  const floorX = Math.min(Math.floor(rx), IsoConfig.gridEndAt - 1);
  const floorY = Math.min(Math.floor(ry), IsoConfig.gridEndAt - 1);

  selectedTile.coord.x = floorX;
  selectedTile.coord.y = floorY;

  if (printMouseCoordinates) {
    debugGrid.printDebugGrid(rx, ry, IsoConfig.gridStartAt, IsoConfig.gridEndAt, floorX, floorY, canvas);
  }

}

function updateInfo() {
  infoArr.length = 0;
  infoArr.push(`Mouse: ${mouse.getInString()}`);
  infoArr.push(`Mouse grid: ${selectedTile.coord.getInString()}`);
  infoArr.push(`Player: ${player.pos.getInString()} / ${player.dir}`);
  infoArr.push(`Cam: ${isometric.camera.getInString()}`);
}

function printInfo() {
  if (!shouldPrintInfo) return;
  ctx.font = "15px sans-serif";
  ctx.textAlign = 'left';
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black'
  ctx.globalAlpha = 0.8;
  //Left
  ctx.strokeRect(0, 0, 170, infoArr.length * 21);
  ctx.fillRect(0, 0, 170, infoArr.length * 21);
  //Right
  ctx.strokeRect(800, 0, 300, tipsArr.length * 21);
  ctx.fillRect(800, 0, 300, tipsArr.length * 21);

  //Text
  ctx.fillStyle = "black";
  ctx.globalAlpha = 1;
  for (var i = 0; i < Math.max(infoArr.length, tipsArr.length); i++){
    if (infoArr[i]){
      ctx.fillText(infoArr[i], 10, 18 + i * 20);
    }
    if (tipsArr[i]){
      ctx.fillText(tipsArr[i], 810, 18 + i * 20);

    }
  }
}

runFrame();


document.addEventListener('keyup', function (e) {
  keyboard.keyUp(e.key);
});

document.addEventListener('keydown', function (e) {
  keyboard.keyDown(e.key);
});

const showDebugInfoBtn = document.getElementById("showDebugInfoBtn");
showDebugInfoBtn.addEventListener('click', function (e) {
  shouldPrintInfo = !shouldPrintInfo;
  runFrame();
});

const showCartesianBtn = document.getElementById("showCartesianBtn");
showCartesianBtn.addEventListener('click', function (e) {
  cartCanvas.style.display = cartCanvas.style.display === 'none' ? 'initial' : 'none';

  runFrame();
});

const showCameraBorder = document.getElementById("showCameraBorder");
showCameraBorder.addEventListener('click', function (e) {
  debugGrid.printCameraBorder = !debugGrid.printCameraBorder;
  runFrame();
});

const showTileCoord = document.getElementById("showTileCoord");
showTileCoord.addEventListener('click', function (e) {
  debugGrid.printCoordinates = !debugGrid.printCoordinates;
  runFrame();
});