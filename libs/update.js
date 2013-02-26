var https = require("https"),
        fs = require("fs"),
        sys = require("sys"),
        exec = require("child_process").exec;
var irc = 0, child, self;

var Update = exports.Update = function (i) {
    irc = i;
    this.init();
};

Update.prototype.init = function () {
    irc.updateSHA = fs.readFileSync(__dirname + "/../refs/head/master").split("\n")[0];
    irc.updateTimer = setTimeout(this.watch, irc.updateInterval);
    self = this;
};

Update.prototype.restart = function () {
    if(irc.update) {
        child = exec("git pull", function(error, stdout, strerr) {
            if(error === null) {
                child = exec("forever restart dunnbot.js", function(a,b,c){}); //this is probably evil.
            } else if(irc.updateChannel.length) {
                irc.send(irc.updateChannel, "Failed to execute git pull");
            }
        });
    } else {
        irc.updateTimer = setTimeout(self.watch, irc.updateInterval);
    }
};

Update.prototype.watch = function () {
    var req = irc.httpGet('https://api.github.com/repos/killswitch/dunn/commits', function (err, res, json) {
        if (!err) {
            var jsonGet = irc.isValidJson(json, function (error, jsondata) {
                if (!error && jsondata && jsondata.length > 0) {
                    var data = jsondata[0];
                    if (irc.updateSHA.indexOf(data.sha) !== -1) {
                        if (irc.updateAnnounce) {
                            irc.send(irc.updateChannel, "New commit; " + data.sha.substr(0, 10) + " - " + data.commit.message);
                        }
                        self.restart();
                    } else {
                        irc.updateTimer = setTimeout(self.watch, irc.updateInterval);
                    }
                } else {
                    irc.sendHeap((error || 'Error getting data from Github'), irc.updateChannel);
                }
            });
        } else {
            irc.sendHeap(err, irc.updateChannel);
        }
    });
};
