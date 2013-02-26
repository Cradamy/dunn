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
var Plugin = module.exports = function (i) {
    //console.log(__dirname + "/../.git/refs/heads/master", fs.existsSync(__dirname + "/../.git/refs/heads/master"));
    if(fs.existsSync(__dirname + "/../.git/refs/heads/master")) {
        updateSHA = fs.readFileSync(__dirname + "/../.git/refs/heads/master").toString().split("\n")[0];
        i.addTrigger('update', this.check, 1);
    }
};

Plugin.prototype.check = function(irc, channel, nick, params, message, raw) {
    irc.send(channel, "Checking...");
    var req = irc.httpGet("https://api.github.com/repos/killswitch/dunn/commits", function (err, res, json) {
        if (!err) {
            var jsonGet = irc.isValidJson(json, function (err, jsondata) {
                if (!err && jsondata) {
                    var data = jsondata[0];
                    if (updateSHA.trim().indexOf(data.sha.trim()) === -1) {
                        irc.send(channel, "New commit; " + data.sha.substr(0, 10) + " - " + data.commit.message);
                        child = exec("git pull", function (error, stdout, strerr) {
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
                } else {
                    irc.send(channel, ((err) ? err.message : 'Error getting data for updates'));
                }
            });
        } else {
            irc.sendHeap(err, channel);
        }
        
    });
};
