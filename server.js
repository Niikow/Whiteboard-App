var express = require("express");
var app = express();
var path = require("path");
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var createAdapter = require("@socket.io/redis-adapter");
var createClient = require('ioredis');


// io.adapter(redis({ host: process.env.REDIS_ENDPOINT, port: 6379 }));
const pubClient = new createClient();
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient,subClient));

//Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
//  io.adapter(createAdapter(pubClient, subClient));
//  io.listen(3000);
//});



var connections = [];
const events = [];



io.on("connect", (socket) => {
    connections.push(socket);
    console.log(`${socket.id} has connected`);
    console.log("Connected: " + connections.length);

    // socket.on("connect", function () {
    //     for (const event of events) {
    //         socket.emit(event.name, event.data);
    //     }
    // });

    socket.on("onNewConnection", function () {
        for (const event of events) {
            socket.emit(event.name, event.data);
        }
    });

    function relay(name) {
        socket.on(name, (data) => {
            //connections.forEach((con) => {
              //  if (con.id !== socket.id) {
                    // do an emit to a room or a broadcast 
                    // broadcast 
                    socket.broadcast.emit(name, data);

                    
                    events.push({ name: name, data: data });
                //}
            //});
        });
    }



    [
        "mouseup",
        "mousedown",
        "mousemove",
        "changeDrawer",
        "changeColor",
        "clear",
        "changeFontSize",
    ].forEach(relay);

    socket.on("disconnect", function () {
        // console.log("hello");
        connections = connections.filter((con) => con.id !== socket.id);
        console.log(`${socket.id} has disconnected`);
        console.log("Connected: " + connections.length);
    });
});






app.use(express.static("public"));

let PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server started on port ${PORT}`));