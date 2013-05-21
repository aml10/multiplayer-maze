# Multiplayer Maze

This project provides a multiplayer maze game which is suitable for teaching Node.js, Express and particularly, socket.io, within a group setting.  These project files are provided so that others might utilize them for educational purposes.

This project is derived from Steven Ciraolo's multiplayer maze game (https://github.com/cirsteve/MultiMaze) and much credit goes to him.  It builds on top of his work by providing a few enhancements including a multiplayer chat, a Twitter Bootstrap UI, support for RequireJS and modularization of the code base.

Check out more good stuff from Steven at http://monkeyslikefunk.com.

This project is provided on behalf of the Cleveland JavaScript and Node.js meetup groups:

 - http://www.meetup.com/Cleveland-JavaScript-Meetup/
 - http://www.meetup.com/NodejsCleveland/

## Installation

1.  Get a copy of the Multiplayer-Maze source code onto your computer.  There are two ways to do this.  The first is use Git to clone the
source from GitHub.  Or, if you don't have Git set up, you can navigate to https://github.com/uzquiano/multiplayer-maze and click the ZIP
button to download a ZIP file to your computer.  Make sure to expand the ZIP file to someplace where you're going to work.

2.  Make sure you have the latest version of Node installed.  You can download Node from http://www.nodejs.org.  Simply grab the latest
distribution and install it onto your computer.

3.  Open a Terminal (or Command Prompt in Windows).  Go to the directory where your source files are and run: 'npm install'

4.  Wait for a little bit while Node downloads all of the dependencies for the project.

5.  Run 'node app' to launch the application.  It will start up and you can access it at http://localhost:8888/

## Tutorial

The tutorial consists of 8 problems that span using Socket.IO both within the browser and in the Node.js server.  The full Multiplayer
Maze application makes pretty good use of Socket.IO but a few interesting places have been identified and their code has been separated
out into Worksheet files and solutions that students can play with.

The worksheet files are located at:

    - '/public/tutorial/worksheet1.js'
    - '/public/tutorial/worksheet2.js'

And the solutions are right alongside them at:

    - '/public/tutorial/worksheet1-solution.js'
    - '/public/tutorial/worksheet2-solution.js'

The 'worksheet1.js' file contains Socket.IO and DOM manipulation code that runs in the browser whereas
'worksheet2.js' contains Socket.IO code that runs within the Node.js server.  These files are picked up automatically
when the server starts.

The 'worksheet1.js' and 'worksheet2.js' files are incomplete in the sense that it is left as an exercise for the
student to fill in the missing Socket.IO logic for things to work properly.  Each file contains comments that
describe what is expected for each step.  Students should begin with Worksheet #1.

Students are free to look at the solutions should they get stuck but are encouraged to write their own logic and come
up with their own solutions.  As always, there is no correct solution -- the provided solutions are intended to
provide a guide and they can often be improved upon.

If you would like to run the application with the provided solutions, you can switch worksheets in main.js (for the
browser) and app.js (for the node.js server).  Switching to the *-solution.js worksheets will bring everything into
full working order.



## Instructions

To access the application, go to: http://localhost:8888

You will be asked for a user name right away.  This app doesn't tackle authentication or anything related to user security.  You can provide any user name you like.  Once you do so, you'll be take to the home page.  Click on 'Create a Maze' in the navigation bar to create your first maze.

Give your maze a unique name and then click "Start my Maze!".  Your maze will be created and you'll be taken into a maze waiting room.  In this room, you can wait for other players to arrive.  For example, you might wait until 8 players arrive before you elect to Start your Game.  While you're waiting, you can chat with other players in the waiting area.

Once you have your players, click on "Start your Game".  You'll now be taken to a view of your maze.  Each of the players will have a colored dot associated with them.  Use the arrow keys to move your dot through the maze.


## Resources

- Powerpoint Slides from Cleveland JS Meetup:
    - http://files.meetup.com/2113471/Cleveland%20JS%20Meetup%20-%20May%202013.pdf
