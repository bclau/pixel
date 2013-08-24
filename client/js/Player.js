/**************************************************
** GAME PLAYER CLASS
**************************************************/

var PixelSize = 100;
var Player = function(startX, startY, pixelColor) {
    var x = startX,
        y = startY,
        prevX = x,
        prevY = y,
        color = (pixelColor)?pixelColor:'black',
        id;
    
    var getX = function() {
        return x;
    }
    
    var getY = function() {
        return y;
    }
    
    var getPrevX = function() {
        return prevX;
    }
    
    var getPrevY = function() {
        return prevY;
    }
    
    var setX = function (newX) {
    	if(newX < 0)
    		return;
        prevX = x;
        x = newX;
    }
    
    var setY = function (newY) {
    	if(newY < 0)
    		return;
        prevY = y;
        y = newY;
    }
    
    var update = function(keys) {
        prevX = x,
        prevY = y;
        
        // Up key takes priority over down
        if (keys.up && y >= 1) {
            y -= 1;
        } else if (keys.down) {
            y += 1;
        };

        // Left key takes priority over right
        if (keys.left && x >= 1) {
            x -= 1;
        } else if (keys.right) {
            x += 1;
        };
        
        return (prevX != x || prevY != y) ? true : false;
    };

    var draw = function(ctx) {
        ctx.clearRect(prevX * PixelSize, prevY * PixelSize, PixelSize, PixelSize);
        ctx.fillStyle = color;
        ctx.fillRect(x * PixelSize, y * PixelSize, PixelSize, PixelSize);
    };

    return {
        getX: getX,
        getY: getY,
        getPrevX: getPrevX,
        getPrevY: getPrevY,
        setX: setX,
        setY: setY,
        update: update,
        draw: draw
    };
};