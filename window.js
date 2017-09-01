'use strict';

const EventEmitter = require('events');

const path = require('path');


class Window extends EventEmitter {
	
	constructor(opts) {
		
		super();
		this.setMaxListeners(0);
		
		this._qml = opts.qml;
		
		this._isReady = false;
		
		this._silent    = !! opts.silent;
		
		this._textureId = null;
		
		this._libs = opts.libs || [];
		
		
		this._isValid = true;
		
		this._interops = [];
		this._invokations = [];
		
		
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
			
			this._libs.forEach(l => qml.libs(l));
			
			if (this._used) {
				this._used._ready();
			}
			
		});
		
		this._qml.on('use', e => {
			
			if ( ! this._isValid || e.used !== this._source) {
				return;
			}
			
			if (e.status !== 'success') {
				return console.error('Qml Error: could not use:', this._source);
			}
			
			this._isReady = true;
			this._interops.forEach(io => io._ready());
			this._invokations.forEach(invokation => invokation());
			this._invokations = [];
			
		});
		
		const error = qml.window(
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
		
		this.mbuttons = 0;
		
		if (error) {
			console.error(error);
		}
		
	}
	
	
	resize(w, h) {
		this._qml.resize(w, h);
	}
	
	mousedown(e) {
		this.mbuttons |= (1 << e.button);
		qml.mouse(1, e.button, this.mbuttons, e.x, e.y);
	}
	
	mouseup(e) {
		this.mbuttons &= ~(1 << e.button);
		qml.mouse(2, e.button, this.mbuttons, e.x, e.y);
	}
	
	mousemove(e) {
		qml.mouse(0, 0, this.mbuttons, e.x, e.y);
	}
	
	keydown(e) {
		qml.keyboard(
			1,
			e.which,
			e.keyCode > 0 && e.keyCode < 256 ?
				String.fromCharCode(e.keyCode).charCodeAt(0) || 0 :
				0
		);
	}
	
	keyup(e) {
		qml.keyboard(
			0,
			e.which,
			e.keyCode > 0 && e.keyCode < 256 ?
				String.fromCharCode(e.keyCode).charCodeAt(0) || 0 :
				0
		);
	}
	
	
	get context() { return this._qml; }
	
	
	load(opts) {
		
		opts.qml = this;
		
		if (this._used) {
			this._used._destroy();
		}
		
		this._used =  new Used(opts);
		
		if (this._isReady) {
			this._used._ready();
		}
		
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
	
	
	load(a, b) {
		const error = qml.use(a, b);
		if (error) {
			console.error(error);
		}
	}
	
	
	libs(l) {
		
		this._libs.push(l);
		
		if ( ! this._isReady ) {
			return;
		}
		
		const error = qml.libs(l);
		if (error) {
			console.error(error);
		}
		
	}
	
	
	
	set(a, b, c) {
		const error = qml.set(a, b, JSON.stringify(c));
		if (error) {
			console.error(error);
		}
	}
	
	
	invoke(a, b, c) {
		const error = qml.invoke(a, b, JSON.stringify(c));
		if (error) {
			console.error(error);
		}
	}
	
	interop(opts) {
		
		opts.qml = this._qml;
		
		const io = new Interop(opts);
		
		if ( ! this._isValid ) {
			return io;
		}
		
		this._interops.push(io);
		
		if (this._isReady) {
			io._ready();
		}
		
		return io;
		
	}
	
	
	invoke(name, key, value) {
		
		if ( ! this._isValid ) {
			return;
		}
		
		if (this._isReady) {
			this._qml.invoke(name, key, value);
		} else {
			this._invokations.push(() => this._qml.invoke(name, key, value));
		}
		
	}
	
	get(a, b) {
		const error = qml.get(a, b);
		if (error) {
			console.error(error);
		}
	}
	
	
	release() {
		glfw.MakeContextCurrent(this._cc);
	}
	
	
	_destroy() {
		
		this._qml    = null;
		this._file   = null;
		this._text   = null;
		this._isFile = null;
		this._source = null;
		
		this._isReady = false;
		this._isValid = false;
		
		this._interops = [];
		this._invokations = [];
		this._queue    = [];
		
	}
	
	
	_ready() {
		if (this._isValid) {
			this._qml.use(this._isFile, this._source);
		}
	}
	
	
	update() {
		if (this._isReady) {
			this._interops.forEach(io => io.update());
		}
	}
	
};

module.exports = new Qml();
