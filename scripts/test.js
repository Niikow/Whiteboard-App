var whiteboard = document.getElementById("whiteboard");
var context = whiteboard.getContext("2d");
var colourButton = document.getElementById("PencilColour");
var shapeButton = document.getElementById("SelectShape");
var drawMethodSelected = shapeButton.value;

whiteboard.height = window.innerHeight;
whiteboard.width = window.innerWidth;

window.onload = function () {
  function changeColour() {
    var colour = colourButton.value;
    context.strokeStyle = colour;
  }

  colourButton.addEventListener("change", changeColour);
  shapeButton.addEventListener("change", () => {
    draw();
  });
};

// Variables
let pencil = false;
var canvasX, canvasY;

function draw() {
  drawMethodSelected = shapeButton.value;
  if (drawMethodSelected == "Line") {
    whiteboard.addEventListener("mousedown", startPositionPencil);
    whiteboard.addEventListener("mouseup", finishPositionPencil);
    whiteboard.addEventListener("mousemove", drawPencil);
  } else if (drawMethodSelected == "Circle") {
    disablePencil();

    whiteboard.addEventListener("mousedown", startPositionCircle);
    whiteboard.addEventListener("mouseup", finishPositionCircle);
    whiteboard.addEventListener("mousemove", mouseMove);
    whiteboard.addEventListener("mouseout", mouseOut);
  } else if (drawMethodSelected == "Rectangle") {
    disablePencil();
  }
}

function disablePencil() {
  whiteboard.removeEventListener("mousedown", startPositionPencil);
  whiteboard.removeEventListener("mouseup", finishPositionPencil);
  whiteboard.removeEventListener("mousemove", drawPencil);
}

// Drawing with pencil
function startPositionPencil(e) {
  pencil = true;

  // Draw dots
  drawPencil(e);
}

function finishPositionPencil() {
  pencil = false;

  // Reset path to draw new lines without connecting to old line
  context.beginPath();
}

// Draw on whiteboard
function drawPencil(e) {
  if (!pencil) return;
  context.linewidth = 10;
  context.lineCap = "round";

  // Set mouse cursor pointer according to whiteboard
  canvasX = e.pageX - whiteboard.offsetLeft;
  canvasY = e.pageY - whiteboard.offsetTop;
  // context.lineTo(e.clientX, e.clientY);
  context.lineTo(canvasX, canvasY);
  context.stroke();
  context.beginPath();
  // context.moveTo(e.clientX, e.clientY);
  context.moveTo(canvasX, canvasY);
}

// Drawing with circle

function startPositionCircle(e) {
  e.preventDefault();
  e.stopPropagation();
  startX = e.pageX - whiteboard.offsetLeft;
  startY = e.pageY - whiteboard.offsetTop;
  pencil = true;
}

function finishPositionCircle(e) {
  if (!pencil) return;
  e.preventDefault();
  e.stopPropagation();
  pencil = false;
}

function mouseOut(e) {
  if (!pencil) return;
  e.preventDefault();
  e.stopPropagation();
  pencil = false;
}

function mouseMove(e) {
  if (!pencil) return;
  e.preventDefault();
  e.stopPropagation();

  canvasX = e.pageX - whiteboard.offsetLeft;
  canvasY = e.pageY - whiteboard.offsetTop;

  drawCircle(canvasX, canvasY);
}

function drawCircle(x, y) {
  context.clearRect(0, 0, whiteboard.width, whiteboard.height);
  context.beginPath();
  context.moveTo(startX, startY + (y - startY) / 2);
  context.bezierCurveTo(
    startX,
    startY,
    x,
    startY,
    x,
    startY + (y - startY) / 2
  );
  context.bezierCurveTo(x, y, startX, y, startX, startY + (y - startY) / 2);
  context.closePath();
  context.stroke();
}
