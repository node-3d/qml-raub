'use strict';


class Variable {
	
	
	constructor(opts) {
		
		if ( ! opts.window ) {
			throw new Error('Variable requires opts.window.');
		}
		
		this._owner = opts.view;
		
		this._name  = opts.name  || 'unnamed';
		this._key   = opts.key   || 'null';
		this._value = opts.value || null;
		
		this._getJs = opts.getJs || null;
		this._setJs = opts.setJs || null;
		
		this._isReady = false;
		this._isValid = opts.auto === undefined ? true : !! opts.auto;
		
		this.send = opts.send || this._send;
		
		this._owner.on('get', data => {
			
			if ( ! (data.name === this._name && data.key === this._key) ) {
				return;
			}
			
			this._value = data.value;
			if (this._setJs) {
				this._setJs(this._value);
			}
			
		});
		
	}
	
	
	get key() { return this._key; }
	get name() { return this._name; }
	
	
	_destroy() {
		
		this._owner = null;
		this._name  = null;
		this._key   = null;
		this._value = null;
		this._getJs = null;
		this._setJs = null;
		
		this._isReady = false;
		this._isValid = false;
		
	}
	
	
	_initialize() {
		
		if (this._isValid) {
			
			this._isReady = true;
			
			if (this._value !== undefined) {
				this.send();
			} else {
				this._owner.get(this._name, this._key);
			}
			
		}
		
	}
	
	
	get value() { return this._value; }
	set value(v) {
		if (this._value === v) {
			return;
		}
		this._value = v;
		this.send();
	}
	
	
	canSend() {
		return this._isValid && this._isReady;
	}
	
	
	_send() {
		if (this.canSend()) {
			this._owner.set(this._name, this._key, this._value);
		}
	}
	
	
	update() {
		if (this._isReady && this._getJs) {
			// Use getter
			this.value = this._getJs();
		}
	}
	
};

module.exports = Variable;
