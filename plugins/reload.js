/**
 * Reload Plugin
 */
var sys = require('util');

Plugin = exports.Plugin = function(irc) {
  this.trigger = 'reload';
  this.title = 'Plugin Reloader';
  this.version = '0.1';
  this.author = 'Michael Owens';
  this.protected = true;

  irc.addTrigger(this, 'load', this.loadPlugin);
  irc.addTrigger(this, 'reload', this.reloadPlugin);
  irc.addTrigger(this, 'unload', this.unloadPlugin);
};

Plugin.prototype.loadPlugin = function(irc, chan, nick, msg, params) {
  var plugin = params[0];
  irc.send(chan && chan.name || nick, 'Loading plugin: ' + plugin);
  irc.loadPlugin(plugin);
};

Plugin.prototype.reloadPlugin = function(irc, chan, nick, msg, params) {
  var plugin = params[0];
  irc.send(chan && chan.name || nick, 'Reloading plugin: ' + plugin);
  irc.loadPlugin(plugin);
};

Plugin.prototype.unloadPlugin = function(irc, chan, nick, msg, params) {
  var plugin = params[0];
  irc.send(chan && chan.name || nick, 'Unloading plugin: ' + plugin);
  irc.unloadPlugin(plugin);
};
