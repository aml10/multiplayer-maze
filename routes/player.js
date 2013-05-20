var Player = function (options) {

    this.name = options.name || 'Unknown Player';
    this.id = options.socket.id;
    this.coords = {
        x: 0,
        y: 0
    };
};

exports.Player = Player;
