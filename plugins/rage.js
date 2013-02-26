/*
 * @Plugin        RAGE
 * @Description   Capitalizes everything.
 * @Trigger       .rage
 *
 * @Author        Emn1ty (Jonathan Ardis)
 *
 */

var Plugin = module.exports = function (irc) {
  irc.addTrigger('rage', this.RAGE);
};

Plugin.prototype.RAGE = function (irc, channel, user, params, message) {
  var RAGE_MESSAGE = '',
      symbols = ' %$#&@*!',
      message_return = '', i;

  if (params < 1) {
    message_return = user + ', WHY U NO WORDS?!?';
  } else {
    if (params[0] === 'MOAR') {
      for(i=0;i<150;i++) {
          RAGE_MESSAGE += symbols.charAt(Math.floor(Math.random() * symbols.length));
      }
    } else {
      for(i=0;i<params.length;i++) {
        RAGE_MESSAGE += params[i].toUpperCase()+' ';
      }
    }
    message_return = user + ' RAGES! ' + RAGE_MESSAGE + '!!!!!';
  }


  irc.send(channel, message_return);
};
