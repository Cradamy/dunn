/*
 * @Plugin        Dunn
 * @Description   Random triggers based on things having to do with Dunn himself.
 * @Trigger       .(about|code)
 *
 * @Author        Killswitch (Josh Manders)
 * @Website       http://www.joshmanders.com
 * @Copyright     Josh Manders 2012
 *
 */
Plugin = exports.Plugin = function (irc) {
  this.trigger = 'dunn';
  this.usage = 'Random triggers based on things having to do with Dunn himself.';
  this.version = '0.1';
  this.author = 'Killswitch';
  this.protected = false;
  this.irc = irc;
  this.irc.addTrigger(this, 'about', this.about);
  this.irc.addTrigger(this, 'code', this.code);
};

Plugin.prototype.about = function (msg) {
  var irc = this.irc,
      channel = msg.arguments[0],
      chanObj = irc.channels[channel],
      user = irc.user(msg.prefix),
      message = msg.arguments[1],
      params = message.split(' ');

  params.shift();
  irc.send(chanObj && chanObj.name || user, user + ': My name is Dunn, I am written in Node.js and utilize MongoDB as my data storage. I was written by ' + this.author + '.');
};

Plugin.prototype.code = function (msg) {
  var irc = this.irc,
      channel = msg.arguments[0],
      chanObj = irc.channels[channel],
      user = irc.user(msg.prefix),
      message = msg.arguments[1],
      params = message.split(' ');

  params.shift();
  irc.send(chanObj && chanObj.name || user, user + ': You can view, and fork my code to contribute on GitHub @ http://www.github.com/killswitch/dunn.');
};