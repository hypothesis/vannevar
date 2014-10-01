# Vannevar

Vannevar is one of the [Hypothes.is project][hyp]'s IRC bots.

Vannevar is a [hubot][hubot] and is designed to be deployed on
[Heroku][heroku].

[heroku]: https://www.heroku.com/
[hubot]: https://hubot.github.com/
[hyp]: https://hypothes.is/

## Testing Vannevar locally

You can test Vannevar by running the following. You need a local redis instance
running first (Vannevar uses redis for basic persistence).

    % bin/hubot -n vannevar

You'll see some start up output about where your scripts come from and a
prompt.

    [Sun, 04 Dec 2011 18:41:11 GMT] INFO Loading adapter shell
    [Sun, 04 Dec 2011 18:41:11 GMT] INFO Loading scripts from /home/tomb/Development/hubot/scripts
    [Sun, 04 Dec 2011 18:41:11 GMT] INFO Loading scripts from /home/tomb/Development/hubot/src/scripts
    vannevar>

Then you can interact with Vannevar by typing `vannevar help`.

    vannevar> vannevar help
    ...


## Scripting

You can add functionality to Vannevar by writing scripts. Read up on what you
can do with hubot in the [Scripting Guide][scripting].

[scripting]: https://github.com/github/hubot/blob/master/docs/scripting.md

You can also add scripts from [hubot-scripts][scripts] to `hubot-scripts.json`,
or scripts from any published NPM package (see the [hubot-scripts GitHub
org][hs-org] for a start) using `external-scripts.json` (you'll need to `npm
install --save` these first).

[scripts]: https://github.com/github/hubot-scripts
[hs-org]: https://github.com/hubot-scripts
