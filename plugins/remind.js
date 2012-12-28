/*
 * @Plugin        Remind
 * @Description   .remind [me] [to] MESSAGE in X {minutes, hours} [and X {minutes, hours}]
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
		trigger =		'remind';

		
Plugin = exports.Plugin = function (irc) {
  irc.addTrigger(trigger, this.remind);
  this.irc = irc;
  this.db = mongodb.connect(irc.database);
	this.collection = this.db.collection('reminders');
};

/**
 * setup interval to check for messages each minute
 */
Plugin.prototype.onConnect = function(){
	//set interval
	var boundFAS = this.fetchAndSend.bind(this); //setInterval loses context
	this.interval = setInterval(boundFAS,10000);//every TEN seconds
};

/**
 * clear interval on quit/part
 */
Plugin.prototype.onQuit = Plugin.prototype.onPart = function(){
	clearInterval(this.interval);
};

Plugin.prototype.fetchAndSend = function(){
	//check for messages
	var that = this;
	this.collection.find({time: { $lt : new Date() } }).forEach(function(err, doc){
		//send if found
		if( null !== doc ){
			that.irc.send(doc.channel, doc.nick + ': ' + doc.message);
			//remove
			that.collection.remove( { _id : doc._id } );
		}
	});
};

/**
 * main function, triggered by `trigger`
 */
Plugin.prototype.remind = function (irc, channel, nick, params, message) {
	if(message.length === irc.command.length+trigger.length){
		//just `.remind`: send usage message
		irc.send(channel,'remind plugin usage: "'+irc.command+trigger+' [me to] check the dumplings in 1 hour [and 10 minutes]".  hours & minutes supported');
		return false;
	}
	try {
	//strip the command/trigger ('.remind me to asdf in..' -> 'me to asdf in..') 
	var prefixLen = (irc.command.length+trigger.length+1);
	message = message.substr(prefixLen);

	//get time string and message
	var parts = this.parseMsg(message);

	//create date for storage
	var timeOffset = this.parseDateStr(parts.timeStr);
	var futureTimestamp = new Date().getTime() + timeOffset;
	
	//add entry 
	this.collection.save({
		nick		:	nick,
		channel	:	channel,
		message	:	parts.contents,
		time		:	new Date(futureTimestamp),
		created	: new Date()
	});
	
	//send confirmation
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
