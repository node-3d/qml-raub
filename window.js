'use strict';

const EventEmitter = require('events');

const path = require('path');

const qml = require('./qml');


class Window extends EventEmitter {
	
	constructor(opts) {
		
		super();
		this.setMaxListeners(0);
		
		this._isReady = false;
		
		this._silent    = !! opts.silent;
		
		this._textureId = null;
		
		this._libs = opts.libs || [];
		
		this.mbuttons = 0;
		
		this._enqueuedQml = null;
		
		this._unload();
		
		// Expect FBO texture. Automatic Overlay created/updated as needed
		this.on('fbo', data => {
			this._textureId = data.texture;
			this.emit('reset', this._textureId);
		});
		
		this.on('error', data => {
			if ( ! this._silent ) {
				console.error('Qml Error: (' + data.type + ')', data.message);
			}
		});
		
		this.on('ready', () => {
			
			this._isReady = true;
			
			this._libs.forEach(l => qml.libs(this._index, l));
			
			if (this._enqueuedQml) {
				this._loadEnqueued();
			}
			
		});
		
		this.on('use', e => {
			
			if ( ! this._isValid || e.used !== this._source) {
				return;
			}
			
			if (e.status !== 'success') {
				return console.error('Qml Error: could not use:', this._source);
			}
			
			this._isReady = true;
			this._variables.forEach(v => v._ready());
			this._invokations.forEach(i => i());
			this._invokations = [];
			
		});
		
		this._index = qml.window(
			opts.width, opts.height,
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
		
		if (error) {
			console.error(error);
		}
		
		Window._libs.forEach(l => this.libs(l));
		
	}
	
	
	resize(w, h) {
		this._qml.resize(this._index, w, h);
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
	
	
	get context() { return this._qml; }
	
	
	load(opts) {
		
		if (this._used) {
			this._used._destroy();
		}
		
		_loadWhenReady();
		
		return this._used;
		
	}
	
	
	get isTracing() { return this._isTracing; }
	set isTracing(v) {
		if (v) {
			process.env.QML_IMPORT_TRACE = 'true';
		} else {
			delete process.env.QML_IMPORT_TRACE;
		}
	}
	
	
	get textureId() {
		if (this._textureId === null) {
			console.log('Error: no qml textureId yet.', (new Error()).stack);
		}
		return this._textureId;
	}
	
	
	libs(l) {
		
		this._libs.push(l);
		
		if ( ! this._isReady ) {
			return;
		}
		
		this._libs(l);
		
	}
	
	
	variable(opts) {
		
		if ( ! this._isValid ) {
			return null;
		}
		
		const v = new Variable(opts);
		
		
		this._variables.push(v);
		
		if (this._isReady) {
			v._ready();
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
	
	
	_invoke(name, key, value) {
		const error = qml.invoke(this._index, name, key, JSON.stringify(value));
		if (error) {
			console.error(error);
		}
		return error;
	}
	
	
	_get(key, name) {
		const error = qml.get(key, name);
		if (error) {
			console.error(error);
		}
		return error;
	}
	
	
	_set(a, b, c) {
		const error = qml.set(this._index, a, b, JSON.stringify(c));
		if (error) {
			console.error(error);
		}
		return error;
	}
	
	
	_load(isFile, source) {
		const error = qml.use(this._index, isFile, source);
		if (error) {
			console.error(error);
		}
		return error;
	}
	
	
	_loadWhenReady() {
		this._isEnqueued = ! this._isReady;
		if (this._isValid) {
			this._load(this._isFile, this._source);
		}
	}
	
	
	_libs(l) {
		
		const error = qml.libs(this._index, l);
		if (error) {
			console.error(error);
		}
		
		return error;
		
	}
	
	
	release() {
		glfw.MakeContextCurrent(this._cc);
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
		
		this._isLoaded = false;
		this._textureId = null;
		this._libs = [];
		this.mbuttons = 0;
		
		delete Window.windows[this._index];
		this._index
		const error = qml.close(this._index);
		
		if (error) {
			console.error(error);
		}
		
	}
	
	
	update() {
		if (this._isReady) {
			this._interops.forEach(io => io.update());
		}
	}
	
};


Window._windows = {};

Window._libs = [];

Window._addLibDir = (l) => {
	
	Window._libs.push(l);
	
	Object.keys(Window._windows).forEach(w => w.libs(l));
	
};


module.exports = Window;
