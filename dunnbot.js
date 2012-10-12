var irc = require('./libs/irc.js'),
    config = require('./config');

var ircClient = new irc.Server(config);
ircClient.connect();