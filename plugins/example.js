/*
 * @Plugin        Example
 * @Description   Just an example plugin to show how to extend Dunn
 *
 * @Author        Killswitch (Josh Manders)
 * @Website       http://www.joshmanders.com
 * @Copyright     Josh Manders 2012
 *
 */
 
Plugin = exports.Plugin = function (irc) {
  irc.addTrigger('example', this.example);
};

Plugin.prototype.example = function (irc, channel, nick, params, message) {
  irc.send(channel, user + ': You can view this example plugin at https://raw.github.com/killswitch/dunn/master/plugins/example.js');
};