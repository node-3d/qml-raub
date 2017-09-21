'use strict';

const EventEmitter = require('events');

const path = require('path');

const qml = require('./qml');


class View extends EventEmitter {
	
	constructor(opts) {
		
		super();
		this.setMaxListeners(0);
		
		this._silent = !! opts.silent;
		this.on('error', data => {
			if ( ! this._silent ) {
				console.error('Qml Error: (' + data.type + ')', data.message);
			}
		});
		
		this._destroy();
		
		// Expect FBO texture
		this.on('fbo', data => {
			this._textureId = data.texture;
			this.emit('reset', this._textureId);
		});
		
		this.on('ready', () => {
			
			this._isReady = true;
			
			this._libs.forEach(l => qml.libs(this._index, l));
			
			this._loadWhenReady();
			
		});
		
		this.on('use', e => {
			
			if ( ! this._isValid || e.used !== this._source) {
				return;
			}
			
			if (e.status !== 'success') {
				return console.error('Qml Error: could not use:', this._source);
			}
			
			this._isLoaded = true;
			this._variables.forEach(v => v._initialize());
			this._invokations.forEach(i => i());
			this._invokations = [];
			
		});
		
		this._index = qml.view(
			opts.width || 512, opts.height || 512,
			(data) => {
				let parsed = null;
				
				try {
					parsed = JSON.parse(data);
					try {
						this.emit(parsed.type, parsed.data);
					} catch (ex) {
						console.error(ex.stack);
					}
				} catch (ex) {
					console.error("Error: Qml event, bad JSON.", data);
				}
			}
		);
		
		View._libs.forEach(l => this.libs(l));
		
		if (opts.file || opts.source) {
			this.load(opts);
		}
		
	}
	
	
	resize(w, h) {
		qml.resize(this._index, w, h);
	}
	
	
	mousedown(e) {
		this.mbuttons |= (1 << e.button);
		qml.mouse(this._index, 1, e.button, this.mbuttons, e.x, e.y);
	}
	
	
	mouseup(e) {
		this.mbuttons &= ~(1 << e.button);
		qml.mouse(this._index, 2, e.button, this.mbuttons, e.x, e.y);
	}
	
	
	mousemove(e) {
		qml.mouse(this._index, 0, 0, this.mbuttons, e.x, e.y);
	}
	
	
	keydown(e) {
		qml.keyboard(
			this._index,
			1,
			e.which,
			e.keyCode > 0 && e.keyCode < 256 ?
				String.fromCharCode(e.keyCode).charCodeAt(0) || 0 :
				0
		);
	}
	
	
	keyup(e) {
		qml.keyboard(
			this._index,
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
		if (this._textureId === null) {
			console.log('Error: no qml textureId yet.', (new Error()).stack);
		}
		return this._textureId;
	}
	
	
	libs(directory) {
		
		this._libs.push(directory);
		
		if ( ! this._isReady ) {
			return;
		}
		
		qml.libs(this._index, directory);
		
	}
	
	
	variable(opts) {
		
		if ( ! this._isValid ) {
			return null;
		}
		
		const v = new Variable(opts);
		
		this._variables.push(v);
		
		if (this._isReady) {
			v._initialize();
		}
		
		return v;
		
	}
	
	
	invoke(name, key, value) {
		
		if ( ! this._isValid ) {
			return;
		}
		
		if (this._isReady) {
			this._invoke(name, key, value);
		} else {
			this._invokations.push(() => this._invoke(name, key, value));
		}
		
	}
	
	
	_loadWhenReady() {
		
		if (this._index > -1 && this._isReady && ! this._isLoaded) {
			qml.load(this._index, this._isFile, this._source);
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
		
		this._isReady = false;
		this._textureId = null;
		this._libs = [];
		this.mbuttons = 0;
		
		if (View._instances[this._index]) {
			delete View._instances[this._index];
			qml.close(this._index);
		}
		
		this._index = -1;
		
	}
	
	
	update() {
		if (this._isLoaded) {
			this._variables.forEach(v => v.update());
		}
	}
	
};


View._instances = {};

View._libs = [];

View._addLibDir = (l) => {
	
	View._libs.push(l);
	
	Object.keys(View._instances).forEach(w => w.libs(l));
	
};


module.exports = View;
