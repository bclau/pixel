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
    client.on("win", onWin);
    client.on("update me", onUpdateRequest);
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

function onUpdateRequest(requester) {
	var player = playerById(requester.id);
	if(player)
		this.emit("update score", {status: getStatus(player) });
}

function getStatus(player) {
	var range = getMaxScore() - getMinScore();
	return player.getScore() / (range > 0)? range: player.getScore();
}

function getMinScore() {
	return _getAbsoluteScore(players, lesser);
}

function getMaxScore() {
	return _getAbsoluteScore(players, bigger);
}

lesser = function (a, b) {
    return a > b;
};

bigger = function (a, b) {
    return a < b;
};

function _getAbsoluteScore(object_array, condition) {
    var absolute = object_array[0].getScore();
    var temp;
    for (var i in object_array) {
        temp = object_array[i].getScore();
        if (condition(absolute, temp))
            absolute = temp;
    }
    return absolute;
}

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

function onWin(data) {
	var temp;
	var winners = data.winners;
	for(var i=0; i < winners.length; i++) {
		temp = winners[i];
		for(var j=0; j < players.length; j++)
			if(temp.id == players[j].id)
				players[j].incScore();
	}
	
    this.broadcast.emit("win", data);
}


function playerById(id) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].id == id)
            return players[i];
    }

    return false;
}
init();