/**************************************************
** GAME PLAYER CLASS
**************************************************/

var PixelSize = 10;
var EFFICIENT_DRAW = false;

var Player = function(startX, startY, pixelColor) {
    var x = startX,
        y = startY,
        prevX = x,
        prevY = y,
        color = (pixelColor)?pixelColor:'gray',
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

    var pixel = function (ctx, color, status, border) {
        var statusRed = color.re
        var statusGreen = 
            
        // draw block
        ctx.fillStyle = color;
        ctx.fillRect(x, y, PixelSize, PixelSize);

        // draw lines (borders + status)
        ctx.lineWidth = 1;
        ctx.beginPath();

        // draw borders
        ctx.strokeStyle = 'black';
        ctx.moveTo(x, y);

        if (border.Top == 1) {
            ctx.lineTo(x + PixelSize, y);
        }

        if (border.Right == 1) {
            ctx.lineTo(x + PixelSize, y + PixelSize);
        }

        if (border.Bottom == 1) {
            ctx.lineTo(x, y + PixelSize);
        }

        if (border.Left == 1) {
            ctx.lineTo(x, y);
        }

        // draw status
        ctx.strokeStyle = "#" + status + status + status;
        ctx.moveTo(x + 3, y + 3);
        ctx.lineTo(x + PixelSize - 3, y + 3);
        ctx.lineTo(x + PixelSize - 3, y + PixelSize - 3);
        ctx.lineTo(x + 3, y + PixelSize - 3);
        ctx.lineTo(x + 3, y + 3);

        ctx.stroke();
    }

    var draw = function (ctx) {
        if (EFFICIENT_DRAW == true) {
            ctx.clearRect(prevX, prevY, PixelSize, PixelSize);
        }

        pixel(ctx, color, "FF", {Top: 1, Right: 1, Bottom: 1, Left: 1});
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