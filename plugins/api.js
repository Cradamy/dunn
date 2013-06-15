/*
 * @Plugin 			API
 * @Description 	API endpoints
 *
 * @Author 			Killswitch (Josh Manders)
 * @Website 		http://www.joshmanders.com
 * @Copyright 		Josh Manders 2013
 *
 */

Plugin = exports.Plugin = function (irc) {
	this.irc = irc;
	irc.addEndpoint('say', this.say);
};

Plugin.prototype.say = function (irc) {
	
};