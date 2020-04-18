// Imports
const express = require('express');
const webRoutes = require('./routes/web');

// Session imports
let cookieParser = require('cookie-parser');
let session = require('express-session');
let flash = require('express-flash');
let passport = require('passport');

// Express app creation
const app = express();

//Socket.io
const server = require('http').Server(app);
const io = require('socket.io')(server);


// Configurations
const appConfig = require('./configs/app');

// View engine configs
const exphbs = require('express-handlebars');
const hbshelpers = require("handlebars-helpers");
const multihelpers = hbshelpers();
const extNameHbs = 'hbs';
const hbs = exphbs.create({
  extname: extNameHbs,
  helpers: multihelpers
});
app.engine(extNameHbs, hbs.engine);
app.set('view engine', extNameHbs);

// Session configurations
let sessionStore = new session.MemoryStore;
app.use(cookieParser());
app.use(session({
  cookie: { maxAge: 60000 },
  store: sessionStore,
  saveUninitialized: true,
  resave: 'true',
  secret: appConfig.secret
}));
app.use(flash());

// Configuraciones de passport
require('./configs/passport');
app.use(passport.initialize());
app.use(passport.session());

// Receive parameters from the Form requests
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/', express.static(__dirname + '/public'));
app.use('/', webRoutes);

const result = {
  VICTORY: '¡Has ganado!',
  DEFEAT: '¡Perdiste! Mejor suerte la próxima',
  TIE: 'Ha habido un empate',
  NS: 'El juego no ha empezado'
}

const gameStatus = {
  FINISHED: true,
  NOTFINISHED: false,
  NOTSTARTED: "notstarted"
}

const playerStatus = {
  ACTIVE: true,
  LOBBY: false,
  FIRST: "first"
}

//clase jugador
class Player {
  constructor(socket) {
      this.socket = socket;
      this.id = socket.id;
      this.opponent = 'unmatched';
      this.points = 0;
      this.result = result.NS;
      this.status = playerStatus.FIRST;
      this.color = '';
      this.fruto = '';
      this.nombre = '';
  }
}

//la clase para el tablero
class Board {
  constructor(){
    this.players = [];
    this.status = gameStatus.NOTSTARTED;
    this.lobby = [];
    this.letter = '';
    this.answersRecieved = 0;
    this.active = false;
  }

  getLetter(){
    var alphabet = 'ABCDEFGHIJKLMNOPQRZTUVWXYZ';
    var position = Math.floor(Math.random() * alphabet.length)
    this.randomLetter = alphabet.charAt(position);
    this.letter = this.randomLetter;
    return this.randomLetter;
  }

   addPlayer(player) {
    if (this.players.length < 2) {
      player.status = playerStatus.ACTIVE;
      this.players.push(player);
      if(this.players.length == 2) {
        this.players[0].opponent = this.players[1];
        this.players[1].opponent = this.players[0];
      }
    }
    else {
      player.status = playerStatus.LOBBY;
      this.lobby.push(player);
    }
   }
   
   addFromLobby(){
    for(var i = 0; i < this.lobby.length; i++) {
      //Si no hay dos jugadores activos, se manda al primer jugador de la lista de espera a la lista de jugadores activos
      if (this.players.length < 2) {
        this.addPlayer(this.lobby.shift());
      }
    }
   }

   deletePlayer(id) {
    for(var i = 0; i < this.players.length; i++) {
      if(this.players[i].id == id) {
        this.players.splice(i, 1);
        this.addFromLobby();
      }
    }
    for(var i = 0; i < this.lobby.length; i++) {
      if(this.lobby[i].id == id) {
        this.lobby.splice(i, 1);
      }
    }
  }

  changeToLobby() {
    for(i = 0; i < 2; i++){
      this.lobby.push(this.players.pop());
    }
  }
  
