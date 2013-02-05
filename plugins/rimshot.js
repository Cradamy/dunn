/*
 * @Plugin        Rimshot
 * @Description   Badumm tish
 *
 * @Author        Nobody
 *
 */

Plugin = exports.Plugin = function (irc) {
  //lolololololololol
};

Plugin.prototype.onMessage = function (irc) {
  if(irc.arguments[1].match(/rimshot/i)) this.ircObj.send(irc.arguments[0], 'badumm tisssshhhhh');
  else if(irc.arguments[1].match(/badumm/i) || irc.arguments[1].match(/ba dumm/i)) this.ircObj.send(irc.arguments[0], 'tisssshhhhh');
};

