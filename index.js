const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

let questions = require("./questions.json");

let answer;
let clues;
let users = {};

function game(host) {
  // Creates a new array of "_" that's the length of the clue
  let clue = new Array(questions[0][1].length).fill("_");
  answer = questions[0][1];

  // Creates an array that counts to the length of clue
  let order = [];
  for (let i = 0; i < clue.length; i++) {
    order.push(i);
  }

  // Shuffles the array to determine the order to reveal letters
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  
  io.emit("update sentence", {"sentence" : questions[0][0] + clue.join("") + questions[0][2], "clueLength": clue.length});
  clues = 0;
  function giveHints(count) {
    if (count < clue.length) {
      clue[order[count]] = questions[0][1].charAt(order[count]);
      io.emit("update sentence", {"sentence" : questions[0][0] + clue.join("") + questions[0][2]});
      clues++;
      setTimeout(function() { giveHints(count + 1) }, 2000);
    } else{
      questions.shift();
      showLeaderBoard(host)
    }
  }

  giveHints(0);

}

function showLeaderBoard(host){
  if(questions.length != 0){
    host.broadcast.emit("update sentence", {sentence:"Round over!"});
    host.emit("leaderboard", Object.entries(users).sort((a,b) => {
      return b[1]-a[1]
    }))
    for (let i = 0; i <= 5; i++) {
      if(i<5){
        setTimeout(() => {
          host.emit("update sentence", {sentence:5-i});
        },1000 * i);
      } else{
        setTimeout(() => {
          game(host);
        },5000);
      }
      
    }
    
  } else{
    host.broadcast.emit("update sentence", {sentence:"Game over!"});
    host.emit("update sentence", {sentence:"Final scores"})
    host.emit("leaderboard", Object.entries(users).sort((a,b) => {
      return b[1]-a[1]
    }))
  }
  
}

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

io.use(function(socket, next) {
  if (socket.handshake.auth.host || socket.handshake.auth.username) {
    console.log(users[socket.handshake.auth.username])
    return next();
  }
  next(new Error('Auth error'));
});

io.on("connection", (socket) => {
  console.log(socket.handshake.auth.username || socket.handshake.auth.host);
  if(!socket.handshake.auth.host){
    users[socket.handshake.auth.username] = 0;
    console.log(users)
    socket.on("guess", (data) => {
      if(data.toLowerCase() === answer){
        socket.emit("right");
        users[socket.handshake.auth.username] += (answer.length - clues) * 100;
      } else{
        socket.emit("wrong");
      }
    });
  }
  

  socket.on("start", () => {
    if (socket.handshake.auth.host) {
      io.emit("start game");
      console.log("starting game");
      game(socket);
    }
  })

  socket.on("test", console.log)

})