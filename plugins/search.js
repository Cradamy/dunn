/*
 * @Plugin        Search
 * @Description   Allows you to search, also minify links
 * @Trigger       .g
 *
 * @Author        buttcactus (Aaron Ahmed)
 * @Website       http://www.digitalkitsune.net
 * @Copyright     DIGITAL KITSUNE 2012
 *
 */

Plugin = exports.Plugin = function(irc) {
  this.irc = irc;
  this.irc.addTrigger('g', this.google);
};

Plugin.prototype.google = function(irc, channel, nick, params, message, raw) {
  if(params.length > 0) {
		var http = require("http");

		http.request({
			host: "ajax.googleapis.com",
			path: "/ajax/services/search/web?v=1.0&q="+params.join(" ")
		}, function(res) {
			var data = "";

			res.on("data", function(chunk) {
				data += chunk;
			}).on("end", function() {
				data = JSON.parse(data);
				irc.send(channel, data.responseData.results[0].url);
			});
		}).on("error", function(err) {
			irc.sendHeap(err.stack, channel);
		}).end();
  }
};