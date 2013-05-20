This project provides a multiplayer maze game which is suitable for teaching Node.js, Express and particularly, socket.io, within a group setting.  These project files are provided so that others might utilize them for educational purposes.

This project is derived from Steven Ciraolo's multiplayer maze game (https://github.com/cirsteve/MultiMaze) and much credit goes to him.  It builds on top of his work by providing a few enhancements including a multiplayer chat, a Twitter Bootstrap UI, support for RequireJS and modularization of the code base.

Check out more good stuff from Steven at http://monkeyslikefunk.com.

## Installation

First, make sure you have the latest version of Node installed.  Clone the source from github and then run 'npm install' within the project directory.  This will pull down all of the project node requirements.

Then, run 'node app' to run the server.

## Instructions

To access the application, go to: http://localhost:8888

You will be asked for a user name right away.  This app doesn't tackle authentication or anything related to user security.  You can provide any user name you like.  Once you do so, you'll be take to the home page.  Click on 'Create a Maze' in the navigation bar to create your first maze.

Give your maze a unique name and then click "Start my Maze!".  Your maze will be created and you'll be taken into a maze waiting room.  In this room, you can wait for other players to arrive.  For example, you might wait until 8 players arrive before you elect to Start your Game.  While you're waiting, you can chat with other players in the waiting area.

Once you have your players, click on "Start your Game".  You'll now be taken to a view of your maze.  Each of the players will have a colored dot associated with them.  Use the arrow keys to move your dot through the maze.
