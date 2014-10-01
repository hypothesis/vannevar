// Description:
//   Pick a victim
//
// Configuration:
//   HUBOT_VICTIM_ROLE - Who is eligible for selection?
//
// Commands:
//   hubot pick a victim - Randomly pick somebody for victimisation
//

var config = {
    victimRole: process.env.HUBOT_VICTIM_ROLE || 'staff'
};


module.exports = function (robot) {
    robot.respond(/pick a victim$/i, function (msg) {
        var users = robot.auth.usersWithRole(config.victimRole);
        msg.send("I pick " + msg.random(users));
    });
};
