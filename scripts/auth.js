// Description:
//   Provide easy access to Slack user info.
//
// Author:
//   Nick Stenning

'use strict';

class Auth {
    isAdmin(user) {
        return user.is_admin
    }

    isStaff(user) {
        return !(user.is_restricted || user.is_ultra_restricted)
    }
}

module.exports = function (robot) {
    robot.auth = new Auth();
};
