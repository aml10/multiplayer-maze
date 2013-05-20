/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var RoomManager = require('./routes/roomManager').RoomManager;
var Room = require('./routes/roomManager').Room;
var Player = require('./routes/player').Player;
var Maze = require('./routes/buildMaze').Maze;
var querystring = require('querystring');

var rooms = {};

var app = express();

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', {
        layout: false
    });
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);

// Express
var port = process.env.PORT || 3000;
var server = app.listen(port, function() {
    console.log("Listening on " + port);
});

// Socket IO
var io = require("socket.io").listen(server);
/*
io.configure(function () {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 20);
});
*/



// SOCKET IO LISTENERS
io.sockets.on('connection', function(socket) {

    /**
     * When a browser connects to the maze server for the first time, it calls "set-player" to tell the maze server
     * everything it knows about the current player.
     *
     * A Player object is constructed and stored in socket.io's session ("player").
     *
     * Responds by raising a "player-confirmation" signal.
     */
    socket.on('set-player', function(data) {

        var config = {
            'socket': socket
        };
        if (data.name) {
            config.name = data.name;
        }

        var player = new Player(config);

        console.log("A new player has connected to the maze server!");
        console.log("Data -> " + data + ", socket id: " + socket.id);
        console.log("Player -> name: " + player.name + ", id: " + player.id);

        // store "player" object in session
        socket.set('player', player, function() {
            socket.emit('player-confirmation', {id:player.id,name:player.name});
        });
    });

    /**
     * When a browser decides to rename a player, it signals "set-player-name" to allow the maze server to
     * update the server-side player object and inform all clients connected to the room.
     */
    socket.on('set-player-name', function(data) {

        // the new player name
        var newname = data.player.name;
        var room = data.room;

        // get the "player" object from session
        socket.get('player', function(err, player) {

            if (player) {
                var oldname = player.name;

                console.log("Player: " + oldname + " updated their name to: " + newname);
                player.name = newname;

                io.sockets.in(room.name).emit("set-player-name-update", {
                    "oldname": oldname,
                    "newname": newname
                });
            }
        });
     });

    /**
     * Retrieves a list of rooms that this server is running.
     */
    socket.on('get-rooms', function(data)
    {
        var current_rooms = {
            current_rooms: rooms
        };

        socket.emit('current-rooms', current_rooms);
    });

    /**
     * Creates a brand new room.
     * Rooms are stored on the global 'rooms' javascript variable.
     *
     * This method expects:
     *
     * {
     *   "x": <size in x>,
     *   "y": <size in y>,
     *   "name": "<name of the room>",
     *   "bs": <size of the blocks>
     * }
     *
     */
    socket.on('create-room', function(data) {

        // information about the room that is to be created
        var roomdata = querystring.parse(data.room);

        // check whether a room already exists with this name
        if (rooms.hasOwnProperty(roomdata.name)) {
            socket.emit('room-exists');
            return;
        }

        // parse out additional properties about the room to be created
        roomdata.x = parseInt(roomdata.x, 10);
        roomdata.y = parseInt(roomdata.y, 10);

        // create the room
        var room = new Room(roomdata, data.player);

        // tell this socket to join the the socket.io room
        socket.join(room.name);

        // store back onto our map
        rooms[room.name] = room;

        // store room into socket.io session
        socket.set('room', room);

        // respond with "room-created" message
        socket.emit('room-created', {
            name: room.name,
            x: room.x,
            y: room.y,
            bs: room.bs,
            wallObj:room.maze.walls,
            players:room.players
        });

        // broadcast "current-rooms" to all clients
        socket.broadcast.emit('current-rooms', {
            current_rooms:rooms
        });
    });

    /**
     * Listens for when a user elects to join a room.
     */
    socket.on('join-room', function(data) {

        // find the room
        var room = rooms[data.name];

        // make sure there isn't already a game in progress
        if ( room.playing ) {
            socket.emit('game-in-progress');
            return;
        }

        socket.get('player', function(err, player) {

            // is this player already in this room?
            var alreadyInRoom = false;
            if (room.players) {
                for (var i = 0; i < room.players.length; i++)
                {
                    if (room.players[i].name === player.name) {
                        alreadyInRoom = true;
                    }
                }
            }

            if (!alreadyInRoom)
            {
                // inform everyone in the room that a player has joined
                io.sockets.in(room.name).emit('player-joined', player);

                // now let the player join the room
                socket.join(room.name);

                // update the room to include the player
                room.players.push(player);

                console.log("Player: " + player.name + " just joined the room: " + room.name);
            }

            // inform the player that they successfully joined the room
            var response = {
                name:room.name,
                x: room.x,
                y: room.y,
                bs: room.bs,
                offset: 20,
                wallObj: room.maze.walls,
                players: room.players,
                playing: room.playing
            };
            socket.set('room', room, function() {
                socket.emit('room-joined', response);
            });
        });
    });

    /**
     * Signaled when a player is starting to play a maze.
     * Only one player can play a maze at a time.
     */
    socket.on('start-maze', function(data) {
            socket.get('room', function(err, room) {
                room.playing = true;
                io.sockets.in(data.name).emit('init-maze');
            });
    });

    /**
     * Signaled when a player moves within the maze.
     *
     * We signal back that we've heard them move.
     * If they move to the upper-right corner, we finish the game and tell them they've won.
     */
    socket.on('move', function (data) {
        //console.log(data);
        io.sockets.in(data.name).emit('move-update',data);
        socket.get('room', function(err, room) {

            // if they make it to the upper left, they've finished
            if (data.coords.x === room.cDimensions.x && data.coords.y === room.cDimensions.y) {
                room.playing = false;
                io.sockets.in(room.name).emit('game-won', {winner:data.id});
            }
        });
    });

    /**
     * Signaled when a new maze is created.
     *
     */
    socket.on('new-maze', function(data) {
        socket.get('room', function(err, room) {

            // generates the walls for the maze
            room.maze.walls = room.maze.kruskals();
            room.playing = false;

            // everyone in the room receives the maze update
            io.sockets.in(room.name).emit('another-maze', {
                wallObj: room.maze.walls
            });
        });
    });

    /**
     * Signaled when a player leaves the maze and goes back to the lobby.
     */
    socket.on('to-lobby', function(data) {

        var playerID = data.player;

        // leave the socket io room
        socket.leave(data.room);

        // remove player from the room list
        var room = rooms[data.room];
        for (i=0;i<room.players.length; i++) {
            if (room.players[i].id === playerID) {
                room.players.splice(i, 1);
                break;
            }
        }

        io.sockets.in(data.room).emit('player-left', {player:data.player});
    });

    /**
     * Signaled when a comment is submitted by one of the players in a room.
     * If approved, the comment is distributed to everyone else in the room.
     */
    socket.on("submit-comment", function(data) {

        var playerId = data.player;

        socket.get("room", function(err, room) {

            socket.get("player", function(err, player) {

                io.sockets.in(room.name).emit("announce-comment", {
                    player: player.name,
                    comment: data.comment
                })

            });
        });
    });

    /**
     * When a user disconnects (such as closing their browser), we remove them from the room they were in.
     */
    socket.on('disconnect', function() {
        socket.get("player", function(err, player) {
            socket.get('room', function(err, room) {

                if (room)
                {
                    // remove player from the room list
                    if (room.players)
                    {
                        for (i=0;i<room.players.length; i++) {
                            if (room.players[i].id === player.id) {
                                room.players.splice(i, 1);
                                break;
                            }
                        }
                    }

                    // inform everyone that the player left
                    socket.get('player', function(err, player) {
                        io.sockets.in(room.name).emit('player-left', {player:player.id});
                    });
                }

            });
        });
    });


});
