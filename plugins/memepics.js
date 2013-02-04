/*
 * @Plugin        Meme Pics
 * @Description   Serving up your favorite memes.
 * @Trigger       .brian
 * @Author        cgcardona
 * @Contributor   polar-bear 
 *
 */

var memes = {
  "brian"               : [740857,3459374],
  "scumbag_steve"       : [142,366130],
  "grumpy_cat"         : [1590955,6541210],
  "first_world_problem" : [340895,2055789],
  "stoner"              : [1091690,4694520],
  "good_guy"            : [534,699717],
  "morpheus"            : [1118843,4796874],
  "all_the_things"      : [318065,1985197],
  "prepare_yourself"    : [414926,2295701],
  "yo_dawg"             : [79,108785],
  "what_if"             : [318374,1986282],
  "i_dont_always"       : [76,2485],
  "skeptical"           : [1225013,5169527],
  "joseph"              : [54,42],
  "oag"                 : [1152019,4915715],
  "trollface"           : [68,269],
  "insanity_wolf"       : [45, 20]
};

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
