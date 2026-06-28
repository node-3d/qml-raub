import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { Method, View } from './index.ts';

const fixtureDir = fileURLToPath(new URL('../examples/assets/', import.meta.url));
View.init(fixtureDir, 0, 0);

const view = new View({ file: 'test.qml', silent: true });
const loadPromise = Promise.race([
	new Promise<boolean>((res) => { setTimeout(() => res(false), 5000); }),
	new Promise<boolean>((res) => { view.on('load', () => res(true)); }),
]);
view.on('error', () => { /* nop */ });

const opts = { view, name: 'obj1', key: 'method1' };

const tested = describe('Method', () => {
	it('can be created', () => {
		assert.strictEqual(typeof (new Method(opts)), 'function');
	});
	
	it('has all properties', () => {
		const method = new Method(opts);
		for (const name of ['opts'] as const) {
			assert.ok(method[name]);
		}
	});
	
	it('calls QML method1', async () => {
		const loaded = await loadPromise;
		assert.strictEqual(loaded, true);
		
		const method1 = new Method(opts);
		const called = await new Promise<boolean>((res) => {
			view.on('m1c', () => res(true));
			method1();
		});
		assert.strictEqual(called, true);
	});
	
	it('calls QML method2', async () => {
		const loaded = await loadPromise;
		assert.strictEqual(loaded, true);
		
		const method2 = new Method({ ...opts, key: 'method2' });
		const called = await new Promise<boolean>((res) => {
			view.on('m2c', () => res(true));
			method2(10);
		});
		assert.strictEqual(called, true);
	});
	
	it('calls non-existent object method, and gets null', async () => {
		const loaded = await loadPromise;
		assert.strictEqual(loaded, true);
		
		const method = new Method({ ...opts, name: 'awdaldaklwd23' });
		assert.strictEqual(method(), null);
	});
	
	it('calls non-existent method, and gets null', async () => {
		const loaded = await loadPromise;
		assert.strictEqual(loaded, true);
		
		const method = new Method({ ...opts, key: 'awdaldaklwd23' });
		assert.strictEqual(method(), null);
	});
});

const interval = setInterval(View.update, 15);
await tested;
clearInterval(interval);
