var winston     = require("winston");
var connector   = require("kido-connector");
var Schedule    = require('./lib/schedule');

connector.init("Cybozu", winston);

module.exports = function (config) {

    var schedule = new Schedule(config.serviceUrl, config.username, config.password);

    var authenticate = function (username, password, cb) {
        cb(null, 'not required');
    };

    var _connector = new connector.Connector(config, authenticate);

    // The authenticate method of your connector will as simple like this one.
    this.authenticate = function (options, cb) {
        //get session
        _connector.getSession(options, function (err, session, auth) {
            if (err) return cb(err);
            cb( { auth: auth });
        });
    };

    // A secured method
    this.getEvents = function (options, cb) {
        schedule.getEvents(options.start, options.end, cb);
    };

    this.addEvent = function (options, cb) {
        schedule.addEvent(options.event, cb);
    };

    this.updateEvent = function (options, cb) {
        schedule.updateEvent(options.event, cb);
    };

    this.removeEvent = function (options, cb) {
        schedule.removeEvent(options.id, cb);
    };
    // Close and release all sessions.
    this.close = function(cb) {
        _connector.close(cb);
    };
};
