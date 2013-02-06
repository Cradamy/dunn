
var wiki = function (irc) {
    var http = require('http');
    var qs = require('querystring');
    var trigger = 'wiki';
    var mesLen = trigger.length + irc.command.length + 1;

    var question = function (pla, channel, nick, par, message) {

        function searchWiki(message, cb) {
            var query = qs.escape(message.substring(mesLen).trim());
            var qPath = '/w/api.php?action=opensearch&search=' + query + '&format=json';
            var options = {
                hostname: 'en.wikipedia.org',
                path: qPath,
                headers: {'user-agent': 'Mozilla/5.0'},
            };
            var req = http.request(options, function (res) {
                var answer = '';
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    answer += chunk;
                });
                res.on('error', function (err) {
                    cb(err.message, null);
                });
                res.on('end', function () {
                    cb(null, answer);
                });
            });

            req.on('error', function (err) {
                cb(err.message, null);
            });

            req.end();
        }

        function isValidJson(json) {
            try {
                return JSON.parse(json);
            } catch (e) {
                return false;
            }
        }

        function getLinksFromAnswer(answer, cb) {
            var json = isValidJson(answer);
            var links = '';
            if (json) {
                json[1].forEach(function (link) {
                    links += ' http://en.wikipedia.org/wiki/' + qs.escape(link);
                });
                cb(null, links);
            } else {
                cb('No valid answer', null);
            }
        }

        searchWiki(message, function (err, answer) {
            if (!err) {
                getLinksFromAnswer(answer, function (err, links) {
                    if (!err) {
                        irc.send(channel, nick + ':' + links);
                    } else {
                        irc.send(channel, nick + ': ' + err);
                    }
                });
            } else {
                irc.send(channel, nick + ': ' + err);
            }
        });
    };
    irc.addTrigger(trigger, question);
};

exports.Plugin = wiki;
