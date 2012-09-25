/*
 * @Plugin        Log
 * @Description   Logs channel activity and when user joins/parts to keep track of them.
 *
 * @Author        Killswitch (Josh Manders)
 * @Website       http://www.joshmanders.com
 * @Copyright     Josh Manders 2012
 *
 */
 
var mongodb = require('mongojs');

Plugin = exports.Plugin = function (irc) {
  this.irc = irc;
  this.db = mongodb.connect(irc.database, ['logs', 'userList']);
};

Plugin.prototype.onMessage = function (msg) {
  var irc = this.irc,
      scheme = {
        nick: this.irc.user(msg.prefix),
        channel: msg.arguments[0],
        host: msg.prefix,
        date: new Date(),
        message: msg.arguments[1]
      }

  if (msg.command === 'PRIVMSG') {
    this.db.logs.save(scheme);
  }
};