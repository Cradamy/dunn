/*
 * @Plugin        Search
 * @Description   Allows you to search
 * @Trigger       .g
 * @Trigger       .gi
 * @Trigger       .gif
 *
 * @Author        buttcactus (Aaron Ahmed)
 * @Website       http://www.digitalkitsune.net
 * @Copyright     DIGITAL KITSUNE 2012
 *
 */

var Plugin = module.exports = function (irc) {
  	irc.addTrigger('g', this.google);
  	irc.addTrigger('gi', this.google);
  	irc.addTrigger('gif', this.google);
};

Plugin.prototype.google = function (irc, channel, nick, params, message, raw) {
	var trigger = message.substring(irc.command.length).split(' ')[0];
  	if (params.length > 0) {
		var urls = {
			'g': function (params) {
				return 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=' + encodeURIComponent(params.join(' '));
			},
			'gi': function (params) {
				return 'http://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=' + encodeURIComponent(params.join(' '));
			},
			'gif': function (params) {
				return 'http://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=' + encodeURIComponent(params.join(' ') + ' filetype:gif');
			}
		};
  		var getUrl = urls[trigger](params);
		var req = irc.httpGet(getUrl, function (err, res, json) {
			if (!err) {
				var data = irc.isValidJson(json);
				if (data) {
					irc.send(channel, decodeURIComponent(data.responseData.results[0].url));
				} else {
					irc.send(channel, 'Error getting data from google');
				}
			} else {
				irc.sendHeap(err, channel);
			}
		});
	} else {
		irc.send(channel, 'Usage: ' + irc.command + trigger + ' <QUERY>');
	}
};
