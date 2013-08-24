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
        color = (pixelColor)?pixelColor:"#666666",
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

    var hexToRGB = function(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    var pixel = function (ctx, color, status, border) {
        // draw block
        ctx.fillStyle = color;
        ctx.fillRect(x, y, PixelSize, PixelSize);

        // draw lines (borders + status)
        ctx.lineWidth = 1;

        // draw borders
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
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
        ctx.stroke();


        // draw status
        ctx.beginPath();
        //        var colorComponents = hexToRGB(color);

//        if (colorComponents == null) {
//            ctx.strokeStyle = color;
//        }
//        else {
//            ctx.strokeStyle = "rgba(" + colorComponents.r + ", " + colorComponents.g + ", " + colorComponents.b + ", " + status + ")";
            ctx.strokeStyle = "rgba(" + 0 + ", " + 0 + ", " + 0 + ", " + status + ")";
//        }
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

        pixel(ctx, color, 1, {Top: 1, Right: 1, Bottom: 1, Left: 1});
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