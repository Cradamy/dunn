/*
 * @Plugin        Karma
 * @Description   Karma system based on Stack Overflow's Reputation system.
 * @Trigger      .karma
 *
 * @Author        Killswitch (Josh Manders)
 * @Website       http://www.joshmanders.com
 * @Copyright     Josh Manders 2012
 *
 */

var mongodb = require('mongojs'),
    howLong = require('../libs/ago.js');

Date.prototype.KarmaLimit = function () {
  this.setMinutes(this.getMinutes() - 1);
  return this;
}

Plugin = exports.Plugin = function (irc) {
  irc.addTrigger('karma', this.karma);
  this.db = mongodb.connect(irc.database, ['karma']);
  this.irc = irc;
  this.threshold = irc.config.karmaThreshold || 5;
};

Plugin.prototype.onMessage = function (msg) {
  var to, users, irc = this.irc,
      nick = this.irc.user(msg.prefix).toLowerCase(),
      channel = msg.arguments[0],
      message = msg.arguments[1],
      botNick = this.irc.nick.toLowerCase(),
      karma = this.db.karma,
      threshold = this.threshold;
  Object.keys(irc.users).forEach(function (user) {
  if (user != irc.nick.toLowerCase() && user != nick)
    {
      users += ' ' + user;
    }
  });
  if (channel == this.irc.nick)
  {
    return;
  }
  if (to = message.match(/^(\w+)\+\+;?$/i)) {
    var user = to[1].toLowerCase();
    if (user != botNick && user != nick && users.indexOf(user) != -1) {
      karma.find({ to: user, from: nick, channel: channel, action: 'give' }).sort({ date: -1 }).limit(1, function (err, check) {
        var KarmaLimit = new Date().KarmaLimit(),
            now = new Date();
        if (check.length > 0) {
          if ((check[0].date <= now) && (check[0].date >= KarmaLimit))  {
            irc.send(channel, nick + ': Can not give karma to the same person in a ' + KarmaLimit + ' minute span.');
            return;
          }
        }
        karma.save({ to: user, from: nick, channel: channel, action: 'give', date: new Date() });
        irc.send(channel, nick + ': Karma given to ' + user);
      });
    }
  }

  if (to = message.match(/^(\w+)\-\-;?$/i)) {
    var user = to[1].toLowerCase();
    if (user != botNick && user != nick && users.indexOf(user) != -1) {
      karma.find({ to: user, from: nick, channel: channel, action: 'take' }).sort({ date: -1 }).limit(1, function (err, check) {
        var fifteenMinsAgo = new Date().fifteenMinsAgo(),
            now = new Date();
        if (check.length > 0) {
          if ((check[0].date <= now) && (check[0].date >= fifteenMinsAgo))  {
            irc.send(channel, nick + ': Can not take karma from the same person in a 15 minute span.');
            return;
          }
        }

        karma.find({ to: nick, channel: channel, action: 'give' }, function (err, k) {
          karma.find({ to: nick, channel: channel, action: 'take'}, function(err, k2) {
            if(k.length - k2.length < threshold) {
              irc.send(channel, nick + ": You need at least "+threshold+" karma inorder to take karma.");
              return;
            }
            karma.save({ to: user, from: nick, channel: channel, action: 'take', date: new Date() });
            irc.send(channel, nick + ': Karma taken from ' + user);
          });
        });
      });
    }
  }
};

Plugin.prototype.karma = function (irc, channel, nick, params, message, raw) {
  var db = this.db;
  if(params.length) {
    nick = params[0];
  }
  
  db.karma.find({ to: nick, channel: channel, action: 'give' }, function (err, karma) {
    db.karma.find({ to: nick, channel: channel, action: 'take'}, function(err, karma2) {
      irc.send(channel, nick + ': You have ' + (karma.length - karma2.length) + ' total karma.');
    });
  });
};
