var express = require("express");
var app = express();
var path = require("path");
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var redis = require("ioredis");

// import {promisify } from "util"

const client = redis.createClient();








var connections = [];
const events = [];

const dbredisEvents = [];


// async function loadData(){

//     var redisString = await client.get('redisEvents2');

//     var betterString = JSON.parse(redisString);

//     dbredisEvents.push(betterString);

// }

// loadData();

io.on("connect", (socket) => {
    connections.push(socket);
    console.log(`${socket.id} has connected`);
    console.log("Connected: " + connections.length);

    // socket.on("connect", function () {
    //     for (const event of events) {
    //         socket.emit(event.name, event.data);
    //     }
    // });
  
    socket.on("onNewConnection", async function () {


        // loads redis data 
        

        for (const event of events) {

            
            socket.emit(event.name, event.data);
        }

        // for (const eachEvent of dbredisEvents){

        //     socket.emit(eachEvent.name, eachEvent.data);
        // }
       
       
    });

    // was not async before

    async function saveData(name, data){
        // was json.stringify
        client.set(name , JSON.stringify(data));

        
    }




    function relay(name) {
        socket.on(name, (data) => {
            connections.forEach((con) => {
                if (con.id !== socket.id) {
                    con.emit(name, data);
                    events.push({ name: name, data: data });
                    saveData('redisEvents' , events);
                }
            });
        });
    }

   
    // This is where data is asked for then given out
    [
        "mouseup",
        "mousedown",
        "mousemove",
        "changeDrawer",
        "changeColor",
        "clear",
        "changeFontSize",
    ].forEach(relay);

    // Where we will save the message

 


    

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

