/**************************************************
** GAME PLAYER CLASS
**************************************************/

var PixelSize = 10;
var EFFICIENT_DRAW = false;

var canvasLimits = { Top: 20, Right: 25, Bottom: 20, Left: 55 };

var Player = function (startX, startY, startColor, startStatus) {
    var x = startX;
    var y = startY;
    var prevX = x;
    var prevY = y;
    var score = 0;
    var color = (startColor) ? startColor : "#666666";
    var status = (startStatus) ? startStatus : 0;
    var border = { Top: 1, Right: 1, Left: 1, Bottom: 1 };
    var id;

    var getX = function () {
        return x;
    }

    var getY = function () {
        return y;
    }

    var getColor = function () {
        return color;
    }

    var getStatus = function () {
        return status;
    }

    var getBorder = function () {
        return border;
    }

    var getPrevX = function () {
        return prevX;
    }

    var getPrevY = function () {
        return prevY;
    }

    var setX = function (newX) {
        if (newX < 0)
            return;
        prevX = x;
        x = newX;
    }

    var setY = function (newY) {
        if (newY < 0)
            return;
        prevY = y;
        y = newY;
    }

    var setColor = function (newColor) {
        color = newColor;
    }

    var setStatus = function (newStatus) {
        status = (newStatus && newStatus >= 0 && newStatus <= 1) ? newStatus : status;
    }

    var setBorder = function (newBorder) {
        border = newBorder;
    }

    var getScore = function () {
        return score;
    }

    var incScore = function () {
        score++;
    }

    var update = function (keys) {
        prevX = x,
        prevY = y;

        if (!(keys.up || keys.down || keys.left || keys.right)) {
            return;
        }

        // Up key takes priority over down
        if (keys.up && y >= 1) {
            y -= 1;
        } else if (keys.down && (y < Math.floor((canvas.height - canvasLimits.Top - canvasLimits.Bottom - 1) / PixelSize - 1))) {
            y += 1;
        };

        // Left key takes priority over right
        if (keys.left && x >= 1) {
            x -= 1;
        } else if (keys.right && (x < Math.floor((canvas.width - canvasLimits.Left - canvasLimits.Right - 1) / PixelSize - 1))) {
            x += 1;
        };

        return (prevX != x || prevY != y) ? true : false;
    };

    /*
        var hexToRGB = function(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }
    */

    var pixel = function (ctx) {

        if (x >= Math.floor((canvas.width - canvasLimits.Left - canvasLimits.Right - 1) / PixelSize))
            return;
        if (y >= Math.floor((canvas.height - canvasLimits.Top - canvasLimits.Bottom - 1) / PixelSize))
            return;

        // draw block
        ctx.fillStyle = color;
        ctx.fillRect(canvasLimits.Left + x * PixelSize, canvasLimits.Top + y * PixelSize, PixelSize, PixelSize);

        // draw lines (borders + status)
        ctx.lineWidth = 1;

        // draw borders
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(canvasLimits.Left + x * PixelSize, canvasLimits.Top + y * PixelSize);

        if (border.Top == 1) {
            ctx.lineTo(canvasLimits.Left + (x + 1) * PixelSize, canvasLimits.Top + y * PixelSize);
        }

        if (border.Right == 1) {
            ctx.lineTo(canvasLimits.Left + (x + 1) * PixelSize, canvasLimits.Top + (y + 1) * PixelSize);
        }

        if (border.Bottom == 1) {
            ctx.lineTo(canvasLimits.Left + x * PixelSize, canvasLimits.Top + (y + 1) * PixelSize);
        }

        if (border.Left == 1) {
            ctx.lineTo(canvasLimits.Left + x * PixelSize, canvasLimits.Top + y * PixelSize);
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
        ctx.rect(canvasLimits.Left + x * PixelSize + Math.round(PixelSize / 3), canvasLimits.Top + y * PixelSize + Math.round(PixelSize / 3), Math.round(PixelSize / 3), Math.round(PixelSize / 3));

        ctx.stroke();
    }

    var draw = function (ctx) {
        if (EFFICIENT_DRAW == true) {
            ctx.clearRect(canvasLimits.Left + prevX * PixelSize, canvasLimits.Top + prevY * PixelSize, PixelSize, PixelSize);
        }

        pixel(ctx);
    };

    return {
        getX: getX,
        getY: getY,
        getColor: getColor,
        getStatus: getStatus,
        getBorder: getBorder,
        getPrevX: getPrevX,
        getPrevY: getPrevY,
        getScore: getScore,
        setX: setX,
        setY: setY,
        setColor: setColor,
        setStatus: setStatus,
        setBorder: setBorder,
        incScore: incScore,
        update: update,
        draw: draw
    };
};