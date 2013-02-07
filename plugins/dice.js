/*
 * @Plugin        Dice
 * @Description   Roll dice e.g. '.roll 1d6+2'
 * @Trigger       .roll
 *
 * @Author        Olli K
 * @Website       github.com/gildean
 * @License       MIT
 * @Copyright     -
 *
 */

var events = require('events');
var util = require('util');

var Dice = function (irc) {
    "use strict";
    var self = this;
    var trigger = 'roll';
    var msLen = trigger.length + irc.command.length + 1;

    function rolling(die) {
        return (Math.floor(Math.random() * die) + 1);
    }

    this.roll = function (dice, roller, game) {
        var error = false,
            i, dices, times, withoutmod, result, mod, die, answer, roll;
        if (dice.indexOf('d') > -1) {
            dices = dice.split('d');
            times = parseInt(dices[0]);
            withoutmod = dices[1].split('+');
            die = parseInt(withoutmod[0]);
            result = 0;
            answer = 'Rolled ' + dice + ' (';
            if (withoutmod.length > 1) {
                mod = parseInt(withoutmod[1]);
                if (!isNaN(mod)) {
                    result += mod;
                }
            }
            if (!isNaN(die) && die > 0 && die < 1001 && times > 0 && times < 21) {
                for (i = 0; i < times; i += 1) {
                    roll = rolling(die);
                    result += roll;
                    answer += roll + ', ';
                }
            } else {
                error = true;
                self.emit('misroll', 'A die must have 2 to 1k sides and you must roll 1 to 20 times', roller, game);
            }
            if (result && !error) {
                answer = answer.substring(0, answer.length - 2) + ') = ' + result;
                self.emit('result', answer, roller, game);
            }
        } else {
            self.emit('misroll', 'No dice', roller, game);
        }
    };

    function sendRoll(msg, nick, channel) {
        irc.send(channel, nick + ': ' + msg);
    }

    function triggerRoll(pla, channel, nick, pr, message) {
        var dice = message.substring(msLen).trim();
        if (dice !== '') {
            var rolling = self.roll(dice, nick, channel);
        } else {
            self.emit('misroll', 'Roll dice with or without modifier e.g. \'' + irc.command + trigger + ' 1d20\' or \'' + irc.command + trigger + ' 1d6+2\'', nick, channel);
        }
    }

    this.on('misroll', sendRoll)
        .on('result', sendRoll);

    irc.addTrigger(trigger, triggerRoll);

};

util.inherits(Dice, events.EventEmitter);

exports.Plugin = Dice;
