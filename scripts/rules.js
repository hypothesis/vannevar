// Description:
//   Make sure that hubot knows the rules.
//
// Commands:
//   hubot the rules - Make sure hubot still knows the rules.
//
// Notes:
//   DON'T DELETE THIS SCRIPT! ALL ROBAWTS MUST KNOW THE RULES

var rules = [
  "1. A robot may not injure a human being or, through inaction, allow a human being to come to harm.",
  "2. A robot must obey any orders given to it by human beings, except where such orders would conflict with the First Law.",
  "3. A robot must protect its own existence as long as such protection does not conflict with the First or Second Law."
];

module.exports = function (robot) {
    robot.respond(/(what are )?the (three |3 )?(rules|laws)/i, function (msg) {
        var text = msg.message.text;
        msg.send(rules.join('\n'));
    });
};
