#!/usr/bin/env node

/*
 * @Name          Sandbunn
 * @Description   A sandbox simulator for dunn, creates a safe-sandbox offline enviornment for dunn plugin making
 *
 * @Author        polar-bear
 * @Website       http://www.polarbearcollective.com
 * @Copyright     DIGITAL KITSUNE 2012
 *
 *    WIP WIP WIP WIP WIP WIP WIP WIP WIP WIP WIP WIP WIP WIP WIP WIP WIP WIP WIP WIP WIP WIP WIP WIP WIP WIP WIP 
 *
 */

var program = require("commander"),
	fs = require("fs"),
	sys = require("sys"),
	events = require("events");

program.version("1.0.0").
		usage("[options] <plugins ...>").
		option("-l, --load", "Load all plugins").
		option("-x, --exclude <plugins>", "Exclude plugins from loading", function(value) {
			return value.split(",");
		}).
		option("-d, --directory", "Plugin directory").
		option("-c, --command", "Plugin command").
		option("-D, --db", "Database name").
		parse(process.argv);

console.log("Initializing Sandbunn");
var irc = {
	host: "sandbox",
	port: 6667,
	nick: "Sandbunn",
	username: "SandBunn",
	realname: "Dunn, in the dunes, making sandcastles",
	command: program.command || ".",
	alias: "Dunn",
	database: program.db || "dunn",
	admins: ["shirokuma", "penguin", "panda"],
	userChannels: ["#sandbox", "#webtech"],
	config: {},
	hooks: [],
	triggers: [],
	plugins: [],
	messagehandlers: [],
	replies: [],
	connection: null,
	buffer: "",
	encoding: "utf8",
	timeout: 60*60*1000,
	heap: []
}
sys.inherits(irc, events.EventEmmiter);

console.log("Loading plugins");
if(program.load) {
	var xPlugins = fs.readdirSync(__dirname + "/plugins/");
	while(xPlugins.length) {
		var xPlugin = xPlugins.shift(),
			ext = xPlugin.split("."); ext = ext[ext.length-1];

		if(ext.toLowerCase() == "js") {
			if(program.exclude && program.exclude.indexOf(xPlugin) == -1) {
				var xP = require(__dirname + "/plugins/" + xPlugin), name = xPlugin.replace(".js", "");
				irc.plugins[name] = xP;

				['connect', 'data', 'numeric', 'message', 'join', 'part', 'quit', 'nick', 'privateMessage'].forEach(function(event) {
					var onEvent = 'on' + event.charAt(0).toUpperCase() + event.substr(1),
					callback = this.plugins[name][onEvent];

					if (typeof callback == 'function') {
						this.addPluginListener(name, event, callback);
					}
				}, irc);
			}
		}
	}
}

irc.onMessage = function(msg) {
	var target = msg.arguments[0],
		nick = (this.user(msg.prefix) || '').toLowerCase(),
		user = sandbunn.user,
		m,
		command = msg.command,
		users = sandbunn.users;
}

irc.addPluginListener = function (plugin, ev, f) {
	if(typeof this.hooks[plugin] == 'undefined') {
		this.hooks[plugin] = [];
	}

	var scope = this.plugins[plugin];

	var callback = (function() {
		return function() {
			f.apply(scope, arguments);
		};
	})();

	this.hooks[plugin].push({event: ev, callback: callback});

	return this.on(ev, callback);
};
