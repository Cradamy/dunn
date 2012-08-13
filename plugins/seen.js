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
  this.trigger = 'seen';
  this.usage = 'Type ' + irc.command + this.trigger + ' <user> to see when that user was last active.';
  this.version = '0.1';
  this.author = 'Killswitch';
  this.protected = false;
  this.irc = irc;
  this.db = mongodb.connect(irc.database, ['logs', 'userList']);
  this.irc.addTrigger(this, 'seen', this.whereThey);
};

Plugin.prototype.whereThey = function (msg) {
  var irc = this.irc,
      channel = msg.arguments[0],
      chanObj = irc.channels[channel],
      user = irc.user(msg.prefix),
      message = msg.arguments[1],
      params = message.split(' ');

  params.shift();
  if (params.length > 0) {
    if (params[0] !== user || params[0] !== irc.nick) {
      this.db.logs.find({ nick: params[0], channel: channel }).sort({ date: -1 }).limit(1, function (err, seen) {
        if (seen.length > 0) {
          irc.send(chanObj && chanObj.name || user, user + ': The last time I seen ' + params[0] + ' was ' + howLong.ago(seen[0].date) + '.');
        }
        else {
          irc.send(chanObj && chanObj.name || user, user + ': Sorry, I have not seen ' + params[0] + '.');
        }
      });
    }
  }
  else {
    irc.send(chanObj && chanObj.name || user, user + ': [USAGE] ' + this.usage);
  }
};