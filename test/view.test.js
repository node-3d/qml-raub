'use strict';


const assert = require('node:assert').strict;
const { describe, it } = require('node:test');

const { View } = require('./init');


const properties = [
	'width', 'height', 'w', 'h', 'wh', 'size', 'textureId', 'isLoaded',
];

const methods = [
	'load', 'destroy', 'toString', 'mousedown', 'mouseup',
	'mousemove', 'keydown', 'keyup',
];

const staticMethods = ['init', 'libs', 'plugins', 'style', 'update'];

const view = new View({ file: 'test.qml' });
const loadPromise = new Promise((res) => view.on('load', () => res(true)));
const texturePromise = new Promise((res) => view.on('reset', (id) => res(id)));

const tested = describe('Qml View', () => {
	it('has all static methods', () => {
		staticMethods.forEach(
			(name) => assert.strictEqual(
				typeof View[name],
				'function',
				`Static method "${name}" is missing.`,
			),
		);
	});
	
	it('has all dynamic methods', () => {
		methods.forEach(
			(name) => assert.strictEqual(
				typeof view[name],
				'function',
				`Method "${name}" is missing.`,
			),
		);
	});
	
	it('has all properties', () => {
		properties.forEach(
			(name) => assert.notStrictEqual(
				view[name],
				undefined,
				`Property "${name}" is missing.`,
			),
		);
	});
	
	it('eventually loads a QML file', async () => {
		const loaded = await loadPromise;
		assert.strictEqual(loaded, true);
	});
	
	it('eventually creates a texture', async () => {
		const textureId = await texturePromise;
		assert.ok(textureId);
	});
});

(async () => {
	const interv = setInterval(View.update, 15);
	await tested;
	clearInterval(interv);
})();
