var util = require("util");
var io = require("socket.io");
var Player = require("./Player").Player;

var socket;
var players;

var solution;
var difficulty = 0;

function init_solutions() {
    solution = new Array(10);

    // solution 1
    solution[0] = new Array(2);
    solution[0][0] = new Array(3);
    solution[0][1] = new Array(3);

    // solution 2
    solution[1] = new Array(3);
    solution[1][0] = new Array(3);
    solution[1][1] = new Array(3);
    solution[1][2] = new Array(3);

    // solution 3
    solution[2] = new Array(4);
    solution[2][0] = new Array(3);
    solution[2][1] = new Array(3);
    solution[2][2] = new Array(3);
    solution[2][2] = new Array(3);

    // solution 4
    solution[3] = new Array(4);
    solution[3][0] = new Array(4);
    solution[3][1] = new Array(4);
    solution[3][2] = new Array(4);
    solution[3][3] = new Array(4);

    // solution 5
    solution[4] = new Array(4);
    solution[4][0] = new Array(5);
    solution[4][1] = new Array(5);
    solution[4][2] = new Array(5);
    solution[4][3] = new Array(5);

    // solution 6
    solution[5] = new Array(5);
    solution[5][0] = new Array(5);
    solution[5][1] = new Array(5);
    solution[5][2] = new Array(5);
    solution[5][3] = new Array(5);
    solution[5][4] = new Array(5);

    // solution 7
    solution[6] = new Array(5);
    solution[6][0] = new Array(6);
    solution[6][1] = new Array(6);
    solution[6][2] = new Array(6);
    solution[6][3] = new Array(6);
    solution[6][4] = new Array(6);

    // solution 8
    solution[7] = new Array(6);
    solution[7][0] = new Array(6);
    solution[7][1] = new Array(6);
    solution[7][2] = new Array(6);
    solution[7][3] = new Array(6);
    solution[7][4] = new Array(6);
    solution[7][5] = new Array(6);

    // solution 9
    solution[8] = new Array(6);
    solution[8][0] = new Array(7);
    solution[8][1] = new Array(7);
    solution[8][2] = new Array(7);
    solution[8][3] = new Array(7);
    solution[8][4] = new Array(7);
    solution[8][5] = new Array(7);

    // solution 9
    solution[9] = new Array(7);
    solution[9][0] = new Array(7);
    solution[9][1] = new Array(7);
    solution[9][2] = new Array(7);
    solution[9][3] = new Array(7);
    solution[9][4] = new Array(7);
    solution[9][5] = new Array(7);
    solution[9][6] = new Array(7);

    setInterval(function () { handle_solution(); }, 1000);
}

function generate_solution(index) {
    var x;
    var y;

    for (y = 0; y < solution[index].length; y++) {
        for (x = 0; x < solution[index][y].length; x++) {
            solution[index][y][x] = (Math.floor((Math.random() * 10000)) % 2) ? true : false;
        }
    }
}

var maxTimer = 20;
var timer = 0;
function handle_solution() {
    timer++;

    if (timer == maxTimer) {
        console.log("out of time");
        timer = 0;
        //onWin("out of time");
    }
}

function init() {
    //variable to hold the players
    players = [];

    init_solutions();
    generate_solution(difficulty);

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
    var player = playerById(this.id);
    if (player)
        this.emit("update score", { status: getStatus(player), newSolution: solution[3] });
}

function getStatus(player) {
    var range = getMaxScore() - getMinScore();
    return player.getScore() / (range > 0) ? range : player.getScore();
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

    for (var i = 0; i < winners.length; i++) {
        temp = winners[i];
        for (var j = 0; j < players.length; j++)
            if (temp.id == players[j].id)
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