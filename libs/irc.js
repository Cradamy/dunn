var sys = require('util'),
    net = require('net'),
    events = require('events'),
    fs = require('fs'),
    path = require('path'),
    user = require ('./user.js' ),
    channel = require('./channel.js'),
    api = require("./api.js");

var existsSync = fs.existsSync || path.existsSync;

var Server = exports.Server = function (config) {
  this.initialize(config);
};

sys.inherits(Server, events.EventEmitter);

Server.prototype.initialize = function (config) {
  this.existsSync = existsSync;

  //update this as you change the code pls.
  this.majorVersion = "1.0.7";
  this.minorVersion = "469-git";

  this.host = config.host || '127.0.0.1';
  this.port = config.port || 6667;
  this.nick = config.nick || 'DunnBot';
  this.username = config.username || 'DunnBot';
  this.realname = config.realname || 'Powered by #webtech';
  this.command = config.command || '.';
  this.alias = config.alias || '?';
  this.database = config.db || 'dunn';
  this.admins = config.admins || [];
  this.userChannels = config.channels || [];

  this.reconnect = config.autoReconnect || true;
  
  // carry over config object to allow plugins to access it
  this.config = config || {};

  // channel constructor and channel hash
  this.channelObj = channel.Channel;
  this.channels = {};

  // user constructor and user hash
  this.userObj = user.User;
  this.users = {};

  // hook and callback arrays
  this.hooks = [];
  this.triggers = [];
  this.messagehandlers = {};
  this.replies = [];

  this.v2 = new api.Api(this);

  this.connection = null;
  this.buffer = "";
  this.encoding = "utf8";
  this.timeout = 60*60*1000;

  this.debug = config.debug || false;

  this.heap = [];

  /*
   * Hook for User/Channel inits
   */
  if (typeof channel.initialize === "function") {
    channel.initialize(this);
  }
  if (typeof user.initialize === "function") {
    user.initialize(this);
  }

  /*
   * Boot Plugins
   */
  this.plugins = [];
  with(this) {
    config.plugins.forEach(function(plugin) {
      loadPlugin(plugin);
    });
  };

  //Another layer of error reporting, useful until proven otherwise.
  with(this) {
    process.on('uncaughtException', function (error) {
      try {
        sendHeap(error.stack);
      } catch(e) {
        return;
      }
    });
  }
};

Server.prototype.sendHeap = function(err, send) {
  var https = require("https")

  var reqdata = "contents="+encodeURIComponent(err)+"&private=true&language=Plain+Text";

  with(this) {
    var req = https.request({
      host: "www.refheap.com",
      port: 443,
      path: "/api/paste",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": reqdata.length
      }
    }, function(res) {
      res.data = "";

      res.on("data", function(chunk) {
        res.data += chunk;
      }).on("end", function() {
        var data = JSON.parse(res.data);
        if(typeof send != "string") heap.push(data.url);
        else {
          send(send, "Error: "+data.url);
        }
      });
    }).write(reqdata);
  }
};

Server.prototype.connect = function () {
  var c = this.connection = net.createConnection(this.port, this.host);
    c.setEncoding(this.encoding);
    c.setTimeout(this.timeout);

  this.addListener('connect', this.onConnect);
  this.addListener('data', this.onReceive);
  this.addListener('eof', this.onEOF);
  this.addListener('timeout', this.onTimeout);
  this.addListener('close', this.onClose);
};

Server.prototype.disconnect = function (reason, reconnect) {
    if (this.connection.readyState !== 'closed') {
        this.connection.close();
        sys.puts('disconnected (' + reason + ')');

        if((typeof reconnect == "undefined" || reconnect == true) && this.reconnect) {
          with(this) setTimeout(function(){this.connection.connect(this.port, this.host)}, 3000); //reconnect in 3 seconds
        }
    }
};

Server.prototype.onConnect = function () {
  this.raw('NICK', this.nick);
  this.raw('USER', this.username, '0', '*', ':' + this.realname);
  this.emit('connect');
};

