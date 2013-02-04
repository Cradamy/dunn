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
  sys = require("util"),
  events = require("events");

program.version("1.0.0").
  usage("[options] <plugins ...>").
  option("-l, --load", "Load all plugins").
  option("-x, --exclude <plugins>", "Exclude plugins from loading", function(value) {
    return value.split(",");
  }).
  option("-d, --directory", "Plugin directory").
  option("-c, --cmd", "Plugin command").
  option("-D, --db", "Database name").
  parse(process.argv);

console.log("Initializing Sandbunn");

var ircServer = function(program) {
  this.init(program);
};

sys.inherits(ircServer, events.EventEmitter);

ircServer.prototype.init = function(program) {
  this.host = "sandbox";
  this.port = 6667;
  this.nick = "Sandbunn";
  this.username = "SandBunn";
  this.realname = "Dunn, in the dunes, making sandcastles";
  this.command = program.cmd || ".";
  this.alias = "Dunn";
  this.database = program.db || "dunn";
  this.admins = ["shirokuma", "penguin", "panda"];
  this.userChannels = ["#sandbox", "#webtech"];
  this.config = {};
  this.hooks = [];
  this.triggers = [];
  this.plugins = [];
  this.messagehandlers = {};
  this.replies = [];
  this.connection = null;
  this.buffer = "";
  this.encoding = "utf8";
  this.timeout = 60*60*1000;
  this.heap = [];
}

var sandbunn = {
  user: "nobody",
  channel: null,

}

ircServer.prototype.user = function(/**/) {
  return sandbunn.user;
}

ircServer.prototype.onMessage = function(msg) {

  var msgs = msg.split(" ");
  var argm = {
    prefix: "",
    command: "",
    arguments: [],
    lastarg: "",
    orig: ""
  };
  argm.arguments.push(sandbunn.channel);
  while(msgs.length) argm.arguments.push(msgs.shift());
  msgs = msg.split(" ");

  var msghandlers = Object.keys(this.messagehandlers).filter(function(val) {
    return val.indexOf(msg) == 0;
  });

  if(msgs[0][0] == "#") {
    if(msgs[0][1] == ".") {
        var cmd = msgs[0].substr(2);
        switch(cmd) {
          case "chusr": 
            sandbunn.user = msgs[1];
            this.send(sandbunn.channel, "Changed user", sandbunn.user)
          break;

          case "chchnl":
            sandbunn.channel = "#" + (msgs[1].replace("#", ""));
            this.send(sandbunn.channel, "Changed channel", sandbunn.user)
          break;

          case "this":
            console.log(this);
          break;

          case "exit":
            process.exit(0);
          break;
        }
    } else if(msgs[0][1] == "!") {
      this.emit(msgs[0].substr(2), msgs.splice(1).join(" "));
    }
  } else if(msgs[0].indexOf(this.command) == 0) {
    var trigger = msgs[0].replace(this.command, "");

    if(typeof this.triggers[trigger] != "undefined") {
      var trig = this.triggers[trigger];

      if(trig.admin) {
        if(this.admins.indexOf(sandbunn.user) == -1) {
          this.send(sandbunn.channel, sandbunn.user + ": Insufficient permissions");
          return false;
        }
      }

     trig.callback.apply(this.plugins[trig.plugin], [this, sandbunn.channel, sandbunn.user, msgs.splice(1), argm, msg]); 
    }
  } else if(msghandlers.length > 0) {
    msghandlers.forEach(function(h) {
      var ha = this.messagehandlers[h];

      ha.callback.apply(this.plugins[ha.plugin], [this, sandbunn.channel, sandbunn.user, msgs.splice(1), argm, msg]);
    }, this);
  }

  this.emit("message", argm);
}

ircServer.prototype.send = function(t, m, u) {
  console.log((u || this.nick) + "@" + t + " >>> " + m);
}

ircServer.prototype.addPluginListener = function (plugin, ev, f) {
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



ircServer.prototype.addTrigger = function(trigger, callback, admin) {
  if(typeof this.triggers[trigger] == 'undefined') {
    if(typeof admin == "undefined") admin = 0;
    admin = parseInt(admin);
    this.triggers[trigger] = {plugin: trigger, callback: callback, admin: admin};
  }
};

ircServer.prototype.addMessageHandler = function(trigger, callback) {
  if(typeof this.messagehandlers[trigger] == 'undefined') {
    this.messagehandlers[trigger] = {plugin: trigger, callback: callback};
  }
};


ircServer.prototype.load = function(name) {
  var xP = require(__dirname + "/plugins/" + name), name = name.replace(".js", "");
  irc.plugins[name] = new xP.Plugin(this);

  ['connect', 'data', 'numeric', 'message', 'join', 'part', 'quit', 'nick', 'privateMessage'].forEach(function(event) {
    var onEvent = 'on' + event.charAt(0).toUpperCase() + event.substr(1),
    callback = this.plugins[name][onEvent];
    if (typeof callback == 'function') {
      this.addPluginListener(name, event, callback);
    }
  }, this);
}

var irc = new ircServer(program);
sandbunn.user = irc.admins[0] || "shirokuma";
sandbunn.channel = irc.userChannels[0] || "ohshitiforgottoaddachannel";

console.log("Loading plugins");
if(program.load) {
  var xPlugins = fs.readdirSync(__dirname + "/plugins/");
  while(xPlugins.length) {
    var xPlugin = xPlugins.shift(),
      ext = xPlugin.split("."); ext = ext[ext.length-1];

    if(ext.toLowerCase() == "js") {
      if(typeof program.exclude != "undefined" && program.exclude.indexOf(xPlugin) > -1) {
        continue;
      }
      console.log("  ->  " + xPlugin.replace(".js", ""));
      irc.load(xPlugin);
    }
  }
} else {
  while(program.args.length) {
    var name = program.args.shift();
    console.log("  ->  " + name);
    irc.load(name + ".js");
  }
}

sandbunn.requestInput = function() {
  program.prompt(sandbunn.user + "@" + sandbunn.channel + ": ", function(v) {
    irc.onMessage(v)
    sandbunn.requestInput();
  });
}

console.log("Root commands are #.chusr - change user, #.chchnl - change channel, #.this - prints this, #.exit - exits, #[EVENT] emits an event with msg");
sandbunn.requestInput();

process.on('uncaughtException', function(e) {
  console.error(e);
});