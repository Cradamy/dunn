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
  this.trigger = 'nsfw';
  this.usage = '.nsfw hot asian spice';
  this.version = '0.1';
  this.author = 'naomi';
  this.protected = false;

  irc.addTrigger(this, 'nsfw', this.nsfw);
};

Plugin.prototype.nsfw = function (irc, chan, nick, msg, params) {
  
  // create query param
  var q = params.map(function(e){
      return encodeURIComponent(e);
    }).join('+');
  
  // return
  irc.send(chan && chan.name || nick, nick + ': http://nsfw.heroku.com/search?q=' + q);
};
