'use strict';

const Interop = require('./interop');


class Used {
	
	
	constructor(opts) {
		
		this._qml  = opts.qml;
		
		this._file = opts.file || null;
		this._text = this._file ? null : opts.text || null;
		
		this._isFile = this._file !== null;
		this._source = this._file || this._text;
		
		this._isReady = false;
		this._isValid = true;
		
		this._interops = [];
		this._invokations = [];
		
		if ( ! this._source ) {
			this._isValid = false;
			return console.error("Either file or text should be in the opts.", (new Error()).stack);
		}
		
		this._qml.on('use', e => {
			
			if ( ! this._isValid || e.used !== this._source) {
				return;
			}
			
			if (e.status !== 'success') {
				return console.error("Qml Error: could not use:", this._source);
			}
			
			this._isReady = true;
			this._interops.forEach(io => io._ready());
			this._invokations.forEach(invokation => invokation());
			this._invokations = [];
			
		});
		
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

module.exports = Used;
