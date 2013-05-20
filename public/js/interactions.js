define([
    "jquery",
    "bootstrap",
    "app/game",
    "app/sockets",
    "worksheet"
],
    function($, bootstrap, Game, Sockets, Worksheet) {

    var socket = Sockets.socket;

    // handle click to create a new room
    $('#create').click(function(e) {
        e.preventDefault();

        var player = Game.player();

        var form = $('#maze_config_form');
        form = form.serialize();
        var data = {
            room: form,
            player: player
        };

        socket.emit('create-room', data);

        // block with a modal
        Game.block("Please wait while your maze is created...");
    });


    // handle click to start the game
    $('button#start').click(function(e) {
        //console.log('start clicked'+room.name);

        var room = Game.room();

        socket.emit('start-maze', {
            name: room.name
        });
    });


    // handle click to create a new maze
    $('button#new-maze').click(function(e) {
        e.preventDefault();
        socket.emit('new-maze');
    });


    // handel click to go back to the lobby
    $('#to-lobby').click( function(e) {
        e.preventDefault();
        var player = Game.player();
        socket.emit('to-lobby', {room:room.name,player:player.id});
        Game.room(null);
        Game.toLobby();
    });



    $('.header-main-input').on('click', 'h3', function(e) {
        var target = $(this);
        target.siblings().removeClass('current-header');
        target.addClass('current-header');
        var id = target.attr('id').slice(7);
        $('.input-content').addClass('hidden');
        //console.log('id: '+id);
        $('#'+id).removeClass('hidden');
    });


    // listens for key-down events when a game is in progress so that people can move around the maze using arrow keys
    $(window).keydown(function(e) {

        var room = Game.room();

        if (room.playing) {
            var move;
            var data = room;
            data.bs = parseInt(data.bs, 10);
            //console.log('key is down'+typeof(room.x));
            e.preventDefault();
            var moveMap = { 37: function() {
                            return {x:this.x - data.bs,y: this.y};
                        },
                        38: function() {
                            return {x:this.x,y: this.y - data.bs};
                        },
                        39: function() {
                            return {x:this.x + data.bs,y: this.y};
                        },
                        40: function() {
                            return {x:this.x,y: this.y + data.bs};
                        }};
            var player = room.players[room.players.length-1];
            if (Game.moveArc(e.which, player.coords, moveMap[e.which], room, player.ctxc, player.ctx, player)) {
                socket.emit('move', {id:player.id,coords:player.coords,name:room.name});
            }
        }
    });

    /**
     * When they click ENTER on the text input, we send the comment over to the server and have it relay to all
     * players in the room.
     */
    Worksheet.setupCommentSubmitHandler(socket, $("#comment"));

    $("#set-name").click(function(e) {
        e.preventDefault();

        Game.modalChangeName(function(player, room) {
            socket.emit('set-player-name', {
                "player": player,
                "room": room
            });
        });
    });

    // the comments text area is always disabled (not manually editable)
    $("#comments").prop('disabled', true);

    $("#logout").click(function(e) {
        e.preventDefault();

        Game.logout();
    });

});



