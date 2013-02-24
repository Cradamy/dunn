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
 
var Plugin = module.exports = function (irc) {
  irc.addTrigger('example', this.example);
  irc.addTrigger('admin-example', this.example, 1);
};

Plugin.prototype.example = function (irc, channel, nick, params, message) {
  irc.send(channel, nick + ': You can view this example plugin at https://raw.github.com/killswitch/dunn/master/plugins/example.js');
};