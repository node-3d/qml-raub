import Emitter from 'node:events';
import path from 'node:path';
import { inspect, inherits } from 'node:util';
import { getLogger } from '@node-3d/addon-tools';
import { core } from './core.ts';
import type { TNativeViewInstance } from './native.ts';

export type TSize = Readonly<{ width: number; height: number }>;

export type TEvent = {
	type: string;
	[key: string]: unknown;
};

export type TMouseEventCommon = TEvent & Readonly<{
	buttons: number;
	x: number;
	y: number;
}>;

export type TMouseEventPress = TMouseEventCommon & Readonly<{
	button: number;
}>;

export type TMouseEventWheel = TMouseEventCommon & Readonly<{
	wheelDelta: number;
}>;

export type TKeyEvent = TEvent & Readonly<{
	which: number;
	charCode: number;
}>;

export type TOptsView = Readonly<Partial<{
	/** Texture width. Default is 512. */
	width: number;
	/** Texture height. Default is 512. */
	height: number;
	/** Suppress error messages from QML runtime. */
	silent: boolean;
	/** If passed, this QML file starts loading immediately. */
	file: string;
	/** If passed, this QML source starts loading immediately. */
	source: string;
}>>;

export type TOptsLoad = Readonly<{ file: string }> | Readonly<{ source: string }>;

type TViewOpts = {
	width: number;
	height: number;
	silent: boolean;
	file?: string;
	source?: string;
};

type TQmlEvent = TEvent & {
	message?: string;
	source?: string;
	status?: string;
	texture?: number;
};

type TViewInterceptor = (type: string, data: unknown) => void;

const interceptorKey = Symbol('qmlInterceptor');

type TViewBinding = TNativeViewInstance & Emitter & {
	[interceptorKey]?: TViewInterceptor;
};

type TReEmitterThis = Emitter & {
	[interceptorKey]?: TViewInterceptor;
};

const { View: NativeView } = core;
const LOAD_TIMEOUT_MSEC = 5000;
const logger = getLogger('qml');

const ReEmitter = function ReEmitter(this: TReEmitterThis): void {
	Emitter.call(this);
};

ReEmitter.prototype.emit = function emit(
	this: TReEmitterThis,
	type: string | symbol,
	data?: unknown,
): boolean {
	if (typeof type === 'string' && this[interceptorKey]) {
		this[interceptorKey](type, data);
	}
	return Emitter.prototype.emit.call(this, type, data);
};

inherits(ReEmitter, Emitter);
inherits(NativeView, ReEmitter);

let inited = false;
let nextIndex = 0;
const globalLibs: string[] = [];
const viewInstances = new Map<number, View>();
let queueLoading: View[] = [];
let qmlCwd = process.cwd().replaceAll('\\', '/');

const emptyFunction = (): void => { /* nop */ };
const takeIndex = (): number => (++nextIndex);

const createEmptyView = (): TViewBinding => ({
	_libs: emptyFunction,
	_resize: emptyFunction,
	_mouse: emptyFunction,
	_keyboard: emptyFunction,
	_destroy: emptyFunction,
	_invoke: () => '[null]',
	_set: emptyFunction,
	_get: () => '[null]',
	_load: emptyFunction,
	isDestroyed: false,
	on: Emitter.prototype.on,
	emit: Emitter.prototype.emit,
}) as unknown as TViewBinding;

const parseJsonSafe = (json: string): unknown => {
	try {
		const parsed = JSON.parse(json) as readonly [unknown?];
		return parsed[0] ?? null;
	} catch {
		logger.error(`Error: Qml event, bad JSON.\n${json}`);
		return null;
	}
};

/**
 * Loads and manages a QML scene.
 *
 * Make sure to always switch back to your own OpenGL context before drawing.
 */
export class View extends Emitter {
	public constructor(opts: TOptsView = {}) {
		if (!inited) {
			throw new Error('Not inited. Call View.init(...) first.');
		}
		
		super();
		
		this.index = takeIndex();
		viewInstances.set(this.index, this);
		
		this.opts = {
			...opts,
			width: opts.width || 512,
			height: opts.height || 512,
			silent: Boolean(opts.silent),
		};
		this.widthValue = this.opts.width;
		this.heightValue = this.opts.height;
		
		View.enqueueLoad(this);
	}
	
	/** Is the requested QML file loaded? */
	public get isLoaded(): boolean { return this.loaded; }
	
	/** Width in pixels. */
	public get width(): number { return this.widthValue; }
	public set width(v: number) {
		if (this.widthValue === v) {
			return;
		}
		this.widthValue = v;
		this.viewBinding['_resize'](this.widthValue, this.heightValue);
	}
	
