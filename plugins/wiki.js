/*
 * @Plugin        Wiki
 * @Description   Search the wikipedia
 * @Trigger       .wiki
 *
 * @Author        Olli K
 * @Website       github.com/gildean
 * @License       MIT
 * @Copyright     -
 *
 */

var qs = require('querystring');
var Wiki = function (irc) {
    "use strict";
    var trigger = 'wiki';
    var mesLen = trigger.length + irc.command.length + 1;
    var limit = (irc.config.wiki && irc.config.wiki.limit) ? parseInt(irc.config.wiki.limit) : 5;

    var question = function (pla, channel, nick, par, message) {

        function sendToIrc(err, links) {
            if (!err && links) {
                irc.send(channel, nick + ': ' + links);
            } else {
                irc.send(channel, nick + ': ' + (err || 'No valid answer'));
            }
        }
        
        function getLinksFromAnswer(answer, cb) {
            var jsonGet = irc.isValidJson(answer, function (err, json) {
                if (!err && json && json.length > 1 && json[1].length > 0) {
                    var links = '';
                    json[1].forEach(function (link) {
                        links += link + ': http://en.wikipedia.org/wiki/' + qs.escape(link.replace(/ /g, '_')) + ' || ';
                    });
                    cb(null, links.substring(0, links.length - 4));
                } else {
                    cb(((err) ? err.message : 'No valid answer'), null);
                }
            });
        }

        function handleAnswer(err, answer) {
            if (!err) {
                getLinksFromAnswer(answer, sendToIrc);
            } else {
                sendToIrc(err);
            }
        }

        (function searchWiki(message, cb) {
            var query = qs.escape(message.substring(mesLen).trim());
            if (query !== '') {
                var qPath = '/w/api.php?action=opensearch&search=' + query + '&format=json&limit=' + limit;
                var options = {
                    hostname: 'en.wikipedia.org',
                    path: qPath,
                    headers: {'user-agent': 'Mozilla/5.0'},
                };
                var req = irc.httpGet(options, function (err, response, answer) {
                    if (!err && answer) {
                        cb(null, answer);
                    } else {
                        cb(err.message, null);
                    }
                });
            } else {
                cb('Search the wikipedia i.e. \'' + irc.command + trigger + ' traumatic insemination\' ', null);
            }
        }(message, handleAnswer));

    };

    irc.addTrigger(trigger, question);
};

module.exports = Wiki;
