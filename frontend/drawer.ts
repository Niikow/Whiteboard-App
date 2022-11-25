export interface Drawer {
    holdDown?: boolean;

    mouseDown?(context: CanvasRenderingContext2D, x: number, y: number): void;
    mouseUp?(context: CanvasRenderingContext2D, x: number, y: number): void;
    draw(context: CanvasRenderingContext2D, x: number, y: number): void;
}

const pencil: Drawer = {
    mouseDown: function (context, x, y) {
        context.moveTo(x, y);
        this.draw(context, x, y);
    },

    mouseUp: function (context) {
        context.beginPath();
    },

    draw: function (context, x, y) {
        context.lineWidth = 10;
        context.lineCap = "round";
        context.lineTo(x, y);
        context.stroke();
    },
};

const circle: Drawer = {
    holdDown: true,
    mouseDown: function (_, x, y) {
        this.startX = x;
        this.startY = y;
    },

    draw: function (context, x, y) {
        context.lineWidth = 10;
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

const rectangle: Drawer = {
    holdDown: true,

    mouseDown: function (_, x, y) {
        this.startX = x;
        this.startY = y;
    },

    draw: function (context, x, y) {
        context.lineWidth = 10;
        context.lineCap = "round";

        const width = x - this.startX;
        const height = y - this.startY;
        context.strokeRect(this.startX, this.startY, width, height);
    },
};

// Selecting tool
export function selectDrawer(msg: string): Drawer | null {
    console.log(msg);
    switch (msg) {
        case "Line":
            return pencil;
        case "Circle":
            return circle;
        case "Rectangle":
            return rectangle;
        default:
            return null;
    }
}
