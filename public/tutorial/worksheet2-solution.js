var exports = module.exports;

var Player = require('../../routes/player').Player;

/**
 * PROBLEM #3: Using on() within Node.js to listen for message from the browser to initialize the player.
 *
 * This method listens for the "set-player" event from the browser.  This event contains data including the player name
 * that the user has elected to use.  We create a player object and store it in the Socket.IO session.  We then hand
 * back a "player-confirmation" event to the browser.
 *
 * The "set-player" event has the following data structure:
 *
 *     {
 *         "name": "<name of the player>"
 *     }
 *
 * The "player-confirmation" response has the following data structure:
 *
 *     {
 *         "id": "<id of the player>",
 *         "name": "<name of the player>"
 *     }
 *
 * HINT: To set a Socket.IO session variable, use:
 *
 *     socket.set("<variable-name>", variable, function() {
 *         ..custom callback code...
 *     });
 *
 * HINT: To emit a Socket.IO message, use:
 *
 *     socket.emit("<event-name>", {
 *         ... data ...
 *     });
 *
 * @param socket
 */
exports.setupHandleSetPlayer = function(socket)
{
    socket.on('set-player', function(data) {

        var config = {
            'socket': socket
        };
        if (data.name) {
            config.name = data.name;
        }

        var player = new Player(config);

        var playerId = player.id;
        var playerName = player.name;

        console.log("A new player has connected to the maze server!");
        console.log("Data -> " + data + ", socket id: " + socket.id);
        console.log("Player -> name: " + playerName + ", id: " + playerId);

        // TODO: store player into Socket.IO server-side session
        // TODO: emit "player-confirmation" with data
        socket.set('player', player, function() {
            socket.emit('player-confirmation', {
                id: playerId,
                name: playerName
            });
        });
    });

};

/**
 * PROBLEM #6: Using on() within Node.js to listen for an event and broadcast to everyone in the room.
 *
 * This method listens for the "submit-comment" event from the browser.  This event contains the following data
 * structure:
 *
 *     {
 *         "player": "<id of the player>",
 *         "comment": "<the comment text>"
 *     }
 *
 * If the comment is not empty, the method should get the "room" and "player" values from the Socket.IO session.
 * Once we have these, we should broadcast the "announce-comment" event to all other players in the room.  This tells
 * all of the browsers connected to our room to update their UI's with our new comment.
 *
 * The data structure for "announce-comment" is:
 *
 *     {
 *         "player": "<player name>",
 *         "comment": "<comment>"
 *     }
 *
 * HINT: The syntax for getting a variable from the Socket.IO session is:
 *
 *     socket.get("<variable-name>", function(err, variable) {
 *         ... your custom code ...
 *     });
 *
 * HINT: The syntax for broadcasting to everyone in a room is:
 *
 *     io.sockets.in("<room-name>").emit("<event-name>", {
 *         ... data ...
 *     });
 *
 * HINT: The player and room name can be accessed via player.name and room.name, respectively.
 *
 * @param socket
 */
exports.setupHandleSubmitContent = function(io, socket)
{
    // TODO: handle the "submit-content" event
    // TODO: get the "room" variable from Socket.IO session
    // TODO: get the "player" variable from Socket.IO session
    // TODO: broadcast to all players (sockets) in the same room
    socket.on("submit-comment", function(data) {

        var comment = data.comment;
        if (comment)
        {
            // add for #8
            comment = filterComment(comment);

            socket.get("room", function(err, room) {

                socket.get("player", function(err, player) {

                    var playerName = player.name;

                    io.sockets.in(room.name).emit("announce-comment", {
                        player: playerName,
                        comment: comment
                    })

                });
            });
        }
    });
};




/**
 * PROBLEM #8: Extra credit - an textual filter for comments!
 *
 * In this problem, we want you to implement a filter for comments to disallow unwanted words.  This is typically used
 * for expletives.
 *
 * If you find any bad words, change the comment to "*** COMMENT CONTAINS DISALLOWED WORDS ***".
 *
 * Instead of bad words, we'll dis
 *
 * A helper function is provided here.  Simply plug it into your solution for #6 above.
 *
 * NOTE: This approach to checking for bad words isn't a particularly fast (or accurate) one.
 *       Can you see why?  How would you improve it?  Do it!
 *
 * @param comment
 */
var filterComment = function(comment)
{
    var contains = function(t, s) {
        return t.indexOf(s) != -1;
    };

    // here are some words we don't allow
    var badwords = ["nodejs", "javascript", "meetup"];

    var containsBadWords = false;
    for (var i = 0; i < badwords.length; i++) {
        if (contains(comment.toLowerCase(), badwords[i].toLowerCase())){
            containsBadWords = true;
            break;
        }
    }

    if (containsBadWords)
    {
        comment = "*** COMMENT CONTAINS DISALLOWED WORDS ***";
    }

    return comment;
};
