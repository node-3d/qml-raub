'use strict';


class Method {
	
	constructor(opts) {
		
		if ( ! opts.view ) {
			throw new Error('Method requires opts.view.');
		}
		
		this._owner = opts.view;
		
		this._name = opts.name || 'unnamed';
		this._key  = opts.key  || 'null';
		
		this._queue = [];
		
	}
	
	
	get key() { return this._key; }
	get name() { return this._name; }
	
	
	_destroy() {
		
		this._owner = null;
		this._name  = null;
		this._key   = null;
		
		this._isReady = false;
		this._isValid = false;
		
	}
	
	
	_initialize() {
		
		if (this._isValid) {
			
			this._isReady = true;
			
		}
		
	}
	
	
	call(args) {
		
		if ( ! this._isValid ) {
			return;
		}
		
		const inv = () => this._owner._view.invoke(name, key, value);
		
		if ( ! this._isReady ) {
			return this._queue.push(inv);
		}
		
		inv();
		
	}
	
};

module.exports = Method;
