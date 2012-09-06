/*
 * @Plugin        Plugins
 * @Description   Displays all loaded plugins
 * @Trigger       .plugins
 *
 * @Author        Killswitch (Josh Manders)
 * @Website       http://www.joshmanders.com
 * @Copyright     Josh Manders 2012
 *
 */
 
Plugin = exports.Plugin = function (irc) {
  this.trigger = 'plugins';
  this.usage = 'Display all loaded plugins.';
  this.version = '0.1';
  this.author = 'Killswitch';
  this.protected = false;

  irc.addTrigger(this, 'plugins', this.loadedPlugins);
  // this.irc.addTrigger(this, 'help', this.helpPlugins);
};

Plugin.prototype.loadedPlugins = function (irc, chan, nick, msg, params) {

  var plugins = [];
  for (var trig in irc.triggers) {
    plugins.push(trig);
  }

  irc.send(chan && chan.name || nick, nick + ': Loaded plugins are: ' + plugins.join(', ') + '.');
};

Plugin.prototype.helpPlugins = function (irc, chan, nick, msg, params) {
  irc.send(chan && chan.name || nick, nick + ': You can get help by typing "' + irc.command + 'help <trigger>".');
};
