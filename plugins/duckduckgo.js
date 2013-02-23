
/*
 * @Plugin        DuckDuckGo
 * @Description   Use the duckduckgo api
 * @Trigger       .ddg
 *
 * @Author        Olli K
 * @Website       github.com/gildean
 * @License       MIT
 * @Copyright     -
 *
 */

var qs = require('querystring');
var url = require('url');

function Ddg(irc) {
    "use strict";
    var trigger = 'ddg';
    var mesLen = trigger.length + irc.command.length + 1;

    var question = function (pla, channel, nick, par, message) {

        function isValidJson(json) {
            try {
                return JSON.parse(json);
            } catch (e) {
                return false;
            }
        }

        function sendToIrc(err, links) {
            if (!err) {
                irc.send(channel, nick + ': ' + links);
            } else {
                irc.send(channel, nick + ': ' + err);
            }
        }
        
        function getLinksFromAnswer(answer, query, cb) {
            var json = isValidJson(answer);
            if (json) {
                var abstractText = (json.AbstractText) ? json.AbstractText + ' || ' : '';
                var abstractSource = (json.AbstractSource && json.AbstractUrl) ? json.AbstractSource + ': ' + json.AbstractUrl + ' || ' : '';
                var answerText = (json.Answer) ? json.Answer + ' || ' : '';
                var definitionText = (json.DefinitionText && json.DefinitionURL) ? 'Definition ( ' + json.DefinitionURL + ' ): ' + json.DefinitionText + ' || ' : '';
                var redirect = (json.Redirect) ? url.resolve('https://duckduckgo.com', json.Redirect) + ' || ' : '';
                var links = abstractText + abstractSource + answerText + definitionText + redirect;
                if (links === '') {
                    links = 'https://duckduckgo.com/?q=' + query + '    ';
                }
                cb(null, links.substring(0, links.length - 4));
            } else {
                cb('No valid answer', null);
            }
        }

        function handleAnswer(err, answer, query) {
            if (!err) {
                getLinksFromAnswer(answer, query, sendToIrc);
            } else {
                sendToIrc(err);
            }
        }

        (function searchDdg(message, cb) {
            var msg = qs.escape(message.substring(mesLen).trim());
            if (msg !== '') {
                var qPath = '/?q=' + msg + '&format=json&no_redirect=1&no_html=1';
                var options = {
                    hostname: 'api.duckduckgo.com',
                    path: qPath
                };
                var req = irc.httpGet(options, function (err, res, json) {
                    if (!err) {
                        cb(null, json, msg);
                    } else {
                        cb(err.message, null);
                    }
                });
            } else {
                cb('DuckDuckGo e.g. \'' + irc.command + trigger + ' define google\' or \'' + irc.command + trigger + ' 10+20*50\'', null);
            }
        }(message, handleAnswer));

    };

    irc.addTrigger(trigger, question);
}

exports.Plugin = Ddg;
