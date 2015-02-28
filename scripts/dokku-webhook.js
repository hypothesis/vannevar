// Description:
//   Respond to webhooks sent by the dokku-webhooks plugin.
//
// Configuration:
//   HUBOT_DOKKU_WEBHOOK_TOKEN - A secret token used to configure the webhook URL
//   HUBOT_DOKKU_WEBHOOK_ROOM - The room in which to post messages triggered by webhooks
//

var config = {
    token: process.env.HUBOT_DOKKU_WEBHOOK_TOKEN,
    room: process.env.HUBOT_DOKKU_WEBHOOK_ROOM
};


var ACTIONS = {
    'receive-app': ['app', 'host', 'git_rev', 'git_rev_before'],
    'post-deploy': ['app', 'host', 'url']
};


var validated = function (data, keys) {
    var res = {};
    for (var i = 0, len = keys.length; i < len; i++) {
        var k = keys[i];
        if (typeof data[k] !== 'string' || data[k].length === 0) {
            return false;
        }
        res[k] = data[k];
    }
    return res;
};


module.exports = function (robot) {
    if (config.token == null || config.room == null) {
        if (config.token == null) {
            robot.logger.warning('dokku-webhook requires HUBOT_DOKKU_WEBHOOK_TOKEN to be set');
        }
        if (config.room == null) {
            robot.logger.warning('dokku-webhook requires HUBOT_DOKKU_WEBHOOK_ROOM to be set');
        }
        return;
    }

    robot.router.post('/hubot/dokku-webhook/' + config.token, function (req, res) {
        // Check we have an "action" param
        var action = req.body.action;
        if (!action) {
            robot.logger.warning('dokku-webhook received POST payload without an "action" param');
            res.status(400).end('Bad Request');
            return;
        }

        // Check that we recognize the passed action
        if (!ACTIONS.hasOwnProperty(action)) {
            robot.logger.warning('dokku-webhook received POST payload for unknown action "' + action + '"');
            res.status(400).end('Bad Request');
            return;
        }

        // And finally, check that the data has the keys we expect
        var data = validated(req.body, ACTIONS[action]);
        if (!data) {
            robot.logger.warning('dokku-webhook received malformed POST payload for "' + action + '"');
            res.status(400).end('Bad Request');
            return;
        }

        // If we got here, all is well and we can send 200 OK.
        res.end();

        data.room = config.room;
        robot.emit('dokku-webhook.' + action, data);
    });


    robot.on('dokku-webhook.receive-app', function (data) {
        var msg = "dokku@" + data.host + " deployment started: ";
        msg += data.app + " ";
        if (data.git_rev_before === data.git_rev) {
            msg += "(rebuild)";
        } else {
            msg += "(" + data.git_rev_before.slice(0, 7) + ".." + data.git_rev.slice(0, 7) + ")";
        }

        robot.messageRoom(data.room, msg);
    });

    robot.on('dokku-webhook.post-deploy', function (data) {
        var msg = "dokku@" + data.host + " deployment completed: ";
        msg += data.app + " to " + data.url;

        robot.messageRoom(data.room, msg);
    });
};