Server.prototype.onReceive = function (chunk) {
  this.buffer += chunk;
    while(this.buffer) {
        var offset = this.buffer.indexOf("\r\n");
        if (offset < 0) {
            return;
        }

        var msg = this.buffer.slice(0, offset);
        this.buffer = this.buffer.slice(offset + 2);

        if (this.debug) {
            sys.puts( "< " + msg);
        }

        msg = this.parse(msg);
        this.onMessage(msg);
    }
};

Server.prototype.kick = function(channel, nick, reason) {
  if(typeof channel == "undefined" || typeof nick == "undefined") return;

  if(typeof reason == "undefined") reason = "";
  else reason = " :"+reason;

  this.raw("KICK", channel + " " + nick + reason);
};

Server.prototype.ctcp = function(nick, target, msg, command) {
  msg = msg.slice(1); msg = msg.slice(0, msg.lastIndexOf('\x01'));
  var parts = msg.split(" ");
  this.emit('ctcp', nick, target, msg, command);
  this.emit('ctcp-'+command, nick, target, msg);

  if(command === "PRIVMSG" && msg == "VERSION") {
    var plugins = Object.keys(this.triggers);

    this.raw("NOTICE", nick, ":\x01VERSION DunnBot, running ["+(plugins.join(", "))+"] plugins\x01");
    this.emit("ctcp-version", [nick, target]);
  }
};

Server.prototype.onMessage = function (msg) {
  if (this.debug) {
    sys.puts('++ command: ' + msg.command);
    sys.puts('++ arguments: ' + msg.arguments);
    sys.puts('++ prefix: ' + msg.prefix);
    sys.puts('++ lastarg: ' + msg.lastarg);
  }

  var target = msg.arguments[0], // target
      nick = (this.user(msg.prefix) || '').toLowerCase(), // nick
      user = this.users[nick], // user
      m, // message
      command = msg.command, // command
      users = this.users; // user hash

  switch(true){
    case (command === 'PING'):
      this.raw('PONG', msg.arguments);
      break;

    case (command == "NOTICE"):
      if(msg.arguments[1][0] === "\x01" && msg.arguments[1].lastIndexOf('\x01') > 0) {
        this.ctcp(nick, target, msg.arguments[1], command);
      }
      this.emit("notice", msg);
      break;

    case (command === 'PRIVMSG'):
      if (user) {
          user.update(msg.prefix);
      }

      if(msg.arguments[1][0] === "\x01" && msg.arguments[1].lastIndexOf('\x01') > 0) {
        this.ctcp(nick, target, msg.arguments[1], command);
      }

      // Look for triggers
      var params = msg.arguments[1].split(' '),
          cmd = params.shift();
      
      if (cmd.substring(0, 1) == this.command) {
        
        var trigger = cmd.substring(1);

        if (typeof this.triggers[trigger] != 'undefined') {
          var trig = this.triggers[trigger];

          if(trig.admin) {
            if(this.admins.indexOf(nick.toLowerCase()) == -1) {
              this.send(this.channels[msg.arguments[0]].name.toLowerCase(), nick.toLowerCase() + ": Insufficient permissions");
              return false;
            }
          }

          if (typeof this.channels[msg.arguments[0]] != "undefined") {
            //room message recieved

            try {
              trig.callback.apply(this.plugins[trig.plugin], [this, this.channels[msg.arguments[0]].name.toLowerCase(), nick.toLowerCase(), params, msg.arguments[1], msg.orig]);
            } catch(err) {
              this.sendHeap(err.stack, this.channels[msg.arguments[0]].name.toLowerCase());
              return false;
            }
          } else {
            //PM recieved
          }
        } else if(trigger == "heaps") {
          if(this.heap.length > 0) {
            this.send(this.channels[msg.arguments[0]].name.toLowerCase(), this.heap.join(" "));
            this.heap = [];
          } else {
            this.send(this.channels[msg.arguments[0]].name.toLowerCase(), "No heaps");
          }
        }
      } else {

        var msgHandlers = this.messagehandlers, msgTrigger, key;
 
        for (key in msgHandlers) {

          var msgHandler = msgHandlers[key],
              ttrigger = msgHandler.trigger,
              _msg = msg.arguments[1],
              match = false;

          if (ttrigger instanceof RegExp) {
            match = ttrigger.test(_msg);
          } else {
            match = _msg.toLowerCase().match(ttrigger);
          }

          if (match) {
 
            if (typeof this.channels[msg.arguments[0]] != "undefined") {
              //room message recieved
              try {
                msgHandler.callback.apply(this, [this, this.channels[msg.arguments[0]].name.toLowerCase(), nick.toLowerCase(), match, msg.arguments[1], msg.orig]);
              } catch(err) {
                this.sendHeap(err.stack, this.channels[msg.arguments[0]].name.toLowerCase());
                return false;
              }
            } else {
              //PM recieved
            }
          }
        }
      }

      if (user == this.nick) {
          this.emit('private_message', msg);
      }

      else {
        this.emit('message', msg);
      }

      break;

    case (command === 'JOIN'):
      if (user) {
        user.update(msg.prefix);
        user.join(target);
      }

      else {
          user = this.users[nick] = new this.userObj(this, nick);
          this.raw('NS id ' + this.config.identPass);
      }

      user.join(target);
      this.emit('join', msg);
      break;

    case (command === 'PART'):
      if (user) {
        user.update(msg.prefix);
        user.part(target);
      }

      this.emit('part', msg);
      break;

    case (command === 'QUIT'):
      if (user) {
        user.update(msg.prefix);
        user.quit(msg);
      }

      this.emit('quit', msg);
      break;

    case (command === 'NICK'):
      var oldNick = msg.prefix.split("!")[0].trim().toLowerCase();
      user = this.users[oldNick];

      if (user) {
        user.update(msg.prefix);
        this.users[msg.arguments[0]] = user;
      }

      this.emit('nick', msg, msg.arguments[0], oldNick);
      break;

    case (/^\d+$/.test(command)):
      this.emit('numeric', msg);
      break;
  }

  this.emit(msg.command, msg);
  this.emit('data', msg);
};

