/*
 * @Plugin        Info
 * @Description   Gathers plugin info
 * @Trigger       .info
 * @Trigger       .info-reparse
 *
 * @Author        buttcactus (Aaron Ahmed)
 * @Website       http://www.digitalkitsune.net
 * @Copyright     Digital-Kitsune 2012
 *
 */

Plugin = exports.Plugin = function (irc) {
  irc.addTrigger('info', this.pull);
  irc.addTrigger('info', this.parsePlugins);
  this.plugins = {};
  this.pluginsRaw = {};
};

Plugin.prototype.parsePlugins = (irc, channel, nick, params, message) {
	var fs = require("fs");
	var files = fs.readdirSync(__dirname);

	for (var i = 0; i < files.length; i++) {
		var file = fs.readFileSync(files[i]).toString();
		var lines = file.split("\n");
		var pluginT = {};
		for(var x = 0; x < lines.length; x++) {
			var line = lines[x];
			if(line.indexOf("*/") !== -1 || line.indexOf("*") == -1) {
				x = lines.length+1;
			} else {
				var tag = "";
				// switch(true) {
				// 	case line.toLowerCase().indexOf("@plugin") > -1:
				// 		tag = "@plugin";
				// 	break;
				// 	case line.toLowerCase().indexOf("@description") > -1:
				// 		tag = "@description";
				// 	break;
				// 	case line.toLowerCase().indexOf("@trigger") > -1:
				// 		tag = "@trigger";
				// 	break;
				// 	case line.toLowerCase().indexOf("@author") > -1:
				// 		tag = "@author";
				// 	break;
				// 	case line.toLowerCase().indexOf("@website") > -1:
				// 		tag = "@website";
				// 	break;
				// 	case line.toLowerCase().indexOf("@copyright") > -1:
				// 		tag = "@copyright";
				// 	break;
				// }

				if(line.toLowerCase().indexOf("@") > -1) {
					tag = "@"+line.substr(line.indexOf("@")+1, line.substr(line.indexOf("@")).indexOf(" ")).toLowerCase();
				}

				if(tag.length) {
					if(tag == "@trigger") {
						this.plugins[line.substr(line.toLowerCase().indexOf(tag)+tag.length+1).trim()] = files[i].split(".")[0];
						
						if(typeof pluginT["triggers"] == "undefined") {
							pluginT["triggers"] = [];
						}
						pluginT["triggers"].push(line.substr(line.toLowerCase().indexOf(tag)+tag.length+1).trim());
					} else {
						pluginT[tag.substr(1)] = line.substr(line.toLowerCase().indexOf(tag)+tag.length+1).trim();
					}
				}
			}
		}

		if(pluginT["triggers"] && pluginT["triggers"].length == 1) {
			pluginT["triggers"] = pluginT["triggers"][0];
		}
		this.pluginsRaw[files[i].split(".")[0]] = pluginT;
	};
}

Plugin.prototype.pull = function(irc, channel, nick, params, message) {
	if(this.plugins.length == 0) {
		this.parsePlugins();
	}

	if(params.length == 0) {
		irc.send(channel, "Usage: .info plugin");
	} else {
		var plugin = 0;
		params = params.join(" ");
		if(typeof this.plugins[params] != "undefined") {
			plugin = this.pluginsRaw[this.plugins[params]];
		} if(typeof this.plugins["."+params] != "undefined") {
			plugin = this.pluginsRaw[this.plugins[params]];
		} else if(typeof this.pluginsRaw[params] != "undefined") {
			plugin = this.pluginsRaw[params];
		} else {
			irc.send(channel, "No such plugin");
			return;
		}

		if(plugin) {
			message = "";
			for(var key in plugin) {
				var content = plugin[key];
				if(typeof content != "string") content = content.join(", ");
				message += key + ": "+content+" ";
			}
			irc.send(channel, message.trim());
		}
	}
}