	/** Height in pixels. */
	public get height(): number { return this.heightValue; }
	public set height(v: number) {
		if (this.heightValue === v) {
			return;
		}
		this.heightValue = v;
		this.viewBinding['_resize'](this.widthValue, this.heightValue);
	}
	
	/** Alias for width. */
	public get w(): number { return this.width; }
	public set w(v: number) { this.width = v; }
	
	/** Alias for height. */
	public get h(): number { return this.height; }
	public set h(v: number) { this.height = v; }
	
	/** An array containing width and height. */
	public get wh(): [number, number] { return [this.width, this.height]; }
	public set wh([width, height]: [number, number]) { this.size = { width, height }; }
	
	/** An object containing width and height. */
	public get size(): TSize {
		return { width: this.width, height: this.height };
	}
	public set size({ width, height }: TSize) {
		if (this.widthValue === width && this.heightValue === height) {
			return;
		}
		this.widthValue = width;
		this.heightValue = height;
		this.viewBinding['_resize'](this.widthValue, this.heightValue);
	}
	
	/** OpenGL texture ID for QML scene RTT resource. */
	public get textureId(): number | null {
		return this.texture;
	}
	
	public [inspect.custom](): string { return this.toString(); }
	
	/** Stringification helper. */
	public toString(): string {
		return `View { ${this.widthValue}x${this.heightValue} ${
			this.loaded ? `loaded ${
				this.fileSource ? `file: ${this.source} ` : '[inline] '
			}` : ''
		}}`;
	}
	
	/** Send "mousedown" event into the QML scene. */
	public mousedown(e: TMouseEventPress): void {
		this.viewBinding['_mouse'](1, e.button, e.buttons, e.x, e.y);
	}
	
	/** Send "mouseup" event into the QML scene. */
	public mouseup(e: TMouseEventPress): void {
		this.viewBinding['_mouse'](2, e.button, e.buttons, e.x, e.y);
	}
	
	/** Send "mousemove" event into the QML scene. */
	public mousemove(e: TMouseEventCommon): void {
		this.viewBinding['_mouse'](0, 0, e.buttons, e.x, e.y);
	}
	
	/** Send "wheel" event into the QML scene. */
	public wheel(e: TMouseEventWheel): void {
		this.viewBinding['_mouse'](3, e.wheelDelta, e.buttons, e.x, e.y);
	}
	
	/** Send "keydown" event into the QML scene. */
	public keydown(e: TKeyEvent): void {
		this.viewBinding['_keyboard'](1, e.which, e.charCode);
	}
	
	/** Send "keyup" event into the QML scene. */
	public keyup(e: TKeyEvent): void {
		this.viewBinding['_keyboard'](0, e.which, e.charCode);
	}
	
	/**
	 * Load a new QML scene from file or source text.
	 *
	 * The old scene will be discarded, if any. A new texture will be created.
	 */
	public load(opts: TOptsLoad | Record<string, never> = {}): void {
		this.opts = { ...this.opts, ...opts };
		
		if (!this.constructed || this.loading) {
			return;
		}
		
		this.loading = true;
		this.loaded = false;
		this.fileSource = null;
		this.source = null;
		this.finalSource = null;
		this.texture = null;
		
		if (this.opts.file) {
			this.fileSource = true;
			this.source = this.opts.file;
		} else if (this.opts.source) {
			this.fileSource = false;
			this.source = this.opts.source;
		} else {
			throw new Error('To load QML, specify opts.file or opts.source.');
		}
		
		if (this.index === -1) {
			return;
		}
		
		if (this.fileSource) {
			this.finalSource = path.isAbsolute(this.source)
				? this.source
				: `${qmlCwd}/${this.source}`;
			
			this.viewBinding['_load'](true, this.finalSource);
			return;
		}
		
		this.finalSource = this.source;
		this.viewBinding['_load'](false, this.source);
	}
	
	/** Unload the current QML scene. */
	public destroy(): void {
		this.loading = false;
		this.loaded = false;
		this.fileSource = null;
		this.source = null;
		this.finalSource = null;
		this.texture = null;
		
		if (viewInstances.has(this.index)) {
			viewInstances.delete(this.index);
			this.viewBinding['_destroy']();
		}
		
		this.index = -1;
	}
	
	/** Invoke a method in QML scene. */
	public invoke(name: string, key: string, args: readonly unknown[]): unknown {
		return parseJsonSafe(this.viewBinding['_invoke'](name, key, JSON.stringify(args)));
	}
	
	/** Set property value of an object in QML scene. */
	public set(name: string, key: string, value: unknown): void {
		this.viewBinding['_set'](name, key, `[${JSON.stringify(value)}]`);
	}
	
