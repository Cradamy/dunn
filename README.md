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

1. change the nick in the config
2. identPass isn't required, so you can leave that blank
3. Put your nick is in the admins array otherwise things like .update won't work
for you
4. Put all channels you want him to join in the channels as an array:
['#webtech','#web','#whatever']
5. Install node.js on your server *Note*: If you use anything like logging, seen, karma, or anything you set the third param in the plugin's irc.addTrigger() then you'll need mongodb installed.
6. `node dunnbot.js` *Note*: That will connect him and join the channels.
