/*
 * @Plugin        bit
 * @Description   BIT! Tron. BIT!
 *
 * @Author        buttcactus
 * @Website       http://www.digitalkitsune.net
 * @Copyright     DIGITAL KITSUNE 2012
 *
 */
 
var Plugin = module.exports = function (irc) {
  this.irc = irc;
};

Plugin.prototype.onMessage = function (msg) {
  var irc = this.irc,
      channel = msg.arguments[0],
      message = msg.arguments[1],
      botNick = this.irc.nick.toLowerCase(),
      nickExp = new RegExp("^" + botNick + "\\b", "i"),
      replies = [
        "YES",
        "NO",
        "YES",
        "NO",
        "YES",
        "NO", 
        "YES YES YES YES YES YES",
        "NO NO NO NO NO NO"
      ];
  if (nickExp.test(message)) { //did they mention Dunn?
    irc.send(channel, replies[Math.floor(Math.random()*replies.length)]);
  }
};
