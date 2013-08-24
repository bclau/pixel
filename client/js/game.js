/**************************************************
** GAME VARIABLES
**************************************************/
var canvas,            // Canvas DOM element
    ctx,            // Canvas rendering context
    keys,            // Keyboard input
    localPlayer,    // Local player
    remotePlayers,
    socket;
var PixelSize = 10;
var HOST = "http://share.ligaac.ro";
//var HOST = "http://127.0.0.1";
var EFFICIENT_DRAW = false;
var xmax,
	ymax;
var solution;
var map;


/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
    // Declare the canvas and rendering context
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    // Maximise the canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Initialise keyboard controls
    keys = new Keys();
    /*
        var url = require('url');
        var url_parts = url.parse(request.url, true);
        var query = url_parts.query;
    
        PixelSize = query.pixelsize;
        */
    // Calculate a random start position for the local player
    // The minus 10 (half a player size) stops the player being
    // placed right on the egde of the screen
    
    xmax = Math.floor((canvas.width) / PixelSize);
    ymax = Math.floor((canvas.height) / PixelSize);
    var startX = Math.floor(Math.random() * xmax);
    var startY = Math.floor(Math.random() * ymax);
    
    map = initBooleanMatrix(ymax, xmax);
    map[startY][startX] = true;
    
    solution = initBooleanMatrix(2, 3);
    solution[0][0] = true;
    solution[0][2] = true;
    solution[1][1] = true;
    
    	
    // Initialise the local player
    localPlayer = new Player(startX, startY, "rgba(" + Math.round(Math.random() * 224 + 31) + "," + Math.round(Math.random() * 224 + 31) + "," + Math.round(Math.random() * 224 + 31) + ", 1.0)", 0.0);
    if (EFFICIENT_DRAW == true) {
        localPlayer.draw(ctx);
    }

    remotePlayers = [];
    socket = io.connect(HOST, { port: 8000, transports: ["websocket"] });
    remotePlayers.push(localPlayer);

    // Start listening for events
    setEventHandlers();
};

function initBooleanMatrix(n, m) {
	matrix = new Array(n);
	for(var i = 0; i< n; i++) {
		matrix[i] = new Array(m);
		for(var j=0; j<m; j++)
			matrix[i][j] = false;
	}
	return matrix;
}


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function () {
    // Keyboard
    window.addEventListener("keydown", onKeydown, false);
    window.addEventListener("keyup", onKeyup, false);

    // Window resize
    window.addEventListener("resize", onResize, false);

    //Socket events
    socket.on("connect", onSocketConnected);
    socket.on("disconnect", onSocketDisconnect);
    socket.on("new player", onNewPlayer);
    socket.on("move player", onMovePlayer);
    socket.on("remove player", onRemovePlayer);

    window.setInterval(function () { update() }, 100);
};

// Keyboard key down
function onKeydown(e) {
    if (localPlayer) {
        keys.onKeyDown(e);
    };
};

// Keyboard key up
function onKeyup(e) {
    if (localPlayer) {
        keys.onKeyUp(e);
    };
};

