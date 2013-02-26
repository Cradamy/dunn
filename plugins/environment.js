/*
 * @Plugin        Environment
 * @Description   Contains all triggers related to DunnBot's environment
 * @Trigger       .triggers, .plugins
 *
 * @Author        #webtech
 * @Copyright     DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE Version 2 http://sam.zoy.org/wtfpl/COPYING
 *
 */

var Plugin = module.exports = function (irc) {
  irc.addTrigger('plugins', this.plugins);
  irc.addTrigger('triggers', this.triggers);
  irc.addTrigger('env', this.env);
};

Plugin.prototype.plugins = function (irc, channel, nick, params, message, raw) {
  var plugins = [];
  for (var plugin in irc.plugins) {
      plugins.push(plugin);
  }
  irc.send(channel, nick + ': Loaded plugins are: ' + plugins.join(', ') + '.');
};

Plugin.prototype.triggers = function (irc, channel, nick, params, message, raw) {
  var plugins = [];
  for (var plugin in irc.plugins) {
      plugins.push(plugin);
  }

  var fs = require('fs');
  var loadedTriggerString = '';
  plugins.forEach(function (elmnt) {
    var linesArray = fs.readFileSync(__dirname + '/' + elmnt + '.js').toString().split('\n');
    for (var i = 0; i < 10; i++) {
      var tmpTriggerString = '';
      if (linesArray[i].match(/@Trigger/g)) {
        var splitLines = linesArray[i].split('@Trigger');
        tmpTriggerString += splitLines[1].replace(/^\s\s*/, '').replace(/\s\s*$/, '') + ', ';
      }

      loadedTriggerString += tmpTriggerString;
    }
  });
  var cleanString = loadedTriggerString.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  irc.send(channel, nick + ': Loaded triggers are: ' + cleanString.substring(0, cleanString.length - 1));
};


Plugin.prototype.env = function(irc, channel, user, params, message) {
  if(typeof params[0] == "undefined") return irc.send(channel, "Usage: "+irc.command+"env <plugins/triggers/handlers>");


  switch(true) {
    case params[0].indexOf("plugins") > -1:
      irc.send(channel, "Loaded plugins are: " + Object.keys(irc.plugins).join(", "));
    break;
    case params[0].indexOf("triggers") > -1:
      irc.send(channel, "Loaded triggers are: " + irc.command + Object.keys(irc.triggers).join(", " + irc.command));
    break;
    case params[0].indexOf("handlers") > -1:
      irc.send(channel, "Loaded message handlers are: " + Object.keys(irc.messagehandlers).join(", "));
    break;
    default:
      irc.send(channel, "Usage: "+irc.command+"env <plugins/triggers/handlers>");
  }
};
