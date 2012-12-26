//@TODO setup interval on onConnect
//@TODO teardown interval on onQuit

/*
 * @Plugin        Remind
 * @Description   .remind [me] [to] MESSAGE in X {minutes, hours} [and X {minutes, hours}
 * @Trigger       .remind
 *
 * @Author        Sequoia McDowell
 * @Website       github.com/sequoia
 * @Copyright     Sequoia McDowell 2012
 * @License				GPL
 *
 */
 
var mongodb =		require('mongojs'),
		sys			=		require('util'), //for debugging
		moment	=		require('moment'),
		trigger =		'remind';

		
Plugin = exports.Plugin = function (irc) {
  irc.addTrigger(trigger, this.remind);
  this.irc = irc;
  this.db = mongodb.connect(irc.database);
	this.collection = this.db.collection('reminders');
};

Plugin.prototype.onConnect = function(){
	
};

Plugin.prototype.remind = function (irc, channel, nick, params, message) {
	try {
	//strip the command/trigger ('.remind me to asdf in..' -> 'me to asdf in..') 
	var prefixLen = (irc.command.length+trigger.length+1);
	message = message.substr(prefixLen);

	//get time string and message
	sys.puts('remind msg: ' + message);
	var parts = this.parseMsg(message);

	//create date for storage
	var timeOffset = this.parseDateStr(parts.timeStr);
	var futureTimestamp = this.roundTime(new Date()).getTime();
	futureTimestamp += timeOffset;
	
	sys.puts(new Date(futureTimestamp));
	sys.puts(parts.contents);

	//add entry 
	this.collection.save({
		nick		:	nick,
		message	:	parts.contents,
		time		:	futureTimestamp,
		created	: new Date().getTime()
	});
	
	//send response
  irc.send(channel, 'Ok ' + nick +', I\'ll remind you.');

	}catch(e){
		irc.send(channel, nick + ': Sorry, there was a problem: ' + e.message);
	}
};

/**
 * parse message for remind
 * @param String	message with trigger (.remind ) removed
 *								ex: "me to call my mom in 2 hours'
 *								ex: "drink three martinis in 1 hour 30 minutes"
 * @return Object	contents : reminder string
 *                timeStr  : like '20 minutes'
 * @throws Error	if time string is bad
 */
Plugin.prototype.parseMsg = function(message){

	//get the time string
	var timeIndex = message.lastIndexOf(' in ');
	if(timeIndex === -1){
		throw {
			name: "InvalidArgumentError",
			message : "remind message contained no time string"
		};
	} 
	var timeStr = message.substr(timeIndex + 4); //+3 for " in "
	message = message.substr(0,timeIndex); //discard time string

	//optionall discard 'me' or 'me to'
	if(message.indexOf('me ') === 0){
		message = message.substr(3);
		if(message.indexOf('to ') === 0){
			message = message.substr(3);
		}
	}

	return {
		contents	: message,
		timeStr		: timeStr
	};
};

/**
 *	parse a string and return a future Date
 *	@param String	datStr indicates time in future like "2 hours 10 minutes"
 *	@return Date	date object (without seconds)
 *	@throws Error if dateStr is not supported (e.g. days, seocnds, etc.)
 */
Plugin.prototype.parseDateStr= function(dateStr){
	var minutesMS = 60000;
	var hoursMS = minutesMS * 60;
	var units = null; //the number of units (hours or minutes)
	var timeOffset = 0; //to add minutes/hours to create new timestamp
	var milliseconds = null; // set to minutesMS or hoursMS as appropriate

	dateStr = dateStr.toLowerCase();
	//loop thru tokens
	dateStr.split(" ").forEach(function(str){
		switch(str){
			case "and": //discard and
				break;
			case "minutes":
			case "minute":
				milliseconds = minutesMS;
				break;
			case "hours":
			case "hour":
				milliseconds = housMS;
				break;
			default: //units
				units = parseInt(str,10);
				if( isNaN(units) ) {
					throw {
						name :		"InvalidDateError",
						message : "the date string [" + dateStr + "] is messed up"
					};
				}
		}

		if(milliseconds !== null){ //caught minutes/hours string, add time to timeOffset
			if(units === null){
				throw {
					name :		"InvalidDateError",
					message : "the date string [" + dateStr + "] is messed up"
				};
			}
			timeOffset += milliseconds * units;
			units = milliseconds = null;
		}

	});

	return timeOffset;
};

/**
 *	remove seonds from time using Math.floor
 *	@param	Date dateObj
 *	@return	Date with seconds set to 00
 *	@see		https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getTime
 */
Plugin.prototype.roundTime = function(dateObj){
	dateObj = dateObj || new Date();
	return new Date(Math.floor(dateObj.getTime()/60000)*60000);
};