Server.prototype.user = function (mask){
    if (!mask) {
        return;
    }
  var match = mask.match(/([^!]+)![^@]+@.+/);

  if (!match ) {
        return;
    }
  return match[1];
};

Server.prototype.parse = function (text) {
  if (typeof text  !== "string") {
    return false;
    }

  var tmp = text.split(" ");

  if (tmp.length < 2) {
    return false;
  }

  var prefix = null,
      command = null,
      lastarg = null,
      args = [];

  for (var i = 0, j = tmp.length; i < j; i++) {
    if (i === 0 && tmp[i].indexOf(":") === 0) {
      prefix = tmp[0].substr(1);
        } else if (tmp[i] === "") {
      continue;
        } else if (!command && tmp[i].indexOf(":") !== 0) {
      command = tmp[i].toUpperCase();
        } else if (tmp[i].indexOf(":") === 0) {
      tmp[i] = tmp[i].substr(1);
      tmp.splice(0, i);
      args.push(tmp.join(" "));
      lastarg = args.length - 1;
      break;
    } else {
      args.push(tmp[i]);
        }
  }

  return {
    prefix: prefix,
    command: command,
    arguments: args,
    lastarg: lastarg,
    orig: text
  };
};

Server.prototype.onEOF = function () {
    this.disconnect('EOF');
};

Server.prototype.onTimeout = function () {
    this.disconnect('timeout');
};

Server.prototype.onClose = function () {
    this.disconnect('close');
};

