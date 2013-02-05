# Chapter 2. Setup
## Grab a copy of Dunn
Get your very own brand new shiny bot by cloning the Dunn git repository: `git://github.com/killswitch/dunn.git` Once the new DunnBot box arrives you'll want to tear open the box and start tinkering right away so bring your toolset. 

## Configurations
Each new dunnbot comes with a config.js.default. You'll want to `mv config.js.default config.js`.  Within this config.js file is everything you'll need to get your copy of dunnbot up and running in no time

Most of the settings are obvious but just in case:

### host
Set this to whatever your irc host/server is. Defaults to `irc.freenode.net`

### port
Set to your desired port. Defaults to `6667`

### nick
Set to your bot's nick. Defaults to `dunnBot`

### identPass
Set to your bot's password. Defaults to `yourBotsIRCPass`

### username
This is the name that gets passed along with your bot's login. 

### realname
Your bot's real name? Defaults to `Powered by #webtech`

### command
This is the character(s) that you will type before triggers. Ex: `.plugins` Defaults to `.`

### db
This is the name of your mongojs database.

### channels
Insert all channels you want Dunn to join in the channels as an array: `['#webtech','#web','#whatever']`

### plugins
This is an array of all the plugins that you want to include in your room.  Plugins are really where Dunn comes alive. Check the `plugins` directory

### admins
Put your nick is in the admins array otherwise admin commands (e.g update) won't work for you

## Set up your database
* Install node.js *0.8 or newer* on your server *Note*: If you use anything like logging, seen, karma, or anything you set the third param in the plugin's irc.addTrigger() then you'll need mongodb installed.

## Fire it up
* There are two ways to run Dunn. You can go the traditional route `node dunnbot.js` but that blocks a terminal window. Instead use [forever.js](https://github.com/nodejitsu/forever) to keep him running without a terminal window blocked. That way when you issue the `.update` command he runs the command to git pull, then `forever restart dunnbot.js`
* To fire up your shiny new robot issue this from a command line: `forever start dunnbot.js`
* To shut your robot down if you went the traditional termnial blocking route `cntrl^C` and if you're using `forever` issue: `forever stop dunnbot.js`
