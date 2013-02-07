/*
 * @Plugin        syndicate
 * @Description   adds this dunnbot to a dunnsync server.
 *
 * @Author        shirokuma
 * @Website       http://www.polarbearcollective.com
 * @Copyright     DIGITAL KITSUNE
 *
 */
 
Plugin = exports.Plugin = function (irc) {
	this.ident = irc.v2.hash(irc.config.identPass + irc.config.command + irc.config.nick + irc.config.channels.join(""), irc.config.identPass.substr(0, 31));
	this.data = new Buffer(JSON.stringify([irc.config.nick, irc.config.host+":"+irc.config.port, irc.config.channels, irc.config.plugins]), "binary").toString("base64");
	this.host = require("url").parse(irc.config.syndicate || "dunn.polarbearcollective.com");
	this.host = this.host.hostname || this.host.pathname;
	this.ping();
};

var http = require("http");
Plugin.prototype.ping = function() {
	http.request({hostname: this.host, path: "/pong?ident="+this.ident+"&data="+encodeURIComponent(this.data), port: 80}, function(res){}).end();
	with(this) setTimeout(function() { ping() }, 180000);
}
