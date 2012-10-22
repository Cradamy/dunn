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
var updateSHA;
Plugin = exports.Plugin = function (i) {
	//console.log(__dirname + "/../.git/refs/heads/master", fs.existsSync(__dirname + "/../.git/refs/heads/master"));
	if(fs.existsSync(__dirname + "/../.git/refs/heads/master")) {
		updateSHA = fs.readFileSync(__dirname + "/../.git/refs/heads/master").toString().split("\n")[0];
		i.addTrigger('update', this.check, 1);
	}
}

Plugin.prototype.check = function(irc, channel, nick, params, message, raw) {
	irc.send(channel, "Checking...");
	var req = https.request(require("url").parse("https://api.github.com/repos/killswitch/dunn/commits"), function(res) {
		var data = "";
		res.on("data", function(d) { data += d; }).on("end", function() {
			data = JSON.parse(data)[0];
	  	if(updateSHA.trim().indexOf(data.sha.trim()) === -1) {
	  		irc.send(channel, "New commit; "+data.sha.substr(0, 10)+" - "+data.commit.message);
	  		child = exec("git pull", function(error, stdout, strerr) {
					if(error) {
						irc.send(channel, "Failed to execute git pull");
						irc.sendHeap(stdout+"\n"+strerr, channel);
						return;
					} else {
						process.exit(0); //assuming forever
					}
				});
	  	} else {
	  		irc.send(channel, "No updates");
		}
	  })
	}).on("error", function(e) {
		irc.sendHeap(e, channel);
	}).end();
}