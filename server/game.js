var util = require("util");
var io = require("socket.io");
var Player = require("./Player").Player;

var socket;
var players;

function init() {
    //variable to hold the players
    players = [];

    //Listen for connections on port 8000
    socket = io.listen(8000);

    //Configure socket.io to use only websockets and limit log level
    socket.configure(function () {
        socket.set("transports", ["websocket"]);
        socket.set("log level", 2);
    });

    setEventHandlers();
}

var setEventHandlers = function () {
    socket.sockets.on("connection", onSocketConnection);
}

function onSocketConnection(client) {
    util.log("New player has connected: " + client.id);
    client.on("disconnect", onClientDisconnect);
    client.on("new player", onNewPlayer);
    client.on("move player", onMovePlayer);
}

function onClientDisconnect() {
    util.log("Player has disconnected: " + this.id);

    var removePlayer = playerById(this.id);

    if (!removePlayer) {
        util.log("Player not found: " + this.id);
        return;
    }

    players.splice(players.indexOf(removePlayer), 1);
    this.broadcast.emit("remove player", { id: this.id });
};

function onNewPlayer(data) {
    var newPlayer = new Player(data.x, data.y, data.color, data.status);
    newPlayer.id = this.id;
    this.broadcast.emit("new player", { id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), color: newPlayer.getColor(), status: newPlayer.getStatus() });
    var i, existingPlayer;
    for (i = 0; i < players.length; i++) {
        existingPlayer = players[i];
        this.emit("new player", { id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY(), color: existingPlayer.getColor(), status: existingPlayer.getStatus() });
    }

    players.push(newPlayer);
};

function onMovePlayer(data) {
    var movePlayer = playerById(this.id);

    if (!movePlayer) {
        util.log("Player not found: " + this.id);
        return;
    }

    movePlayer.setX(data.x);
    movePlayer.setY(data.y);

    this.broadcast.emit("move player", { id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY(), color: movePlayer.getColor(), status: movePlayer.getStatus() });

};

function playerById(id) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].id == id)
            return players[i];
    }

    return false;
}
init();