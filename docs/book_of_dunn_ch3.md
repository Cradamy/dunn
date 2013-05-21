# Chapter 3. Writing Plugins.
## Old vs New
There are two methods you can write plugins, using direct hooks, or using the V2 API Engine.
As for now, the V2 engine is still under development, so it's wise to use the direct way.

## Direct method

It's a nice way to write plugins, you start your plugin with a basic slate, you can look at plugins/example.js, or other plugins for a nice example.

```javascript
/*
* @Plugin foo
* @Description this is required
*
*/

Plugin = exports.Plugin = function(irc) {

}
```

You can add just about anything in the header.

Now, in the function part, you'll see that it has one argument, when Dunn loads the plugins it passes this"" as an argument, you'll need this to bind to events or add triggers.

### Adding a trigger

It's fairly simple,

```javascript
/...
Plugin = exports.Plugin = function(irc) {
	irc.addTrigger(".foo", function(irc, channel, nick, params,  message) {
		irc.send(channel, "bar");
	});
}
```

Now you see I added the function inline with the trigger registration, but you can also use 

```javascript
/...
Plugin = exports.Plugin = function(irc) {
	irc.addTrigger(".foo", this.foo);
}

Plugin.prototype.foo = function(irc, channel, nick, params,  message) {
	irc.send(channel, "bar");
}
```

This would work in the same way.

### Hooking into events
This is a little bit more complex because you get the raw message, look in plugins/rimshot.js or plugins/karma.js for an example.

```javascript
/...
Plugin = exports.Plugin = function (irc) {
	this.irc = irc;
};

Plugin.prototype.onMessage = function(msg) {
	if(new RegExp("foo", "i").test(msg.arguments[1])) this.irc.send(msg.arguments[0], "bar");
}
```

Now you see, the on* statements don't actually contain a formal set of arguments.
The msg object has five known keys.

* arguments (Array)
* * 0 channel
* * 1 the entire message
* prefix 
* command
* lastarg
* orig the original packet

The same object will be used for all events, except onNick.
onNick has three arguments, which are

* msg object
* new nick
* old nick

the event is fired when someone changes their nick.

You can also hook into events with the traditional "on" method

```javascript
/...
Plugin = exports.Plugin = function (irc) {
	this.irc = irc;
	irc.on("message", this.foo);
};

Plugin.prototype.foo = function(msg) {
	if(new RegExp("foo", "i").test(msg.arguments[1])) this.irc.send(msg.arguments[0], "bar");
}
```

There are a number of events.

* ctcp
* notice
* private_message
* * ```Plugin.prototype["onPrivate_message"]```
* message
* join
* part
* quit
* nick
* connect
* data

## V2 api

Now the v2 api is still in development, but it's safe to use some, or all features.
For now, this only documents the known working functions.

### irc.v2.hash

A BLAKE2s hashed string

```javascript
irc.v2.hash("foo", "some_salt");
```

### irc.v2.requestDB

Requests a mongodb object with the specified collections

```javascript
irc.v2.requestDB("foo", "bar", "baz", …)
//Will return a mongodb object with the collections "foo", "bar", "baz", or null if mongojs is not installed/the db is offline
```

### irc.v2.send

Direct passthrough to irc.send

### irc.v2.users

Returns an object with all the users in the specified channel

```javascript
irc.v2.users("webtech");
//["dunn", "killswitch", "shirokuma", …]
```

### irc.v2.configAgent

Returns a value of the config.js

```javascript
irc.v2.configAgent("name");
//returns valueof config.js -> name ("Dunnbot")
irc.v2.configAgent("doesnotexist");
//returns undefined
irc.v2.configAgent("doesnotexist", "fallback");
//returns "fallback"
```

### irc.v2.kick 

Direct passthrough to irc.kick

```javascript
irc.v2.kick("webtech", "shirokuma", "no reason");
```

### irc.v2.join

Joins a channel

```javascript
irc.v2.join("#shirokuma")
irc.v2.join("#supersecretclubmeeting", "password-is-a-lie");
```

### irc.v2.part

Parts a channel

```javascript
irc.v2.part("#shirokuma");
```

### irc.v2.topic

Sets the topic for a channel

```javascript
irc.v2.topic("#shirokmua", "Mint flavoured polar bears");
```
