var xml2js        = require('xml2js').parseString;
var request       = require('request');
var core          = require('./core.js');
var ns            = 'http://wsdl.cybozu.co.jp/schedule/2008';
var page          = 'PApiSchedule';
var service       = 'schedule';

module.exports = function (serviceUrl, user, pass) {
    var self = this;

    var send = function (action, params, cb) {
        var body = core.prepareRequestXml(action, ns, user, pass, params);
        var req = {
            url     : serviceUrl,
            method  : 'POST',
            qs      : { page: 'PApiSchedule' },
            headers : { 'Content-Type': 'application/soap+xml' },
            body    : body
        };
        request(req, function (err, res, result) {
            cb(err, result);
        });
    };

    this.getEvents = function (start, end, cb) {
        send('ScheduleGetEvents', { start: start, end: end }, function (err, result) {
            if (err) return cb(err);
            parseEvents(result, 'ScheduleGetEventsResponse', cb);
        });
    };

    this.addEvent = function (event, cb) {
        if (!event) return cb('Missing event parameter');
        crudEvent('ScheduleAddEvents', event, cb);
    };

    this.updateEvent = function (event, cb) {
        if (!event) return cb('Missing event parameter');
        if (event.event_type == "repeat")
            return cb('repeat events cannot be updated');
        crudEvent('ScheduleModifyEvents', event, cb);
    };

    this.removeEvent = function (id, cb) {
        //var res = app.update("Schedule", "ScheduleRemoveEvents", { event_id: { innerValue: eventId} }, true);
        send('ScheduleRemoveEvents', { event_id: { innerValue: id} }, function (err, result) {
            xml2js(result, function (err, data) {
                if (err) return cb(err);
                cb(null, { success: !!core.jpath(data, 'soap:Envelope/soap:Body/0/schedule:ScheduleRemoveEventsResponse')});
            });
        });
    };

    function crudEvent (method, event, cb) {
        var params = { schedule_event: {} };
        //copy the events object into the params.
        Object.keys(event).forEach(function (prop) {
            if (prop !== "members" && prop !== "when")
                params.schedule_event[prop] = event[prop];
        });
        //members and when should go down last so the xml
        //is serialized in the right order.
        params.schedule_event.members = { member: event.members };
        params.schedule_event.when = { datetime: event.when };
        
        send(method, params, function (err, results) {
            if (err) return cb(err);
            parseEvents(results, method + 'Response', function (err, data) {
                if (err) return cb(err);
                cb(null, data[0]);
            });
        });
    }
};

function parseEvents(xmlResult, action, cb) {
    xml2js(xmlResult, function (err, data) {
        if (err) return cb(err);
        var results = core.jpath(data, 'soap:Envelope/soap:Body/0/schedule:' + action + '/0/returns/0/schedule_event');
        var events = core.jprettify(results).map(function (ev) {
            //fix when
            ev.when = ev.when[0].datetime;
            //fix members
            ev.members = ev.members[0].member;
            return ev;
        });
        cb(err, events);
    });
}