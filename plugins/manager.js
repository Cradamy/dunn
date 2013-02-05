/*
 * @Plugin        Manager
 * @Description   Manages Dunn (Adds/removes admins, changes command string, loads/unloads plugins, exits)
 * @Trigger       .manager
 *
 * @Author        Shirokuma
 * @Website       http://digitlakitsune.net/
 * @Copyright     POLAR BEAR COLLECTIVE / DIGITAL KITSUNE 2012-2013
 *
 */

Plugin = exports.Plugin = function (irc) {
  irc.addTrigger('manager', this.manager, 1);
};

Plugin.prototype.manager = function (irc, channel, nick, params, message) {
	if(typeof params[0] == "undefined") return irc.send(channel, "Usage: "+irc.command+"manager <edit|load|unload|restart>");

	params.forEach(function(p) {
		p = p.toLowerCase();
	});

	switch(true) {
		case params[0].indexOf("edit") > -1:
			if(typeof params[1] == "undefined") return irc.send(channel, "Usage: "+irc.command+"manager edit <admins|command>");
			switch(true) {
				case params[1].indexOf("admins") > -1:
					if(typeof params[2] == "undefined") return irc.send(channel, "Usage: "+irc.command+"manager edit admins <add|remove> nick");
					switch(true) {
						case params[2].indexOf("add") > -1:
							if(typeof params[3] == "undefined") return irc.send(channel, "Usage: "+irc.command+"manager edit admin add <nick>");
							irc.admins.push(params[3].trim().toLowerCase());
						break;

						case params[2].indexOf("rm") > -1:
						case params[2].indexOf("remove") > -1:
							if(typeof params[3] == "undefined") return irc.send(channel, "Usage: "+irc.command+"manager edit admin remove <nick>");
							var admins = [];
							while(irc.admins.length) {
								var admin = irc.admins.shift();
								if(admin.toLowerCase() != params[3].trim().toLowerCase()) admins.push(admin);
							}
							irc.admins = admins;
						break;

						default:
							return irc.send(channel, "Usage: "+irc.command+"manager edit admins <add|remove> nick");
						break;
					}
				break;

				case params[1].indexOf("command") > -1:
					if(typeof params[2] == "undefined") return irc.send(channel, "Usage: "+irc.command+"manager edit command <c>");
					irc.command = params[2].trim()[0];
					irc.send(channel, "New command is "+irc.command);
				break;

				default:
					return irc.send(channel, "Usage: "+irc.command+"manager edit <admins|command>");
				break;
			}
		break;

		case params[0].indexOf("load") > -1:
			if(typeof params[1] == "undefined") return irc.send(channel, "Usage: "+irc.command+"manager load <pluginName>");
			if(irc.existsSync(__dirname + "/" + params[1].trim().toLowerCase()) + ".js") {
				irc.send(channel, "Loading plugin "+params[1].trim());
				irc.loadPlugin(params[1].trim().toLowerCase());
			}
			else irc.send(channel, "Plugin "+params[1].trim()+" doesn't exist.");
		break;

		case params[0].indexOf("unload") > -1:
			if(typeof params[1] == "undefined") return irc.send(channel, "Usage: "+irc.command+"manager load <pluginName>");
			if(irc.existsSync(__dirname + "/" + params[1].trim().toLowerCase()) + ".js") {
				irc.send(channel, "Unloading plugin "+params[1].trim());
				irc.unloadPlugin(params[1].trim().toLowerCase());
			}
			else irc.send(channel, "Plugin "+params[1].trim()+" doesn't exist.");
		break;

		case params[0].indexOf("exit") > -1:
			process.exit();
		break;

		default: 
			return irc.send(channel, "Usage: "+irc.command+"manager <edit|load|unload|exit>");
		break;
	}
};