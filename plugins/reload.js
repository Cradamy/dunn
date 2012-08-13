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

	this.irc = irc;

	this.irc.addTrigger(this, 'load', this.loadPlugin);
	this.irc.addTrigger(this, 'reload', this.reloadPlugin);
  this.irc.addTrigger(this, 'unload', this.unloadPlugin);
};

Plugin.prototype.loadPlugin = function(msg) {
	var irc = this.irc, // irc object
      c = msg.arguments[0], // channel
      chan = irc.channels[c], // channel object
		  u = irc.user(msg.prefix), // user
		  m = msg.arguments[1], // message
      params = m.split(' ');
	params.shift();
	irc.send(chan && chan.name || u, 'Loading plugin: ' + params[0]);
	irc.loadPlugin(params[0]);
};

Plugin.prototype.reloadPlugin = function(msg) {
	var irc = this.irc, // irc object
      c = msg.arguments[0], // channel
      chan = irc.channels[c], // channel object
		  u = irc.user(msg.prefix), // user
		  m = msg.arguments[1], // message
      params = m.split(' ');
	params.shift();
	irc.send(chan && chan.name || u, 'Reloading plugin: ' + params[0]);
	irc.loadPlugin(params[0]);
};

Plugin.prototype.unloadPlugin = function(msg) {
	var irc = this.irc, // irc object
	    c = msg.arguments[0], // channel
      chan = irc.channels[c], // channel object
		  u = irc.user(msg.prefix), // user
		  m = msg.arguments[1], // message
      params = m.split(' ');
	params.shift();
	irc.send(chan && chan.name || u, 'unloading plugin: ' + params[ 0]);
    irc.unloadPlugin(params[0]);
};