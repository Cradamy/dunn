/**
 * HTTP(S)-GET shim.
 *
 * A small wrapper for plugins to use
 * Automatically selects either http or https
 * Also forwards redirects (max 5)
 *
 * Example:
 *
 *   function getSomeData(channel, options, callback) {
 *      // here the httpGet function returns a callback function with three arguments
 *      irc.httpGet(options, function (err, response, responsedata) {
 *          if (!err && response.statusCode === 200) {
 *              var json = irc.isValidJson(responsedata);
 *              if (json) {
 *                  callback(null, channel, json);
 *              } else {
 *                  callback('Invalid answer', channel, null);
 *              }
 *          } else {
 *              callback(err || 'Something went wrong', channel, null);
 *          }
 *      });
 *   }
 *
 * Aliased as `irc.httpGet()`.
 * If the callback returns with an error, it might or might not have a response
 * Data always comes back with a response and never with an error
 *
 * @param {String} or {Object} as node.js core http(s)-get api goes
 * @return callback {Function} with {Error} response {Object} and data {String}
 * @api public
 */

 /*
  * Require Modules
  */

var url = require('url');
var http = require('http');
var https = require('https');

/*
 * Export a callback function
 */

module.exports = function (options, cb) {
    "use strict";
    var i = 0;
    var hGet;
    if (typeof(options) === 'string' && options.toLowerCase().indexOf('s') === 4 || typeof(options) === 'object' && options.port === 443) {
        hGet = https.get;
    } else {
        hGet = http.get;
    }
    (function req(options) {
        hGet(options, function (res) {
            var data = '';
            var getHost;
            // check for a redirect
            if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location && i < 5) {
                i += 1;
                if (url.parse(res.headers.location).hostname) {
                    return req(res.headers.location);
                } else {
                    getHost = (typeof(options) === 'string') ? url.parse(options).hostname : options.hostname || options.host;
                    return req(getHost + res.headers.location);
                }
            } else if (i === 5) {
                return cb(new Error('Redirect loop'), res, null);
            } else {
                res.on('data', function (chunk) {
                    data += chunk;
                }).on('error', function (err) {
                    return cb(err, res, null);
                }).on('end', function () {
                    return cb(null, res, data);
                });
            }
        }).on('error', function (err) {
            return cb(err, null, null);
        });
    }(options));
};