Server.prototype.raw = function (cmd) {
    if (this.connection.readyState !== "open") {
        return this.disconnect("cannot send with readyState " + this.connection.readyState);
    }

    var msg = Array.prototype.slice.call(arguments, 1).join(' ') + "\r\n";

    if (this.debug) {
        sys.puts('>' + cmd + ' ' + msg);
    }

    this.connection.write(cmd + " " + msg, this.encoding);
};

// public method to send PRIVMSG cleanly
Server.prototype.send = function (target, msg) {
    msg = Array.prototype.slice.call(arguments, 1).join(' ') + "\r\n";

    if (arguments.length > 1) {
        while(msg.length) {
          this.raw('PRIVMSG', target, ':' + msg.substr(0, 440));
          msg = msg.substr(440);
        }
    }
};

Server.prototype.addListener = function (ev, f) {
  var that = this;
  return this.connection.addListener(ev, (function() {
    return function() {
      f.apply(that, arguments);
    };
  })());
};

Server.prototype.addPluginListener = function (plugin, ev, f) {
  if (typeof this.hooks[plugin] == 'undefined') {
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

Server.prototype.unloadPlugin = function (name, q) {
  if((typeof q == "undefined" || q == false) && this.debug) {
    sys.puts( "Unloading plugin " + name);
  }

  if (typeof this.plugins[name] != 'undefined') {
    delete this.plugins[name];

    if (typeof this.hooks[name] != 'undefined') {

      for(var hook in this.hooks[name]) {

        this.removeListener(this.hooks[name][hook].event, this.hooks[name][hook].callback);

      }

    }

    if (typeof this.replies[name] != 'undefined') {

      for(var reply in this.replies[name]) {

        this.removeListener(this.replies[name][reply].event, this.replies[name][reply].callback);

      }

    }

    for(var trig in this.triggers) {

      if (this.triggers[trig].plugin == name) {

        delete this.triggers[trig];

      }

    }

    if(typeof require.cache[path.resolve(__dirname, "../plugins/" + name + ".js")] != "undefined") {
      delete require.cache[path.resolve(__dirname, "../plugins/" + name + ".js")];
    }
  }


};

Server.prototype.loadPlugin = function (name) {
  
  if(this.debug) {
    sys.puts( "Loading plugin " + name);
  }

  this.unloadPlugin(name, true);

  var path = __dirname + '/../plugins/' + name + '.js',
    plugin;
  
  // load plugin
  if (existsSync(path)) {

    // require
    try {
      plugin = require(path);
    } catch(err) {
      this.sendHeap(err.stack);
      return false;
    }
    // invoke
    this.plugins[name] = new plugin.Plugin(this);

    // hooks
    ['connect', 'data', 'numeric', 'message', 'join', 'part', 'quit', 'nick', 'privateMessage'].forEach(function(event) {
      var onEvent = 'on' + event.charAt(0).toUpperCase() + event.substr(1),
        callback = this.plugins[name][onEvent];

      if (typeof callback == 'function') {
        this.addPluginListener(name, event, callback);
      }

    }, this);

    return true;
  }

  // invalid plugin
  else {
    sys.puts("Plugin not found: " + name);
    return false;
  }

};

Server.prototype.addTrigger = function (trigger, callback, admin) {
  if (typeof this.triggers[trigger] == 'undefined') {
    if(typeof admin == "undefined") admin = 0;
    admin = parseInt(admin);
    this.triggers[trigger] = { plugin: trigger, callback: callback, admin: admin};
  }
};

Server.prototype.addMessageHandler = function (trigger, callback) {
  // we can convert the callback into a str for a unique id
  var keyFromFn = function(f) {
    var strf = f.toString().replace(/\s+/, '');
    return strf.slice(-25) + String(trigger);
  };

  var key = keyFromFn(callback); // same trigger, multiple cbs? no problem

  if(typeof this.messagehandlers[key] == 'undefined') {
    this.messagehandlers[key] = {trigger: trigger, callback: callback};
  }

};

process.on('uncaughtException', function (error) {
  console.error(error.stack); //prevents from crashing
});
