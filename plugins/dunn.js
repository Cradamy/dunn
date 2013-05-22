/*
* @Plugin Dunn
* @Description Random triggers based on things having to do with Dunn himself.
* @Trigger .about
* @Trigger .code
*
* @Author Killswitch (Josh Manders)
* @Website http://www.joshmanders.com
* @Copyright Josh Manders 2012
*
*/

var exec = require('child_process').exec;

Plugin = exports.Plugin = function (irc) {
	this.ircObj = irc;
	irc.addMessageHandler('dunn dunn', this.dunn);
	irc.addTrigger('about', this.about);
	irc.addTrigger('code', this.code);
	irc.addTrigger('env', this.environment);
	irc.addTrigger('register', this.register);
	irc.addTrigger('restart', this.restart, 1);
};

Plugin.prototype.onNumeric = function(irc) {
	if (irc.command !== '376') {
		return;
	}
	for (var i = 0; i < this.ircObj.userChannels.length; i++) {
		var channelName = this.ircObj.userChannels[i], password;
		if (typeof(channelName) == 'object') {
			password = channelName.password;
			channelName = channelName.name;
		}
		var chan = new this.ircObj.channelObj(this.ircObj, channelName, true, password);
		this.ircObj.channels[chan.name] = chan;
	}
};

Plugin.prototype.dunn = function (irc, channel, nick, params, message, raw) {
	irc.send(channel, nick + ': dunnnnnnnnnn')
};

Plugin.prototype.about = function (irc, channel, nick, params, message, raw) {
	irc.send(channel, nick + ': My name is dunnBot, I am written in Node.js and I am a collective project by the channel #webtech on freenode.');
};

Plugin.prototype.code = function (irc, channel, nick, params, message, raw) {
	irc.send(channel, nick + ': You can view, and fork my code to contribute on GitHub at http://www.github.com/webtechirc/dunn.');
};

Plugin.prototype.environment = function(irc, channel, nick, params, message, raw) {
	if(typeof params[0] == 'undefined') {
		return irc.send(channel, 'Usage: ' + irc.command + 'env <plugins/triggers>');
	}
	switch(true) {
		default:
		irc.send(channel, 'Usage: ' + irc.command + 'env <plugins/triggers/handlers>');
		break
		case params[0].indexOf('plugins') > -1:
		irc.send(channel, 'Loaded plugins are: ' + Object.keys(irc.plugins).join(', '));
		break;
		case params[0].indexOf('triggers') > -1:
		irc.send(channel, 'Loaded triggers are: ' + irc.command + Object.keys(irc.triggers).join(', ' + irc.command));
		break;
	}
};

Plugin.prototype.register = function(irc, channel, nick, params, message, raw) {
	console.log(raw);
	if (params[0] == 'help') {
		irc.send(channel, nick + ': Usage: ' + irc.command + 'register <you@example.com> -- This will register you for things that require authentication.')
	}
	else {
		/*irc.db.query('INSERT INTO users SET ?', {username: nick, hostmask: '', email: ''}, function (err, result) {
			
		});*/
		irc.send(channel, nick + ': You have been registered.');
	}
};

Plugin.prototype.restart = function(irc, channel, nick, params, message, raw) {
	irc.send(channel, nick + ': Restarting, brb.');
	exec('forever restart dunnbot.js');
};