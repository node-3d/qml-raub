import { createRequire } from 'node:module';
import { getBin } from '@node-3d/addon-tools';
import '@node-3d/segfault';

export type TNativeViewInstance = {
	readonly isDestroyed: boolean;
	_libs(path: string): void;
	_destroy(): void;
	_resize(width: number, height: number): void;
	_mouse(type: number, button: number, buttons: number, x: number, y: number): void;
	_keyboard(type: number, key: number, text: number): void;
	_load(isFile: boolean, source: string): void;
	_set(objectName: string, property: string, json: string): void;
	_get(objectName: string, property: string): string;
	_invoke(objectName: string, method: string, json: string): string;
};

type TNativeViewConstructor = {
	new(width: number, height: number): TNativeViewInstance;
	_init(
		cwd: string,
		wnd: number,
		ctx: number,
		device: number,
		converter: (json: string) => unknown,
	): void;
	_plugins(path: string): void;
	_style(name: string, fallback?: string): void;
	update(): void;
};

type TNative = {
	View: TNativeViewConstructor;
};

const loadAddon = createRequire(import.meta.url);

export const native = loadAddon(`../${getBin()}/qml.node`) as TNative;
