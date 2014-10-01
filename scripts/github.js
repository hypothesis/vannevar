// Description:
//   Fetch titles and links to GitHub issues
//
// Commands:
//   repo#nr - Get title and link to this issue
//   hubot add repo <name> - Add repo to stored repository list
//   hubot remove repo <name> - Remove repo from stored repository list
//   hubot list repos - Show stored repository list
//

var VALID_REPO_NAME = /^[^\s\/]+\/[^\s\/]+$/;


var validRepoName = function (name) {
    return VALID_REPO_NAME.test(name);
};


// splitRepo turns a repository name into an object:
//
//     splitRepo("foo/bar")
//     => {user: "foo", name: "bar"}
//
// If the username is not provided, it will return an object with a null user
// property:
//
//     splitRepo("bar")
//     => {user: null, name: "bar"}
//
// If the provided string isn't a valid repository name, it will return false
//
//     splitRepo("foo/bar/baz")
//     => false
//
var splitRepo = function (name) {
    var result = {},
        split = name.split('/');

    if (split.length === 1) {
        result.user = null;
        result.repo = split[0];
    } else if (split.length === 2) {
        result.user = split[0];
        result.repo = split[1];
    } else {
        // More than one slash? Erm, no thanks.
        return false;
    }

    // Don't allow empty user or repo.
    if (result.user !== null && result.user.length === 0) {
        return;
    }
    if (result.repo.length === 0) {
        return;
    }

    return result;
};


var fuzzyMatch = function (haystack, needle) {
    var ok = (haystack.indexOf(needle.toLowerCase()) !== -1);
    return ok;
};


var searchRepos = function (repos, query) {
    var i,
        compare,
        len = repos.length,
        q = splitRepo(query);

    if (!q) {
        return false;
    }

    if (q.user !== null) {
        // Try for an exact match with both username and repo
        for (i = 0; i < len; i++) {
            compare = splitRepo(repos[i]);
            if (compare.user === q.user && compare.repo == q.repo) {
                return repos[i];
            }
        }

        // Try for an exact match with username, and fuzzy with repo
        for (i = 0; i < len; i++) {
            compare = splitRepo(repos[i]);
            if (compare.user === q.user && fuzzyMatch(compare.repo, q.repo)) {
                return repos[i];
            }
        }

        // Try for a fuzzy match with both username and repo
        for (i = 0; i < len; i++) {
            compare = splitRepo(repos[i]);
            if (fuzzyMatch(compare.user, q.user) && fuzzyMatch(compare.repo, q.repo)) {
                return repos[i];
            }
        }
    }

    // Try for an exact match with repo
    for (i = 0; i < len; i++) {
        compare = splitRepo(repos[i]);
        if (compare.repo == q.repo) {
            return repos[i];
        }
    }

    // Try for an exact match with username, and fuzzy with repo
    for (i = 0; i < len; i++) {
        compare = splitRepo(repos[i]);
        if (fuzzyMatch(compare.repo, q.repo)) {
            return repos[i];
        }
    }

    // Fell through, so no matches
    return false;
};


var getRepos = function (brain) {
    if (typeof brain.data.repos == "undefined" || brain.data.repos === null) {
        brain.data.repos = [];
    }
    return brain.data.repos;
};


module.exports = function (robot) {
    robot.respond(/add repo ([^\s]+)$/i, function (msg) {
        var repo = msg.match[1].toLowerCase();
        if (!robot.auth.hasRole(msg.envelope.user, 'staff')) {
            msg.send("You need the staff role to do that! Ask an admin.");
            return;
        }
        if (!validRepoName(repo)) {
            msg.send("This isn't a valid repo name. It should be a fully " +
                     "qualified name like 'joebloggs/dotfiles'.");
            return;
        }
        var repos = getRepos(robot.brain),
            idx = repos.indexOf(repo);
        if (idx !== -1) {
            msg.send("Repo '" + repo + "' is already in my list.");
            return;
        }
        repos.push(repo);
        msg.send("OK, repo '" + repo + "' added to my list.");
    });

    robot.respond(/remove repo ([^\s]+)$/i, function (msg) {
        var repo = msg.match[1];
        if (!robot.auth.hasRole(msg.envelope.user, 'staff')) {
            msg.send("You need the staff role to do that! Ask an admin.");
            return;
        }
        var repos = getRepos(robot.brain),
            idx = repos.indexOf(repo);
        if (idx === -1) {
            msg.send("Sorry, repo '" + repo + "' is not in my list.");
            return;
        }
        repos.splice(idx, 1);
        msg.send("OK, repo '" + repo + "' removed from my list.");
    });

    robot.respond(/list repos/i, function (msg) {
        var repos = getRepos(robot.brain);
        if (repos.length === 0) {
            msg.send("I don't know about any repos yet.");
            return;
        }
        msg.send( "I know about these repos: " + repos.join(", ") + ".");
    });

    robot.hear(/\b([^\s#]+)#(\d+)\b/i, function (msg) {
        var repo = msg.match[1],
            number = msg.match[2],
            repos = getRepos(robot.brain);

        var result = searchRepos(repos, repo);
        if (!result) {
            return;
        }

        robot
            .http("https://api.github.com/repos/" + result + "/issues/" + number)
            .get()(function (err, resp, body) {
                if (err || resp.statusCode != 200 || typeof body == "undefined") {
                    // Just swallow socket errors, 404s, etc. We don't need that
                    // noise in the channel.
                    return;
                }
                try {
                    obj = JSON.parse(body);
                    if (obj.title && obj.html_url) {
                        msg.send(obj.title + ": " + obj.html_url);
                    }
                } catch (e) {
                    msg.send(
                        "Error encountered while parsing GitHub response for " +
                        result + "#" + number + ": " + e
                    );
                }
            });
    });

};
