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
    irc.httpGet('http://api.openweathermap.org/data/2.5/weather?q=' + encodeURIComponent(params[0]) + '&units=imperial', function (err, res, result) {
		var forcast = JSON.parse(result);
		irc.send(channel, nick + ': ' + forcast.name + ': ' + forcast.weather[0] + ' ' + forcast.main.temp + 'F (High: ' + forcast.main.temp_max + 'F - Low: ' + forcast.main.temp_min + 'F), Humidity ' + forcast.main.humidity + '%, Wind: ' + forcast.wind.speed + 'MPH');
	});
};
