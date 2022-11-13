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

    whiteboard.addEventListener("mousedown", startPosition);
    whiteboard.addEventListener("mouseup", finishPosition);
    whiteboard.addEventListener("mousemove", drawPencil);
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
