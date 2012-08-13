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
  this.irc = irc;
  this.irc.addTrigger(this, 'nsfw', this.nsfw);
};

Plugin.prototype.nsfw = function (msg) {
  
  // boilerplate!
  var irc = this.irc,
      channel = msg.arguments[0],
      chanObj = irc.channels[channel],
      user = irc.user(msg.prefix),
      message = msg.arguments[1],
      params = message.split(' ')
  ;

  // boilerplate param disposal!
  params.shift();
  
  // BEGIN ACTUAL PLUGIN :P
  
  // create query param
  var q = params.map(function(e){
      return encodeURIComponent(e);
    }).join('+');
  
  // return
  irc.send(chanObj && chanObj.name || user, user + ': http://nsfw.heroku.com/search?q=' + q);
};
