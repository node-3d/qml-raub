declare module "qml-raub" {
	type TSize = Readonly<{ width: number; height: number }>;
	
	type TEvent = {
		type: string;
		[key: string]: unknown;
	};
	
	type TMouseEventCommon = Readonly<{
		buttons: number[],
		x: number,
		y: number,
	}>;
	
	type TMouseEventPress = TMouseEventCommon & Readonly<{
		button: number,
	}>;
	
	type TMouseEventWheel = TMouseEventCommon & Readonly<{
		wheelDelta: number,
	}>;
	
	type TKeyEvent = Readonly<{
		which: number,
		charCode: number,
	}>;
	
	type TEventCb<T extends TEvent> = (event: T) => (void | boolean);
	
	type EventEmitter = import('node:events').EventEmitter;
	
	export type TOptsView = Readonly<Partial<{
		/** Texture width. Default is 512. */
		width: number;
		/** Texture height. Default is 512. */
		height: number;
		/** Suppress error messages from QML runtime. */
		silent: boolean;
		/** If passed, this QML file starts loading immediately. */
		file: string;
	}>>;
	
	export type TOptsLoad = Readonly<{ file: string }> | Readonly<{ source: string }>;
	
	/**
	 * View
	 *
	 * Loads and manages a QML file.
	*/
	export class View implements EventEmitter {
		constructor(opts?: TOptsView);
		
		/**
		 * Width in pixels.
		 */
		width: number;
		
		/**
		 * Height in pixels.
		 */
		height: number;
		
		/** Alias for width. */
		w: number;
		
		/** Alias for height. */
		h: number;
		
		/** An Array, containing width and height. */
		wh: [number, number];
		
		/** An Object, containing width and height. */
		size: TSize;
		
		/** Is the requested QML file loaded? */
		readonly isLoaded: boolean;
		
		/** OpenGL texture ID for QML scene RTT resource. */
		readonly textureId: number;
		
		/** Stringification helper. */
		toString(): string;
		
		/** Send "mousedown" event into the QML scene. */
		mousedown(e: TMouseEventPress): void;
		
		/** Send "mouseup" event into the QML scene. */
		mouseup(e: TMouseEventPress): void;
		
		/** Send "mousemove" event into the QML scene. */
		mousemove(e: TMouseEventCommon): void;
		
		/** Send "wheel" event into the QML scene. */
		wheel(e: TMouseEventWheel): void;
		
		/** Send "keydown" event into the QML scene. */
		keydown(e: TKeyEvent): void;
		
		/** Send "keyup" event into the QML scene. */
		keyup(e: TKeyEvent): void;
		
		/** Load a new QML scene from file or source text. */
		load(opts: TOptsLoad): void;
		
		/** Unload the current QML scene. */
		destroy(): void;
		
		/** Invoke a method in QML scene. */
		invoke(name: string, key: string, args: unknown[]): unknown;
		
		/** Set property value of an object in QML scene. */
		set(name: string, key: string, value: unknown): void;
		
		/** Get property value from an object in QML scene. */
		get(name: string, key: string): unknown;
		
		/** Initialize the QML engine. */
		static init(cwd: string, wnd: number, ctx: number): void;
		
		/** Register a QML "library" directory. */
		static libs(l: string): void;
		
		/** Register a QML "plugin" directory. */
		static plugins(p: string): void;
		
		/** Assign QML style value. */
		static style(name: string, def: string): void;
		
		/** Update the QML scene (similar to "pollEvents" for a window). */
		static update(): void;
		
		// ------ implements EventEmitter
		
		addListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
		on(eventName: string | symbol, listener: (...args: any[]) => void): this;
		once(eventName: string | symbol, listener: (...args: any[]) => void): this;
		removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
		off(eventName: string | symbol, listener: (...args: any[]) => void): this;
		removeAllListeners(event?: string | symbol): this;
		setMaxListeners(n: number): this;
		getMaxListeners(): number;
		listeners(eventName: string | symbol): Function[];
		rawListeners(eventName: string | symbol): Function[];
		emit(eventName: string | symbol, ...args: any[]): boolean;
		listenerCount(eventName: string | symbol, listener?: Function): number;
		prependListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
		prependOnceListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
		eventNames(): Array<string | symbol>;
	}
	
	export type TOptsProperty<T> = Readonly<{
		/** QML View instance */
		view: View;
		/** Target object name. */
		name: string;
		/** Property key. */
		key: string;
		/** Optional initial value - will be sent to QML scene ASAP. */
		value?: T;
	}>;
	
	export class Property<T> {
		constructor(opts: TOptsProperty<T>);
		
		get value(): T | null;
		set value(v: T);
	}
	
	export type TOptsMethod = Readonly<{
		/** QML View instance */
		view: View;
		/** Target object name. */
		name: string;
		/** Property key. */
		key: string;
	}>;
	
	interface TNewableMethod {
		new(opts: TOptsMethod): (...args: unknown[]) => unknown;
	}
	
	export const Method: TNewableMethod;
}
