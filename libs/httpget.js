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
var https = require('https');

/*
 * Export callback function
 */

module.exports = function (options, cb) {
    "use strict";
    var hGet;
    if (typeof(options) === 'string' && options.toLowerCase().indexOf('s') === 4 || typeof(options) === 'object' && options.port === 443) {
        hGet = https.get;
    } else {
        hGet = http.get;
    }
    var req = hGet(options, function (res) {
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        }).on('error', function (err) {
            return cb(err, null);
        }).on('end', function () {
            return cb(null, data);
        });
    }).on('error', function (err) {
        return cb(err, null);
    });
};
