const whiteboard = document.getElementById("whiteboard");
const controls = document.getElementById("controls");

// GUI control
const colourButton = document.getElementById("PencilColour");
const shapeButton = document.getElementById("SelectShape");
const savePNGButton = document.getElementById("saveButton");
const redrawButton = document.getElementById("redrawButton");
const fontSizeButton = document.getElementById("FontSize");
const context = whiteboard.getContext("2d");

// Window size
whiteboard.style.top = 0 + controls.offsetHeight;
whiteboard.height = window.innerHeight - controls.offsetHeight;
whiteboard.width = window.innerWidth;

// Selecting tool
const Drawer = {};
var io;

function getDrawer() {
    switch (shapeButton.value) {
        case "Line":
            return Drawer.line;
        case "Circle":
            return Drawer.circle;
        case "Rectangle":
            return Drawer.rect;
        case "Text":
            return Drawer.text;
    }
}

function getFont() {
    return fontSizeButton.value + "px sans";
}

function getColor() {
    return colourButton.value;
}

let img = null;

function checkSave(inProgress) {
    if (img) {
        context.putImageData(img, 0, 0);
        if (!inProgress) img = null;
    } else if (inProgress) {
        img = context.getImageData(0, 0, whiteboard.width, whiteboard.height);
    }
}

function contextBegin({ color, font }) {
    context.beginPath();

    if (color) {
        context.fillStyle = color;
        context.strokeStyle = color;
    }

    if (font) {
        console.log(font);
        context.font = font;
    }
}

const eventHandler = {
    drawText: function ({ x, y, text, color, font }) {
        contextBegin({ color, font });
        context.fillText(text, x, y);
    },

    drawLine: function ({ x, y, fromX, fromY, color }) {
        contextBegin({ color });

        context.lineWidth = 10;
        context.lineCap = "round";
        context.moveTo(fromX, fromY);
        context.lineTo(x, y);
        context.stroke();
    },

    drawRect: function ({ x, y, fromX, fromY, color, inProgress }) {
        contextBegin({ color });
        checkSave(inProgress);
        context.fillStyle = color;
        context.strokeStyle = color;

        const width = x - fromX;
        const height = y - fromY;
        context.strokeRect(fromX, fromY, width, height);
    },

    drawCircle: function ({ x, y, fromX, fromY, color, inProgress }) {
        contextBegin({ color });
        checkSave(inProgress);
        context.fillStyle = color;
        context.strokeStyle = color;

        context.lineWidth = 10;
        context.lineCap = "round";

        context.beginPath();
        context.moveTo(fromX, fromY + (y - fromY) / 2);

        // Draws top half of circle
        context.bezierCurveTo(
            fromX,
            fromY,
            x,
            fromY,
            x,
            fromY + (y - fromY) / 2
        );

        // Draws bottom half of circle
        context.bezierCurveTo(x, y, fromX, y, fromX, fromY + (y - fromY) / 2);

        context.stroke();
    },

    clear: function () {
        context.clearRect(0, 0, whiteboard.width, whiteboard.height);
    },
};

function emit(name, args) {
    eventHandler[name](args);
    if (!args.inProgress) io.emit(name, args);
}

Drawer.line = {
    mousedown: function ({ x, y }) {
        this.pressedDown = true;
        this.fromX = x;
        this.fromY = y;
    },

    mouseup: function () {
        this.pressedDown = false;
    },
    mousemove: function ({ x, y }) {
        if (!this.pressedDown) return;

        emit("drawLine", {
            fromX: this.fromX,
            fromY: this.fromY,
            color: getColor(),
            x,
            y,
        });

        this.fromX = x;
        this.fromY = y;
    },
};

function shapeDrawer(name) {
    name = `draw${name}`;
    return {
        mousedown: function ({ x, y }) {
            this.fromX = x;
            this.fromY = y;
            this.pressedDown = true;
        },

        mouseup: function ({ x, y }) {
            this.pressedDown = false;
            emit(name, {
                fromX: this.fromX,
                fromY: this.fromY,
                color: getColor(),
                inProgress: false,
                x,
                y,
            });
        },

        mousemove: function ({ x, y }) {
            if (!this.pressedDown) return;
            emit(name, {
                fromX: this.fromX,
                fromY: this.fromY,
                color: getColor(),
                inProgress: true,
                x,
                y,
            });
        },
    };
}

Drawer.rect = shapeDrawer("Rect");
Drawer.circle = shapeDrawer("Circle");
Drawer.text = {
    mousedown: function ({ x, y }) {
        const text = prompt("Enter text");
        emit("drawText", {
            x,
            y,
            text,
            color: getColor(),
            font: getFont(),
        });
    },
};

function onEvent(event, pos) {
    getDrawer()?.[event]?.(pos);
}

// Main
window.onload = function () {
    io = io.connect("http://localhost:3000");
    for (const [key, value] of Object.entries(eventHandler)) {
        io.on(key, value);
    }

    // Set background to be white
    context.fillStyle = "white";
    context.fillRect(0, 0, whiteboard.width, whiteboard.height);

    // Save image
    savePNGButton.addEventListener("click", () => {
        const image = whiteboard
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");
        window.location.href = image;
    });

    redrawButton.addEventListener("click", () => emit("clear", {}));

    function coord(e) {
        return {
            x: e.pageX - whiteboard.offsetLeft,
            y: e.pageY - whiteboard.offsetTop,
        };
    }

    ["mousedown", "mouseup", "mousemove"].forEach((name) =>
        whiteboard.addEventListener(name, (event) =>
            onEvent(name, coord(event))
        )
    );
};
