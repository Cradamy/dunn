/*
 * @Plugin        Mentinos
 * @Description   WHO MENTIONED YOU WHEN YOU WERE OFFLINE, HUH?
 * @Trigger       .mentions
 * @Trigger       .femento
 *
 * @Author        Shirokuma
 * @Website       http://www.polarbearcollective.com
 * @Copyright     DIGITAL KITSUNE 2012-2013
 *
 * @Tested        0
 */

var Plugin = module.exports = function (irc) {
	this.db = irc.v2.database("mentions");
	if(this.db === null) return irc.sendHeap("OH MY GOD PLEASE INSTALL MONGOJS FOR THE SAKE OF THE MIQQIAYUUQ");
	irc.addTrigger("mentions", this.mentions);
	irc.addTrigger("femento", this.flush, 1);
	this.irc = irc;
};

Plugin.prototype.flush = function(irc, channel) {
	this.db.mentions.remove({});
	irc.send(channel, "Flushed backlog");
};

Plugin.prototype.mentions = function(irc, channel, nick) {
	var me = this, db = me.db.mentions;

	db.find({message: new RegExp(nick, "i"), channel: channel}, function(e, r) {
		if(e) irc.sendHeap(e, channel);
		else {
			if(!r.length) irc.send(channel, nick + " you had no mentions.");
			else {
				irc.send(channel, nick + " you have "+r.length+" mentions, PMing you them now.");
				while(r.length) {
					var m = r.shift();
					irc.send(nick, "<"+m.from+" @ "+m.channel+"> "+m.message);
				}
			}

			db.remove({message: new RegExp(nick, "i"), channel: channel});
		}
	});
};

Plugin.prototype.onJoin = function(msg) {
	var channel = this.irc.channels[msg.arguments[0]].name.toLowerCase(), nick = (this.irc.user(msg.prefix) || '').toLowerCase();
	var me = this, db = me.db.mentions;

	db.find({message: new RegExp(nick, "i"), channel: channel}, function(e, r) {
		if(e);
		else {
			if(r.length) irc.send(channel, nick + " you have "+r.length+" mentions, say "+me.irc.command+" mentions to know which ones.");
		}
	});
};

Plugin.prototype.onMessage = function(msg) {
	this.db.mentions.save({message: msg.arguments[1], channel: this.irc.channels[msg.arguments[0]].name.toLowerCase(), from: (this.irc.user(msg.prefix) || '').toLowerCase()});
};
