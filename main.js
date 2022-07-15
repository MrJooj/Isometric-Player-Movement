import { Isometric } from "./scripts/isometric.js";
import { DebugOptions } from "./scripts/debugOptions.js";
import { Coordinates } from "./scripts/coordinates.js";
import { Map } from "./scripts/map.js";
import { Sprite } from "./scripts/sprite/sprite.js";
import TilesInfo from "./scripts/sprite/tiles.json" assert {type: 'json'};
// class Tile {
//   constructor(img, imgX, imgY, imgW, imgH) {
//     var tile = this;

//     tile.img = img;

//     tile.imgX = imgX;
//     tile.imgY = imgY;
//     tile.imgW = imgW;
//     tile.imgH = imgH;
//   }
// }

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var cartCanvas = document.getElementById("cartesian");
var cartCtx = cartCanvas.getContext("2d");
var runCanvas = true;
let shouldPrintInfo = true;
//Debug info
let infoArr = ["Debug =D"];
//Grid tiles
class SelectedTile {
  constructor() {
    this.coord = new Coordinates();
    this.spriteInfo = TilesInfo.FlatTilesBigWater;
  }

}
const selectedTile = new SelectedTile();
var gridFirstTile = 0;
var gridLastTile = 6;
//Mouse
const mouse = new Coordinates(canvas.width / 2, canvas.height / 2);

// isometric:
const isometric = new Isometric(mouse);
function IsoToScreenX(localX, localY) {
  return isometric.IsoToScreenX(localX, localY);
}
function IsoToScreenY(localX, localY) {
  return isometric.IsoToScreenY(localX, localY);
}
function ScreenToIsoX(globalX, globalY) {
  return isometric.ScreenToIsoX(globalX, globalY);
}
function ScreenToIsoY(globalX, globalY) {
  return isometric.ScreenToIsoY(globalX, globalY);
}

const map = new Map(ctx, cartCtx, gridLastTile, isometric, selectedTile);
const debugGrid = new DebugOptions(ctx, isometric);
//Cart

function runFrame() {

  map.printIsoFloor();
  map.printCartFloor();
  updateSelected(true);

  updateCamera(canvas);
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

function updateCamera(canvas) {
  return isometric.updateCamera(canvas);
}
canvas.addEventListener('mousemove', function (e) {
  if (!runCanvas) {
    runCanvas = true;
    runFrame();
  }
});

canvas.addEventListener('mouseleave', function (e) {
  runCanvas = false;
});
function updateSelected(print) {

  var rx = Math.max(gridFirstTile, Math.min(ScreenToIsoX(mouse.x, mouse.y), gridLastTile));
  var ry = Math.max(gridFirstTile, Math.min(ScreenToIsoY(mouse.x, mouse.y), gridLastTile));
  const floorX = Math.min(Math.floor(rx), gridLastTile - 1);
  const floorY = Math.min(Math.floor(ry), gridLastTile - 1);
  selectedTile.coord.x = floorX;
  selectedTile.coord.y = floorY;

  if (print) {
    debugGrid.printDebugGrid(rx, ry, gridFirstTile, gridLastTile, floorX, floorY, canvas);
  }

}

var tileCoordBtn = document.getElementById("showDebugInfoBtn");
tileCoordBtn.addEventListener('click', function (e) {
  shouldPrintInfo = !shouldPrintInfo;
  runFrame();
});

var tileCoordBtn = document.getElementById("showCartesianBtn");
tileCoordBtn.addEventListener('click', function (e) {
  cartCanvas.style.display = cartCanvas.style.display === 'none' ? 'initial' : 'none';

  runFrame();
});

var cameraBorderBtn = document.getElementById("showCameraBorder");
cameraBorderBtn.addEventListener('click', function (e) {
  debugGrid.printCameraBorder = !debugGrid.printCameraBorder;
  runFrame();
});

var tileCoordBtn = document.getElementById("showTileCoord");
tileCoordBtn.addEventListener('click', function (e) {
  debugGrid.printCoordinates = !debugGrid.printCoordinates;
  runFrame();
});



function updateInfo() {
  infoArr.length = 0;
  infoArr.push(`Mouse: ${mouse.getInString()}`);
  infoArr.push(`Inside grid: ${selectedTile.coord.getInString()}`);
  infoArr.push(`Cam: ${isometric.camera.getInString()}`);
}

function printInfo() {
  if (!shouldPrintInfo) return;
  ctx.font = "15px sans-serif";
  ctx.textAlign = 'left';
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black'
  ctx.globalAlpha = 0.8;
  ctx.strokeRect(0, 0, 170, infoArr.length * 21);
  ctx.fillRect(0, 0, 170, infoArr.length * 21);
  ctx.fillStyle = "black";
  ctx.globalAlpha = 1;
  for (var i = 0; i < infoArr.length; i++)
    ctx.fillText(infoArr[i], 10, 15 + i * 20);
}

runFrame();