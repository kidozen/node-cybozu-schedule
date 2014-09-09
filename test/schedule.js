var assert     = require('assert');
var lib        = require('../lib/schedule');
var serviceUrl = 'https://YOUR-ACCOUNT-HERE.cybozu.com/o/ag.cgi';
var username   = 'USERNAME HERE';
var password   = 'PASSWORD HERE';

describe('schedule', function () {
    this.timeout(25 * 1000);
    var api = new lib(serviceUrl, username, password);
    it('should get events', function (done) {
        api.getEvents( '2014-09-01T00:00:00', '2014-09-30T00:00:00', function (err, data) {
            assert.ok(!err);
            assert.ok(data);
            assert.ok(data.length > 0);
            done(err);
        });
    });

    it('should add a new event', function (done) {
        var ev = {
            xmlns: "",
            version: "dummy",
            "id": "dummy",
            "event_type": "normal",
            "public_type": "public",
            "plan": "",
            "detail": "KidoZen Party",
            "description": "Come all inside!",
            "allday": "false",
            "start_only": "false",
            "members": [
              {
                "user": {
                  "id": "166",
                  "order": "1"
                }
              },
            ],
            "when": {
              "start": "2014-09-10T01:00:00Z",
              "end": "2014-09-10T01:30:00Z"
            }
        };
        api.addEvent(ev, function (err, data) {
            assert.ok(!err);
            assert.ok(data);
            assert.ok(data.id); //make sure an id was assigned.
            done();
        });
    });

    it('should update an event', function (done) {
        var ev = {
            xmlns: "",
            version: "dummy",
            "id": "dummy",
            "event_type": "normal",
            "public_type": "public",
            "plan": "",
            "detail": "KidoZen Prty (with typo)",
            "description": "Come all inside!",
            "allday": "false",
            "start_only": "false",
            "members": [
              {
                "user": {
                  "id": "166",
                  "order": "1"
                }
              },
            ],
            "when": {
              "start": "2014-09-10T01:00:00Z",
              "end": "2014-09-10T01:30:00Z"
            }
        };
        api.addEvent(ev, function (err, data) {
            assert.ok(!err);
            assert.ok(data);
            assert.ok(data.id); //make sure an id was assigned.
            data.detail = "KidoZen Party (correct)";
            api.updateEvent(data, function (err, updated) {
                assert.ok(!err);
                assert.ok(data);
                assert.ok(updated.detail === "KidoZen Party (correct)");
                done();
            });
        });
    });

    it('should remove an event', function (done) {
        var ev = {
            xmlns: "",
            version: "dummy",
            "id": "dummy",
            "event_type": "normal",
            "public_type": "public",
            "plan": "",
            "detail": "KidoZen Prty (with typo)",
            "description": "Come all inside!",
            "allday": "false",
            "start_only": "false",
            "members": [
              {
                "user": {
                  "id": "166",
                  "order": "1"
                }
              },
            ],
            "when": {
              "start": "2014-09-10T01:00:00Z",
              "end": "2014-09-10T01:30:00Z"
            }
        };
        api.addEvent(ev, function (err, data) {
            assert.ok(!err);
            assert.ok(data);
            assert.ok(data.id); //make sure an id was assigned.
            api.removeEvent(data.id, function (err, del) {
                assert.ok(!err);
                assert.ok(del);
                assert.ok(del.success);
                done();
            });
        });
    });
});