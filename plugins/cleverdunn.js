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

	irc.addTrigger("cdlog", this.getLog);
	irc.addTrigger("cddebug", this.debug);
}

Plugin.prototype.getLog = function(irc, channel, nick, match, message, raw) {
	if(typeof Bots[nick] != "undefined") {
		irc.send(channel, "Cleverbot log url: http://cleverbot.com/" + Bots[nick].params.logurl);
	} else {
		irc.send(channel, "Sorry, "+nick+" you don't have a cleverbot session yet.");
	}
}

Plugin.prototype.debug = function(irc, channel, nick, match, message, raw) {
	if(typeof Bots[nick] != "undefined") {
		irc.send(nick, JSON.stringify(Bots[nick].params));
	} else {
		irc.send(channel, "Sorry, "+nick+" you don't have a cleverbot session yet.");
	}
}

Plugin.prototype.run = function(irc, channel, nick, match, message, raw) {
	if(typeof Bots[nick] == "undefined") {
		Bots[nick] = new Cleverbot();
		Bots[nick].params.sessionid = channel.replace("#", "")+nick;
	}
	
	var Bot = Bots[nick];
	Bot.params.sessionid = channel.replace("#", "")+nick;
	Bot.write(message.split(" ").splice(1).join(" "), function(r) {
		if(r.message.indexOf("<!--") > -1) irc.send(channel, "Cleverbot.com is under maintenance, probably because of us.");
		else irc.send(channel, nick + ': ' + r.message);
	});
};
