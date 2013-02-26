try {
	var mongojs = require("mongojs").connect;
} catch(e) {
	var mongojs;
}

var self;
var Api = exports.Api = function(irc) {
	this.boot(irc);
};

Api.prototype.Error = function (msg) {
	throw new Error(msg);
};

Api.prototype.boot = function(irc) {
	this.irc = irc;
	this.mongo = mongojs(irc.database);

	self = this;
	irc.on("ctcp", this.event.ctcp);
	irc.on("notice", this.event.notice);
	irc.on("private_message", this.event.pm);
	irc.on("message", this.event.message);
	irc.on("join", this.event.join);
	irc.on("part", this.event.part);
	irc.on("quit", this.event.quit);
	irc.on("nick", this.event.nick);
	irc.on("connect", this.event.connect);
	irc.on("data", this.event.data);
};

Api.prototype.env = {
	triggers: {},
	message: {},
	pm: {},
	hooks: {
		ctcp: {},
		notice: {},
		pm: {},
		message: {},
		join: {},
		part: {},
		nick: {},
		connect: {},
		data: {}
	},
	miqqiayuuq: function(/**/) {
		//Don't even ask.
		return ((parseInt((0x82030e59cc2b2*0x004189374bc6a7f).toString().substr(0, 7), 36) * 7) / parseInt(self.toString(), 36)).toString(36).split(".")[1];
	}
};

Api.prototype.hook = function(evt /**/) {
	var args = Array.prototype.slice.call(arguments, 1);

	switch(evt) {
		case "ctcp":

		break;

		case "notice":

		break;

		case "pm":

		break;

		case "message":

		break;
		
		case "join":

		break;

		case "part":

		break;

		case "nick":

		break;

		case "connect":

		break;

		case "data":

		break;
	}
};

Api.prototype.event = {
	ctcp: function(/**/) {
		self.hook("ctcp", Array.prototype.slice.call(arguments));
	},
	notice: function(/**/) {
		self.hook("notice", Array.prototype.slice.call(arguments));
	},
	pm: function(/**/) {
		self.hook("pm", Array.prototype.slice.call(arguments));
	},
	message: function(/**/) {
		self.hook("message", Array.prototype.slice.call(arguments));
	},
	join: function(/**/) {
		self.hook("join", Array.prototype.slice.call(arguments));
	},
	part: function(/**/) {
		self.hook("part", Array.prototype.slice.call(arguments));
	},
	quit: function(/**/) {
		self.hook("quit", Array.prototype.slice.call(arguments));
	},
	nick: function(/**/) {
		self.hook("nick", Array.prototype.slice.call(arguments));
	},
	connect: function(/**/) {
		self.hook("connect", Array.prototype.slice.call(arguments));
	},
	data: function(/**/) {
		self.hook("data", Array.prototype.slice.call(arguments));
	},
};

Api.prototype.add =  {
	trigger: function(cmd, admin /**/) {
		var args = Array.prototype.slice.call(arguments, 2);
		if(typeof self.env.triggers[cmd] != "undefined") self.Error("The trigger "+trigger.toString()+" already exists.");
		self.env.triggers[cmd] = {trigger: cmd, admin: admin, callbacks: args};
		return true;
	},
	message: function(match, admin /**/) {
		var args = Array.prototype.slice.call(arguments, 2);
		if(typeof self.env.message[match] != "undefined") self.Error("A message handler with the match: "+message.toString()+" already exists.");
		self.env.message[match] = {match: match, admin: admin, callbacks: args};
		return true;
	},
	pm: function(pmID, admin /**/) {
		var args = Array.prototype.slice.call(arguments, 2);
		if(typeof self.env.pm[pmID] != "undefined") self.Error("A PM interceptor with the id: "+pmID+" already exists.");
		self.env.pm[pmID] = {id: pmID, admin: admin, callbacks: args};
		return true;
	},
	hook: function(pluginID, evt /**/) {
		var args = Array.prototype.slice.call(arguments, 2);
		if(evt.substr(0, 2).toLowerCase() == "on") evt = evt.substr(2);
		if(typeof self.env.hooks[evt] == "undefined") self.error("Event "+evt+"does not exist");
		if(typeof self.env.hooks[evt][pluginID] != "undefined") self.error("There is already an event with the ID "+pluginID);
		self.env.hooks[evt][pluginID] = {id: pluginID, callbacks: args};
		return true;
	}
};

