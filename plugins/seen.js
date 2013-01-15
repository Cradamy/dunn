/*
 * @Plugin        Seen
 * @Description   Allows you to find out the last time a user was seen active in the channel. 
 * @Trigger       .seen <nick>
 *
 * @Author        Killswitch (Josh Manders)
 * @Website       http://www.joshmanders.com
 * @Copyright     Josh Manders 2012
 *
 */
 
var mongodb = require('mongojs'),
    howLong = require('../libs/ago.js');
 
Plugin = exports.Plugin = function (irc) {
  this.irc = irc;
  this.db = mongodb.connect(irc.database, ['logs']);
  this.irc.addTrigger('seen', this.seen);
};

Plugin.prototype.seen = function (irc, channel, nick, params, message, raw) {
  var users;
  Object.keys(irc.users).forEach(function (user) {
  if (user != irc.nick.toLowerCase() && user != nick)
    {
      users += ' ' + user;
    }
  });
  if (params.length > 0) {
    if (params[0] !== nick || params[0] !== irc.nick || users.indexOf(params[0]) != -1) {
      this.db.logs.find({ nick: params[0], channel: channel }).sort({ date: -1 }).limit(1, function (err, seen) {
        if (seen.length > 0) {
          var ago = howLong.ago(seen[0].date);
          var msg = nick + ': The last time I sawed ' + params[0] + ' was ';
          msg += ago === "just now" ? ago +'.' : ago + ' ago saying: <' + seen[0].nick + '> ' + seen[0].message;
          irc.send(channel,  msg);
        }
        else {
          irc.send(channel, nick + ': Sorry, I have not seen ' + params[0] + '.');
        }
      });
    }
  }
};
