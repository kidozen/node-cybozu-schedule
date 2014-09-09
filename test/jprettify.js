var jprettify = require('../lib/core').jprettify;
var assert = require('assert');

describe('jprettify', function () {
	it('should map all items in an array', function () {
		var list = [{foo: 'bar' }, {foo: 'baz'}];
		assert.ok(jprettify(list).length === 2);
	});

	it('should extend item with $ properties', function () {
		var list = [{foo: 'bar', '$': { name: 'gus'}}];
		assert.ok(jprettify(list)[0].name === 'gus');
	});

	it('should ignore xmlns properties in $ objects', function () {
		var list = [{foo: 'bar', '$': { xmlns: 'foo'}}];
		assert.ok(jprettify(list)[0].xmlns === undefined);
	});

	it('should extend children', function () {
		var list = [{foo: { bar: { '$': { name: 'baz'}}}}];
		assert.ok(jprettify(list)[0].foo.bar.name === 'baz');
	});

	it('should extend parent if child has only one property and is $', function () {
		var list = [{
			"user": [
              {
                "$": {
                  "id": "166",
                  "name": "Administrator",
                  "order": "1"
                }
              }
            ]}];
        assert.ok(jprettify(list)[0].user.id === "166");
	});
});