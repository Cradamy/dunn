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
  fs.readdir(__dirname, function(err, list) {
    var outerStr = '';
    list.forEach(function(elmnt){
      if(elmnt.slice(elmnt.length - 3) == '.js')
      {
        fs.readFileSync(__dirname + '/' + elmnt).toString().split('\n').forEach(function(line){

          var tmpStr = '';
          if(line.match(/@Trigger/g))
          {
            var splitLines = line.split('@Trigger');
            tmpStr += splitLines[1].replace(/^\s\s*/, '').replace(/\s\s*$/, '') + ', ';
          }

          outerStr += tmpStr;
        }); 
      }
      var newEl = elmnt.slice(0, elmnt.length - 3);
    });

    irc.send(channel,outerStr);
  });
};
