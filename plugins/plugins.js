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
  this.irc = irc;
  this.irc.addTrigger(this, 'plugins', this.loadedPlugins);
  // this.irc.addTrigger(this, 'help', this.helpPlugins);
};

Plugin.prototype.loadedPlugins = function (msg) {
  var irc = this.irc,
      channel = msg.arguments[0],
      chanObj = irc.channels[channel],
      user = irc.user(msg.prefix),
      message = msg.arguments[1],
      params = message.split(' '),
      triggers = '';

  params.shift();
  for (var trig in irc.triggers) {
    if (triggers !== '') {
      triggers = triggers + ', ' + trig;
    }
    else {
      triggers = trig;
    }
  }
  irc.send(chanObj && chanObj.name || user, user + ': Loaded plugins are ' + triggers + '.');
  // irc.send(chanObj && chanObj.name || user, user + ': You can get information about the plugin by typing "' + irc.command + 'help <trigger>".');
};

Plugin.prototype.helpPlugins = function (msg) {
  var irc = this.irc,
      channel = msg.arguments[0],
      chanObj = irc.channels[channel],
      user = irc.user(msg.prefix),
      message = msg.arguments[1],
      params = message.split(' '),
      triggers = '';

  params.shift();
  irc.send(chanObj && chanObj.name || user, user + ': You can get help by typing "' + irc.command + 'help <trigger>".');
};