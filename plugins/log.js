/*
 * @Plugin        Log
 * @Description   Logs channel activity and when user joins/parts to keep track of them.
 * @Trigger       Automatic
 *
 * @Author        Killswitch (Josh Manders)
 * @Website       http://www.joshmanders.com
 * @Copyright     Josh Manders 2012
 *
 */
 
var mongodb = require('mongojs');

Plugin = exports.Plugin = function (irc) {
  this.trigger = 'log';
  this.usage = 'Channel Logging';
  this.version = '0.1';
  this.author = 'Josh Manders';
  this.protected = false;
  this.irc = irc;
  this.db = mongodb.connect(irc.database, ['logs', 'userList']);
};

Plugin.prototype.onMessage = function (msg) {
  this.insertLog(msg);
};

Plugin.prototype.onJoin = function (msg) {
  // console.log(this.irc.users);
  // this.addUserList(msg);
};

Plugin.prototype.onPart = function (msg) {
  // this.removeUserList(msg);
};

Plugin.prototype.onQuit = function (msg) {
  // this.removeUserList(msg);
};

Plugin.prototype.onNick = function (msg) {
  var irc = this.irc,
      oldNick = irc.user(msg.prefix),
      user = irc.users[oldNick],
      newNick = msg.arguments[0];

  console.log('Nick Change: from ' + oldNick + ' to ' + newNick);
  // user && user.changeNick(newNick);
  // this.updateUserList(oldNick, newNick, msg.channel);
};

Plugin.prototype.getNick = function (msg) {
  return this.irc.user(msg.prefix);
};

Plugin.prototype.getChannel = function (msg) {
  var args = msg.arguments;
  return args.length ? args[0] : '';
};

Plugin.prototype.getHost = function (msg) {
  return msg.prefix;
};

Plugin.prototype.getDate = function (msg) {
  return new Date();
};

Plugin.prototype.getMessage = function (msg) {
  var args = msg.arguments;
  return args.length == 2 ? args[1] : '';
};

Plugin.prototype.getType = function (msg) {
  return msg.command;
};

Plugin.prototype.insertLog = function (msg) {
  var irc = this.irc,
      scheme = {
        nick: this.getNick(msg),
        channel: this.getChannel(msg),
        host: this.getHost(msg),
        date: this.getDate(msg),
        message: this.getMessage(msg)
      }

  if (this.getType(msg) === 'PRIVMSG') {
    this.db.logs.save(scheme);
  }
};