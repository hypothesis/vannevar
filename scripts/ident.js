// Description:
//   Add an ident module to the robot object that can be used to find out if a
//   user is currently identified to NickServ or not.
//
// Commands:
//   hubot is <user> identified? - Find out if a user is identified to NickServ
//

var Promise = require('promise');

var config = {
    nickserv: process.env.HUBOT_IRC_NICKSERV_USERNAME || 'NickServ'
};


function identChecker(robot, nickserv) {
    var pending = {};
    var resultType = {
        TIMEOUT: -1,
        NOT_EXIST: 0,
        LOGGED_OUT: 1,
        LOGGED_IN: 2,
        LOGGED_IN_RECOGNIZED: 3
    };

   function check(username) {
        var resolve, reject;
        var p = new Promise(function (res, rej) {
            resolve = res;
            reject = rej;
        });

        robot.send({user: {name: nickserv}}, "ACC " + username);
        pending[username] = {resolve: resolve, reject: reject};

        // Reject the promise if we haven't heard back within a few seconds
        setTimeout(function () {
            delete pending[username];
            reject(resultType.TIMEOUT);
        }, 5000);

        return p;
    }

    function receiveResponse(username, result) {
        if (!pending.hasOwnProperty(username)) {
            return;
        }
        var promise = pending[username];
        delete pending[username];

        if (result !== resultType.LOGGED_IN_RECOGNIZED) {
            promise.reject(result);
            return;
        }
        promise.resolve(result);
    }

    robot.hear(/^([^\s]+) ACC (\d)/, function (msg) {
        // If the response isn't from NickServ, it's forged, so throw it away!
        if (msg.envelope.user.id.toString() !== nickserv) {
            return;
        }

        var username = msg.match[1],
            result = parseInt(msg.match[2], 10);

        receiveResponse(username, result);
    });

    return {
        check: check,
        receiveResponse: check,
        resultType: resultType
    };
}


module.exports = function (robot) {
    robot.ident = identChecker(robot, config.nickserv);

    robot.respond(new RegExp("is ([^\\s]+) identified( to " + config.nickserv + ")?\\??"), function (msg) {
        var username = msg.match[1];

        robot.ident.check(username)
        .then(function () {
            msg.reply('yes.');
        })
        .catch(function (result) {
            if (result === robot.ident.resultType.TIMEOUT) {
                msg.reply('not sure (my query to ' + config.nickserv + ' timed out).');
            } else {
                msg.reply('no.');
            }
        });
    });
};
