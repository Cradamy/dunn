/*
 * @Plugin        Example
 * @Description   Just an example plugin to show how to extend Dunn
 * @Trigger       .example
 *
 * @Author        Killswitch (Josh Manders)
 * @Website       http://www.joshmanders.com
 * @Copyright     Josh Manders 2012
 *
 */
 
Plugin = exports.Plugin = function (irc) {
  this.trigger = 'example';
  this.usage = 'Just an example plugin to show how to extend Dunn';
  this.version = '0.1';
  this.author = 'Killswitch';
  this.protected = false;
  this.irc = irc;
  this.irc.addTrigger(this, 'example', this.example);
};

Plugin.prototype.example = function (msg) {
  var irc = this.irc,
      channel = msg.arguments[0],
      chanObj = irc.channels[channel],
      user = irc.user(msg.prefix),
      message = msg.arguments[1],
      params = message.split(' ');

  params.shift();
  irc.send(chanObj && chanObj.name || user, user + ': You can view this example plugin at https://raw.github.com/killswitch/dunn/master/plugins/example.js');
};