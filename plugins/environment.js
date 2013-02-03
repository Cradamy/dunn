/*
 * @Plugin        Environment
 * @Description   Contains all triggers related to DunnBot's environment
 * @Trigger       .triggers, .plugins
 *
 * @Author        #webtech
 * @Copyright     DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE Version 2 http://sam.zoy.org/wtfpl/COPYING
 *
 */

Plugin = exports.Plugin = function (irc) {
  irc.addTrigger('plugins', this.plugins);
  irc.addTrigger('triggers', this.triggers);
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
  for (var plugin in irc.plugins)
    plugins.push(plugin);

  var fs = require('fs');
  var outerStr = '';
  plugins.forEach(function(elmnt){
    var linesArray = fs.readFileSync(__dirname + '/' + elmnt + '.js').toString().split('\n');
    for(var i = 0; i < 10; i++)
    {
      var tmpStr = '';
      if(linesArray[i].match(/@Trigger/g))
      {
        var splitLines = linesArray[i].split('@Trigger');
        tmpStr += splitLines[1].replace(/^\s\s*/, '').replace(/\s\s*$/, '') + ', ';
      }

      outerStr += tmpStr;
    }
  });
  irc.send(channel,outerStr);
};
