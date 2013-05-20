define(["app/game", "socket.io"], function(Game, io) {

    WEB_SOCKET_SWF_LOCATION = "/vendor/socket.io";

    var socket = io.connect('http://localhost/');

    /**
     * Signaled after a "set-player" call upon initialization.
     * Hands back the player object to be used by the client.
     */
    socket.on('player-confirmation', function(player) {
        Game.player(player);
    });


    /**
     * Signaled after the "get-rooms" call upon initialization.
     * Hands back a list of rooms and everything known about them.
     *
     * This method updates the "rooms" page to show all of the available mazes to play.
     */
    socket.on('current-rooms', function(data) {
        //console.log('current-rooms fired: '+data.current_rooms);

        var count = 0;
        for (var rm in data.current_rooms) {
            count++;
        }

        if (count > 0)
        {
            var table = $("<table class='table table-striped'></table>");
            table.append("<thead><th>Name</th><th>Size</th><th>Players</th><th></th></thead>");
            for (var rm in data.current_rooms) {
                var c = data.current_rooms[rm];

                var joinText = '';
                if (!c.playing) {
                    joinText = '<a href="#" data-room-name="'+ c.name +'">JOIN</a>';
                } else {
                    joinText = 'GAME IN PROGRESS';
                }
                $(table).append('<tr><td>'+c.name+'</td><td>' + c.x + " x " + c.y + '</td><td>' + c.players.length + '</td><td>' + joinText + '</td></tr>');
            }

            var div = $('#maze-list');
            $(div).html();
            $(div).append(table);

            // when they click on a room, join the room
            $("[data-room-name]").off().click(function(e) {
                e.preventDefault();

                var room_name = $(this).attr("data-room-name");

                //console.log('clicked rn: '+room_name);
                socket.emit('join-room', {name:room_name});
            });
        }
        else
        {
            var div = $('#maze-list');
            $(div).html("<B>There are no games currently online</B>");
        }

    });


    socket.on('room-created', function(data) {

        // hide the modal
        Game.unblock(function() {

            // clear the form (for next time)
            $('#maze_config_form :text').val('');

            // hide the maze itself
            $("#maze-game").addClass("hidden");

            // show the chat
            $("#maze-chat").removeClass("hidden");
            $("#comment").val("");
            $("#comments").val("");

            // change pages (to the maze page)
            Game.changePage("maze");

            Game.drawMaze(data, Game.toMazeOn);
            Game.updateRoomHTML(data.name);
            Game.updatePlayersHTML(data.players);
            var room = data;
            room.bs = parseInt(data.bs, 10);
            room.playing = false;

            Game.room(room);
        });

    });

    socket.on('room-exists', function() {

        Game.unblock(function() {
            $('#maze_config_form input[name="name"]').val('');
            alert('Room with that name exists, choose another.');
        });
    });


    socket.on('player-joined', function(data) {
        //console.log('player joined'+data);

        var room = Game.room();

        room.players.unshift(data);
        Game.updatePlayersHTML(room.players);
    });


    socket.on('room-joined', function(data) {

        // hide the maze itself
        $("#maze-game").addClass("hidden");

        // show the chat
        $("#maze-chat").removeClass("hidden");
        $("#comment").val("");
        $("#comments").val("");

        // change pages (to the maze page)
        Game.changePage("maze");

        Game.drawMaze(data, Game.toMazeOn);
        var room = data;
        room.playing = false;
        Game.updatePlayersHTML(data.players);
        Game.updateRoomHTML(data.name);

        Game.room(room);
    });


    socket.on('game-in-progress', function() {
        alert('Game in Progress, choose another room');
    });


    socket.on('room-queued', function(data) {

    });


    socket.on('another-maze', function(data) {

        var room = Game.room();

        room.wallObj = data.wallObj;
        Game.drawMaze(room, Game.toMazeOn);
        room.playing = false;
        $('#start').removeClass('hidden');
        $('#canvasCover').removeClass('hidden');
    });


    socket.on('init-maze', function() {

        var room = Game.room();

        // hide the chat
        $("#maze-chat").addClass("hidden");

        // show the maze itself
        $("#maze-game").removeClass("hidden");



        //console.log('init maze for: '+room.players);

        Game.initArcs(room.players, room);
        room.playing = true;
        $('#start').addClass('hidden');
        $('#canvasCover').addClass('hidden');
    });


    socket.on('move-update', function(data) {

        var room = Game.room();

        //console.log('move-update called: '+room.players.length);

        var player = Game.player();
        if (player.id !== data.id) {
            Game.coverArcs(room);
            for (var i = 0; i <= room.players.length - 1; i++) {
                if (room.players[i].id == data.id) {
                    //console.log('move update match: '+data.id);
                    room.players[i].coords = data.coords;
                    Game.drawArcs(room);
                    //break;
                }
                //console.log(room.players[i].id);
            }
        }
    });


    socket.on('game-won', function(data) {
        //console.log('game-won: ' + data);

        var room = Game.room();
        room.playing = false;
        for (var i = 0;i<room.players.length; i++) {
            if (data.winner === room.players[i].id) {
                alert(room.players[i].name+' has won!');
                break;
            }
        }
        $('#new-maze').removeClass('hidden');
    });


    socket.on('player-left', function(data) {

        var room = Game.room();

        //console.log('player left called: '+data.player+typeof(room.players[0].id));

        var i, player = parseInt(data.player, 10);
        for (i=0; i<room.players.length; i++) {
            //console.log('plid: '+room.players[i].id);
            if (data.player === room.players[i].id) {
                break;
            }
        }
        room.players.splice(i,1);
        Game.updatePlayersHTML(room.players);
    });


    socket.on("announce-comment", function(data) {
        //console.log("comment announced: " + data.comment);

        var val = $("#comments").val();
        val += "[" + data.player + "] " + data.comment;
        val += "\r\n";

        $("#comments").val(val);
    });

    socket.on("set-player-name-update", function(data) {

        var oldname = data.oldname;
        var newname = data.newname;

        var room = Game.room();

        Game.updateUserNameHTML(newname);
        if (room.players) {
            for (var i = 0; i < room.players.length; i++) {
                if (room.players[i].name == oldname) {
                    room.players[i].name = newname;
                }
            }
            Game.updatePlayersHTML(room.players);
        }
    });


    var r = {};

    var init = r.init = function(name)
    {
        // start things off by telling the server who we are
        // also get a list of all available rooms
        socket.emit('set-player', {
            "name": name
        });
        socket.emit('get-rooms', {});
    };

    r.socket = socket;

    return r;
});
