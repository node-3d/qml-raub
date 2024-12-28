'use strict';

const path = require('node:path');
const { inspect, inherits } = require('node:util');
const Emitter = require('node:events');

const { View } = require('../core');


function ReEmitter() {}
ReEmitter.prototype = {
	emit(type, data) {
		if (this.__interceptor) {
			this.__interceptor(type, data);
		}
		return super.emit(type, data);
	}
};

inherits(ReEmitter, Emitter);
inherits(View, ReEmitter);


let inited = false;
let nextIndex = 0;
const globalLibs = [];
const viewInstances = {};
let queueLoading = [];
let emptyFunction = () => null;
let qmlCwd = process.cwd().replace(/\\/g, '/');

const takeIndex = () => (++nextIndex);

const parseJsonSafe = (json) => {
	try {
		return JSON.parse(json)[0];
	} catch (_e) {
		console.error(`Error: Qml event, bad JSON.\n${json}`);
		return null;
	}
};

class JsView extends Emitter {
	constructor(opts = {}) {
		if (!inited) {
			throw new Error('Not inited. Call View.init(...) first.');
		}
		
		super();
		
		this._index = takeIndex();
		viewInstances[this._index] = this;
		this._timeout = null;
		
		this._opts = {
			...opts,
			width: opts.width || 512,
			height: opts.height || 512,
			silent: !!opts.silent,
		};
		
		this._isLoaded = false;
		this._isFile = null;
		this._source = null;
		this._finalSource = null;
		this._width = this._opts.width;
		this._height = this._opts.height;
		this._textureId = null;
		this._isConstructed = false;
		
		// This is fake temporary plug to receive event calls before `new View` is ready
		this._view = {
			_libs: emptyFunction,
			_resize: emptyFunction,
			_mouse: emptyFunction,
			_keyboard: emptyFunction,
			_destroy: emptyFunction,
			_invoke: emptyFunction,
			_set: emptyFunction,
			_get: emptyFunction,
		};
		
		JsView._enqueueLoad(this);
	}
	
	
	static _enqueueLoad(view) {
		queueLoading = [...queueLoading, view];
		if (queueLoading.length === 1) {
			view._createView();
		}
	}
	
	static _finishLoad(view) {
		if (view._timeout) {
			clearTimeout(view._timeout);
			view._timeout = null;
		}
		view._isLoading = false;
		
		queueLoading = queueLoading.filter((item) => (item !== view));
		const [next] = queueLoading;
		if (next) {
			next._createView();
		}
	}
	
	_createView() {
		this._timeout = setTimeout(
			() => {
				this._timeout = null;
				JsView._finishLoad(this);
			},
			5000,
		);
		
		this._view = new View(this._width, this._height);
		this._view.__interceptor = (type, data) => {
			if (!type.startsWith('_qml_')) {
				this.emit(type, data);
			}
		};
		
		globalLibs.forEach((l) => this._view._libs(l));
		this._isConstructed = true;
		
		this._view.on('_qml_error', (data) => setImmediate(() => {
			if (!this._opts.silent) {
				console.error(`Qml Error: (${data.type})`, data.message);
			}
			this.emit('error', new Error(`${data.type}: ${data.message}`));
		}));
		
		// Expect FBO texture
		this._view.on('_qml_fbo', (data) => setImmediate(() => {
			this._textureId = data.texture;
			this.emit('reset', this._textureId);
		}));
		
		this._view.on('_qml_load', (e) => setImmediate(() => {
			if (e.source !== this._finalSource) {
				return;
			}
			
			if (e.status === 'loading') {
				return;
			}
			
			if (e.status !== 'success') {
				JsView._finishLoad(this);
				return console.error('Qml Error. Could not load:', this._source);
			}
			
			this._isLoaded = true;
			JsView._finishLoad(this);
			this.emit('load');
		}));
		
		this._view.on('_qml_mouse', (e) => setImmediate(() => this.emit(e.type, e)));
		this._view.on('_qml_key', (e) => setImmediate(() => this.emit(e.type, e)));
		
		if (this._opts.file || this._opts.source) {
			this.load();
		} else {
			setImmediate(() => JsView._finishLoad(this));
		}
	}
	
	get isLoaded() { return this._isLoaded; }
	
	get width() { return this._width; }
	get height() { return this._height; }
	
