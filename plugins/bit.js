/*
 * @Plugin        bit
 * @Description   BIT! Tron. BIT!
 *
 * @Author        buttcactus
 * @Website       http://www.digitalkitsune.net
 * @Copyright     DIGITAL KITSUNE 2012
 *
 */
 
Plugin = exports.Plugin = function (irc) {
	this.irc = irc;
};

Plugin.prototype.onMessage = function (msg) {
  var irc = this.irc,
  		channel = msg.arguments[0],
      message = msg.arguments[1],
      botNick = this.irc.nick.toLowerCase(),
      replies = [
      	"YES",
      	"NO", 
      	"YES",
      	"NO", 
      	"YES",
      	"NO", 
      	"YES YES YES YES YES YES",
      	"NO NO NO NO NO"
      ];
  if(message.substr(0, botNick.length).toLowerCase() == botNick) {
  	if(message.substr(message.length-1) == "?" || message.substr(message.length-1)) {
  		irc.send(channel, replies[Math.floor(Math.random()*replies.length)]);
  	}
  }
}