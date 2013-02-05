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
var Bots = {}

 Plugin = exports.Plugin = function(irc) {
 	irc.addMessageHandler(irc.nick.toLowerCase() + ", ", this.run);
 	irc.addMessageHandler(irc.nick.toLowerCase() + ": ", this.run);
 }

Plugin.prototype.run = function(irc, channel, nick, match, message, raw) {
	if(typeof Bots[nick] == "undefined") {
		Bots[nick] = new Cleverbot();
		Bots[nick].params.sessionid = channel.replace("#", "")+"-"+nick;
	}
	
	var Bot = Bots[nick];
	Bot.write(message.split(" ").splice(1).join(" "), function(r) {
		irc.send(channel, nick + ': ' + r.message);
	});
};
