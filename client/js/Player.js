/**************************************************
** GAME PLAYER CLASS
**************************************************/

var PixelSize = 5;
var Player = function(startX, startY, pixelColor) {
    var x = startX,
        y = startY,
        prevX = x,
        prevY = y,
        color = (pixelColor)?pixelColor:'black',
        id
    
    var getX = function() {
        return x;
    }
    
    var getY = function() {
        return y;
    }
    
    var setX = function (newX) {
        prevX = x;
        x = newX;
    }
    
    var setY = function (newY) {
        prevY = y;
        y = newY;
    }
    
    var update = function(keys) {
        prevX = x,
        prevY = y;
        
        // Up key takes priority over down
        if (keys.up && y >= PixelSize) {
            y -= PixelSize;
        } else if (keys.down) {
            y += PixelSize;
        };

        // Left key takes priority over right
        if (keys.left && x >= PixelSize) {
            x -= PixelSize;
        } else if (keys.right) {
            x += PixelSize;
        };
        
        return (prevX != x || prevY != y) ? true : false;
    };

    var draw = function(ctx) {
        ctx.clearRect(prevX-5, prevY-5, 10, 10);
        ctx.fillStyle = color;
        ctx.fillRect(x-5, y-5, 10, 10);
    };

    return {
        getX: getX,
        getY: getY,
        setX: setX,
        setY: setY,
        update: update,
        draw: draw
    };
};