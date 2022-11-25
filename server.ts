import { Server, Socket } from "socket.io";
import { createServer } from "http";
import express from "express";
import { EventHandler, events } from "./event";

const app = express();
const http = createServer(app);

const io = new Server<EventHandler, EventHandler>();

const connections: Socket[] = [];

io.on("connect", (socket) => {
    connections.push(socket);
    console.log(`${socket.id} has connected`);

    function relay(name: keyof EventHandler) {
        socket.on(name, (data: any) => {
            connections.forEach((con) => {
                if (con.id !== socket.id) {
                    con.emit(name, data);
                }
            });
        });
    }

    events.forEach(relay);
});

app.use(express.static("frontend/public"));

let PORT = process.env.PORT || 8888;
http.listen(PORT, () => console.log(`Server started on port ${PORT}`));
