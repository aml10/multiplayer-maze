define(["jquery", "app/game", "app/sockets"], function($, Game, Sockets) {

    var r = {};

    /**
     * PROBLEM #1: Using emit() to send messages from the browser to the Node.js server.
     *
     * This method gets called when the user connects their browser to the NodeJS server for the first time.
     * The browser loads all of the AMD modules and then initializes the application.
     *
     * The method is invoked by sockets.init().
     *
     * This method is responsible for calling over to NodeJS using Socket.io.  It needs to:
     *
     *   1) Tell the Node.js server what it knows about the player
     *   2) Request a list of rooms
     *
     * For (1), emit the "set-player" event and pass the following data:
     *
     *     {
     *         "name": "<the name of the user>"
     *     }
     *
     * For (2), emit the "get-rooms" event and pass an empty data object (i.e. {} )
     *
     * HINT: The syntax for a Socket.IO emit() is:
     *
     *     socket.emit( "<event-name>", {} );
     *
     * @param username
     */
    r.initializeGame = function(socket, username)
    {
        // TODO: emit the "set-player" event
        socket.emit('set-player', {
            "name": username
        });

        // TODO: emit the "get-rooms" event
        socket.emit('get-rooms', {});
    };


    /**
     * PROBLEM #2: Using on() to listen for new messages from the Node.js server.
     *
     * This method listens for a response from the Node.js server to the "set-player" message which was sent in
     * problem #1.  The response is an event named "player-confirmation".
     *
     * This method is responsible for setting up the socket to listen for the "player-confirmation" event.  When the
     * event triggers, the event data should be passed to the callback.  The "player-confirmation" data looks like this:
     *
     *     {
     *         "name": "<the name of the player>"
     *     }
     *
     * Prior to making the callback, use console.log() to print out the name of the player.
     *
     * HINT: The syntax for a Socket.IO on() is:
     *
     *     socket.on("<event-name>", function(data) {
     *         ... your custom code ...
     *     });
     *
     * @param socket
     * @param callback
     */
    r.setupPlayerConfirmationListener = function(socket, callback)
    {
        // TODO: handle the "player-confirmation" event
        socket.on("player-confirmation", function(data) {

            console.log("The current player is: " + data.name);

            callback(data);
        });
    };


    // PROBLEM #3: Please see Worksheet 2 for Problem #3.


    /**
     * PROBLEM #4: Using on() to listen for new messages from the Node.js server.
     *
     * This method listens for a response from the Node.js server to the "get-rooms" message which was sent in
     * problem #1.  The response is an event named "current-rooms".
     *
     * This method is responsible for setting up the socket to listen for the "current-rooms" event.  When the
     * event triggers, the event data should be passed to the callback.
     *
     * The callback takes two arguments - data and count.
     *
     * The count is a count of the number of rooms.  The data object has a "current_rooms" property which is an
     * associative array (a key/value map) of rooms that are keyed by room id.  Walk this map and count the total
     * number of rooms.  Make sure to pass this into the callback as well.
     *
     * HINT: The syntax for a Socket.IO on() is:
     *
     *     socket.on("<event-name>", function(data) {
     *         ... your custom code ...
     *     });
     *
     * @param socket
     * @param callback
     */
    r.setupCurrentRoomsListener = function(socket, callback)
    {
        // TODO: handle the "current-rooms" event
        socket.on('current-rooms', function(data) {

            var count = 0;
            for (var k in data.current_rooms) {
                count++;
            }

            callback(data, count);
        });
    };

    /**
     * PROBLEM #5: Using emit() triggered from DOM events.
     *
     * This method is responsible for handling the ENTER key on the comment field (within the chat) so that comments
     * are submitted to the Node.js server.
     *
     * This method sets up a jQuery keypress() listener on the text field dom element.  When the ENTER key (keycode 13)
     * is pressed, the default behavior is prevented (since we're handling it manually) and the DOM is cleaned up a
     * little.  We then need to call Socket.IO emit().
     *
     * The "submit-comment" emit() should have the following data structure:
     *
     *     {
     *         "id": "<player id>",
     *         "comment": "<comment text>"
     *     }
     *
     * HINT: The syntax for a Socket.IO emit() is:
     *
     *     socket.emit( "<event-name>", {} );
     *
     */
    r.setupCommentSubmitHandler = function(socket, textfield)
    {
        // when a key is pressed within the text field...
        $(textfield).keypress(function(e) {

            // ... and the key is the ENTER key...
            if (e.keyCode == 13)
            {
                // stop anyone else from handling this method since we are handling manually
                e.preventDefault();

                // the player
                var player = Game.player();
                var playerId = player.id;

                // get the value of the text field
                // this is the comment we want to send to the Node.js server
                var comment = $(textfield).val();

                // clear the comment text field
                $(textfield).val("");

                // TODO: emit the "submit-comment" event
                socket.emit("submit-comment", {
                    "id": playerId,
                    "comment": comment
                });
            }
        });
    };


    // PROBLEM #6: Please see Worksheet 2 for Problem #6.


    /**
     * PROBLEM #7: Using on() to listen for new comments and update DOM.
     *
     * This method listens for an event from the Node.js server of any new comments that have been posted to the
     * player's current room.  All players in the room receive this message and each browser is responsible for
     * updating their user interface to reflect the ongoing chat.
     *
     * This method is responsible for receiving the new comment and updating the text area.
     *
     * The socket.io event name is "announce-comment" and the incoming data has the structure:
     *
     *     {
     *         "player": "<the name of the player>",
     *         "comment": "<the comment text>"
     *     }
     *
     * The text area contains a block of text that should be appended to.  Include the name of the player in the
     * appended text so that each comment is on a new line and is prefixed by [<player name>].
     *
     * In the end, we want comments to stack up like this:
     *
     *     [Bob] Hello World!
     *     [Bill] I hear you loud and clear...
     *     [Betty] Let's start the game!
     *
     * HINT: The syntax for a Socket.IO on() is:
     *
     *     socket.on("<event-name>", function(data) {
     *         ... your custom code ...
     *     });
     *
     * @param socket
     * @param textarea
     */
    r.setupAnnounceCommentListener = function(socket, textarea)
    {
        // TODO: handle the "announce-comment" event
        socket.on("announce-comment", function(data) {

            var player = data.player;
            var comment = data.comment;

            var val = $(textarea).val();
            val += "[" + player + "] " + comment;
            val += "\r\n";

            $(textarea).val(val);
        });
    };


    // PROBLEM #8: Please see Worksheet 2 for Problem #8.


    return r;

});