	set width(v) {
		if (this._width === v) {
			return;
		}
		this._width = v;
		this._view._resize(this._width, this._height);
	}
	set height(v) {
		if (this._height === v) {
			return;
		}
		this._height = v;
		this._view._resize(this._width, this._height);
	}
	
	get w() { return this.width; }
	set w(v) { this.width = v; }
	get h() { return this.height; }
	set h(v) { this.height = v; }
	get wh() { return [this.width, this.height]; }
	set wh([width, height]) { this.size = { width, height }; }
	
	get size() {
		return { width: this.width, height: this.height };
	}
	
	set size({ width, height }) {
		if (this._width === width && this._height === height) {
			return;
		}
		this._width = width;
		this._height = height;
		this._view._resize(this._width, this._height);
	}
	
	get textureId() {
		return this._textureId;
	}
	
	[inspect.custom]() { return this.toString(); }
	
	toString() {
		return `View { ${this._width}x${this._height} ${
			this._isLoaded ? `loaded ${
				this._isFile ? `file: ${this._source} ` : '[inline] '
			}` : ''
		}}`;
	}
	
	mousedown(e) {
		this._view._mouse(1, e.button, e.buttons, e.x, e.y);
	}
	
	mouseup(e) {
		this._view._mouse(2, e.button, e.buttons, e.x, e.y);
	}
	
	
	mousemove(e) {
		this._view._mouse(0, 0, e.buttons, e.x, e.y);
	}
	
	wheel(e) {
		this._view._mouse(3, e.wheelDelta, e.buttons, e.x, e.y);
	}
	
	keydown(e) {
		this._view._keyboard(1, e.which, e.charCode);
	}
	
	keyup(e) {
		this._view._keyboard(0, e.which, e.charCode);
	}
	
	load(opts = {}) {
		this._opts = { ...this._opts, ...opts };
		
		// If not constructed yet, just let it cook
		if (!this._isConstructed) {
			return;
		}
		
		// If already loading something - ignore
		if (this._isLoading) {
			return;
		}
		
		this._isLoading = true;
		this._isLoaded = false;
		this._isFile = null;
		this._source = null;
		this._finalSource = null;
		this._textureId = null;
		
		if (this._opts.file) {
			this._isFile = true;
			this._source = this._opts.file;
		} else if (this._opts.source) {
			this._isFile = false;
			this._source = this._opts.source;
		} else {
			throw new Error('To load QML, specify opts.file or opts.source.');
		}
		
		if (this._isLoaded || this._index === -1) {
			return;
		}
		
		if (this._isFile) {
			this._finalSource = path.isAbsolute(this._source)
				? this._source
				: `${qmlCwd}/${this._source}`;
				
			this._view._load(true, this._finalSource);
		} else {
			this._finalSource = this._source;
			this._view._load(false, this._source);
		}
	}
	
	destroy() {
		this._isLoading = false;
		this._isLoaded = false;
		this._isFile = null;
		this._source = null;
		this._finalSource = null;
		this._textureId = null;
		
		if (viewInstances[this._index]) {
			delete viewInstances[this._index];
			this._view._destroy();
		}
		
		this._index = -1;
	}
	
	invoke(name, key, args) {
		return parseJsonSafe(this._view._invoke(name, key, JSON.stringify(args)));
	}
	
	set(name, key, value) {
		this._view._set(name, key, `[${JSON.stringify(value)}]`);
	}
	
	get(name, key) {
		return parseJsonSafe(this._view._get(name, key));
	}
	
	static init(cwd, wnd, ctx, device = 0) {
		inited = true;
		qmlCwd = cwd.replace(/\\/g, '/');
		
		View._plugins(`${qmlCwd}/plugins`);
		View._init(qmlCwd, wnd, ctx, device, parseJsonSafe);
	}
	
	static libs(l) {
		if (!inited) {
			throw new Error('Not inited. Call View.init(...) first.');
		}
		
		globalLibs.push(l);
		Object.values(viewInstances).forEach((v) => v._libs(l));
	}
	
	static plugins(p) {
		if (!inited) {
			throw new Error('Not inited. Call View.init(...) first.');
		}
		
		View._plugins(p);
	}
	
	static style(name, def) {
		if (!inited) {
			throw new Error('Not inited. Call View.init(...) first.');
		}
		
		View._style(name, def);
	}
	
	static update() {
		View.update();
	}
}

module.exports = JsView;
