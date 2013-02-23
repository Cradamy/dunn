/**
 * HTTP(S)-GET shim.
 *
 * A small wrapper for plugins to use
 * Automatically selects either http or https
 *
 * Example:
 *
 *   function getSomeData(channel, options) {
 *      irc.httpGet(options, function (err, responsedata) {
 *          if (!err)
 *              try {
 *                  var json = JSON.parse(responsedata);
 *                  irc.send(channel, json.whatever);
 *              } catch (e) {
 *                  irc.sendHeap(channel, e)
 *              }
 *          } else {
 *              irc.sendHeap(channel, err);
 *          }
 *      });
 *   }
 *
 * Aliased as `irc.httpGet()`.
 *
 * @param {String} or {Object} as node.js core http(s)-get api goes
 * @return callback {Function} with {Error} and {String}
 * @api public
 */

 /*
  * Require Modules
  */

var http = require('http');
var url = require('url');
var https = require('https');

/*
 * Export callback function
 */

module.exports = function (options, cb) {
    "use strict";
    var getHost = (typeof(options) === 'string') ? url.parse(options).hostname : options.hostname || options.host;
    var i = 0;
    var hGet;
    if (typeof(options) === 'string' && options.toLowerCase().indexOf('s') === 4 || typeof(options) === 'object' && options.port === 443) {
        hGet = https.get;
    } else {
        hGet = http.get;
    }
    (function req(options) {
        hGet(options, function (res) {
            // Detect a redirect
            if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location && i < 5) {
                i += 1;
                if (url.parse(res.headers.location).hostname) {
                    req(res.headers.location);
                } else {
                    req(getHost + res.headers.location);
                }
            } else if (i === 5) {
                return cb(new Error('Redirect loop'), null);
            } else {
                var data = '';
                res.on('data', function (chunk) {
                    data += chunk;
                }).on('error', function (err) {
                    return cb(err, null);
                }).on('end', function () {
                    return cb(null, data);
                });
            }
        }).on('error', function (err) {
            return cb(err, null);
        });
    }(options));
};
