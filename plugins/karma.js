/*
 * @Plugin 			Karma
 * @Description 	Issues karma points to users.
 * @Trigger 		<nick>++
 *
 * @Author 			Killswitch (Josh Manders)
 * @Website 		http://www.joshmanders.com
 * @Copyright 		Josh Manders 2013
 *
 */

Plugin = exports.Plugin = function (irc) {
	this.irc = irc;
};

Plugin.prototype.onMessage = function(message) {
	var nick = (this.irc.user(message.prefix) || '').toLowerCase(),
		channel = message.arguments[0],
		msg = message.arguments[1];
	if (user = msg.match(/^(\w+)\+\+;?(.+)?$/i))
	{
		this.give(this.irc, channel.toLowerCase(), nick.toLowerCase(), user[1].toLowerCase(), user[2]);
	}
};

Plugin.prototype.give = function (irc, channel, from, to, reason) {
	var from_id = irc.db.query('SELECT user_id FROM users WHERE username = ? LIMIT 1', [from], function (err, result) {
		if (result.length > 0)
		{
			return result[0].user_id;
		}
		else
		{
			return undefined;
		}
	});
	var to_id = irc.db.query('SELECT user_id FROM users WHERE username = ? LIMIT 1', [to], function (err, result) {
		if (result.length > 0)
		{
			return result[0].user_id;
		}
		else
		{
			return undefined;
		}
	});
	console.log(from_id, to_id);
	if (from_id == undefined)
	{
		irc.send(channel, from + ': Unable to give karma to ' + to + ' as you are not registered with me.');
	}
	else if (to_id == undefined)
	{
		irc.send(channel, from + ': Unable to give karma to ' + to + ' as they are not registered with me.');
	}
	else
	{
		irc.send(channel, from + ': Karma has been given to ' + to + ((reason === undefined) ? '.' : ' for ' + reason.replace('for', '').trim() + '.'));
	}
};