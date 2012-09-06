/*
 * @Plugin        rage
 * @Description   Capitalizes everything.
 * @Trigger       .rage
 *
 * @Author        Emn1ty (Jonathan Ardis)
 *
 */
 
Plugin = exports.Plugin = function (irc) {
  this.trigger = 'rage';
  this.usage = 'EXPRESSES YOUR RAGE!';
  this.version = '0.1';
  this.author = 'Emn1ty';
  this.protected = false;
  
  irc.addTrigger(this, 'rage', this.rage);
};

Plugin.prototype.rage = function (irc, chan, nick, msg, params) {
  
  var RAGE_MESSAGE = '',
      symbols = ' %$#&@*!';;

  if (params[0] == 'MOAR') {
    for(var i=0;i<150;i++) {
      RAGE_MESSAGE += symbols.charAt(Math.floor(Math.random() * symbols.length));
    }

  }

  else {
    RAGE_MESSAGE += params.join(' ').toUpperCase();
  }

  irc.send(chan && chan.name || nick, nick + ' RAGES!: ' + RAGE_MESSAGE + '!!!!!');
};
