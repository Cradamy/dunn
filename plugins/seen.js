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

Plugin.prototype.whereThey = function (irc, chan, nick, msg, params) {

  if (params.length > 0) {
    if (params[0] !== nick || params[0] !== irc.nick) {

      this.db.logs.find({ nick: params[0], channel: chan.name }).sort({ date: -1 }).limit(1, function (err, seen) {
        
        // seen
        if (seen.length > 0) {
          irc.send(chan && chan.name || nick, nick + ': The last time I seen ' + params[0] + ' was ' + howLong.ago(seen[0].date) + '.');
        }

        // unseen
        else {
          irc.send(chan && chan.name || nick, nick + ': Sorry, I have not seen ' + params[0] + '.');
        }
      });
    }
  }
  
  // usage
  else {
    irc.send(chan && chan.name || nick, nick + ': [USAGE] ' + this.usage);
  }
};