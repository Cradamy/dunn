/*
* @Plugin        NSFW search
* @Description   get your nsfw fix
* @Trigger       .nsfw
*
* @Author        naomi (Naomi Kyoto)
* @Website       http://github.com/naomik
*
*/

Plugin = exports.Plugin = function (irc) {
  irc.addTrigger('nsfw', this.nsfw);
};

Plugin.prototype.nsfw = function (irc, channel, nick, params, message, raw) {
  var q = params.map(function(e) {
      return encodeURIComponent(e);
    }).join('+');
  irc.send(channel, nick + ': http://nsfw.heroku.com/search?q=' + q);
};
