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
	console.log(Date.create(new Date()).format('{yyyy}-{mm}-{dd} {HH}:{mm}:{ss}'), msg);
	/*var sql = {
		created_on: Date.create(new Date()).format('{yyyy}-{mm}-{dd} {HH}:{mm}:{ss}'),
		nick: 
	};
  	var query = connection.query('INSERT INTO logs SET ?', post, function(err, result) {
		
	});
	console.log(query.sql);*/
};
