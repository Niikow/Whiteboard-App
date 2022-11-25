import type { Socket } from "socket.io-client";

import { EventHandler, events } from "./event";
import { Drawer, selectDrawer } from "./drawer";

const whiteboard = document.getElementById("whiteboard") as HTMLCanvasElement;

// GUI control
const colourButton = document.getElementById("PencilColour") as HTMLSelectElement;
const shapeButton = document.getElementById("SelectShape") as HTMLSelectElement;
const savePNGButton = document.getElementById("saveButton") as HTMLButtonElement;
const redrawButton = document.getElementById("redrawButton") as HTMLButtonElement;
const context = whiteboard.getContext("2d")!;

declare var io: typeof import("socket.io-client").io;

//Connect
const socket: Socket<EventHandler, EventHandler> = io("http://localhost:8888").connect();

// Window size
whiteboard.height = window.innerHeight;
whiteboard.width = window.innerWidth;

// Selected tool
let drawer = selectDrawer(shapeButton.value);
let img: ImageData | null = null;
let pressedDown = false;

const eventHandler: EventHandler = {
    mouseMove: function (x, y) {
        if (!pressedDown) return;
        if (!drawer) return;
        if (img) {
            context.putImageData(img, 0, 0);
        }
        drawer.draw(context, x, y);
    },

    mouseUp: function (x, y) {
        pressedDown = false;
        drawer?.mouseUp?.(context, x, y);
        img = null;
    },

    mouseDown: function (x, y) {
        pressedDown = true;
        if (!drawer) return;
        if (drawer.holdDown) {
            img = context.getImageData(0, 0, whiteboard.width, whiteboard.height);
        }
        drawer.mouseDown?.(context, x, y);
    },
    changeDrawer: function (name) {
        drawer = selectDrawer(name);
    },

    changeColor: function (name) {
        context.strokeStyle = name;
    },

    clear: function () {
        context.clearRect(0, 0, whiteboard.width, whiteboard.height);
    },
} as const;

for (const event of events) {
    socket.on(event, eventHandler[event]);
}

function emit<K extends keyof EventHandler, V extends Parameters<EventHandler[K]>>(
    name: K,
    ...arg: V
) {
    const f: Function = eventHandler[name];
    f(...arg);
    socket.emit(name, ...arg);
}

// Main
window.onload = function () {
    // Set background to be white
    context.fillStyle = "white";
    context.fillRect(0, 0, whiteboard.width, whiteboard.height);

    // Change colour button
    colourButton.addEventListener("change", () => emit("changeColor", colourButton.value));

    // Change drawing tool
    shapeButton.addEventListener("change", () => emit("changeDrawer", shapeButton.value));

    // Save image
    savePNGButton.addEventListener("click", () => {
        const image = whiteboard.toDataURL("image/png").replace("image/png", "image/octet-stream");
        window.location.href = image;
    });

    redrawButton.addEventListener("click", () => emit("clear"));

    window.addEventListener("mousedown", (e) => emit("mouseDown", ...coord(e)));
    window.addEventListener("mouseup", (e) => emit("mouseUp", ...coord(e)));
    window.addEventListener("mousemove", (e) => emit("mouseMove", ...coord(e)));
};

function coord(e: MouseEvent): [number, number] {
    return [e.pageX - whiteboard.offsetLeft, e.pageY - whiteboard.offsetTop];
}
