/*
 * @Plugin 			Karma
 * @Description 	Issues karma points to users.
 * @Trigger 		<nick>++
 *
 * @Author 			Killswitch (Josh Manders)
 * @Website 		http://www.joshmanders.com
 * @Copyright 		Josh Manders 2013
 *
 */

Plugin = exports.Plugin = function (irc) {
	this.irc = irc;
	irc.addMessageTrigger('^(\w+)\+\+;?$', this.give);
};

Plugin.prototype.give = function (irc, channel, nick, params, message, raw) {
		irc.send(channel, nick + ': Karma has been given.');
	});
};