var express = require("express");
var app = express();
var path = require("path");
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var redis = require("ioredis");
const { type } = require("os");

// import {promisify } from "util"

const client = redis.createClient();

// look at new Cluster maybe ?

var connections = [];
const events = [];

var dbredisEvents = [];


async function loadData() {
  var redisString = await client.get("redisEvents");

  var betterString = JSON.parse(redisString);

  dbredisEvents = [];

  dbredisEvents.push(betterString);
}

function saveData(name, data) {
  // was json.stringify

  // when save record what as before


  // make two indexes one hiatory one new 

  //newArr = dbredisEvents.concat(data);
  
  // client.set('new_data', JSON.stringify(dbredisEvents));
  client.set(name, JSON.stringify(data));

}



loadData();


io.on("connect", (socket) => {
  connections.push(socket);
  console.log(`${socket.id} has connected`);
  console.log("Connected: " + connections.length);

  // socket.on("connect", function () {
  //     for (const event of events) {
  //         socket.emit(event.name, event.data);
  //     }
  // });

  // was an async function

  

  socket.on("onNewConnection", function () {
   
    

    loadData();

    var num_move = 0;
    if (dbredisEvents.length === 0) {

        console.log('no data');

    } else {

    // console.log('there is data: ' + dbredisEvents[0][1].name);
      
      for (const eachEvent of dbredisEvents[0]){

          socket.emit(eachEvent.name , eachEvent.data);
          console.log(eachEvent);

      }
      num_move = dbredisEvents[0].length;
  
    }
//    loadData();


    console.log("refreshed, loaded Redis data: " + (dbredisEvents[0]).length + "Events data: " + events.length);





    // for (const event of events) {

    //     socket.emit(event.name, event.data);

    //     console.log(dbredisEvents[0]);

    // }

  
  });











  function relay(name) {
    socket.on(name, (data) => {
      connections.forEach((con) => {
        events.push({ name: name, data: data });

        saveData("redisEvents", dbredisEvents.concat(events));

        if (con.id !== socket.id) {
          con.emit(name, data);

          // events.push({ name: name, data: data });
          // saveData('redisEvents' , events);
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


    // saves data when someone disconnects 


    saveData('redisEvents', dbredisEvents[0].concat(events));
    

    connections = connections.filter((con) => con.id !== socket.id);
    console.log(`${socket.id} has disconnected`);
    console.log("Connected: " + connections.length);
  });
});





app.use(express.static("public"));

let PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server started on port ${PORT}`));
