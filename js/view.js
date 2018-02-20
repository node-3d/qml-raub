'use strict';

const path = require('path');
const util = require('util');
const EventEmitter = require('events');

const { View } = require('../core');


class JsView extends EventEmitter {
	
	static init(cwd, ...args) {
		JsView.__cwd = cwd.replace(/\\/g, '/');
		View.init(JsView.__cwd, ...args);
	}
	
	
	static libs(l) {
		
		if ( ! JsView.__libs ) {
			JsView.__libs = [];
		}
		
		JsView.__libs.push(l);
		
		Object.keys(JsView.__instances).forEach(v => v._view.libs(l));
		
	}
	
	
	static plugins(p) {
		
		View.plugins(p);
		
	}
	
	
	static __offerIdx() {
		
		View.__index = (View.__index || 0) + 1;
		return View.__index;
		
	}
	
	
	constructor(opts = {}) {
		
		super();
		
		if ( ! JsView.__libs ) {
			JsView.__libs = [];
		}
		
		this.setMaxListeners(0);
		
		this.__index = JsView.__offerIdx();
		
		this._width = opts.width || opts.w || 512;
		this._height = opts.height || opts.h || 512;
		
		this._emitter = {
			emit: data => {
				try {
					const parsed = JSON.parse(data);
					try {
						this.emit(parsed.type, parsed.data);
					} catch (e) {
						console.error(e);
					}
				} catch (e) {
					console.error("Error: Qml event, bad JSON.", data);
				}
			}
		};
		
		this._view = new View(this._emitter, this._width, this._height);
		
		JsView.__libs.forEach(l => this._view.libs(l));
		
		
		if ( ! JsView.__instances ) {
			JsView.__instances = {};
		}
		JsView.__instances[this.__index] = this;
		
		
		this._silent = !! opts.silent;
		this.on('error', data => {
			if ( ! this._silent ) {
				console.error('Qml Error: (' + data.type + ')', data.message);
			}
		});
		
		// Expect FBO texture
		this.on('fbo', data => {
			this._textureId = data.texture;
			this.emit('reset', this._textureId);
		});
		
		
		this.on('load', e => {
			
			if (e.loaded !== this._source) {
				return;
			}
			
			if (e.status !== 'success') {
				return console.error('Qml Error. Could not load:', this._source);
			}
			
			this._isLoaded = true;
			this._variables.forEach(v => v._initialize());
			this._invokations.forEach(i => i());
			this._invokations = [];
			
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
		this._view.resize(this._width, this._height);
	}
	set height(v) {
		if (this._height === v) {
			return;
		}
		this._height = v;
		this._view.resize(this._width, this._height);
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
		this._view.resize(this._width, this._height);
	}
	
	
	destroy(...args) { return this._view.destroy(...args); }
	
	[util.inspect.custom]() { return this.toString(); }
	
	toString() {
		return `View { }`
	}
	
	
	mousedown(e) {
		this.mbuttons |= (1 << e.button);
		this._view.mouse(1, e.button, this.mbuttons, e.x, e.y);
	}
	
	
	mouseup(e) {
		this.mbuttons &= ~(1 << e.button);
		this._view.mouse(2, e.button, this.mbuttons, e.x, e.y);
	}
	
	
	mousemove(e) {
		this._view.mouse(0, 0, this.mbuttons, e.x, e.y);
	}
	
	
	keydown(e) {
		this._view.keyboard(
			1,
			e.which,
			e.keyCode > 0 && e.keyCode < 256 ?
				String.fromCharCode(e.keyCode).charCodeAt(0) || 0 :
				0
		);
	}
	
	
	keyup(e) {
		this._view.keyboard(
			0,
			e.which,
			e.keyCode > 0 && e.keyCode < 256 ?
				String.fromCharCode(e.keyCode).charCodeAt(0) || 0 :
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
	
	get textureId() {
		return this._textureId;
	}
	
	// variable(opts) {
		
	// 	if ( ! this._isValid ) {
	// 		return null;
	// 	}
		
	// 	const v = new Variable({ view: this, ...opts });
		
	// 	this._variables.push(v);
		
	// 	if (this._isLoaded) {
	// 		v._initialize();
	// 	}
		
	// 	return v;
		
	// }
	
	
	
	_loadWhenReady() {
		
		if (this._isLoaded || this._index === -1) {
			return;
		}
		
		if (this._isFile) {
			
			const realPath = path.isAbsolute(this._source) ?
				this._source :
				`${JsView.__cwd}/${this._source}`;
			console.log('view.js', this._view, this._view.load);
			this._view.load(true, realPath);
			
		} else {
			this._view.load(false, this._source);
		}
		
	}
	
	
	_unload() {
		
		this._isLoaded = false;
		this._isValid  = true;
		
		this._file   = null;
		this._text   = null;
		this._isFile = null;
		this._source = null;
		
		this._variables   = [];
		this._invokations = [];
		
	}
	
	
	_destroy() {
		
		this._unload();
		
		this._textureId = null;
		this.mbuttons = 0;
		
		if (View.__instances[this._index]) {
			delete View.__instances[this._index];
			this._view.destroy();
		}
		
		this._index = -1;
		
	}
	
	
	update() {
		if (this._isLoaded) {
			this._variables.forEach(v => v.update());
		}
	}
	
}


module.exports = JsView;
