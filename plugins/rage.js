/*
 * @Plugin        rage
 * @Description   Capitalizes everything.
 *
 * @Author        Emn1ty (Jonathan Ardis)
 *
 */
 
Plugin = exports.Plugin = function (irc) {
  irc.addTrigger('rage', this.rage);
};

Plugin.prototype.rage = function (irc, channel, nick, params, message, raw) {
  var RAGE_MESSAGE = '',
      symbols = ' %$#&@*!';;
  if (params[0] == 'MOAR') {
    for(var i=0; i <= 150; i++) {
      RAGE_MESSAGE += symbols.charAt(Math.floor(Math.random() * symbols.length));
    }
  }
  else {
    RAGE_MESSAGE += params.join(' ').toUpperCase();
  }
  irc.send(channel, nick + ' RAGES!: ' + RAGE_MESSAGE + '!!!!!');
};