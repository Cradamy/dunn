/*
 * @Plugin        Environment v2
 * @Description   Plugins, triggers, message handlers etc.
 * @Trigger       .env
 * @Author        polar-bear
 * @Copyright     Public Domain
 *
 */

var Plugin = exports.Plugin = function(irc) {
  irc.addTrigger("env", this.env)
};

Plugin.prototype.env = function(irc, channel, user, params, message) {
  if(typeof params[0] == "undefined") return irc.send(channel, "Usage: "+irc.command+"env <plugins/triggers/handlers>");


  switch(true) {
    default:
      irc.send(channel, "Usage: "+irc.command+"env <plugins/triggers/handlers>");
    break
    case params[0].indexOf("plugins") > -1:
      irc.send(channel, "Loaded plugins are: " + Object.keys(irc.plugins).join(", "));
    break;
    case params[0].indexOf("triggers") > -1:
      irc.send(channel, "Loaded triggers are: " + irc.command + Object.keys(irc.triggers).join(", " + irc.command));
    break;
    case params[0].indexOf("handlers") > -1:
    console.log(irc);
      irc.send(channel, "Loaded message handlers are: " + Object.keys(irc.messagehandlers).join(", "));
    break;
  }
}