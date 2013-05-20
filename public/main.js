require.config({
    paths : {
        "jquery": "vendor/jquery/jquery-1.9.1.min",
        "socket.io": "vendor/socket.io/socket.io",
        "bootstrap": "vendor/bootstrap/js/bootstrap",
        //"worksheet": "tutorial/worksheet1-solution",
        "worksheet": "tutorial/worksheet1",
        "app": "js"
    }
});

require(["app/sockets", "app/interactions", "app/game"], function(sockets, interactions, Game) {

    // ensure we have a user logged in
    Game.ensureLogin(function(name) {
        Game.updateUserNameHTML(name);
        sockets.init(name);
    });

});