	/** Get property value from an object in QML scene. */
	public get(name: string, key: string): unknown {
		return parseJsonSafe(this.viewBinding['_get'](name, key));
	}
	
	/**
	 * Initialize the QML engine.
	 *
	 * @param cwd base directory for QML file resolution. Usually, `process.cwd()`.
	 * @param wnd platform window handle, e.g. HWND on Windows.
	 * @param ctx OpenGL context shared with the QML render texture.
	 * @param device optional system display device, used only on Linux.
	 */
	public static init(cwd: string, wnd: number, ctx: number, device = 0): void {
		inited = true;
		qmlCwd = cwd.replaceAll('\\', '/');
		
		NativeView['_plugins'](`${qmlCwd}/plugins`);
		NativeView['_init'](qmlCwd, wnd, ctx, device, parseJsonSafe);
	}
	
	/** Register a QML "library" directory for `*.qml` import resolution. */
	public static libs(libraryPath: string): void {
		if (!inited) {
			throw new Error('Not inited. Call View.init(...) first.');
		}
		
		globalLibs.push(libraryPath);
		for (const view of viewInstances.values()) {
			view.viewBinding['_libs'](libraryPath);
		}
	}
	
	/** Register a QML plugin directory for low-level Qt plugin resolution. */
	public static plugins(pluginPath: string): void {
		if (!inited) {
			throw new Error('Not inited. Call View.init(...) first.');
		}
		
		NativeView['_plugins'](pluginPath);
	}
	
	/** Assign a QML style value. */
	public static style(name: string, fallback = ''): void {
		if (!inited) {
			throw new Error('Not inited. Call View.init(...) first.');
		}
		
		NativeView['_style'](name, fallback);
	}
	
	/**
	 * Update the QML scene.
	 *
	 * Required for async operations, such as signal/slot interaction.
	 */
	public static update(): void {
		NativeView.update();
	}
	
	private createView(): void {
		this.timeout = setTimeout(
			() => {
				this.timeout = null;
				View.finishLoad(this);
			},
			LOAD_TIMEOUT_MSEC,
		);
		
		this.viewBinding = new NativeView(this.widthValue, this.heightValue) as TViewBinding;
		this.viewBinding[interceptorKey] = (type, data) => {
			if (!type.startsWith('_qml_')) {
				this.emit(type, data);
			}
		};
		
		for (const libraryPath of globalLibs) {
			this.viewBinding['_libs'](libraryPath);
		}
		this.constructed = true;
		
		this.viewBinding.on('_qml_error', (data: TQmlEvent) => setImmediate(() => {
			if (!this.opts.silent) {
				logger.error(`Qml Error: (${data.type})`, data.message);
			}
			this.emit('error', new Error(`${data.type}: ${data.message}`));
		}));
		
		this.viewBinding.on('_qml_fbo', (data: TQmlEvent) => setImmediate(() => {
			this.texture = data.texture ?? null;
			this.emit('reset', this.texture);
		}));
		
		this.viewBinding.on('_qml_load', (data: TQmlEvent) => setImmediate(() => {
			if (data.source !== this.finalSource || data.status === 'loading') {
				return;
			}
			
			if (data.status !== 'success') {
				View.finishLoad(this);
				logger.error('Qml Error. Could not load:', this.source);
				return;
			}
			
			this.loaded = true;
			View.finishLoad(this);
			this.emit('load');
		}));
		
		this.viewBinding.on('_qml_mouse', (data: TQmlEvent) => setImmediate(() => {
			this.emit(data.type, data);
		}));
		this.viewBinding.on('_qml_key', (data: TQmlEvent) => setImmediate(() => {
			this.emit(data.type, data);
		}));
		
		if (this.opts.file || this.opts.source) {
			this.load();
		} else {
			setImmediate(() => View.finishLoad(this));
		}
	}
	
	private static enqueueLoad(view: View): void {
		queueLoading = [...queueLoading, view];
		if (queueLoading.length === 1) {
			view.createView();
		}
	}
	
	private static finishLoad(view: View): void {
		if (view.timeout) {
			clearTimeout(view.timeout);
			view.timeout = null;
		}
		
		view.loading = false;
		
		queueLoading = queueLoading.filter((item) => (item !== view));
		const [next] = queueLoading;
		if (next) {
			next.createView();
		}
	}
	
	private index = -1;
	private timeout: NodeJS.Timeout | null = null;
	private opts: TViewOpts;
	private loaded = false;
	private loading = false;
	private fileSource: boolean | null = null;
	private source: string | null = null;
	private finalSource: string | null = null;
	private widthValue = 512;
	private heightValue = 512;
	private texture: number | null = null;
	private constructed = false;
	private viewBinding = createEmptyView();
}
