// Description:
//   Check auth status.
//
// Commands:
//   hubot whoami - tells the user who hubot thinks they are
//
// Author:
//   Nick Stenning

module.exports = function (robot) {
    robot.respond(/whoami$/i, function (msg) {
        const user = msg.message.user;

        msg.reply(`id=${user.id} name=${user.name}`);
    });
};
