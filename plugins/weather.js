/*
 * @Plugin        Weather
 * @Description   Gets weather based on given zipcode
 * @Trigger       .weather
 *
 * @Author        Emn1ty (Jonathan Ardis)
 * @Copyright     Jonathan Ardis 2012
 *
 */

var Plugin = module.exports = function (irc) {
  irc.addTrigger('weather', this.weather);
};

Plugin.prototype.weather = function (irc, channel, nick, params, message) {
  if(params.length > 0) {
    var urlPath = "free.worldweatheronline.com/feed/weather.ashx?q=" + encodeURIComponent(params[0]) + "&format=json&num_of_days=2&key=fb822213ff211557121210";
    var req = irc.httpGet(urlPath, function (err, res, data) {
      if (!err) {
       var json = irc.isValidJson(data);
       if (json) {
          var weather = json.data.currentCondition;
          var temp = weather.temp_C + 'C (' + weather.temp_F + 'F)',
            humidity = weather.humidity + '% Humidity',
            rain = weather.precipMM + 'mm Rainfall',
            wind = weather.windspeedKmph + 'kph (' + weather.windspeedMiles + 'mph) Winds',
            desc = weather.weatherDesc.value,
            clouds = weather.cloudcover + '% Cloudcover';
            weatherMessage = desc + ' | ' + temp + ' | ' + clouds + ' | ' + humidty + ' | ' + wind;
            irc.send(channel, nick +': '+ weatherMessage);
        } else {
          irc.send(channel, 'Error getting weather data');
        }
      } else {
        irc.sendHeap(err, channel);
      }
    });
  } else {
    irc.send(channel, nick + ': You must provide a postal/zip code.');
  }
};
