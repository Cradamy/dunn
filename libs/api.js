try {
	var mongo = require("mongojs");
} catch(e) {
	var mongo = undefined;
}

var self = undefined;
Api = exports.Api = function(irc) {
	this.irc = irc;

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
	hooks: {}
};

Api.prototype.hook = function(evt /**/) {
	var args = Array.prototype.slice.call(arguments).splice(1);
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
	trigger: function(cmd /**/) {
		var args = Array.prototype.slice.call(arguments).splice(1);
	}, 
	message: function(match /**/) {
		var args = Array.prototype.slice.call(arguments).splice(1);
	},
	pm: function(pmID /**/) {
		var args = Array.prototype.slice.call(arguments).splice(1);
	},
	hook: function(evt, pluginID /**/) {
		var args = Array.prototype.slice.call(arguments).splice(2);

	}
};

Api.prototype.rm = {
	trigger: function(/**/) {

	},
	message: function(/**/) {

	},
	pm: function(/**/) {

	},
	hook: function(/**/) {

	}
};


Api.prototype.plugin = {
	clear: function(/**/) {

	},
	reload: function(/**/) {

	}
};

Api.prototype.invoke = {
	trigger: function(/**/) {

	},
	message: function(/**/) {

	},
	pm: function(/**/) {

	},
	hook: function(/**/) {

	}
};

Api.prototype.requestDB = function(/**/) {
	if(mongo) return mongo(self.irc.database, Array.prototype.slice.call(arguments));
	else return null;
};

Api.prototype.send = function(channel /**/) {
	var args = Array.prototype.slice.call(arguments).splice(1);
	while(args.length) {
		var arg = args.shift();
		while(arg.length) {
			self.irc.send(channel, arg.substr(0, 440));
			arg = arg.substr(440);
		}
	}
};

Api.prototype.users = function(channel) {

}

Api.prototype.kick = function(channel, nick, reason) {

}

Api.prototype.topic = function(channel /**/) {
	var args = Array.prototype.slice.call(arguments).splice(1);

}
