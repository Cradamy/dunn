/*
* @Plugin Message
* @Description Just a test to see if db stuff works.
* @Trigger msg
*
* @Author Killswitch (Josh Manders)
* @Website http://www.joshmanders.com
* @Copyright Josh Manders 2013
*
*/

Plugin = exports.Plugin = function (irc) {
	irc.addTrigger('msg', this.messages);
};

Plugin.prototype.messages = function(irc, channel, nick, params, message, raw) {
	irc.mysql.query('SELECT say FROM messages WHERE message_id = 1 LIMIT 1', function (err, result) {
		irc.send(channel, result[0].say);
	});
};