const whiteboard = document.getElementById("whiteboard");
const controls = document.getElementById("controls");

// GUI control
const colourButton = document.getElementById("PencilColour");
const shapeButton = document.getElementById("SelectShape");
const savePNGButton = document.getElementById("saveButton");
const redrawButton = document.getElementById("redrawButton");
const fontSizeButton = document.getElementById("FontSize");
const context = whiteboard.getContext("2d");

// Connect
var io = io.connect("http://localhost:3000");

// Window size
whiteboard.style.top = 0 + controls.offsetHeight;
whiteboard.height = window.innerHeight - controls.offsetHeight;
whiteboard.width = window.innerWidth;

// Selecting tool
function selectDrawer(msg) {
    console.log(msg);
    switch (msg) {
        case "Line":
            return pencilDrawer;
        case "Circle":
            return circleDrawer;
        case "Rectangle":
            return rectangleDrawer;
        case "Text":
            return textDrawer;
    }
}

// Selected tool
let drawer = selectDrawer(shapeButton.value);
let text;
let img = null;
let pressedDown = false;

const eventHandler = {
    mousemove: function ({ x, y }) {
        if (!pressedDown) return;
        if (!drawer) return;
        if (img) {
            context.putImageData(img, 0, 0);
        }
        drawer.draw(context, x, y);
    },

    mouseup: function ({ x, y }) {
        pressedDown = false;
        drawer?.mouseUp(context, x, y);
        img = null;
    },

    mousedown: function ({ x, y, text }) {
        pressedDown = true;
        if (!drawer) return;
        if (drawer == textDrawer) {
            console.log(context.value);
        }
        if (drawer.holdDown) {
            img = context.getImageData(
                0,
                0,
                whiteboard.width,
                whiteboard.height
            );
        }
        if (text) {
            drawer.text = text;
        }

        drawer.mouseDown(context, x, y);
    },
    changeDrawer: function ({ name }) {
        drawer = selectDrawer(name);
    },

    changeColor: function ({ name }) {
        context.strokeStyle = name;
    },

    clear: function () {
        context.clearRect(0, 0, whiteboard.width, whiteboard.height);
    },

    changeFontSize: function ({ name }) {
        context.font = `${name}px Arial`;
    },
};

for (const [key, value] of Object.entries(eventHandler)) {
    io.on(key, value);
}

function emit(name, args) {
    eventHandler[name](args);
    io.emit(name, args);
}

// Main
window.onload = function () {
    // Set background to be white
    context.fillStyle = "white";
    context.fillRect(0, 0, whiteboard.width, whiteboard.height);

    // Change colour button
    colourButton.addEventListener("change", () =>
        emit("changeColor", { name: colourButton.value })
    );

    // Change drawing tool
    shapeButton.addEventListener("change", () =>
        emit("changeDrawer", { name: shapeButton.value })
    );

    // Save image
    savePNGButton.addEventListener("click", () => {
        const image = whiteboard
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");
        window.location.href = image;
    });

    redrawButton.addEventListener("click", () => emit("clear", {}));

    // Change font size
    fontSizeButton.addEventListener("change", () =>
        emit("changeFontSize", { name: fontSizeButton.value })
    );
    whiteboard.addEventListener("mousedown", (e) => {
        const arg = coord(e);
        if (drawer == textDrawer) {
            arg.text = prompt("Enter text");
        }
        emit("mousedown", arg);
    });

    whiteboard.addEventListener("mouseup", (e) => emit("mouseup", coord(e)));
    whiteboard.addEventListener("mousemove", (e) =>
        emit("mousemove", coord(e))
    );
};

function coord(e) {
    return {
        x: e.pageX - whiteboard.offsetLeft,
        y: e.pageY - whiteboard.offsetTop,
    };
}

const pencilDrawer = {
    mouseDown: function (context, x, y) {
        context.moveTo(x, y);
        this.draw(context, x, y);
    },

    mouseUp: function (context, x, y) {
        context.beginPath();
    },

    draw: function (context, x, y) {
        context.linewidth = 10;
        context.lineCap = "round";
        context.lineTo(x, y);
        context.stroke();
    },
};

const circleDrawer = {
    holdDown: true,
    mouseDown: function (context, x, y) {
        this.startX = x;
        this.startY = y;
    },

    mouseUp: function (context, x, y) {},

    draw: function (context, x, y) {
        context.linewidth = 10;
        context.lineCap = "round";

        context.beginPath();
        context.moveTo(this.startX, this.startY + (y - this.startY) / 2);

        // Draws top half of circle
        context.bezierCurveTo(
            this.startX,
            this.startY,
            x,
            this.startY,
            x,
            this.startY + (y - this.startY) / 2
        );

        // Draws bottom half of circle
        context.bezierCurveTo(
            x,
            y,
            this.startX,
            y,
            this.startX,
            this.startY + (y - this.startY) / 2
        );

        context.stroke();
    },
};

const rectangleDrawer = {
    holdDown: true,

    mouseDown: function (context, x, y) {
        this.startX = x;
        this.startY = y;
    },

    mouseUp: function (context, x, y) {},

    draw: function (context, x, y) {
        context.linewidth = 10;
        context.lineCap = "round";

        const width = x - this.startX;
        const height = y - this.startY;
        context.strokeRect(this.startX, this.startY, width, height);
    },
};

// sussy
//i don't think this is horror show
const textDrawer = {
    //need <0 now i can't switch to other tools
    // i hab an idea

    mouseDown: function (context, x, y) {
        context.fillStyle = colourButton.value;
        context.fillText(this.text, x, y);
    },
};
