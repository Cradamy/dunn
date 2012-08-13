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
 
Plugin = exports.Plugin = function (irc) {
  this.trigger = 'karma';
  this.usage = 'You can see your own karma by PMing me "karma"';
  this.version = '0.1';
  this.author = 'Killswitch';
  this.protected = false;
  this.irc = irc;
  this.irc.addTrigger(this, 'karma', this.karma);
};

Plugin.prototype.onMessage = function (msg) {
  var irc = this.irc,
      channel = msg.arguments[0],
      chanObj = irc.channels[channel],
      user = irc.user(msg.prefix),
      message = msg.arguments[1],
      to = '';
  
  if (channel != irc.nick)
  {
    if (to = message.match(/^(\w+)\+\+;?$/i)) {
      this.action('give', user, channel, chanObj, to[1]);
    }
    else if (to = message.match(/^(\w+)\-\-;?$/i)) {
      this.action('take', user, channel, chanObj, to[1]);
    }
  }
  else if (channel === irc.nick) {
    if (message === 'karma') {
      irc.send(chanObj && chanObj.name || user, 'You have no karma.');
    }
  }
};

Plugin.prototype.karma = function (msg) {
  var irc = this.irc,
      channel = msg.arguments[0],
      chanObj = irc.channels[channel],
      user = irc.user(msg.prefix),
      message = msg.arguments[1],
      params = message.split(' ');

  params.shift();
  irc.send(chanObj && chanObj.name || user, user + ': ' + this.usage);
};

Plugin.prototype.action = function (action, user, channel, chanObj, who) {
  var actionMessage = {
    take: 'taken karma from',
    give: 'given karma to'
  };
  
  if (this.userCheck(user, channel, who))
  {
    if (action === 'take') {
      
    }
    else if (action === 'give') {
      
    }
    this.irc.send(chanObj && chanObj.name || user, user + ': You have ' + actionMessage[action] + ' ' + who);
  }
};

Plugin.prototype.userCheck = function (user, channel, who) {
  if (user === who || who === this.irc.nick) {
    return false;
  }
  return true;
}