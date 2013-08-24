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

var KeyTimer = 0;
var KeyTimerMax = 10;

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
    var startX = (Math.round(Math.random() * (canvas.width - PixelSize) / PixelSize)) * PixelSize;
    var startY = (Math.round(Math.random() * (canvas.height - PixelSize) / PixelSize)) * PixelSize;

    // Initialise the local player
    localPlayer = new Player(startX, startY, 'blue');
    localPlayer.draw(ctx);
    
    remotePlayers = [];
    
    socket = io.connect(HOST, {port: 8000, transports:["websocket"]});

    // Start listening for events
    setEventHandlers();
};


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
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
    socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY()});
}

function onSocketDisconnect() {
    console.log("Disconnected from socket server");
}

function onNewPlayer(data) {
    console.log("New player connected: "+ data.id);
    
    var newPlayer = new Player(data.x, data.y);
    newPlayer.id = data.id;
    
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
}

function onRemovePlayer(data) {
    var removePlayer = playerById(data.id);
    
    if (!removePlayer) {
        console.log("Player not found: "+data.id);
        return;
    }
    
    remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
}

/**************************************************
** GAME ANIMATION LOOP
**************************************************/
function animate() {
    KeyTimer++;

    if (KeyTimer >= KeyTimerMax) {
        KeyTimer = 0;
//        update();
    }

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
        socket.emit("move player", { x: localPlayer.getX(), y: localPlayer.getY() });
    }
};

/**************************************************
** GRID DRAW
**************************************************/
function grid_draw() {
    var gridx = 0;
    var gridy = 0;

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#CCCCCC';
    for (gridx = 0; gridx < canvas.width; gridx = gridx + PixelSize) {
        ctx.beginPath();
        ctx.moveTo(gridx, 0);
        ctx.lineTo(gridx, canvas.height);
        ctx.stroke();
    };

    for (gridy = 0; gridy < canvas.height; gridy = gridy + PixelSize) {
        ctx.beginPath();
        ctx.moveTo(0, gridy);
        ctx.lineTo(canvas.width, gridy);
        ctx.stroke();
    };
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
    var i;
    
    for (i = 0; i < remotePlayers.length; i++) {
        if (remotePlayers[i].id == id)
            return remotePlayers[i];
    };
    
    return false;
}