const whiteboard = document.getElementById("whiteboard");
const context = whiteboard.getContext("2d");

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

// Variables
let canvasX, canvasY, startX, startY;
let drawer;

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
    redrawButton.addEventListener("click", clear);

    let pressedDown = false;

    window.addEventListener("mousedown", (e) => {
        pressedDown = true;
        drawer.mouseDown(e);
    });

    window.addEventListener("mouseup", (e) => {
        pressedDown = false;
        drawer.mouseUp(e);
    });

    window.addEventListener("mousemove", (e) => {
        if (pressedDown) drawer.draw(e);
    });
};

function changeColour() {
    const colour = colourButton.value;
    context.strokeStyle = colour;
}

// Selecting tool
function draw() {
    drawMethodSelected = shapeButton.value;

    switch (drawMethodSelected) {
        case "Line":
            drawer = pencilDrawer;
            break;
        case "Circle":
            drawer = circleDrawer;
            break;

        case "Rectangle":
            drawer = rectangleDrawer;
            break;
    }
}

const pencilDrawer = {
    mouseDown: function (e) {
        context.moveTo(canvasX, canvasY);
        io.emit("down", { canvasX, canvasY });
        drawPencil(e);
    },

    // if we replace tempcontext with just context should be fine
    mouseUp: function (e) {
        context.beginPath();
    },

    draw: function (e) {
        canvasX = e.pageX - whiteboard.offsetLeft;
        canvasY = e.pageY - whiteboard.offsetTop;
        
        context.linewidth = 10;
        context.lineCap = "round"

        io.emit("drawPencil", { canvasX, canvasY });
        context.lineTo(canvasX, canvasY);
        context.stroke();
    },
};

const circleDrawer = {
    mouseDown: function (e) {
        startX = e.pageX - whiteboard.offsetLeft;
        startY = e.pageY - whiteboard.offsetTop;
    },

    mouseUp: function (e) {
    },

    draw: function (e) {
        context.linewidth = 10;
        context.lineCap = "round";

        // Set mouse cursor pointer according to whiteboard
        canvasX = e.pageX - whiteboard.offsetLeft;
        canvasY = e.pageY - whiteboard.offsetTop;

        context.clearRect(0, 0, whiteboard.width, whiteboard.height);
        context.beginPath();

        context.moveTo(startX,     context.clearRect(0, 0, whiteboard.width, whiteboard.height);
        context.clearRect(0, 0, whiteboard.width, whiteboard.height);startY + (canvasY - startY) / 2);

        // Draws top half of circle
        context.bezierCurveTo(
            startX,
            startY,
            canvasX,
            startY,
            canvasX,
            startY + (canvasY - startY) / 2
        );

        // Draws bottom half of circle
        context.bezierCurveTo(
            canvasX,
            canvasY,
            startX,
            canvasY,
            startX,
            startY + (canvasY - startY) / 2
        );

        context.stroke();
    },
};

const rectangleDrawer = {
    mouseDown: function (e) {
        startX = e.pageX - whiteboard.offsetLeft;
        startY = e.pageY - whiteboard.offsetTop;
    },

    mouseUp: function (e) {
    },

    draw: function (e) {
        context.linewidth = 10;
        context.lineCap = "round";

        canvasX = e.pageX - whiteboard.offsetLeft;
        canvasY = e.pageY - whiteboard.offsetTop;

        // ok this code is sus
        // like what i would do
        // is first get rid of tempcontext
        // tempwhiteboard etc
        // very sussy
        // yas

        // that will require a bit of rewriting oki le
        context.clearRect(0, 0, whiteboard.width, whiteboard.height);
        //   tempcontext.beginPath();

        const width = canvasX - startX;
        const height = canvasY - startY;

        context.strokeRect(startX, startY, width, height);
    },
};

// CLEAR WHITEBOARD
function clear() {
    context.clearRect(0, 0, whiteboard.width, whiteboard.height);
}

// Draw lines for other users
io.on("onDrawPencil", ({ canvasX, canvasY }) => {
    context.lineTo(canvasX, canvasY);
    context.stroke();
});

io.on("onDown", ({ canvasX, canvasY }) => {
    context.moveTo(canvasX, canvasY);
});

io.on("onDrawRectangle", ({ startX, startY, width, height }) => {
    // tempcontext.clearRect(0, 0, whiteboard.width, whiteboard.height);
    context.strokeRect(startX, startY, width, height);
});

io.on("onSaveRectangle", ({ whiteboardCopy, tempwhiteboardCopy }) => {
    var image = new Image();
    image = tempwhiteboardCopy;
    // var image = new Image(); //wagwan
    // image.onload = start;
    // image.src = tempwhiteboardCopy;
    // oh here
    context.drawImage(image, 0, 0);
    context.save();
});
