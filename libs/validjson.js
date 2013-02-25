/* JSON VALIDATOR
 *
 * @param {String}
 * @return {Object} if valid json, {False} if not
 */
module.exports = function (json) {
	try {
		return JSON.parse(json);
	} catch (e) {
		return false;
	}
};