Api.prototype.on = Api.prototype.bind = Api.prototype.addListener = Api.prototype.add.hook;

Api.prototype.remove = Api.prototype.rm = {
	trigger: function(/**/) {
		var args = Array.prototype.slice.call(arguments);
		while(args.length) {
			var arg = args.shift();
			delete self.env.triggers[arg];
		}
	},
	message: function(/**/) {
		var args = Array.prototype.slice.call(arguments);
		while(args.length) {
			var arg = args.shift();
			delete self.env.message[arg];
		}
	},
	pm: function(/**/) {
		var args = Array.prototype.slice.call(arguments);
		while(args.length) {
			var arg = args.shift();
			delete self.env.pm[arg];
		}
	},
	hook: function(/**/) {
		var args = Array.prototype.slice.call(arguments);
		while(args.length) {
			var arg = args.shift();
			try {
				delete self.env.hook[arg[0]][arg[1]];
			} catch(e) {
				//
			}
		}
	}
};

Api.prototype.unbind = Api.prototype.removeListener = Api.prototype.rm.hook;


Api.prototype.requestDB = Api.prototype.database = function(/**/) {
	if(mongojs) { //Rather than open 10 connections for 10 plugins, open one connection and keep requesting collections.
		var c = Array.prototype.slice.call(arguments);
		while(c.length) self.mongo.collection(c.shift());
		return self.mongo;
	}

	else return null;
};

Api.prototype.configAgent = function(i, d) {
	var recursive = function (k, v) {
		var o = Object.keys(v);

		while(o.length) {
			if(typeof v[oo] == "object") k[oo] = recursive(k[oo] || v[oo], v[oo]);
			else k[oo] = k[oo] || v[oo];
		}

		return k;
	};

	return recursive(self.irc.config[i], d);
};

Api.prototype.send = function(channel /**/) {
	var args = Array.prototype.slice.call(arguments, 1);
	while(args.length) {
		var arg = args.shift();
		while(arg.length) {
			self.irc.send(channel, arg.substr(0, 440));
			arg = arg.substr(440);
		}
	}
};

Api.prototype.users = function(channel) {
	var users = Object.keys(irc.users), channelUsers = [];
	while(users.length) {
		var user = users.shift();
		if(user.channels.filter(function(v) {
			return v.replace("#", "").toLowerCase().trim() == channel.replace("#", "").toLowerCase().trim();
		}).length > 0) channelUsers += user;
	}
	return channelUsers;
};

Api.prototype.kick = function(channel, nick, reason) {
	self.irc.kick(channel, nick, reason);
};

Api.prototype.join = function(channel, password) {
	if(typeof self.irc.channels[channel] == "undefined") {
		self.irc.channels[channel] = new self.irc.channelObj(self.irc, channel, true, password);
	} else {
		self.irc.channels[channel].join();
	}
};

Api.prototype.part = function(channel, reason) {
	if(typeof self.irc.channels[channel] != "undefined") {
		self.irc.channels[channel].part(reason);
	}
};

Api.prototype.topic = function(channel /**/) {
	var args = Array.prototype.slice.call(arguments, 1);

	self.irc.raw("TOPIC", channel, args.join(" "));
};
var blake2 = require("./blake2.js");
Api.prototype.hash = function(str, key) {
	var b = new blake2("", key.substr(0, 31));
	b.update(str);
	return b.hexDigest();
};
