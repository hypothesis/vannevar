// Description:
//   A simple interaction with the built in HTTP Daemon
//
// Dependencies:
//   None
//
// Configuration:
//   None
//
// Commands:
//   None
//
// URLS:
//   /hubot/version
//   /hubot/ping
//   /hubot/time
//   /hubot/info

var spawn = require('child_process').spawn;

module.exports = function (robot) {

    robot.router.get("/hubot/version", function (req, res) {
        res.end(robot.version);
    });

    robot.router.post("/hubot/ping", function (req, res) {
        res.end("PONG");
    });

    robot.router.get("/hubot/time", function (req, res) {
        res.end("Server time is: " + new Date());
    });

    robot.router.get("/hubot/info", function (req, res) {
        var child = spawn(
            '/bin/sh',
            ['-c', "echo I\\'m $LOGNAME@$(hostname):$(pwd) \\($(git rev-parse HEAD)\\)"]
        );

        child.stdout.on('data', function (data) {
            res.end(
                data.toString().trim() +
                " running node " +
                process.version +
                " [pid: " +
                process.pid +
                "]"
            );
        });
        child.stdin.end();
    });

};
