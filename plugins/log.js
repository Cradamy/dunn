/*
* @Plugin Log
* @Description Logs the channel.
* @Trigger none
*
* @Author Killswitch (Josh Manders)
* @Website http://www.joshmanders.com
* @Copyright Josh Manders 2013
*
*/

Plugin = exports.Plugin = function (irc) {
	this.irc = irc;
};

Plugin.prototype.onMessage = function (msg) {
	var user_nick = (this.irc.user(msg.prefix) || '').toLowerCase(),
		sql = {
			created_on: Date.create(new Date()).format('{yyyy}-{dd}-{dd} {HH}:{mm}:{ss}'),
			nick: user_nick,
			hostmask: msg.prefix.split('!~')[1],
			channel: msg.arguments[0],
			message: msg.arguments[1]
		};
  	var query = connection.query('INSERT INTO logs SET ?', post, function(err, result) {
		
	});
	console.log(query.sql);
};
