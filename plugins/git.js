/*
 * @Plugin        Git
 * @Description   Git API operations. 
 * @Trigger       .git-issues
 * @Trigger       .git
 *
 * @Author        buttcactus (Aaron Ahmed)
 * @Website       http://www.digitalkitsune.net
 * @Copyright     Digital-Kitsune 2012
 *
 */

var https = require("https");
var self;
var Plugin = module.exports = function (irc) {
  irc.addTrigger('git', this.git);
  irc.addTrigger('git-issues', this.issues);
  this.pull = [];
  this.pullchans = [];
  this.irc = irc;
  setInterval(this.pullMonitor, 2500);
  self = this;
};

Plugin.prototype.issues = function(irc, channel, nick, params, message) {
	var num = parseInt(params[0]);
	if(params[0] == "issues") num = parseInt(params[1]) || 0;

	var req = https.request(require("url").parse("https://api.github.com/repos/killswitch/dunn/issues"), function(res) {
		var data = "";
		res.on("data", function(d) { data += d; }).
			  on("end", function() {
			  	data = JSON.parse(data);
			  	if(data.length) {
			  		if(data.length < num) num = data.length;
			  		if(num == 0) num = data.length;

			  		data = data.reverse();

			  		while(num > 0) {
			  			var issue = data[num-1];
			  			irc.send(channel, "Issue "+issue.number+"; "+issue.title+" "+issue.url);
			  			num--;
			  		} 
			  	} else {
			  		irc.send(channel, "No issues");
			  	}
			  });
	}).on("error", function(e) {
		irc.sendHeap(e, channel);
	}).end();
}

Plugin.prototype.pullMonitor = function() {
	var chans = self.pullchans;

	while(chans.length) {
		self.pull(chans.shift);
	}
}


Plugin.prototype.pull = function(irc, channel) {
	var req = https.request(require("url").parse("https://api.github.com/repos/killswitch/dunn/pulls"), function(res) {
		var data = "";
		res.on("data", function(d) { data += d; }).
			  on("end", function() {
			  	data = JSON.parse(data);
			  	while(data.length) {
			  		var pull = data.shift();
			  		if(self.pull[pull.number]) {
			  			data = [];
			  			return;
			  		} else {
			  			irc.send(channel, "New pull: "+pull.title+" "+pull.html_url);
			  			data.push(pull.number);
			  		}
			  	}
			  });
	}).on("error", function(e) {
		irc.sendHeap(e, channel);
	}).end();
}

Plugin.prototype.git = function (irc, channel, nick, params, message) {
	switch(params[0]) {
		default:
		case "help":
			irc.send(channel, ".git pull - adds this channel to the announce list, .git-issues [limit]/.git issues [limit] - lists latest issues (by limit), .git last - show last commit");
		break;

		case "pull":
			self.pullchans.push(channel);
		break;

		case "issues":
			this.issues(irc, channel, nick, params, message);
		break;

		case "last":
				var req = https.request(require("url").parse("https://api.github.com/repos/killswitch/dunn/commits"), function(res) {
				var data = "";
				res.on("data", function(d) { data += d; }).
					  on("end", function() {
					  	data = JSON.parse(data)[0];
					  	irc.send(channel, data.sha.substr(0, 10)+" - "+data.commit.message+" https://github.com/killswitch/dunn/commit/"+data.sha);
					  });
			}).on("error", function(e) {
				irc.sendHeap(e, irc.channel);
			}).end();
		break;
	}
};
