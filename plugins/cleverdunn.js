/*
 * @Plugin        Cleverdunn
 * @Description   Cleverbot for Dunn
 *
 * @Author        buttcactus (Aaron Ahmed)
 * @Library       cleverbot-node
 * @Website       http://www.digitalkitsune.net
 * @Copyright     Digital-Kitsune 2012
 *
 */

 var Cleverbot = require("cleverbot-node");
 var CBot = new Cleverbot();

CBot.params.sessionid = (new Date().getTime());


 Plugin = exports.Plugin = function(irc) {
 	irc.addMessageHandler(irc.nick.toLowerCase() + ", ", this.run);
 	irc.addMessageHandler(irc.nick.toLowerCase() + ": ", this.run);
 }

Plugin.prototype.run = function(irc, channel, nick, match, message, raw) {
	CBot.write(message.split(" ").splice(1).join(" "), function(r) {
		irc.send(channel, nick + ': ' + r.message);
	});
};