  getResults() {
    console.log("Jugador 0: ", this.players[0].id);
    console.log("Jugador 1: ", this.players[1].id);

    console.log("Jugador 0: ", this.players[0].nombre);
    console.log("Jugador 1: ", this.players[1].nombre);

    if(this.players[0].nombre == this.players[1].nombre && this.players[0].nombre.charAt(0) == this.letter){
      this.players[0].points = this.players[0].points + 5;
      this.players[1].points = this.players[1].points + 5;
      console.log("Jugador 0, nombre: ", this.players[0].points)
      console.log("Jugador 1, nombre: ", this.players[1].points)
    }
    if(this.players[0].color == this.players[1].color && this.players[0].color.charAt(0) == this.letter){
      this.players[0].points = this.players[0].points + 5;
      this.players[1].points = this.players[1].points + 5;
      console.log("Jugador 0, color: ", this.players[0].points)
      console.log("Jugador 1, color: ", this.players[1].points)
    }
    if(this.players[0].fruto == this.players[1].fruto && this.players[0].fruto.charAt(0) == this.letter){
      this.players[0].points = this.players[0].points + 5;
      this.players[1].points = this.players[1].points + 5;
    }
    if(this.players[0].nombre != this.players[1].nombre){
      if(this.players[0].nombre.charAt(0) == this.letter){
        this.players[0].points = this.players[0].points + 10;
      }
      if(this.players[1].nombre.charAt(0) == this.letter){
        this.players[1].points = this.players[1].points + 10;
      }
      console.log("Jugador 0, nombre: ", this.players[0].points)
      console.log("Jugador 1, nombre: ", this.players[1].points)
    }
    if(this.players[0].color != this.players[1].color){
      if(this.players[0].color.charAt(0) == this.letter){
        this.players[0].points = this.players[0].points + 10;
      }
      if(this.players[1].color.charAt(0) == this.letter){
        this.players[1].points = this.players[1].points + 10;
      }
      console.log("Jugador 0, color: ", this.players[0].points)
      console.log("Jugador 1, color: ", this.players[1].points)
    }
    if(this.players[0].fruto != this.players[1].fruto){
      if(this.players[0].fruto.charAt(0) == this.letter){
        this.players[0].points = this.players[0].points + 10;
      }
      if(this.players[1].fruto.charAt(0) == this.letter){
        this.players[1].points = this.players[1].points + 10;
      }
      console.log("Jugador 0, fruto: ", this.players[0].points)
      console.log("Jugador 1, fruto: ", this.players[1].points)
    }

  }

  getWinner(){
    if(this.players[0].points > this.players[1].points){
      return 0;
    } else if(this.players[0].points < this.players[1].points){
      return 1;
    } else {
      return 2;
    }
  }
  
}

let basta = new Board();

io.on('connection', (socket) => {
  
  player = new Player(socket);
  basta.addPlayer(player);  

  socket.emit('toast', {message: `Bienvenido ${player.id}`});
  console.log(`Connected: ${player.id}`)

  socket.emit('player', {id: player.id, status: player.status});

  if (basta.players.length == 2 && basta.active === false){
    for(i = 0; i < basta.players.length; i++){
      basta.players[i].socket.emit('showGame');
    }
    basta.active = true;
  } 

  socket.on("disconnect", () => {
    console.log("Disconnected: ", socket.id);
    basta.deletePlayer(socket.id);
    if(basta.players.length > 0){
      if(basta.players.length == 1){
        basta.players[0].socket.emit('init');
      } /*else if(basta.players.length == 2 && basta.active == true){
        for(i = 0; i < basta.players.length; i++){
          basta.players[i].socket.emit('showGame');
        }
      } */
    }
  });

  socket.on("startGame", () => {
    var letter = basta.getLetter();
    for(i = 0; i < basta.players.length; i++){
      basta.players[i].socket.emit('startGame', {letter: letter});
    }
  })

  socket.on("basta", (data) => {
    for(i = 0; i < basta.players.length; i++){
      basta.players[i].socket.emit('basta');
    }
  })

  socket.on("sendAnswers", (data) => {
    var nombre = data.nombre.toUpperCase();
    var fruto = data.fruto.toUpperCase();
    var color = data.color.toUpperCase();
    console.log("ID: ", data.id);
    if(basta.players[0].id === data.id){
      basta.players[0].nombre = nombre;
      basta.players[0].fruto = fruto;
      basta.players[0].color = color;
    } else {
      basta.players[1].nombre = nombre;
      basta.players[1].fruto = fruto;
      basta.players[1].color = color;
    }
    basta.answersRecieved = basta.answersRecieved + 1;
    if(basta.answersRecieved == 2){
      basta.getResults();
      var ganador = basta.getWinner();
      if(ganador < 2){
        for(i = 0; i < basta.players.length; i++){
          if(ganador == i){
            basta.players[i].socket.emit('resultado', {points: basta.players[i].points, winner: true});
          } else{
            basta.players[i].socket.emit('resultado', {points: basta.players[i].points, winner: false});
          }
        }
      } else{
        basta.players[0].socket.emit('resultado', {points: basta.players[0].points, winner: "tie"});
        basta.players[1].socket.emit('resultado', {points: basta.players[1].points, winner: "tie"});
      }
      basta.players[0].points = 0;
      basta.players[1].points = 0;
      basta.players[0].socket.emit("hideGame");
      basta.players[1].socket.emit("hideGame");
      basta.deletePlayer(basta.players[1].id);
      basta.deletePlayer(basta.players[0].id);
      basta.answersRecieved = 0;
      basta.active = false;
      if(basta.players.length == 2){
        basta.players[0].socket.emit("showGame");
        basta.players[1].socket.emit("showGame");
      }
    }
  })


  socket.on('message-to-server', (data) => {
    console.log('message received', data);
  });

});

// App init
server.listen(appConfig.expressPort, () => {
  console.log(`Server is listenning on ${appConfig.expressPort}! (http://localhost:${appConfig.expressPort})`);
});
