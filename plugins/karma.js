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
};

Plugin.prototype.onMessage = function(message) {
	console.log(message);
};

Plugin.prototype.give = function (channel, nick, user) {
		irc.send(channel, nick + ': Karma has been given.');
};