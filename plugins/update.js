/*
 * @Plugin        Update
 * @Description   Updates dunn
 * @Trigger       .update
 *
 * @Author        buttcactus (Aaron Ahmed)
 * @Website       http://www.digitalkitsune.net
 * @Copyright     DIGITAL KITSUNE 2012
 *
 */


var https = require("https"),
		fs = require("fs"),
		sys = require("sys"),
		exec = require("child_process").exec;
var irc = 0, child, self;

Plugin = exports.Plugin = function (i) {
	i.addTrigger('update', this.check);
	irc = i;
	self = this;
}

Plugin.prototype.check = function(irc, channel, nick, params, message, raw) {
	var req = https.request(require("url").parse("https://api.github.com/repos/killswitch/dunn/commits"), function(res) {
		var data = "";
		res.on("data", function(d) { data += d; }).on("end", function() {
			data = JSON.parse(data)[0];
	  	if(irc.updateSHA.indexOf(data.sha) !== -1) {
	  		irc.send(irc.updateChannel, "New commit; "+data.sha.substr(0, 10)+" - "+data.commit.message);
	  		child = exec("git pull", function(error, stdout, strerr) {
					if(error) {
						irc.send(irc.updateChannel, "Failed to execute git pull");
						return;
					} else {
						process.exit(0); //assuming forever
					}
				});
	  	}
	  })
	}).on("error", function(e) {
		irc.sendHeap(e, irc.updateChannel);
	}).end();
}