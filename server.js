var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

var connections = [];

io.on("connect", (socket) => {
  connections.push(socket);
  console.log(`${socket.id} has connected`);

  // Transfer drawing data
  socket.on("drawPencil", (data) => {
    connections.forEach((con) => {
      if (con.id !== socket.id) {
        con.emit("onDrawPencil", {
          canvasX: data.canvasX,
          canvasY: data.canvasY,
        });
      }
    });
  });

  socket.on("disconnect", (reason) => {
    console.log(`${socket.id} has disconnected`);
    connections = connections.filter((con) => con.id !== socket.id);
  });
});

app.use(express.static("public"));

let PORT = process.env.PORT || 8888;
http.listen(PORT, () => console.log(`Server started on port ${PORT}`));
