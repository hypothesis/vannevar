// Description:
//   Deliver any messages stored for a user.
//
// Configuration:
//   HUBOT_TELL_RELATIVE_TIME [boolean] - Set to use relative time strings ("2 hours ago")
//
// Commands:
//   hubot any messages? - delivers any pending messages
//
// Notes:
//   This module is an extension to the functionality of the 'hubot-tell'
//   module, which is assumed to already be in use.
//
// Author:
//   Nick Stenning


var config = {
    relativeTime: process.env.HUBOT_TELL_ALIASES != null
};


var retrieveMessages = function (robot, room, username) {
    var localstorage = JSON.parse(robot.brain.get('hubot-tell')) || {};
    var results = [];

    if (localstorage[room] != null) {
        for (var recipient in localstorage[room]) {
            var messages = localstorage[room][recipient];
            // Check if the recipient matches username
            if (username.match(new RegExp('^' + recipient, 'i'))) {
                results = results.concat(localstorage[room][recipient]);
                delete localstorage[room][recipient];
                robot.brain.set('hubot-tell', JSON.stringify(localstorage));
                robot.brain.save();
            }
        }
    }

    return results;
};


module.exports = function (robot) {
    robot.respond(/(any )?messages( for me)?\??$/i, function (msg) {
        var timeago;
        if (config.relativeTime) {
            timeago = require('timeago');
        }
        var room = msg.message.user.room;
        var username = msg.message.user.name;
        var messages = retrieveMessages(robot, room, username);
        var tellmessage = "" + username + ": ";

        if (messages.length === 0) {
            tellmessage += "nope.";
            msg.send(tellmessage);
            return;
        }

        for (var i = 0, len = messages.length; i < len; i++) {
            var message = messages[i];
            var timestr;
            if (config.relativeTime && timeago != null) {
                timestr = timeago(message[1]);
            } else {
                timestr = "at " + message[1].toLocaleString();
            }
            tellmessage += "" + message[0] + " said " + timestr + ": ";
            tellmessage += "" + message[2] + "\r\n";
        }
        msg.send(tellmessage);
    });
};
