var sys = require('util'),
    net = require('net'),
    events = require('events'),
    fs = require('fs'),
    path = require('path'),
    user = require ('./user' ),
    channel = require('./channel'),
    https = require('https'),
    httpGet = require('./httpget'),
    validjson = require('./validjson'),
    api = require("./api");

var existsSync = fs.existsSync || path.existsSync;

var self = this;

var Server = exports.Server = function (config) {
  this.initialize(config);
};

sys.inherits(Server, events.EventEmitter);

Server.prototype.initialize = function (config) {
  this.existsSync = existsSync;

  //update this as you change the code pls.
  this.majorVersion = "1.0.7";
  this.minorVersion = "470a-git";

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
  this.httpGet = httpGet;
  this.isValidJson = validjson;
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

  //this.v2 = new api.Api(this);

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
  var self = this;
  config.plugins.forEach(function (plugin) {
    self.loadPlugin(plugin);
  });
};

Server.prototype.sendHeap = function (err, send) {
  var self = this;
  var reqdata = "contents=" + encodeURIComponent(err) + "&private=true&language=Plain+Text";
  var req = https.request({
    host: "www.refheap.com",
    port: 443,
    path: "/api/paste",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": reqdata.length
    }
  }, function (res) {
    res.data = "";
    res.on("data", function (chunk) {
      res.data += chunk;
    }).on("end", function () {
      var jsonGet = self.isValidJson(res.data, function (err, data) {
        if (!err && data) {
          if (typeof send !== "string") {
            self.heap.push(data.url);
          } else {
            self.send(send, "Error: " + data.url);
          }
        } else if (typeof send === 'string') {
          self.send(send, (err || 'Error getting data from refheap'));
        } else {
          self.heap.push((err || 'Error getting data from refheap'));
        }
      });
    });
  }).write(reqdata);
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
        if ((!reconnect || reconnect === true) && this.reconnect) {
          var port = this.port,
              host = this.host,
              conn = this.connection,
              reConnect = function () {
                conn.connect(port, host);
              };
          setTimeout(reConnect, 3000); //reconnect in 3 seconds;
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

Server.prototype.kick = function (channel, nick, reason) {
  if (!channel || !nick)  {
    return;
  }
  var kick = (reason) ? ' :' + reason : '';
  this.raw("KICK", channel + " " + nick + kick);
};

Server.prototype.ctcp = function (nick, target, msg, command) {
  msg = msg.slice(1); msg = msg.slice(0, msg.lastIndexOf('\x01'));
  var parts = msg.split(" ");
  this.emit('ctcp', nick, target, msg, command);
  this.emit('ctcp-' + command, nick, target, msg);

  if (command === "PRIVMSG" && msg === "VERSION") {
    var plugins = Object.keys(this.triggers);
    this.raw("NOTICE", nick, ":\x01VERSION DunnBot, running [" + (plugins.join(", ")) + "] plugins\x01");
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
      users = this.users, // user hash
      self = this,
      commands = {
        'PING': function () {
          self.raw('PONG', msg.arguments);
        },
        'NOTICE': function () {
          if (msg.arguments[1][0] === "\x01" && msg.arguments[1].lastIndexOf('\x01') > 0) {
            self.ctcp(nick, target, msg.arguments[1], command);
          }
          self.emit("notice", msg);
        },
        'PRIVMSG': function () {
          if (user) {
            user.update(msg.prefix);
          }
          if (msg.arguments[1][0] === "\x01" && msg.arguments[1].lastIndexOf('\x01') > 0) {
            self.ctcp(nick, target, msg.arguments[1], command);
          }

          // Look for triggers
          var params = msg.arguments[1].split(' '),
              cmd = params.shift();
          
          if (cmd.substring(0, 1) === self.command) {
            
            var trigger = cmd.substring(1);

            if (self.triggers[trigger]) {
              var trig = self.triggers[trigger];

              if (trig.admin) {
                if (self.admins.indexOf(nick.toLowerCase()) === -1) {
                  self.send(self.channels[msg.arguments[0]].name.toLowerCase(), nick.toLowerCase() + ": Insufficient permissions");
                  return false;
                }
              }

              if (self.channels[msg.arguments[0]]) {
                //room message recieved
                try {
                  trig.callback.apply(self.plugins[trig.plugin], [self, self.channels[msg.arguments[0]].name.toLowerCase(), nick.toLowerCase(), params, msg.arguments[1], msg.orig]);
                } catch(err) {
                  self.sendHeap(err.stack, self.channels[msg.arguments[0]].name.toLowerCase());
                }
              } else {
                //PM recieved
                try {
                  trig.callback.apply(self.plugins[trig.plugin], [self, nick.toLowerCase(), nick.toLowerCase(), params, msg.arguments[1], msg.orig]);
                } catch(err) {
                  self.sendHeap(err.stack, self.channels[msg.arguments[0]].name.toLowerCase());
                }
              }
            } else if (trigger === "heaps") {
              if (self.heap.length > 0) {
                self.send(self.channels[msg.arguments[0]].name.toLowerCase(), self.heap.join(" "));
                self.heap = [];
              } else {
                self.send(self.channels[msg.arguments[0]].name.toLowerCase(), "No heaps");
              }
            }
          } else {

            var msgHandlers = self.messagehandlers, msgTrigger, key;
     
            for (key in msgHandlers) {
              var msgHandler = msgHandlers[key],
                  ttrigger = msgHandler.trigger,
                  _msg = msg.arguments[1],
                  match = (ttrigger instanceof RegExp) ? ttrigger.test(_msg) : _msg.toLowerCase().match(ttrigger);
              if (match) {
                try {
                  if (self.channels[msg.arguments[0]]) {
                    //room message recieved
                      msgHandler.callback.apply(self, [self, self.channels[msg.arguments[0]].name.toLowerCase(), nick.toLowerCase(), match, msg.arguments[1], msg.orig]);
                  } else {
                    //PM recieved
                    msgHandler.callback.apply(self, [self, nick.toLowerCase(), nick.toLowerCase(), match, msg.arguments[1], msg.orig]);
                  }
                } catch (err) {
                  self.sendHeap(err.stack, self.channels[msg.arguments[0]].name.toLowerCase());
                }
              }
            }
          }

          if (user === self.nick) {
            self.emit('private_message', msg);
          } else {
            self.emit('message', msg);
          }
        },
        'JOIN': function () {
          if (user) {
            user.update(msg.prefix);
            user.join(target);
          } else {
            user = self.users[nick] = new self.userObj(self, nick);
            self.raw('NS id ' + self.config.identPass);
          }

          user.join(target);
          self.emit('join', msg);
        },
        'PART': function () {
          if (user) {
            user.update(msg.prefix);
            user.part(target);
          }

          self.emit('part', msg);
        },
        'QUIT': function () {
          if (user) {
            user.update(msg.prefix);
            user.quit(msg);
          }

          self.emit('quit', msg);
        },
        'NICK': function () {
          var oldNick = msg.prefix.split("!")[0].trim().toLowerCase();
          user = self.users[oldNick];

          if (user) {
            user.update(msg.prefix);
            self.users[msg.arguments[0]] = user;
          }

          self.emit('nick', msg, msg.arguments[0], oldNick);
        }

      };
  if (typeof(commands[command]) === 'function') {
    commands[command]();
  } else if (/^\d+$/.test(command)) {
    this.emit('numeric', msg);
  }
};

Server.prototype.user = function (mask){
  if (!mask) {
    return;
  }
  var match = mask.match(/([^!]+)![^@]+@.+/);

  if (!match) {
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
  return this.connection.addListener(ev, (function () {
    return function () {
      f.apply(that, arguments);
    };
  })());
};

Server.prototype.addPluginListener = function (plugin, ev, f) {
  if (!this.hooks[plugin]) {
    this.hooks[plugin] = [];
  }
  var scope = this.plugins[plugin];
  var callback = (function () {
    return function () {
      f.apply(scope, arguments);
    };
  })();
  this.hooks[plugin].push({event: ev, callback: callback});
  return this.on(ev, callback);
};

Server.prototype.unloadPlugin = function (name, q) {
  if((!q) && this.debug) {
    sys.puts( "Unloading plugin " + name);
  }

  function unLoadFromObj(obj, f) {
    Object.keys(obj).forEach(function (key) {
      return f(obj[key].event, obj[key].callback);
    });
  }

  function delTrig(trig) {
    if (this.triggers[trig].plugin === name) {
      delete this.triggers[trig];
    }
  }

  if (this.plugins[name]) {
    delete this.plugins[name];

    if (this.hooks[name]) {
      unLoadFromObj(this.hooks[name], this.removeListener);
    }
    if (this.replies[name]) {
      unLoadFromObj(this.replies[name], this.removeListener);
    }

    Object.keys(this.triggers).forEach(delTrig);

    if (require.cache[path.resolve(__dirname, "../plugins/" + name + ".js")]) {
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
    this.plugins[name] = new plugin(this);

    // hooks
    var hookarr = ['connect', 'data', 'numeric', 'message', 'join', 'part', 'quit', 'nick', 'privateMessage'];
    hookarr.forEach(function(event) {
      var onEvent = 'on' + event.charAt(0).toUpperCase() + event.substr(1),
        callback = this.plugins[name][onEvent];

      if (typeof callback === 'function') {
        this.addPluginListener(name, event, callback);
      }

    }, this);

    return true;
  } else {
    // invalid plugin
    sys.puts("Plugin not found: " + name);
    return false;
  }

};

Server.prototype.addTrigger = function (trigger, callback, admin) {
  if (!this.triggers[trigger]) {
    if (!admin) {
      admin = 0;
    }
    admin = parseInt(admin);
    this.triggers[trigger] = { plugin: trigger, callback: callback, admin: admin};
  }
};

Server.prototype.addMessageHandler = function (trigger, callback) {
  // we can convert the callback into a str for a unique id
  var keyFromFn = function (f) {
    var strf = f.toString().replace(/\s+/, '');
    return strf.slice(-25) + String(trigger);
  };

  var key = keyFromFn(callback); // same trigger, multiple cbs? no problem

  if (!this.messagehandlers[key]) {
    this.messagehandlers[key] = {trigger: trigger, callback: callback};
  }

};
