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
  if(params.length > 0) {
    var http = require("http");
    http.request({
      host: "free.worldweatheronline.com",
      path: "/feed/weather.ashx?q="+encodeURIComponent(params[0])+"&format=json&num_of_days=2&key=fb822213ff211557121210"
    }, function(data) {
       var weather = JSON.parse(data.data.currentCondition),
        temp = weather.temp_C+'C ('+weather.temp_F+'F)',
        humidity = weather.humidity+'% Humidity',
        rain = weather.precipMM+'mm Rainfall',
        wind = weather.windspeedKmph+'kph ('+weather.windspeedMiles+'mph) Winds',
        desc = weather.weatherDesc.value,
        clouds = weather.cloudcover+'% Cloudcover';
        weatherMessage = desc+' | '+temp' | '+clouds' | '+humidty' | '+wind;
        irc.send(channel, nick +': '+weatherMessage);
    });
  } else {
    irc.send(channel, nick+'You must provide a postal/zip code.');
  }
};