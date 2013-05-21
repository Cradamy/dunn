/*
 * @Plugin        Weather
 * @Description   Gets weather based on given zipcode
 * @Trigger       .weather
 *
 * @Author        Emn1ty (Jonathan Ardis)
 * @Copyright     Jonathan Ardis 2012
 *
 */

Plugin = exports.Plugin = function (irc) {
  irc.addTrigger('weather', this.weather);
};

Plugin.prototype.weather = function (irc, channel, nick, params, message) {
    irc.send(channel, nick + ': Why don\'t you look outside, jesus.');
};
