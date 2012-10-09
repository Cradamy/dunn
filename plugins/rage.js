/*
 * @Plugin        RAGE
 * @Description   Capitalizes everything.
 * @Trigger       .RAGE
 *
 * @Author        Emn1ty (Jonathan Ardis)
 *
 */

Plugin = exports.Plugin = function (irc) {
  this.trigger = 'RAGE';
  this.usage = 'EXPRESSES YOUR RAGE!';
  this.version = '0.1';
  this.author = 'Emn1ty';
  this.protected = false;
  this.irc = irc;
  this.irc.addTrigger(this, 'RAGE', this.RAGE);
};

Plugin.prototype.RAGE = function (msg) {
  var irc = this.irc,
      channel = msg.arguments[0],
      chanObj = irc.channels[channel],
      user = irc.user(msg.prefix),
      message = msg.arguments[1],
      params = message.split(' '),
      RAGE_MESSAGE = '',
      symbols = ' %$#&@*!',
      message_return = '';

  params.shift();
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


  irc.send(chanObj && chanObj.name || user, message_return);
};