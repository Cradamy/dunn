/*
 * @Plugin        Wake Up 
 * @Description   WAKE THE FUCK UP!!!
 * @Trigger       .wakeup
 *
 * @Author        cgcardona
 * @Copyright     MIT License http://opensource.org/licenses/MIT
 *
 */

var Plugin = module.exports = function (irc) {
  irc.addTrigger('wakeup', this.wakeup);
};

Plugin.prototype.wakeup = function (irc, channel, nick, params, message, raw) {
  var users = '';
  for (var user in irc.users)
    users += user + ', ';

  irc.send(channel, users + 'WAKE THE FUCK UP!!!');
};
