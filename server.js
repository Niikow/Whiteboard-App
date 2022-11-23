var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

var connections = [];

io.on("connect", (socket) => {
    connections.push(socket);
    console.log(`${socket.id} has connected`);

    function relay(name) {
        socket.on(name, (data) => {
            connections.forEach((con) => {
                if (con.id !== socket.id) {
                    con.emit(name, data);
                }
            });
        });
    }

    [
        "mouseup",
        "mousedown",
        "mousemove",
        "changeDrawer",
        "changeColor",
        "clear",
    ].forEach(relay);
});

app.use(express.static("public"));

let PORT = process.env.PORT || 8888;
http.listen(PORT, () => console.log(`Server started on port ${PORT}`));
