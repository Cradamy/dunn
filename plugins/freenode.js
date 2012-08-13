/*
 * @Plugin        Karma
 * @Description   Karma system based on Stack Overflow's Reputation system.
 * @Trigger       <user>(++|--)
 *
 * @Author        Killswitch (Josh Manders)
 * @Website       http://www.joshmanders.com
 * @Copyright     Josh Manders 2012
 *
 */

var sys = require('util');

Plugin = exports.Plugin = function( irc ) {
  this.trigger = 'freenode';
  this.usage = 'FreeNode Services';
  this.version = '0.1';
  this.author = 'Karl Tiedt';
  this.protected = false;

  this.nickPass = 'password';

  this.irc = irc;
};

Plugin.prototype.onConnect = function() {
  this.irc.raw('NS id ' + this.nickPass);
};