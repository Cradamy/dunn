/*
 * @Plugin        links
 * @Description   gets title to a link automagically
 * @Trigger       -
 *
 * @Author        Olli K
 * @Website       github.com/gildean
 * @License       MIT
 * @Copyright     -
 *
*/

var util = require('util');
var events = require('events');
var Links = function (irc) {
    "use strict";
    var shortUrl = (irc.config.links && irc.config.links.shortUrl) ? irc.config.links.shortUrl : null;
    var self = this;
    var urlRegex = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/?%=~_|][^\s]+)/ig;
    var titleRegex = /<title>.+?<\/title>/ig;

    function sendToIrc(err, title, channel) {
        if (!err && title) {
            irc.send(channel, title);
        } else {
            irc.send(channel, err || 'Error getting link title');
        }
    }
    
    function parseTitle(message, channel, shortLink) {
        var title = message.match(titleRegex)[0].replace('<title>', '').replace('</title>', '');
        var msg = (shortLink) ? title + ' || ' + shortLink : title;
        self.emit('sendToIrc', null, msg, channel);
    }

    function getPageTitle(message, channel, shortLink) {
        var req = irc.httpGet(message, function (err, answer) {
            if (!err && answer) {
                self.emit('gotTitle', answer, channel, shortLink);
            } else {
                self.emit('sendToIrc', err.message, null, channel);
            }
        });
    }

    function getShort(message, channel, shortU) {
        var req = irc.httpGet(shortU + message, function (err, answer) {
            if (!err && answer) {
                self.emit('getPageTitle', message, channel, answer);
            } else {
                self.emit('sendToIrc', err.message, null, channel);
            }
        });
    }

    this.onMessage = function (msg) {
        var message = msg.arguments[1].match(urlRegex);
        if (message) {
            var channel = msg.arguments[0];
            message.forEach(function (url) {
                if (shortUrl) {
                    self.emit('getShort', url.trim(), channel, shortUrl);
                } else {
                    self.emit('getPageTitle', url.trim(), channel, null);
                }
            });
        }
    }

    this.on('getShort', getShort)
        .on('getPageTitle', getPageTitle)
        .on('gotTitle', parseTitle)
        .on('sendToIrc', sendToIrc);
};

util.inherits(Links, events.EventEmitter);
exports.Plugin = Links;
