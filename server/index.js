
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const PORT = process.env.PORT || 3001;

const { addUser, removeUser, getUser, getAmountOfUsers} = require('./users');

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);

var draw = "";
var word = "";
var wordLevel = "";
var player1Name= "";
var player2Name= "";
var player1Score= 0;
var player2Score= 0;

io.on('connect', (socket) => {
  console.log(`new connection with socket id ${socket.id}`);

  socket.on('getRole', ({}, callback) => {
    getAmountOfUsers() === 0 ? callback('d') : callback('g');
  });

  socket.on('join', ({ name}, callback) => {
    console.log(`${name} joined the game`);
    const { error, user } = addUser({ id: socket.id, name});    
    if(error) return callback("error");
    if(player1Name == "") {
      player1Name = name;
    }
    else {
      player2Name = name;
    }
    if(getAmountOfUsers() === 2) {
      console.log("game starting");
      io.emit('start', {});
    }    
    console.log(`join end`);
  });

  socket.on('getAmountOfUsers', ({}, callback) => {
    callback(getAmountOfUsers());
  });

  socket.on('getPlayersNames', ({}, callback) => {
    callback({one: player1Name, two: player2Name});
  });


  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message });

    callback();
  });

  socket.on('wordToServer', ({_word,_level}, callback) => {
    console.log(`wordToServer: ${_word}, Level: ${_level}`);
    word = _word;
    wordLevel = _level;
    console.log(word);
  });

  socket.on('wordToClient', ({},callback) => {    
    callback({word: word, level: wordLevel});
  });

  socket.on('newGame', ({amountOfGuesses}, callback) => {
    draw = "";
    word = "";
    wordLevel = "";
    console.log(`newGame: ${amountOfGuesses}`);    
  });

  socket.on('updateScore', ({one,two}, callback) => {
    player1Score = one;
    player2Score = two;
  });

  socket.on('getScore', ({}, callback) => {
    callback({one: player1Score, two: player2Score});
  });

  socket.on('endOfGame', ({}, callback) => {
    callback(draw=="");
  });

  socket.on('drawingToServer', (_draw, callback) => {
    console.log(`server got the drawing`);    
    console.log(_draw); 
    draw = _draw.drawing;

  });

  socket.on('getDrawing', () => {
    console.log(`server sent the drawing`);
    console.log(draw);    
    socket.emit('drawToClient', {draw: draw});
  });

  socket.on('disconnect', () => {
    const User = getUser(socket.id);
    if(User !== undefined) {
      const Username = User.name;
      console.log(`${Username} disconnected`);
      if(player1Name == Username) {
        player1Name = "";
      }
      else if(player2Name == Username) {
        player2Name = "";
      }
        
      const user = removeUser(socket.id);
      if(user) {
        console.log(`user left the game`);    
      }
    }
  })



});


server.listen(PORT, () => console.log(`Server has started on port ${PORT}.`));