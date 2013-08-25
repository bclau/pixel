var Player = function (startX, startY, startColor, startStatus) {
    var x = startX;
    var y = startY;
    var color = (startColor) ? startColor : "#666666";
    var status = (startStatus) ? startStatus : 0;
    var score = 0;
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

    var getScore = function () {
    	return score;
    }

    var setX = function (newX) {
        x = newX;
    }

    var setY = function (newY) {
        y = newY;
    }

    var setColor = function (newColor) {
        color = newColor;
    }

    var setStatus = function (newStatus) {
        status = newStatus;
    }

    var incScore = function() {
    	score++;
    }

    return {
        getX: getX,
        getY: getY,
        getColor: getColor,
        getStatus: getStatus,
        getScore: getScore,
        setX: setX,
        setY: setY,
        setColor: setColor,
        setStatus: setStatus,
        incScore: incScore,
        id: id
    }
};

exports.Player = Player;

