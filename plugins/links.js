/*
 * @Plugin        	links
 * @Description   	gets title to a link automagically
 * @Trigger       	none
 *
 * @Author        	Olli K
 * @Website       	github.com/gildean
 * @License      	MIT
 * @Copyright     	-
 *
 */

var util = require('util');
var events = require('events');

function Links(irc) {
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
    
    function parseTitle(response, message, channel, shortLink) {
        var title = (message.match(titleRegex)) ? message.match(titleRegex)[0].replace('<title>', '').replace('</title>', '') : '';
        var data = (response.statusCode > 299) ? 'Error ' + response.statusCode + ' ' + title : title;
        var msg = (shortLink) ? data + ' || ' + shortLink : data;
        self.emit('sendToIrc', null, msg, channel);
    }

    function getPageTitle(message, channel, shortLink) {
        var req = irc.httpGet(message, function (err, response, answer) {
            if (!err && answer) {
                self.emit('gotTitle', response, answer, channel, shortLink);
            } else {
                self.emit('sendToIrc', err.message, null, channel);
            }
        });
    }

    function getShort(message, channel, shortU) {
        var req = irc.httpGet(shortU + message, function (err, response, answer) {
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
            message.forEach(function (uri) {
                if (shortUrl) {
                    self.emit('getShort', uri.trim(), channel, shortUrl);
                } else {
                    self.emit('getPageTitle', uri.trim(), channel, null);
                }
            });
        }
    };

    this.on('getShort', getShort)
        .on('getPageTitle', getPageTitle)
        .on('gotTitle', parseTitle)
        .on('sendToIrc', sendToIrc);
}

util.inherits(Links, events.EventEmitter);
exports.Plugin = Links;
