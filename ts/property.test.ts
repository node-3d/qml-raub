import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { Property, View } from './index.ts';

const fixtureDir = fileURLToPath(new URL('../examples/assets/', import.meta.url));
View.init(fixtureDir, 0, 0);

const view = new View({ file: 'test.qml', silent: true });
const loadPromise = Promise.race([
	new Promise<boolean>((res) => { setTimeout(() => res(false), 5000); }),
	new Promise<boolean>((res) => { view.on('load', () => res(true)); }),
]);
view.on('error', () => { /* nop */ });

const opts = { view, name: 'obj1', key: 'prop1' };

const tested = describe('Property', () => {
	it('has all properties', () => {
		const prop = new Property(opts);
		for (const name of ['opts', 'value'] as const) {
			assert.notStrictEqual(
				prop[name],
				undefined,
				`Property "${name}" is missing.`,
			);
		}
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
		const changed = await new Promise<boolean>((res) => {
			view.on('p1c', () => res(true));
			prop.value = 11;
		});
		assert.strictEqual(changed, true);
	});
	
	it('reads non-existent object property as null', async () => {
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

const interval = setInterval(View.update, 15);
await tested;
clearInterval(interval);
