'use strict';

const path = require('path');
const util = require('util');

const { View } = require('../core');


class JsView extends View {
	
	static init(cwd, ...args) {
		
		JsView.__inited = true;
		
		JsView.__cwd = cwd.replace(/\\/g, '/');
		
		View.init(JsView.__cwd, ...args);
		
	}
	
	
	static libs(l) {
		
		if ( ! JsView.__inited ) {
			throw new Error('Not inited. Call View.init(...) first.');
		}
		
		JsView.__libs.push(l);
		
		Object.entries(JsView.__instances).forEach((k, v) => v.libs(l));
		
	}
	
	
	static plugins(p) {
		
		if ( ! JsView.__inited ) {
			throw new Error('Not inited. Call View.init(...) first.');
		}
		
		View.plugins(p);
		
	}
	
	
	static __offerIdx() {
		
		return ++JsView.__index;
		
	}
	
	
	constructor(opts = {}) {
		
		if ( ! JsView.__inited ) {
			throw new Error('Not inited. Call View.init(...) first.');
		}
		
		const width = opts.width || opts.w || 512;
		const height = opts.height || opts.h || 512;
		
		super(width, height);
		
		this._unload();
		
		this._textureId = null;
		
		this._mbuttons = 0;
		
		this._width = width;
		this._height = height;
		
		JsView.__libs.forEach(l => this.libs(l));
		
		this._index = JsView.__offerIdx();
		JsView.__instances[this._index] = this;
		
		
		this._silent = !! opts.silent;
		this.on('_qml_error', data => {
			console.error(`Qml Error: (${data.type})`, data.message);
			this.emit('error', new Error(`${data.type}: ${data.message}`));
		});
		
		// Expect FBO texture
		this.on('_qml_fbo', data => {
			this._textureId = data.texture;
			this.emit('reset', this._textureId);
		});
		
		
		this.on('_qml_load', e => {
			
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
			
			this._properties.forEach(v => v._initialize());
			this._methods.forEach(m => m._initialize());
			
		});
		
		if (opts.file || opts.source) {
			this.load(opts);
		}
		
	}
	
	
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
		this.resize(this._width, this._height);
	}
	
	get textureId() {
		return this._textureId;
	}
	
	[util.inspect.custom]() { return this.toString(); }
	
	toString() {
		return `View { ${this._width}x${this._height} ${
			this._isLoaded ? `loaded ${
				this._isFile ? `file: ${this._source} ` : '[inline] '
			}` : ''
		}}`;
	}
	
	
	mousedown(e) {
		this._mbuttons |= (1 << e.button);
		this.mouse(1, e.button, this._mbuttons, e.x, e.y);
	}
	
	
	mouseup(e) {
		this._mbuttons &= ~(1 << e.button);
		this.mouse(2, e.button, this._mbuttons, e.x, e.y);
	}
	
	
	mousemove(e) {
		this.mouse(0, 0, this._mbuttons, e.x, e.y);
	}
	
	
	keydown(e) {
		this.keyboard(
			1,
			e.which,
			(e.keyCode > 0 && e.keyCode < 256) ?
				(String.fromCharCode(e.keyCode).charCodeAt(0) || 0) :
				0
		);
	}
	
	
	keyup(e) {
		this.keyboard(
			0,
			e.which,
			(e.keyCode > 0 && e.keyCode < 256) ?
				(String.fromCharCode(e.keyCode).charCodeAt(0) || 0) :
				0
		);
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
			
			this._finalSource = path.isAbsolute(this._source) ?
				this._source :
				`${JsView.__cwd}/${this._source}`;
				
			super.load(true, this._finalSource);
			
		} else {
			this._finalSource = this._source;
			super.load(false, this._source);
		}
		
	}
	
	
	_unload() {
		
		this._isLoaded = false;
		
		this._isFile = null;
		this._source = null;
		this._finalSource = null;
		
		this._properties = [];
		this._methods = [];
		
	}
	
	
	destroy() {
		
		this._unload();
		
		this._textureId = null;
		
		if (View.__instances[this._index]) {
			delete View.__instances[this._index];
			super.destroy();
		}
		
		this._index = -1;
		
	}
	
	
	update() {
		if (this._isLoaded) {
			this._properties.forEach(v => v.update());
		}
	}
	
}


JsView.__inited = false;
JsView.__libs = [];
JsView.__instances = {};
JsView.__index = 0;


module.exports = JsView;
