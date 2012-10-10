/*
 * @Plugin        Triggers
 * @Description   Displays all loaded triggers
 * @Triggers      .plugins
 *
 * @Author        Killswitch (Josh Manders)
 * @Website       http://www.joshmanders.com
 * @Copyright     Josh Manders 2012
 *
 */
 
Plugin = exports.Plugin = function (irc) {
  irc.addTrigger('plugins', this.triggers);
};

Plugin.prototype.triggers = function (irc, channel, nick, params, message, raw) {
  var plugins = [];
  for (var trig in irc.triggers) {
    plugins.push(trig);
  }
  irc.send(channel, nick + ': Loaded triggers are: ' + plugins.join(', ') + '.');
};