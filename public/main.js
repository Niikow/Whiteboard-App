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


// Variables
let pressedDown = false;
let canvasX, canvasY, startX, startY;
let drawer

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


    window.addEventListener('mousedown', (e) => {
        pressedDown = true;
        drawer.mouseDown(e)
    })

    window.addEventListener('mouseup', (e) => {
        pressedDown = false
        drawer.mouseUp(e)
    })

    window.addEventListener('mousemove', (e) => {
        if (pressedDown)
            drawer.draw(e)
    })

};




function changeColour() {
    const colour = colourButton.value;
    tempcontext.strokeStyle = colour;
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
        tempcontext.moveTo(canvasX, canvasY);
        io.emit("down", { canvasX, canvasY });
        drawPencil(e);
    },

    mouseUp: function (e) {
        // Reset path to draw new lines without connecting to old line
        context.drawImage(tempwhiteboard, 0, 0);
        tempcontext.beginPath();
    },

    draw: function (e) {
        canvasX = e.pageX - whiteboard.offsetLeft;
        canvasY = e.pageY - whiteboard.offsetTop;

        tempcontext.linewidth = 10;
        tempcontext.lineCap = "round";

        if (pressedDown) {
            io.emit("drawPencil", { canvasX, canvasY });
            tempcontext.lineTo(canvasX, canvasY);
            tempcontext.stroke();
        }
    }

}

const circleDrawer = {
    mouseDown: function (e) {
        startX = e.pageX - whiteboard.offsetLeft;
        startY = e.pageY - whiteboard.offsetTop;
    },

    mouseUp: function (e) {
        context.drawImage(tempwhiteboard, 0, 0);
    },

    draw: function (e) {
        if (!pressedDown) return;

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

}

const rectangleDrawer = {
    mouseDown: function (e) {
        startX = e.pageX - whiteboard.offsetLeft;
        startY = e.pageY - whiteboard.offsetTop;
    },

    mouseUp: function (e) {
        context.drawImage(tempwhiteboard, 0, 0);
    },

    draw: function (e) {
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
}





// REDRAWING LINES
function redraw() {
    context.clearRect(0, 0, whiteboard.width, whiteboard.height);
    tempcontext.clearRect(0, 0, whiteboard.width, whiteboard.height);

    console.log(paths);
}



// Draw lines for other users
io.on("onDrawPencil", ({ canvasX, canvasY }) => {
    tempcontext.lineTo(canvasX, canvasY);
    tempcontext.stroke();
});

io.on("onDown", ({ canvasX, canvasY }) => {
    tempcontext.moveTo(canvasX, canvasY);
});

