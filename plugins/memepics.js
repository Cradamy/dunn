/*
 * @Plugin        Meme Pics
 * @Description   Serving up your favorite memes.
 * @Trigger       .brian
 * @Author        cgcardona
 * @Contributor   polar-bear 
 *
 */

var memes = require("./memepics.json");

Plugin = exports.Plugin = function (irc) {
  var self = this;
  for(var meme in memes) {
    console.log("loading meme: " + meme);
    irc.addTrigger(meme, function(i,c,u,p,m) {
      var meme = m.split(" ")[0].replace(i.command, "");
      self.memeFunc(i,c,u,p,m,memes[meme],meme);
    });
  }

  irc.addTrigger('meme', this.memeSwitch);
};

Plugin.prototype.memeSwitch = function(irc, channel, user, params, message) {
  if(!params.length) {
    return irc.send("Usage: "+irc.command+"meme "+Object.keys(memes).join("|")+' "line1" "line2", you can also use .[meme-name] "line1" "line2"');
  }

  var meme = params.shift();
  if(memes[meme] !== undefined) return this.meme(irc, channel, user, params, message, memes[meme]);
  else return irc.send("Meme " + meme + " not found");
}

Plugin.prototype.getLines = function(params) {
  var msg1 = '';
  var msg2 = '';
  if(params[0][0] == '"')
  {
    var msgNum = 1;
    while(params.length)
    {
      var p = params.shift();
      var msgNumAfter = false;

      if(p[0] == '"')
        p = p.substr(1);
      else if(p[p.length-1] == '"')
      {
        p = p.substr(0, p.length - 1);
        msgNumAfter = true;
      }

      if(msgNum == 1) 
        msg1 += p + " ";
      else 
        msg2 += p + " ";

      if(msgNumAfter) 
        msgNum++;
    }
  } else {
    params.forEach(function(el, inx)
    {
      if(inx <= 4)
        msg1 += el + ' ';
      else
        msg2 += el + ' ';
    });
  }

  return [msg1.trim(),msg2.trim()]
}

Plugin.prototype.memeFunc = function (irc, channel, user, params, message, generatorID, memeType) {
  if(params < 1)
    irc.send(channel, user + ', Attemps to bad luck brian someone. Forgets to add message.');
  else
  {
    var msgs = this.getLines(params);

    var url = 'http://version1.api.memegenerator.net/Instance_Create?username=w3bt3chirc&password=W3bT3ch1Rc507&languageCode=en&generatorID='+generatorID[0]+'&imageID='+generatorID[1]+'&text0=' + msgs[0] + '&text1=' + msgs[1];

    var http = require('http');
    var request = http.get(url, function(res)
    {
      var resp = '';
      res.on('data', function (data) {
        resp += data;
      });

      res.on('end', function () {
        var parsedJSON = JSON.parse(resp);
        irc.send(channel, user + ': ' + parsedJSON.result.instanceImageUrl);
      });
    }).on('error', function(e) {
         console.log("Got error: " + e.message);
    });

    request.end();
  }
};
