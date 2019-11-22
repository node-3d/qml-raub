'use strict';

const path = require('path');
const { inspect, inherits } = require('util');
const Emitter = require('events');

const { View } = require('../core');


inherits(View, Emitter);


function JsView(opts = {}) {
	
	if ( ! JsView.__inited ) {
		throw new Error('Not inited. Call View.init(...) first.');
	}
	
	const width = opts.width || opts.w || 512;
	const height = opts.height || opts.h || 512;
	
	View.call(this, width, height);
	
	this._unload();
	
	this._textureId = null;
	
	this._width = width;
	this._height = height;
	
	JsView.__libs.forEach(l => this.libs(l));
	
	this._index = JsView.__offerIdx();
	JsView.__instances[this._index] = this;
	
	
	this._silent = !! opts.silent;
	this.on('_qml_error', data => {
		if ( ! this._silent ) {
			console.error(`Qml Error: (${data.type})`, data.message);
		}
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
		
		this.emit('load')
		
	});
	
	this.on('_qml_mouse', e => this.emit(e.type, e));
	this.on('_qml_key', e => this.emit(e.type, e));
	
	if (opts.file || opts.source) {
		this.load(opts);
	}
	
}


const parseJsonSafe = json => {
	try {
		return JSON.parse(json)[0];
	} catch (e) {
		console.error(`Error: Qml event, bad JSON.\n${json}`);
		return null;
	}
};


JsView.init = (cwd, wnd, ctx) => {
	JsView.__inited = true;
	JsView.__cwd = cwd.replace(/\\/g, '/');
	View.init(JsView.__cwd, wnd, ctx, parseJsonSafe);
};


JsView.libs = l => {
	
	if ( ! JsView.__inited ) {
		throw new Error('Not inited. Call View.init(...) first.');
	}
	
	JsView.__libs.push(l);
	
	Object.entries(JsView.__instances).forEach((k, v) => v.libs(l));
	
};


JsView.plugins = p => {
	
	if ( ! JsView.__inited ) {
		throw new Error('Not inited. Call View.init(...) first.');
	}
	
	View.plugins(p);
	
};


JsView.update = View.update;
JsView.style = View.style;


JsView.__offerIdx = () => (++JsView.__index);


JsView.__inited = false;
JsView.__libs = [];
JsView.__instances = {};
JsView.__index = 0;


JsView.prototype = {
	
	get isLoaded() { return this._isLoaded; },
	
	get width() { return this._width; },
	get height() { return this._height; },
	
	set width(v) {
		if (this._width === v) {
			return;
		}
		this._width = v;
		this.resize(this._width, this._height);
	},
	set height(v) {
		if (this._height === v) {
			return;
		}
		this._height = v;
		this.resize(this._width, this._height);
	},
	
	get w() { return this.width; },
	set w(v) { this.width = v; },
	get h() { return this.height; },
	set h(v) { this.height = v; },
	get wh() { return [this.width, this.height]; },
	set wh([width, height]) { this.size = { width, height }; },
	
	
	get size() {
		return { width: this.width, height: this.height };
	},
	
	set size({ width, height }) {
		if (this._width === width && this._height === height) {
			return;
		}
		this._width = width;
		this._height = height;
		this.resize(this._width, this._height);
	},
	
	get textureId() {
		return this._textureId;
	},
	
	[inspect.custom]() { return this.toString(); },
	
	toString() {
		return `View { ${this._width}x${this._height} ${
			this._isLoaded ? `loaded ${
				this._isFile ? `file: ${this._source} ` : '[inline] '
			}` : ''
		}}`;
	},
	
	
	mousedown(e) {
		this.mouse(1, e.button, e.buttons, e.x, e.y);
	},
	
	
	mouseup(e) {
		this.mouse(2, e.button, e.buttons, e.x, e.y);
	},
	
	
	mousemove(e) {
		this.mouse(0, 0, e.buttons, e.x, e.y);
	},
	
	wheel(e) {
		this.mouse(3, e.wheelDelta, e.buttons, e.x, e.y);
	},
	
	keydown(e) {
		this.keyboard(1, e.which, e.charCode);
	},
	
	
	keyup(e) {
		this.keyboard(0, e.which, e.charCode);
	},
	
	
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
		
	},
	
	
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
		
	},
	
	
	_unload() {
		
		this._isLoaded = false;
		
		this._isFile = null;
		this._source = null;
		this._finalSource = null;
		
	},
	
	
	destroy() {
		
		this._unload();
		
		this._textureId = null;
		
		if (View.__instances[this._index]) {
			delete View.__instances[this._index];
			super.destroy();
		}
		
		this._index = -1;
		
	},
	
	
	invoke(name, key, args) {
		return parseJsonSafe(super.invoke(name, key, JSON.stringify(args)));
	},
	
	
	set(name, key, value) {
		super.set(name, key, `[${JSON.stringify(value)}]`);
	},
	
	
	get(name, key) {
		return parseJsonSafe(super.get(name, key));
	},
	
};

inherits(JsView, View);

module.exports = JsView;
