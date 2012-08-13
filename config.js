var config = {
	host: 'irc.freenode.net',
	port: 6667,
	nick: 'dunnBot',
	username: 'dunnBot',
	realname: 'Powered by #webtech',
	command: '.',
	db: 'dunn',
	channels: ['#dunn'],
	plugins: ['dunn', 'global', 'reload', 'log', 'seen', 'plugins'],
	admins: ['killswitch']
};

module.exports = config;