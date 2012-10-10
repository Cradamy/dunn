/*
 * @Plugin        RAGE
 * @Description   Capitalizes everything.
 * @Trigger       .RAGE
 *
 * @Author        Emn1ty (Jonathan Ardis)
 *
 */

Plugin = exports.Plugin = function (irc) {
  irc.addTrigger('rage', this.RAGE);
};

Plugin.prototype.RAGE = function (irc, channel, user, params, message) {
  var RAGE_MESSAGE = '',
      symbols = ' %$#&@*!',
      message_return = '';

  if (params[0] == '') {
    message_return = user + ', WHY U NO WORDS?!?';
  } else {
    if (params[0] == 'MOAR') {
      for(var i=0;i<150;i++) {
          RAGE_MESSAGE += symbols.charAt(Math.floor(Math.random() * symbols.length));
      }
    } else {
      for(var i=0;i<params.length;i++) {
        RAGE_MESSAGE += toUpperCase(params[i])+' ';
      }
    }
    message_return = user + ' RAGES! ' + RAGE_MESSAGE + '!!!!!';
  }


  irc.send(channel, message_return);
};