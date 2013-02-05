/*
 * @Plugin        Meme Pics
 * @Description   Serving up your favorite memes.
 * @Trigger       .brian, .scumbag_steve, .grumpy_cat, .first_world_problem, .stoner, .good_guy, .morpheus, .all_the_things, .prepare_yourself, .yo_dawg, .what_if, .i_dont_always, .skeptical, .josesph, .oag, .trollface, .insanity_wolf, .y_u_no, .victory_baby, .redneck_randal, .stereotypical_redneck, .wtf_picard, .skeptical_fry, .internet_husband, .not_simply            
 * @Author        cgcardona
 * @Contributor   polar-bear 
 * @Copyright     MIT License http://opensource.org/licenses/MIT
 *
 */

var memes = {
  "brian"                 : [740857,3459374],
  "scumbag_steve"         : [142,366130],
  "grumpy_cat"            : [1590955,6541210],
  "first_world_problem"   : [340895,2055789],
  "stoner"                : [1091690,4694520],
  "good_guy"              : [534,699717],
  "morpheus"              : [1118843,4796874],
  "all_the_things"        : [318065,1985197],
  "prepare_yourself"      : [414926,2295701],
  "yo_dawg"               : [79,108785],
  "what_if"               : [318374,1986282],
  "i_dont_always"         : [76,2485],
  "skeptical"             : [1225013,5169527],
  "joseph"                : [54,42],
  "oag"                   : [1152019,4915715],
  "trollface"             : [68,269],
  "y_u_no"                : [2,166088],
  "victory_baby"          : [18609,1152667],
  "redneck_randal"        : [20864,1161245],
  "stereotypical_redneck" : [1099162,4725948],
  "wtf_picard"            : [1718,124044],
  "skeptical_fry"         : [305,84688],
  "internet_husband"      : [1585,880976],
  "not_simply"            : [274947,1865027],
  "insanity_wolf"         : [45, 20]
};

var mongodb = require("mongojs");
var self = this;
Plugin = exports.Plugin = function (irc) {
  this.irc = irc;
  this.db = mongodb.connect(irc.database, ['memes']);
  self = this; 

  this.db.memes.find({}, function(e, r) {
    if(e === null) {
      while(r.length) {
        var m = r.shift();
        memes[m.name] = m.data;
      }
    }

    for(var meme in memes) {
      irc.addTrigger(meme, function(i,c,u,p,m) {
        var meme = m.replace(i.command, "").split(" ")[0].trim();
        self.memeFunc(i,c,u,p,m,memes[meme]);
      }); 
    }
  });

  irc.addTrigger('meme', this.memeSwitch);
  irc.addTrigger('addmeme', this.addMeme);
};

Plugin.prototype.memeSwitch = function(irc, channel, user, params, message) {
  if(!params.length) {
    return irc.send("Usage: "+irc.command+"meme "+Object.keys(memes).join("|")+' "line1" "line2", you can also use .[meme-name] "line1" "line2"');
  }

  var meme = params.shift();
  if(memes[meme] !== undefined) return this.memeFunc(irc, channel, user, params, message, memes[meme]);
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
  }
  else
  {
    var paramsString = params.join(' ');
    var splitParams = paramsString.split('.');
    msg1 = splitParams[0];
    msg2 = splitParams[1];
  }

  if(typeof msg1 != "undefined" && typeof msg2 != "undefined") return [msg1.trim(),msg2.trim()];
  else return ["", msg1.trim()];
}

var http = require("http");
Plugin.prototype.addMeme = function(irc, channel, user, params, message) {
  if(params.length < 1) {
    irc.send(channel, "Usage: " + irc.command + "addMeme <auto|remove> query");
  } else if(params[0] == "auto" || params[0] == "add") {
    var req = http.request(require("url").parse("http://version1.api.memegenerator.net/Generators_Search?q=" + params.splice(1).join("+")), function(res) {
      var data = "";  
      res.on("data", function(d) { data += d; }).
        on("end", function() {
          data = JSON.parse(data);
          var imageID = require("url").parse(data.result[0].imageUrl).pathname.split("/");
          var MemeData = [data.result[0].generatorID, imageID[imageID.length-1].split(".")[0]];
          var name = data.result[0].urlName.toLowerCase().replace(new RegExp("-", "igm"), "_");
          var model = {name: name, data: MemeData};

          if(typeof memes[name] != "undefined") return self.irc.send(channel, "Meme already added");

          self.db.memes.save(model, function(e) {
            if(e !== null) return self.irc.send(channel, "Could not add meme to database");
            else {
              memes[name] = MemeData;
              self.irc.send(channel, "Adding meme " + irc.command + name);
              irc.addTrigger(name, function(i,c,u,p,m) {
                var meme = m.replace(i.command, "").split(" ")[0].trim();
                self.memeFunc(i,c,u,p,m,memes[meme]);
              }); 
            }
          });
      });
    }).end();
  } else if(params[0] == "remove") {
    if(typeof params[1] != "undefined" && typeof irc.triggers[params[1]] != "undefined" && typeof memes[params[1]] != "undefined") {
      delete irc.triggers[params[1].toLowerCase()];
      self.db.memes.remove({
        name: params[1].toLowerCase()
      }, function(e) {
        irc.send(channel, "Removed "+params[1])
      });
    } else {
      irc.send(channel, "Cannot remove "+params[1]);
    }
  } else {
    irc.send(channel, "Usage: " + irc.command + "addMeme <add|remove> query");
  }
}

Plugin.prototype.memeFunc = function (irc, channel, user, params, message, generatorID) {
  if(params < 1)
    irc.send(channel, user + ', ain\'t nobody got time fo\' your stupidity.');
  else
  {
    var msgs = this.getLines(params);

    var url = 'http://version1.api.memegenerator.net/Instance_Create?username=w3bt3chirc&password=W3bT3ch1Rc507&languageCode=en&generatorID='+generatorID[0]+'&imageID='+generatorID[1];
    url += '&text0=' + encodeURIComponent(msgs[0] || "") + '&text1=' + encodeURIComponent(msgs[1] || "");

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
    });

    request.end();
  }
};
