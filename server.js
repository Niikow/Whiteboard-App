const adapter = require("@socket.io/redis-adapter");
const redis = require("redis");

const express = require("express");
const app = express();
const path = require("path");
const http = require("http").createServer(app);
const io = require("socket.io")(http);

async function main() {
    const pubClient = redis.createClient({ host: process.env.REDIS_ENDPOINT, port: 6379 });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(adapter.createAdapter(pubClient, subClient));

    const connections = new Set();
    const events = [];

    io.on("connect", (socket) => {
        connections.add(socket);
        console.log(`${socket.id} has connected`);
        console.log("Connected: " + connections.size);

        for (const event of events) {
            socket.emit(event.name, event.data);
        }

        ["drawText", "drawLine", "drawCircle", "drawRect", "clear"].forEach(
            (name) =>
                socket.on(name, (data) => {
                    events.push({ name, data });
                    socket.broadcast.emit(name, data);
                })
        );

        socket.on("disconnect", function () {
            connections.delete(socket);
            console.log(`${socket.id} has disconnected`);
            console.log("Connected: " + connections.size);
        });
    });

    app.use(express.static("public"));

    var PORT = process.env.PORT || 3000;
    http.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

main();
