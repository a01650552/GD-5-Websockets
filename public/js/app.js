let playerStatus;
let playerId;


function showToast(msg) {
    $.toast({
        text: msg,
        position: "top-right"
    })
}

window.socket = null;

function connectToSocketio() {
    let server = window.location.protocol + "//" + window.location.host;
    window.socket = io.connect(server);
    window.socket.on('toast', function(data){
        showToast(data.message);
    })

    window.socket.on('player', function(data){
        playerId = data.id;
        playerStatus = data.status;
        document.getElementById("usuario").innerHTML = `Bienvenido a Basta, ${playerId}`; 
        
        if(data.status === false){
            document.getElementById("juego").hidden = true; 
            document.getElementById("status").innerHTML = `El juego está lleno. ¡Espera tu turno!`; 
        } else {
            /*
            document.getElementById("status").innerHTML = `¡A jugar!`; 
            */
        }
    })

    window.socket.on('init', function(data){
        initialState()
    })

    window.socket.on('showGame', function(data){
        showGame()
    })

    window.socket.on('startGame', function(data){
        //startGame()
        document.getElementById("status").innerHTML = `La letra es ${data.letter}. ¡A jugar!`; 
        document.getElementById("start"). hidden = true;
        document.getElementById("btnBasta").hidden = false;
    })

    window.socket.on("basta", function(data){
        document.getElementById("btnBasta").hidden = true;
        startCount()
    })

    window.socket.on("resultado", function(data){
        showResults(data.winner, data.points)
    })

    window.socket.on("hideGame", function(data){
        hideGame()
    })

}


function messageToServer(msg) {
    window.socket.emit('message-to-server', {message: msg});
}

function initialState() {
    document.getElementById("juego").hidden = true; 
    document.getElementById("status").innerHTML = `Eres el primer jugador, ¡espera a tu oponente!`; 
}

function showGame() {
    document.getElementById("juego").hidden = false;
    document.getElementById("nombre").value = '';
    document.getElementById("color").value = '';
    document.getElementById("fruto").value = '';
    document.getElementById("status").innerHTML = ``;
    document.getElementById("start"). hidden = false;
    document.getElementById("btnBasta").hidden = true;
    document.getElementById("btnLobby").hidden = true; 
}

function hideGame() {
    document.getElementById("juego").hidden = true;
}

function startGame() {
    window.socket.emit('startGame');
}

function basta() {
    window.socket.emit('basta')
}

function startCount() {
    document.getElementById('status').innerHTML = "¡Alguien dijo Basta!";
    var i = 10;
    var time = setInterval(function() {
        showToast(i);
        i--;
        if(i < 0){
            clearInterval(time);
            sendAnswers();
        }
    }, 1000);
}

function sendAnswers() {
    var nombre = document.getElementById("nombre").value;
    var color = document.getElementById("color").value;
    var fruto = document.getElementById("fruto").value;
    window.socket.emit('sendAnswers', {id: playerId, nombre: nombre, color: color, fruto: fruto})
}

function showResults(winner, points) {
    document.getElementById("nombre").value = '';
    document.getElementById("color").value = '';
    document.getElementById("fruto").value = '';
    if(winner === true){
        document.getElementById("status").innerHTML = `¡Ganaste! Obtuviste ${points} puntos. Buen trabajo.`; 
    }
    else if(winner === "tie"){
        document.getElementById("status").innerHTML = `¡Empate!. Obtuviste ${points} puntos. Buen juego.`;
    } else {
        document.getElementById("status").innerHTML = `Perdiste. Obtuviste ${points} puntos. ¡Mejor suerte la próxima!`;
    }
    document.getElementById("btnLobby").hidden = false;
}


$(function () {
    connectToSocketio();
})