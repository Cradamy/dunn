var irc = require('irc');
var Parse = require('./Parse.js');
var howLong = require('./ago.js');
var uptime_start = new Date();

var bot = {
  nick: 'Dunn',
  server: 'irc.freenode.net',
  channels: ['#webtech'],
  admins: ['Killswitch', 'K1llswitch'],
  cmd: '.',
  alias: '?',
  db: {
    parse: {
      api_key: 'wvd7OvFb5chNRif22wrZHZdhWKaXoZ9gSS8lp2NI',
      master_key: 'rqbhP0Xb1Zqed6baa8GW8oGvW37yvLLok3NVtrvv'
    }
  }
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var client = new irc.Client(bot.server, bot.nick, {
    channels: bot.channels,
});

var db = new Parse(bot.db.parse.api_key, bot.db.parse.master_key);

client.addListener('message', function (user, channel, message) {
  
  var karma_to, who;
  
  if (user !== bot.nick)
  {
      db.insert('log', { channel: channel, user: user, message: message }, function (err, response) {
      // console.log('[' + channel + '] ' + user + ': ' + message);
    });
  }
  
  if (message === bot.cmd + 'help')
  {
    client.say(channel, user + ': Currently I log the channel, and issue and revoke karma to users. PRO-TIP: type .code');
  }
  
  if (message === bot.cmd + 'about')
  {
    client.say(channel, user + ': My name is ' + bot.nick + ' and I am a Node.js powered bot using Node-IRC, written by Killswitch, and I store my data on parse.com.');
  }
  
  if (to = message.match(/^(.*)\+\+;?$/i))
  {
    karma_to = to[1];
    if (karma_to === user)
    {
      client.say(channel, user + ': Since you attempted to give yourself karma, I just took a point away from you.');
    }
    else if (karma_to === bot.nick)
    {
      client.say(channel, user + ': Thanks for trying to give me karma, but I hold all of it.. If I wanted to give myself karma, I could just take it from you. :)');
    }
    else
    {
      db.insert('karma', { channel: channel, from: user, to: karma_to, action: 'give' }, function (err, response) {
          client.say(channel, user + ': Thank you for giving karma to ' + karma_to + '.');
      });
    }
    
  }
  
  if (to = message.match(/^(.*)\-\-;?$/i))
  {
    karma_to = to[1];
    if (karma_to === user)
    {
      client.say(channel, user + ': Well, since you want to do that, I guess I can\'t stop you. I have just taken a point from you.');
    }
    else if (karma_to === bot.nick)
    {
      client.say(channel, user + ': Just for that, I have removed 50 karma points from you and put it in my own pot. Muhahaha! 3:D');
    }
    else
    {
      db.insert('karma', { channel: channel, from: user, to: karma_to, action: 'take' }, function (err, response) {
          client.say(channel, user + ': I\'m sorry to hear ' + karma_to + ' wasn\'t very helpful. We\'ve taken a point away from them.');
      });
    }
    
  }
  
  if (seen = message.match(/^\.seen (.*)$/i))
  {
    who = seen[1];
    if (who === user)
    {
      client.say(channel, user + ': You were last seen just now. :)');
    }
    else if (who === bot.nick)
    {
      client.say(channel, user + ': I am right here.');
    }
    else
    {
      db.findLatest('log', { user: who }, function (err, response) {
        console.log(response);
        if (response.results.length === 0)
        {
          client.say(channel, user + ': I have not seen ' + who + '.');
        }
        else
        {
          client.say(channel, user + ': The last time I seen ' + who + ' was ' + howLong.ago(response.results[0].createdAt) + ' ago saying: <' + who + '> ' + response.results[0].message);
        }
      });
    }
  }
  
  if (message === bot.cmd + 'code')
  {
    client.say(channel, user + ': You can view, and fork my code to contribute on GitHub @ http://www.github.com/killswitch/dunn');
  }
  
  if (message === bot.cmd + 'uptime')
  {
    var uptime_now = new Date();
    var uptime = uptime_now.getTime() - uptime_start.getTime();
    client.say(channel, user + ': I have been up for ' + uptime + ' milliseconds.');
  }
  
  if (quote = message.match(/\.quote add <(.*)> (.*)$/i))
  {
    quote_user = quote[1];
    quote_msg = quote[2];
    db.insert('quotes', { channel: channel, added_by: user, user: quote_user, message: quote_msg }, function (err, response) {
       client.say(channel, user + ': Quote added.');
    });
  }
  
});

client.addListener('join', function (channel, user, message) {
  // client.say(channel, 'Welcome to #webtech, ' + user + '. Enjoy your stay. :)');
});