// Browser window resize
function onResize(e) {
    // Maximise the canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};

function onSocketConnected() {
    console.log("Connected to socket server");
    socket.emit("new player", { x: localPlayer.getX(), y: localPlayer.getY(), color: localPlayer.getColor(), status: localPlayer.getStatus() });
}

function onSocketDisconnect() {
    console.log("Disconnected from socket server");
}

function onNewPlayer(data) {
    console.log("New player connected: " + data.id);

    var newPlayer = new Player(data.x, data.y, data.color, data.status);
    
    newPlayer.id = data.id;
    map[data.y][data.x] = true;
    remotePlayers.push(newPlayer);
}

function onMovePlayer(data) {
    var movePlayer = playerById(data.id);
    
    if (!movePlayer) {
        console.log("Player not found: " + data.id);
        return;
    }

    movePlayer.setX(data.x);
    movePlayer.setY(data.y);
    if (EFFICIENT_DRAW == true) {
        movePlayer.draw(ctx);
    }
    
    updatePlayerLocation(movePlayer);
}

function onRemovePlayer(data) {
    var removePlayer = playerById(data.id);

    if (!removePlayer) {
        console.log("Player not found: " + data.id);
        return;
    }

    map[removePlayer.getY()][removePlayer.getX()] = false;
    remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
}

/**************************************************
** GAME ANIMATION LOOP
**************************************************/
function animate() {
    if (EFFICIENT_DRAW == false) {
        draw();
    }
    
    // Request a new animation frame using Paul Irish's shim
    window.requestAnimFrame(animate);
};


/**************************************************
** GAME UPDATE
**************************************************/
function update() {
    if (localPlayer.update(keys)) {
        if (EFFICIENT_DRAW == true) {
            localPlayer.draw(ctx);
        }

        socket.emit("move player", { x: localPlayer.getX(), y: localPlayer.getY(), color: localPlayer.getColor(), status: localPlayer.getStatus() });
        var win = updatePlayerLocation(localPlayer);
        if(win){
        	//alert("Yeeay. Won.");
        	socket.emit("win", { x: localPlayer.getX(), y: localPlayer.getY(), color: localPlayer.getColor(), status: localPlayer.getStatus() });
        }
    }
};

function updatePlayerLocation(player) {
	if(player.getPrevY() < ymax && player.getPrevX() < xmax)
		map[player.getPrevY()][player.getPrevX()] = false;
	if(player.getY() < ymax && player.getX() < xmax) {
		map[player.getY()][player.getX()] = true;
		return checkGameSolution();
	}
}

/**************************************************
** GAME WIN CHECK
**************************************************/

function checkGameSolution() {
	var minX = _getMinX(remotePlayers);
	var maxX = _getMaxX(remotePlayers);
	if(maxX - minX - 1 > solution[0].length)
		return false;
	
	var minY = _getMinY(remotePlayers);
	var maxY = _getMaxY(remotePlayers);
	if(maxY - minY - 1 > solution.length)
		return false;
	
	for(var i=0; i < solution.length; i++)
		for(var j=0; j < solution[i].length; j++){
			if( !(solution[i][j] == map[minY+i][minX+j]) )
				return false;
		}
	
	return true;
}

function _getMinX(object_array) {
	return _getAbsoluteX(object_array, lesser);
}
function _getMaxX(object_array) {
	return _getAbsoluteX(object_array, bigger);
}
function _getMinY(object_array) {
	return _getAbsoluteY(object_array, lesser);
}
function _getMaxY(object_array) {
	return _getAbsoluteY(object_array, bigger);
}

lesser = function(a, b) {
	return a > b;
};

bigger = function(a, b) {
	return a < b;
};

function _getAbsoluteX(object_array, condition) {
	var absolute = object_array[0].getX();
	var temp;
	for ( var i in object_array) {
		temp = object_array[i].getX();
		if(condition(absolute, temp))
			absolute = temp;
	}
	
	return absolute;
}

function _getAbsoluteY(object_array, condition) {
	var absolute = object_array[0].getY();
	var temp;
	for ( var i in object_array) {
		temp = object_array[i].getY();
		if(condition(absolute, temp))
			absolute = temp;
	}
	
	return absolute;
}

/**************************************************
** GRID DRAW
**************************************************/
function grid_draw() {
    var gridx = 0;
    var gridy = 0;

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#DDDDDD";

    ctx.beginPath();

    for (gridx = 0; gridx < canvas.width; gridx = gridx + PixelSize) {
        ctx.moveTo(gridx, 0);
        ctx.lineTo(gridx, canvas.height);
    };

    for (gridy = 0; gridy < canvas.height; gridy = gridy + PixelSize) {
        ctx.moveTo(0, gridy);
        ctx.lineTo(canvas.width, gridy);
    };

    ctx.stroke();
}

/**************************************************
** GAME DRAW
**************************************************/
function draw() {
    // Wipe the canvas clean
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid_draw();

    var i;
    for (i = 0; i < remotePlayers.length; i++) {
        remotePlayers[i].draw(ctx);
    };

    // Draw the local player
    localPlayer.draw(ctx);
};

function playerById(id) {
    for (var i = 0; i < remotePlayers.length; i++) {
        if (remotePlayers[i].id == id)
            return remotePlayers[i];
    };

    return false;
}
