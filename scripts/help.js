// Description:
//   Generates help commands for Hubot.
//
// Commands:
//   hubot help - Displays all of the help commands that Hubot knows about.
//   hubot help <query> - Displays all help commands that match <query>.
//
// Notes:
//   These commands are grabbed from comment blocks at the top of each file.
//
module.exports = function (robot) {
    robot.respond(/help\s*(.*)?$/i, function (msg) {
        var cmds = robot.helpCommands();
        var filter = msg.match[1];

        if (filter) {
            cmds = cmds.filter(function (cmd) {
                return cmd.match(new RegExp(filter, 'i'));
            });
            if (cmds.length === 0) {
                msg.send("No available commands match " + filter);
                return;
            }
        }

        prefix = robot.alias || robot.name;
        cmds = cmds.map(function (cmd) {
            cmd = cmd.replace(/hubot/ig, robot.name);
            return cmd.replace(new RegExp("^" + robot.name), prefix);
        });

        emit = cmds.join("\n");

        msg.send(emit);
    });
};
