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

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.emit('toast', {message: "Conectado con el servidor"});
  let i = 0;
  setInterval(() => {
    socket.emit('toast', {message: "Conectado con el servidor"});
    i++;
  }, 10000)
  socket.on('message-to-server', (data) => {
    console.log('message received', data);
  });
});

const result = {
  VICTORY: '¡Has ganado!',
  DEFEAT: '¡Perdiste! Mejor suerte la próxima',
  TIE: 'Ha habido un empate',
  NS: 'El juego no ha empezado'
}

const gameStatus = {
  FINISHED: true,
  NOTFINISHED: false,
  NOTSTARTED: false
}

//clase jugador
class Player {
  constructor(socket) {
      this.socket = socket;
      this.id = socket.id;
      this.opponent = 'unmatched';
      this.points = 0;
      this.result = result.NS;
  }

  setOpponent(opponent) {
    this.opponent = opponent;
  }
}

//la clase para el tablero
class Board {
  constructor(){
    this.players = [];
    this.letter = null;
    this.status = gameStatus.NOTSTARTED;
  }
}

// App init
server.listen(appConfig.expressPort, () => {
  console.log(`Server is listenning on ${appConfig.expressPort}! (http://localhost:${appConfig.expressPort})`);
});
