define([
    "app/draw-maze"
],
    function(DrawMaze)
    {
        var canvas = DrawMaze.getCanvas();

        var r = {};

        r.init = function()
        {
            // TODO
        };

        var _player = null;
        var player = r.player = function(p)
        {
            if (p) {
                _player = p;
            }

            return _player;
        };

        var _room = null;
        var room = r.room = function(r)
        {
            if (r) {
                _room = r;
            }

            if (!_room)
            {
                _room = {
                    playing:false
                }
            }

            return _room;
        };

        r.updateRoomHTML = function (room) {
            //console.log('updateRoomHTML with: '+room);
            $('#current-room').text('You are in '+room.name);

            // disable the "start" button
            $("#start").prop("disabled", true);

            // if we're admin user, re-enable the button
            var p = player();
            if (room.admin && room.admin.name == p.name)
            {
                $("#start").prop("disabled", false);
            }
        };

        var updateUserNameHTML = r.updateUserNameHTML = function (name) {
            //console.log('updateUserNameHTML with: '+name);
            //$('div#current-user span#name').text(name);
            $('#userid span').html('Welcome ' + name);
        };

        var updatePlayersHTML = r.updatePlayersHTML = function (players) {
            //console.log(typeof(players)+'plyrs');
            var div = $('.players-list');
            $(div).html("");

            var table = $("<table class='table table-striped'></table>");
            table.append("<thead><th>Name</th></thead>");
            for (var i = 0; i < players.length; i++)
            {
                var p = players[i];
                $(table).append('<tr><td>'+p.name+'</td></tr>');
            }

            div.append(table);
        };

        r.toMazeOn = function () {
            $('#new-maze').addClass('hidden');
        };

        r.toLobby = function () {
            $('#start').addClass('hidden');
            $('#new-maze').addClass('hidden');
        };

        r.drawMaze = function (data, callback) {
            var width = data.x * data.bs + 40
                , height = data.y * data.bs + 44;
            $('#myCanvas').attr('width', width + "px")
                .attr('height', height + "px")
                .show();
            data.offset = 20;
            var context = canvas.getContext("2d");
            var ctxGrid = canvas.getContext("2d");
            var ctxWalls = canvas.getContext("2d");
            var ctxText = canvas.getContext("2d");
            var wallOffset = {
                x:data.offset + data.bs / 2,
                y:data.offset + data.y * data.bs - data.bs / 2
            }; //location of marker at start
            //console.log(data.offset);
            DrawMaze.drawBase(context, data);
            DrawMaze.drawGrid(ctxGrid, data);
            DrawMaze.drawWalls(ctxWalls, data, wallOffset);
            DrawMaze.writeStartEnd(ctxText, data);

            callback();
        };

        r.createArc = function (data, ctx) {
            arcOffset = {x:data.offset + data.bs / 2, y:data.offset + data.y * data.bs - data.bs / 2}; //location of marker at start
        };

        r.updateArc = function (player) {

        };

        var hideAllPages = function()
        {
            $(".page").each(function() {
                var id = $(this).attr("data-page");
                $("[data-page='" + id + "']").addClass("hidden");
                $("[data-nav-page='" + id + "']").removeClass("active");

            });
        };
        var showPage = function(id)
        {
            hideAllPages();
            $("[data-page='" + id + "']").removeClass("hidden");
            $("[data-nav-page='" + id + "']").addClass("active");
        };

        var changePage = r.changePage = function(id)
        {
            showPage(id);
        };

        // navbar
        $("[data-nav-page]").click(function(e) {
            e.preventDefault();

            var id = $(this).attr("data-nav-page");
            showPage(id);
        });
        showPage("home");

        var MODAL_TEMPLATE = ' \
            <div class="modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="overflow: visible !important"> \
                <div class="modal-header"> \
                    <h3 class="modal-title"></h3> \
                </div> \
                <div class="modal-body"></div> \
            <div class="modal-footer"></div> \
        ';

        var blockingModal = null;

        var block = r.block = function(message, callback)
        {
            var div = $($.trim(MODAL_TEMPLATE));

            $(div).find(".modal-body").append("<p align='center'>" + message + "</p>");
            $(div).find(".modal-body").append("<br/><br/>");
            $(div).find(".modal-body").append("<p align='center'><img src='/images/ajax-loader.gif'></p>");
            $(div).on("shown", function() {
                $(div).css({
                    "margin-top": ($(div).outerHeight() / 2)
                });

                blockingModal = div;

                if (callback) {
                    callback();
                }
            });
            $(div).modal({
                "keyboard": true
            });

        };

        var unblock = r.unblock = function(callback)
        {
            if (blockingModal)
            {
                var div = blockingModal;

                $(div).on("hidden", function() {
                    if (callback) {
                        callback();
                    }
                });
                $(div).modal("hide");

            }
        };

        var blockConfirm = r.blockConfirm = function(header, body, callback)
        {
            var div = $($.trim(MODAL_TEMPLATE));

            $(div).find(".modal-header").append(header);
            $(div).find(".modal-body").append(body);
            $(div).find('.modal-footer').append("<button class='btn pull-left btn-primary confirm'>Confirm</button>");
            $(div).on("shown", function() {
                $(div).css({
                    "margin-top": ($(div).outerHeight() / 2)
                });

                blockingModal = div;

                $(div).find(".btn.confirm").click(function(e) {
                    callback(true);
                });
            });
            $(div).modal({
                "keyboard": true
            });

        };


        r.initArcs = function(players, room, canvas)
        {
            return DrawMaze.initArcs(players, room, canvas);
        };

        r.coverArcs = function(options)
        {
            return DrawMaze.coverArcs(options);
        };

        r.drawArcs = function(options)
        {
            return DrawMaze.drawArcs(options);
        };

        r.moveArc = function(key, offsObj, func, options, ctx, ctx2, player) {
            return DrawMaze.moveArc(key, offsObj, func, options, ctx, ctx2, player);
        };

        var modalChangeName = r.modalChangeName = function(title, callback)
        {
            if (typeof(title) === "function") {
                callback = title;
                title = "Change your name";
            }

            var theBody = $("<input type='text' placeholder='Enter your new name' id='new-name'>");

            // block with a modal
            blockConfirm(title, theBody, function(confirm) {

                unblock(function() {

                    if (confirm) {

                        var theRoom = room();

                        var name = $("#new-name").val();
                        //console.log('set-name to: '+name);
                        var thePlayer = player();
                        if (thePlayer)
                        {
                            thePlayer.name = name;
                            if (window.sessionStorage) {
                                window.sessionStorage.setItem("username", name);
                            }
                        }

                        if (callback)
                        {
                            callback(thePlayer, theRoom, name);
                        }
                    }

                    $(theBody).remove();

                });
            });
        };

        r.ensureLogin = function(callback)
        {
            // check html5 session storage
            if (window.sessionStorage && window.sessionStorage.getItem("username"))
            {
                callback(window.sessionStorage.getItem("username"));
            }
            else
            {
                // ask for a name (in lieu of a username/password combo)
                modalChangeName("Please sign in with your name", function(player, room, name) {

                    if (window.sessionStorage) {
                        window.sessionStorage.setItem("username", name);
                    }

                    callback(name);
                });
            }
        };

        r.logout = function()
        {
            if (window.sessionStorage)
            {
                window.sessionStorage.removeItem("username");
                window.location.href = "/";
            }
        };

        return r;
    });