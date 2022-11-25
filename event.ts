export interface EventHandler {
    changeColor(color: string): void;
    changeDrawer(drawer: string): void;
    mouseUp(x: number, y: number): void;
    mouseDown(x: number, y: number): void;
    mouseMove(x: number, y: number): void;
    clear(): void;
}

export const events = [
    "changeColor",
    "changeDrawer",
    "clear",
    "mouseDown",
    "mouseMove",
    "mouseUp",
] as const;
