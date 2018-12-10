'use strict';


class Property {
	
	constructor(opts) {
		
		if ( ! opts.view ) {
			throw new Error('Variable requires opts.view.');
		}
		
		if ( ! opts.name ) {
			throw new Error('Variable requires opts.name.');
		}
		if ( ! opts.key ) {
			throw new Error('Variable requires opts.key.');
		}
		
		this._owner = opts.view;
		this._owner._properties.push(this);
		
		this._name = opts.name;
		this._key = opts.key;
		this._value = opts.value;
		
		this._fromJs = opts.fromJs || null;
		this._toJs = opts.toJs || null;
		
		this._isReady = false;
		this._isValid = opts.auto === undefined ? true : !! opts.auto;
		
		this.send = opts.send || this._send;
		
		this._receiverCb = data => {
			
			if ( ! (data.name === this._name && data.key === this._key) ) {
				return;
			}
			
			this._value = data.value;
			if (this._toJs) {
				this._toJs(this._value);
			}
			
		};
		
		this._owner.on('_qml_get', this._receiverCb);
		
		if (this._owner._isLoaded) {
			this._initialize();
		}
		
	}
	
	
	get name() { return this._name; }
	
	get key() { return this._key; }
	
	get value() { return this._value; }
	set value(v) {
		if (this._value === v) {
			return;
		}
		this._value = v;
		this.send();
	}
	
	
	destroy() {
		
		const idx = this._owner._properties.indexOf(this);
		if (idx > -1) {
			this._owner._properties.splice(idx, 1);
		}
		
		this._owner.off('_qml_get', this._receiverCb);
		this._receiverCb = null;
		
		this._owner = null;
		this._name = null;
		this._key = null;
		this._value = null;
		this._fromJs = null;
		this._toJs = null;
		
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
	
	
	canSend() {
		return this._isValid && this._isReady;
	}
	
	
	_send() {
		if (this.canSend()) {
			this._owner.set(this._name, this._key, JSON.stringify(this._value));
		}
	}
	
	
	update() {
		if (this._isReady && this._fromJs) {
			// Use getter
			this.value = this._fromJs();
		}
	}
	
}

module.exports = Property;
