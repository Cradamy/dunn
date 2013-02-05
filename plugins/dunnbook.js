/*
 * @Plugin        Dunn Book
 * @Description   Contains all knowledge of Dunn
 * @Trigger       .dunnbook
 *
 * @Author        cgcardona
 * @Copyright     MIT License http://opensource.org/licenses/MIT
 *
 */

Plugin = exports.Plugin = function (irc) {
  irc.addTrigger('dunnbook', this.dunnbook);
};

Plugin.prototype.dunnbook = function (irc, channel, nick, params, message, raw) {
  var path;
  if(params[0] == 'ch1')
    path = 'book_of_dunn_ch1';
  else if(params[0] == 'ch2')
    path = 'book_of_dunn_ch2';
  
  irc.send(channel, nick + ': http://github.com/cgcardona/dunn/blob/master/docs/' + path + '.md');
};
