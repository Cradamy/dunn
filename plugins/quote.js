/*
 * @Plugin        Quote
 * @Description   Save and retrieve quotes from the db. Use ".quote help" for help.
 * @Trigger       .quote
 *
 * @Author        Olli K
 * @Website       github.com/gildean
 * @License       MIT
 * @Copyright     -
 *
 */
 
var mongodb = require('mongojs'),
    util = require('util'),
    events = require('events');

var Quote = function (irc) {
    "use strict";
    var trigger = 'quote',
        helpText = irc.command + trigger,
        helpTxtLen = helpText.length + 1,
        self = this,
        db = mongodb.connect(irc.database),
        quotecoll = db.collection('quotes'),
        quoteUserDb = db.collection('quoteUsers'),
        ErrMsg = function (name, message, user) {
            return {
                name: name,
                message: message,
                user: user
            };
        },
        notFoundErr = new ErrMsg('Not found', 'Sorry', true),
        authError = new ErrMsg('Permissions required', 'You don\'t have them', true),
        invalidAction = new ErrMsg('Invalid Action', 'Try again or try: ".quote help".', true),
        ircAdmins = irc.config.admins;
    
    function has(ar, el) {
        return ar.indexOf(el) > -1;
    }

     // main function
    var quote = function (unnecessaryContext, channel, nick, params, message) {
        self.emit('message', channel, nick, message);
    },

    throwErr = function (channel, nick, err) {
        if (err && err.user) {
            irc.send(channel, nick + ': ' + err.name + ': ' + err.message);
        } else {
            throw err;
        }
    },
    
    helpMe = function (channel, message) {
        if (message.length === 1) {
            irc.send(channel, '- ' + helpText + ' <id> -- Get a a specific quote with an id-number.');
            irc.send(channel, '- ' + helpText + ' <nick> -- Get a random quote from nick.');
            irc.send(channel, '- ' + helpText + ' add <nick> <quote> -- Add a quote.');
            irc.send(channel, '- ' + helpText + ' rm <id-number> -- Removes a quote if you\'re the creator and/or admin.');
            irc.send(channel, 'Use "' + helpText + ' help user" for admin help');
        } else if (message[1] === 'user') {
            irc.send(channel, '- '+ helpText +' user list -- List current users.');
            irc.send(channel, '- '+ helpText +' user add <nick> [admin] -- Adds a new user. Admin value as boolean.');
            irc.send(channel, '- '+ helpText +' user rm <nick> -- Removes a user. Also removes all the quotes added by the user.');
        }
    },

    confirmAction = function (channel, nick, id, action, type) {
        irc.send(channel, nick + ': ' + type + ' ' + id + ' ' + action);
    },

    sendQuoteToIrc = function (channel, nick, doc) {
        if (typeof(doc) === 'object' && doc.hasOwnProperty('idNumber')) {
            irc.send(channel, '(' + doc.idNumber + ') <' + doc.nick + '> ' + doc.quote);
        } else {
            irc.send(channel, nick + ': ' + doc);
        }
    },

    findAndVerifyUser = function (channel, nick, callback) {
        quoteUserDb.findOne({name: nick, channel: channel}, function (err, foundUser) {
            if (!err && (foundUser && foundUser.admin || has(ircAdmins, nick))) {
                callback(null, true);
            } else if (err) {
                callback(err, false);
            } else {
                callback(authError, false);
            }
        });
    },

    addUser = function (channel, nick, user, admin) {
        quoteUserDb.update({name: user, channel: channel}, {$set: { name: user, channel: channel, admin: admin }}, { upsert: true }, function (saveerr) {
            if (!saveerr) {
                self.emit('confirmAction', channel, nick, user, 'added', 'user');
            } else {
                self.emit('quoteError', channel, nick, saveerr);
            }
        });
    },

    rmUser = function (channel, nick, user) {
        quoteUserDb.findOne({name: user, channel: channel}, function (notfound, rmuser) {
            if (!notfound && rmuser) {
                quoteUserDb.remove({_id: rmuser._id}, function (rmerr) {
                    if (!rmerr) {
                        quotecoll.remove({owner: user, channel: channel}, function (qrmerr) {
                            if (!qrmerr) {
                                self.emit('confirmAction', channel, nick, user, 'deleted', 'user');
                            } else {
                                self.emit('quoteError', channel, nick, qrmerr);
                            }
                        });
                    } else {
                        self.emit('quoteError', channel, nick, rmerr);
                    }
                });
            } else {
                var tmpErr = notfound || notFoundErr;
                self.emit('quoteError', channel, nick, tmpErr);
            }
        });
    },

    listUsers = function (channel, nick) {
        quoteUserDb.find({channel: channel}, function (err, users) {
            var userlist = 'Users added on this channel: ';
            if (!err && users) {
                users.forEach(function (user) {
                    if (user.hasOwnProperty('name')) {
                        userlist += user.name;
                        userlist += (user.admin === 'true') ? '(admin), ' : '(user), ';
                    }
                });
                self.emit('foundQuote', channel, nick, userlist);
            } else {
                self.emit('quoteError', channel, nick, err);
            }
        });
    },

    adminAction = function (channel, nick, message) {
        findAndVerifyUser(channel, nick, function (err, verified) {
            if (!err && verified) {
                var action = message[1],
                    target, admin;
                if (action === 'list') {
                    self.emit('listUsers', channel, nick);
                } else if (message.length > 2) {
                    target = message[2].toLowerCase();
                    admin = message[3] || false;
                    if (action === 'add') {
                        self.emit('addUser', channel, nick, target, admin);
                    } else if (action === 'rm' || action === 'remove') {
                        self.emit('rmUser', channel, nick, target);
                    } else {
                        self.emit('quoteError', channel, nick, invalidAction);
                    }
                } else {
                    self.emit('quoteError', channel, nick, invalidAction);
                }
            } else {
                self.emit('quoteError', channel, nick, err);
            }
        });
    },

    searchQuotesById = function (channel, nick, id) {
        quotecoll.findOne({ idNumber: parseInt(id) }, function (err, found) {
            if (!err && found) {
                self.emit('foundQuote', channel, nick, found);
            } else {
                var tmpErr = err || notFoundErr;
                self.emit('quoteError', channel, nick, tmpErr);
            }
        });
    },

    searchQuotesByNick = function (channel, nick, query) {
        quotecoll.find({ searchname: query.toLowerCase(), channel: channel }, function (err, quotes) {
            if (!err && quotes.length > 0) {
                var found = quotes[Math.floor(Math.random() * quotes.length)];
                self.emit('foundQuote', channel, nick, found);
            } else {
                var tmpErr = err || notFoundErr;
                self.emit('quoteError', channel, nick, tmpErr);
            }
        });
    },

    getRandomQuote = function (channel, nick) {
        quotecoll.find({channel: channel}, function (err, quotes) {
            if (!err && quotes.length > 0) {
                var found = quotes[Math.floor(Math.random() * quotes.length)];
                self.emit('foundQuote', channel, nick, found);
            } else {
                var tmpErr = err || notFoundErr;
                self.emit('quoteError', channel, nick, tmpErr);
            }
        });
    },

    getQuote = function (channel, nick, message) {
        var getter = message[0];
        if (getter.match(/^\d/)) {
            self.emit('getQuoteById', channel, nick, getter);
        } else {
            self.emit('getQuoteByNick', channel, nick, getter);
        }
    },


    getIdNumber = function (channel, callback) {
        quoteUserDb.findAndModify({ query: { special: '_idNumber' }, update: { $inc: { number: 1 } }, upsert: true, new: true }, function (err, id) {
            if (!err && id) {
                callback(null, id.number);
            } else {
                callback(err, null);
            }
            
        });
    },

    addQuote = function (channel, nick, message) {
        quoteUserDb.findOne({name: nick, channel: channel}, function (err, user) {
            if (!err && (user || has(ircAdmins, nick))) {
                var quoteduser = message[1].replace(':','').replace('<','').replace('>','').replace(' ',''),
                    searchname = quoteduser.toLowerCase(),
                    quoteMsg = message.slice(2).join(' ');
                getIdNumber(channel, function (err, idNumber) {
                    if (!err && idNumber) {
                        quotecoll.save({ nick: quoteduser, owner: nick, searchname: searchname, channel: channel, idNumber: idNumber, quote: quoteMsg }, function (err) {
                            if (!err) {
                                self.emit('confirmAction', channel, nick, idNumber, 'added', 'quote');
                            } else {
                                self.emit('quoteError', channel, nick, err);
                            }
                        });
                    } else {
                        self.emit('quoteError', channel, nick, err);
                    }
                });
            } else {
                var tmpErr = err || authError;
                self.emit('quoteError', channel, nick, tmpErr);
            }
        });
    },

    rmQuote = function (channel, nick, message) {
        var idNumber = parseInt(message[1]);
        if (!isNaN(idNumber)) {
            quoteUserDb.findOne({name: nick, channel: channel}, function (err, user) {
                if (!err && (user || has(ircAdmins, nick))) {
                    quotecoll.findOne({idNumber: idNumber}, function (err, found) {
                        if (!err && found && (nick === found.owner || (user && user.admin) || has(ircAdmins, nick))) {
                            quotecoll.remove({idNumber: idNumber}, function (err) {
                                if (!err) {
                                    self.emit('confirmAction', channel, nick, idNumber, 'deleted', 'quote');
                                } else {
                                    self.emit('quoteError', channel, nick, err);
                                }
                            });
                        } else if (err) {
                            self.emit('quoteError', channel, nick, err);
                        } else if (!found) {
                            self.emit('quoteError', channel, nick, notFoundErr);
                        } else {
                            self.emit('quoteError', channel, nick, authError);
                        }
                    });
                } else {
                    var tmpErr = err || authError;
                    self.emit('quoteError', channel, nick, tmpErr);
                }
            });
        } else {
            var tmpErr = new ErrMsg('Invalid Id-Number', 'Id-Number could not be parsed',true);
            self.emit('quoteError', channel, nick, tmpErr);
        }
    },

    parseMessage = function (channel, nick, msg) {
        if (msg !== helpText) {
            var message = msg.substr(helpTxtLen).trim().split(' '),
                msgLen = message.length,
                command = message[0].substr(0,4).trim();
                
            if (command === 'help') {
                self.emit('help', channel, message);
            } else if (msgLen === 1) {
                self.emit('getQuote', channel, nick, message);
            } else if (command === 'add' && msgLen > 2) {
                self.emit('addQuote', channel, nick, message);
            } else if ((command === 'rm' || command === 'remove') && msgLen > 1) {
                self.emit('rmQuote', channel, nick, message);
            } else if (command === 'user' && msgLen > 1) {
                self.emit('adminAction', channel, nick, message);
            } else {
                self.emit('quoteError', channel, nick, invalidAction);
            }

        } else {
            self.emit('getRandomQuote', channel, nick);
        }
    };

    // the message event should always fire first and determine what comes next
    this.on('message', parseMessage)
        .on('help', helpMe)
        .on('getQuote', getQuote)
        .on('getRandomQuote', getRandomQuote)
        .on('getQuoteByNick', searchQuotesByNick)
        .on('getQuoteById', searchQuotesById)
        .on('foundQuote', sendQuoteToIrc)
        .on('addQuote', addQuote)
        .on('rmQuote', rmQuote)
        .on('adminAction', adminAction)
        .on('listUsers', listUsers)
        .on('addUser', addUser)
        .on('rmUser', rmUser)
        .on('confirmAction', confirmAction)
        .on('quoteError', throwErr);

    // the only truly public method
    this.onConnect = function () {
        quotecoll.ensureIndex({ idNumber: 1, nick: 1 });
        quoteUserDb.ensureIndex({ name: 1 });
    };

    irc.addTrigger(trigger, quote);
};

util.inherits(Quote, events.EventEmitter);

exports.Plugin = Quote;
