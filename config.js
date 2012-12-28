var config = {
	host: 'irc.freenode.net',
	port: 6667,
	nick: 'dunnBot',
	identPass: 'youridpasshere',
	username: 'dunnBot',
	realname: 'Powered by #webtech',
	command: '.',
	db: 'dunnBot',
	channels: ['#yourchannel'],
	plugins: ['dunn', 'example', 'karma', 'log', 'nsfw', 'triggers', 'rage', 'seen', 'remind'],
	admins: ['yournick']
};

module.exports = config;
