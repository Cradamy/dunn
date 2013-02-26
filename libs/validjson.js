/* TRY JSON PARSE
 *
 * @param {String}
 * @param {Function}
 * @return {Function} with {null} and {Object} if valid json, {Error} and {null} if not
 */

module.exports = function (json, cb) {
    var data = null;
    var err = null;
    try {
        data = JSON.parse(json);
    } catch (e) {
        err = e;
    }
    return cb(err, data);
};
