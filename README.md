Dunn
====

Open source Node.js powered IRC bot for #webtech on freenode.

Author
-----
* [Josh Manders](http://www.joshmanders.com).

Contributors
-----
* [Conrad Pankoff](http://www.fknsrs.biz/)
* [Naomi Kyoto](http://github.com/naomik)
* [Jonathan Ardis](http://github.com/Emn1ty)
* [Aaron Ahmed](http://github.com/draceros)

## Usage 
1. Get your very own brand new shiny bot by cloning the Dunn git repository: `git://github.com/killswitch/dunn.git` Once the new DunnBot box arrives you'll want to tear open the box and start tinkering right away so bring your toolset. 
2. Change `nick` in config.js.
3. `identPass` isn't required so you can leave that blank
4. Insert all channels you want Dunn to join in the channels as an array: `['#webtech','#web','#whatever']`
5. Put your nick is in the admins array otherwise admin commands (e.g update) won't work for you
6. Install node.js *0.8 or later* on your server *Note*: If you use anything like logging, seen, karma, or anything you set the third param in the plugin's irc.addTrigger() then you'll need mongodb installed.
7. Use [forever.js](https://github.com/nodejitsu/forever) to keep him running without a terminal blocked. That way when you issue the `.update` command he runs the command to git pull, then `forever restart dunnbot.js`
8. To fire up your shiny new robot issue this from a command line: `forever start dunnbot.js`
9. To shut your robot down issue: `forever stop dunnbot.js`
