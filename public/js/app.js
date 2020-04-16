
function showToast(msg) {
    console.log("El mensaje es: ", msg);
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
        document.getElementById("usuario").innerHTML = `Bienvenido a Basta, ${data}`; 
    })
}

function messageToServer(msg) {
    window.socket.emit('message-to-server', {message: msg});
}

$(function () {
    connectToSocketio();
})