'use strict';

const path = require('node:path');
const { inspect, inherits } = require('node:util');
const Emitter = require('events');

const { View } = require('../core');


let inited = false;

let nextIndex = 0;
const takeIndex = () => (++nextIndex);

const globalLibs = [];
const viewInstances = {};

let qmlCwd = process.cwd().replace(/\\/g, '/');

const parseJsonSafe = (json) => {
	try {
		return JSON.parse(json)[0];
	} catch (e) {
		console.error(`Error: Qml event, bad JSON.\n${json}`);
		return null;
	}
};

inherits(View, Emitter);

class JsView extends View {
	constructor(opts = {}) {
		if (!inited) {
			throw new Error('Not inited. Call View.init(...) first.');
		}
		
		const width = opts.width || 512;
		const height = opts.height || 512;
		
		super(width, height);
		
		this._unload();
		
		this._textureId = null;
		
		this._width = width;
		this._height = height;
		
		globalLibs.forEach((l) => this._libs(l));
		
		this._index = takeIndex();
		viewInstances[this._index] = this;
		
		this._silent = !! opts.silent;
		this.on('_qml_error', (data) => {
			if (!this._silent) {
				console.error(`Qml Error: (${data.type})`, data.message);
			}
			this.emit('error', new Error(`${data.type}: ${data.message}`));
		});
		
		// Expect FBO texture
		this.on('_qml_fbo', (data) => {
			this._textureId = data.texture;
			this.emit('reset', this._textureId);
		});
		
		
		this.on('_qml_load', (e) => {
			if (e.source !== this._finalSource) {
				return;
			}
			
			if (e.status === 'loading') {
				return;
			}
			
			if (e.status !== 'success') {
				return console.error('Qml Error. Could not load:', this._source);
			}
			
			this._isLoaded = true;
			
			this.emit('load');
		});
		
		this.on('_qml_mouse', (e) => this.emit(e.type, e));
		this.on('_qml_key', (e) => this.emit(e.type, e));
		
		if (opts.file || opts.source) {
			this.load(opts);
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
		this.resize(this._width, this._height);
	}
	set height(v) {
		if (this._height === v) {
			return;
		}
		this._height = v;
		this.resize(this._width, this._height);
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
		this._resize(this._width, this._height);
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
		this._mouse(1, e.button, e.buttons, e.x, e.y);
	}
	
	mouseup(e) {
		this._mouse(2, e.button, e.buttons, e.x, e.y);
	}
	
	
	mousemove(e) {
		this._mouse(0, 0, e.buttons, e.x, e.y);
	}
	
	wheel(e) {
		this._mouse(3, e.wheelDelta, e.buttons, e.x, e.y);
	}
	
	keydown(e) {
		this._keyboard(1, e.which, e.charCode);
	}
	
	keyup(e) {
		this._keyboard(0, e.which, e.charCode);
	}
	
	load(opts) {
		this._unload();
		
		if (opts.file) {
			this._isFile = true;
			this._source = opts.file;
		} else if (opts.source) {
			this._isFile = false;
			this._source = opts.source;
		} else {
			throw new Error('To load QML, specify opts.file or opts.source.');
		}
		
		this._loadWhenReady();
	}
	
	_loadWhenReady() {
		if (this._isLoaded || this._index === -1) {
			return;
		}
		
		if (this._isFile) {
			this._finalSource = path.isAbsolute(this._source)
				? this._source
				: `${qmlCwd}/${this._source}`;
				
			this._load(true, this._finalSource);
		} else {
			this._finalSource = this._source;
			this._load(false, this._source);
		}
	}
	
	_unload() {
		this._isLoaded = false;
		this._isFile = null;
		this._source = null;
		this._finalSource = null;
	}
	
	destroy() {
		this._unload();
		
		this._textureId = null;
		
		if (viewInstances[this._index]) {
			delete viewInstances[this._index];
			this._destroy();
		}
		
		this._index = -1;
	}
	
	invoke(name, key, args) {
		return parseJsonSafe(this._invoke(name, key, JSON.stringify(args)));
	}
	
	set(name, key, value) {
		this._set(name, key, `[${JSON.stringify(value)}]`);
	}
	
	get(name, key) {
		return parseJsonSafe(this._get(name, key));
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
		Object.entries(viewInstances).forEach((k, v) => v._libs(l));
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
}

module.exports = JsView;
