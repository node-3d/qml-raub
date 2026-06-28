import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { View } from './index.ts';

const fixtureDir = fileURLToPath(new URL('../examples/assets/', import.meta.url));
View.init(fixtureDir, 0, 0);

const properties = [
	'width', 'height', 'w', 'h', 'wh', 'size', 'textureId', 'isLoaded',
] as const;

const methods = [
	'load', 'destroy', 'toString', 'mousedown', 'mouseup',
	'mousemove', 'keydown', 'keyup',
] as const;

const staticMethods = ['init', 'libs', 'plugins', 'style', 'update'] as const;

const view = new View({ file: 'test.qml' });
const loadPromise = Promise.race([
	new Promise<boolean>((res) => { setTimeout(() => res(false), 5000); }),
	new Promise<boolean>((res) => { view.on('load', () => res(true)); }),
]);
const texturePromise = Promise.race([
	new Promise<null>((res) => { setTimeout(() => res(null), 5000); }),
	new Promise<number | null>((res) => { view.on('reset', (id: number | null) => res(id)); }),
]);

const tested = describe('Qml View', () => {
	it('has all static methods', () => {
		for (const name of staticMethods) {
			assert.strictEqual(
				typeof View[name],
				'function',
				`Static method "${name}" is missing.`,
			);
		}
	});
	
	it('has all dynamic methods', () => {
		for (const name of methods) {
			assert.strictEqual(
				typeof view[name],
				'function',
				`Method "${name}" is missing.`,
			);
		}
	});
	
	it('has all properties', () => {
		for (const name of properties) {
			assert.notStrictEqual(
				view[name],
				undefined,
				`Property "${name}" is missing.`,
			);
		}
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

const interval = setInterval(View.update, 15);
await tested;
clearInterval(interval);
