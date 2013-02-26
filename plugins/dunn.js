/*
 * @Plugin        Dunn
 * @Description   Random triggers based on things having to do with Dunn himself.
 * @Trigger       .about
 * @Trigger       .code
 *
 * @Author        Killswitch (Josh Manders)
 * @Website       http://www.joshmanders.com
 * @Copyright     Josh Manders 2012
 *
 */
var Plugin = module.exports = function (irc) {
  this.ircObj = irc;
  botNick = this.ircObj.nick;
  irc.addTrigger('about', this.about);
  irc.addTrigger('code', this.code);
};

Plugin.prototype.onNumeric = function(irc) {
  if (irc.command !== '376') {
      return;
  }
  for (var i = 0; i < this.ircObj.userChannels.length; i++) {
    var channelName = this.ircObj.userChannels[i], password;
    if (typeof(channelName) == "object") {
      password = channelName.password;
      channelName = channelName.name;
    }
    var chan = new this.ircObj.channelObj(this.ircObj, channelName, true, password);
    this.ircObj.channels[chan.name] = chan;
  }
};

Plugin.prototype.onMessage = function (message) {
  if (message.arguments[1].match(/dunn dunn/i)) {
      this.ircObj.send(message.arguments[0], 'dunnnnnnnnnn');
  }
};

Plugin.prototype.about = function (irc, channel, nick, params, message, raw) {
  irc.send(channel, nick + ': My name is ' + botNick + ', I am written in Node.js and utilize MongoDB as my data storage. I was written by the people at #webtech.');
};

Plugin.prototype.code = function (irc, channel, nick, params, message, raw) {
  irc.send(channel, nick + ': You can view, and fork me in my code hole to contribute on GitHub @ http://www.github.com/webtechirc/dunn.');
};
