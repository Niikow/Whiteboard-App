const whiteboard = document.getElementById("whiteboard");
const tempwhiteboard = document.getElementById("tempwhiteboard");
const context = whiteboard.getContext("2d");
const tempcontext = tempwhiteboard.getContext("2d");

// GUI control
const colourButton = document.getElementById("PencilColour");
const shapeButton = document.getElementById("SelectShape");
const drawMethodSelected = shapeButton.value;
const savePNGButton = document.getElementById("saveButton");
const redrawButton = document.getElementById("redrawButton");

// Connect
const io = io.connect("http://localhost:8888");

// Window size
whiteboard.height = window.innerHeight;
whiteboard.width = window.innerWidth;
tempwhiteboard.height = window.innerHeight;
tempwhiteboard.width = window.innerWidth;

// Main
window.onload = function () {
    // Set background to be white
    context.fillStyle = "white";
    context.fillRect(0, 0, whiteboard.width, whiteboard.height);

    colourButton.addEventListener("change", changeColour);
    shapeButton.addEventListener("change", draw);
    savePNGButton.addEventListener("click", () => {
        // Download png
        const image = whiteboard
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");
        // Have to add .png at end of file name
        window.location.href = image;
    });
    redrawButton.addEventListener("click", redraw);
};

function changeColour() {
    const colour = colourButton.value;
    tempcontext.strokeStyle = colour;
    context.strokeStyle = colour;
}

// Variables
let pencil = false;
let canvasX, canvasY, startX, startY;

// Selecting tool
function draw() {
    drawMethodSelected = shapeButton.value;

    switch (drawMethodSelected) {
        case "Line":
            disableCircle();
            disableRectangle();
            enablePencil();
            break;
        case "Circle":
            disableRectangle();
            disablePencil();
            enableCircle();
            break;

        case "Rectangle":
            disablePencil();
            disableCircle();
            enableRectangle();
            break;
    }

}

function enablePencil() {
    window.addEventListener("mousedown", handleMouseDownPencil);
    window.addEventListener("mouseup", handleMouseUpPencil);
    window.addEventListener("mousemove", drawPencil);
}

function disablePencil() {
    window.removeEventListener("mousedown", handleMouseDownPencil);
    window.removeEventListener("mouseup", handleMouseUpPencil);
    window.removeEventListener("mousemove", drawPencil);
}

function enableCircle() {
    window.addEventListener("mousedown", handleMouseDownCircle);
    window.addEventListener("mouseup", handleMouseUpCircle);
    window.addEventListener("mousemove", drawCircle);
}

function disableCircle() {
    window.removeEventListener("mousedown", handleMouseDownCircle);
    window.removeEventListener("mouseup", handleMouseUpCircle);
    window.removeEventListener("mousemove", drawCircle);
}

function enableRectangle() {
    window.addEventListener("mousedown", handleMouseDownRectangle);
    window.addEventListener("mouseup", handleMouseUpRectangle);
    window.addEventListener("mousemove", drawRectangle);
}

function disableRectangle() {
    window.removeEventListener("mousedown", handleMouseDownRectangle);
    window.removeEventListener("mouseup", handleMouseUpRectangle);
    window.removeEventListener("mousemove", drawRectangle);
}

// REDRAWING LINES
function redraw() {
    context.clearRect(0, 0, whiteboard.width, whiteboard.height);
    tempcontext.clearRect(0, 0, whiteboard.width, whiteboard.height);

    console.log(paths);
}

// DRAWING LINES
function handleMouseDownPencil(e) {
    tempcontext.moveTo(canvasX, canvasY);
    io.emit("down", { canvasX, canvasY });
    pencil = true;

    drawPencil(e);
}

function handleMouseUpPencil(e) {
    pencil = false;

    // Reset path to draw new lines without connecting to old line
    context.drawImage(tempwhiteboard, 0, 0);
    tempcontext.beginPath();
}

function drawPencil(e) {
    canvasX = e.pageX - whiteboard.offsetLeft;
    canvasY = e.pageY - whiteboard.offsetTop;

    tempcontext.linewidth = 10;
    tempcontext.lineCap = "round";

    if (pencil) {
        io.emit("drawPencil", { canvasX, canvasY });
        tempcontext.lineTo(canvasX, canvasY);
        tempcontext.stroke();
    }
}

// Draw lines for other users
io.on("onDrawPencil", ({ canvasX, canvasY }) => {
    tempcontext.lineTo(canvasX, canvasY);
    tempcontext.stroke();
});

io.on("onDown", ({ canvasX, canvasY }) => {
    tempcontext.moveTo(canvasX, canvasY);
});

// DRAWING CIRCLES
function handleMouseDownCircle(e) {
    startX = e.pageX - whiteboard.offsetLeft;
    startY = e.pageY - whiteboard.offsetTop;
    pencil = true;
}

function handleMouseUpCircle(e) {
    pencil = false;

    context.drawImage(tempwhiteboard, 0, 0);
}

function drawCircle(e) {
    if (!pencil) return;

    tempcontext.linewidth = 10;
    tempcontext.lineCap = "round";

    // Set mouse cursor pointer according to whiteboard
    canvasX = e.pageX - whiteboard.offsetLeft;
    canvasY = e.pageY - whiteboard.offsetTop;

    tempcontext.clearRect(0, 0, whiteboard.width, whiteboard.height);
    tempcontext.beginPath();

    tempcontext.moveTo(startX, startY + (canvasY - startY) / 2);

    // Draws top half of circle
    tempcontext.bezierCurveTo(
        startX,
        startY,
        canvasX,
        startY,
        canvasX,
        startY + (canvasY - startY) / 2
    );

    // Draws bottom half of circle
    tempcontext.bezierCurveTo(
        canvasX,
        canvasY,
        startX,
        canvasY,
        startX,
        startY + (canvasY - startY) / 2
    );

    tempcontext.stroke();
}

// DRAWING RECTANGLES
function handleMouseDownRectangle(e) {
    startX = e.pageX - whiteboard.offsetLeft;
    startY = e.pageY - whiteboard.offsetTop;

    pencil = true;
}

function handleMouseUpRectangle(e) {
    pencil = false;

    context.drawImage(tempwhiteboard, 0, 0);
}

function drawRectangle(e) {
    if (!pencil) return;

    tempcontext.linewidth = 10;
    tempcontext.lineCap = "round";

    canvasX = e.pageX - whiteboard.offsetLeft;
    canvasY = e.pageY - whiteboard.offsetTop;

    tempcontext.clearRect(0, 0, whiteboard.width, whiteboard.height);
    //   tempcontext.beginPath();

    const width = canvasX - startX;
    const height = canvasY - startY;

    tempcontext.strokeRect(startX, startY, width, height);
}
