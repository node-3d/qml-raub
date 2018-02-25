'use strict';


class Method {
	
	constructor(opts) {
		
		if ( ! opts.view ) {
			throw new Error('Method requires opts.view.');
		}
		
		if ( ! (opts.name && typeof opts.name === 'string') ) {
			throw new Error('Method requires `string opts.name`.');
		}
		if ( ! (opts.key && typeof opts.key === 'string') ) {
			throw new Error('Method requires `string opts.key`.');
		}
		
		this._owner = opts.view;
		this._owner._methods.push(this);
		
		this._name = opts.name;
		this._key  = opts.key;
		
		this._queue = [];
		
		this._isReady = false;
		
		if (this._owner._isLoaded) {
			this._initialize();
		}
		
	}
	
	
	get key() { return this._key; }
	get name() { return this._name; }
	
	
	_destroy() {
		
		this._owner = null;
		this._name = null;
		this._key = null;
		
		this._isReady = false;
		
	}
	
	
	_initialize() {
		
		this._isReady = true;
		this._queue.forEach(c => c());
		this._queue = [];
		
	}
	
	
	call(args) {
		
		const inv = () => this._owner._view.invoke(
			this._name,
			this._key,
			args === undefined ? '' : JSON.stringify(args)
		);
		
		if ( ! this._isReady ) {
			return this._queue.push(inv);
		}
		
		inv();
		
	}
	
};

module.exports = Method;
