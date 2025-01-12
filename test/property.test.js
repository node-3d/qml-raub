'use strict';


const assert = require('node:assert').strict;
const { describe, it } = require('node:test');

const { View, Property } = require('./init');


const view = new View({ file: 'test.qml', silent: true });
const loadPromise = Promise.race([
	new Promise((res) => { setTimeout(() => res(false), 5000); }),
	new Promise((res) => view.on('load', () => res(true))),
]);
view.on('error', () => {});

const opts = { view, name: 'obj1', key: 'prop1' };


const tested = describe('Property', () => {
	it('has all properties', () => {
		const prop = new Property(opts);
		['opts', 'value'].forEach(
			(name) => assert.notStrictEqual(
				prop[name],
				undefined,
				`Property "${name}" is missing.`,
			),
		);
	});
	
	it('reads a value from QML', async () => {
		const loaded = await loadPromise;
		assert.strictEqual(loaded, true);
		const prop = new Property(opts);
		assert.strictEqual(prop.value, 'value1');
	});
	
	it('changes a QML value', async () => {
		const loaded = await loadPromise;
		assert.strictEqual(loaded, true);
		const prop = new Property(opts);
		const changed = await new Promise((res) => {
			view.on('p1c', () => res(true));
			prop.value = 11;
		});
		assert.strictEqual(changed, true);
	});
	
	it('reads non-existent object\'s property as null', async () => {
		const loaded = await loadPromise;
		assert.strictEqual(loaded, true);
		const prop = new Property({ ...opts, name: 'awdaldaklwd23' });
		assert.strictEqual(prop.value, null);
	});
	
	it('reads non-existent property as null', async () => {
		const loaded = await loadPromise;
		assert.strictEqual(loaded, true);
		const prop = new Property({ ...opts, key: 'awdaldaklwd23' });
		assert.strictEqual(prop.value, null);
	});
});

(async () => {
	const interv = setInterval(View.update, 15);
	await tested;
	clearInterval(interv);
})();
