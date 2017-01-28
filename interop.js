'use strict';


class Interop {
	
	
	constructor(opts) {
		
		this._qml = opts.qml;
		
		this._name  = opts.name || 'notset';
		this._key   = opts.key || 'notset';
		this._value = opts.value || null;
		
		this._getJs = opts.getJs || null;
		this._setJs = opts.setJs || null;
		
		this._isReady = false;
		this._isValid = opts.auto === undefined ? true : !! opts.auto;
		
		// if (opts.send) {
		// 	console.log('Send substituted');
		// }
		this.send = opts.send || this._send;
		
		this._qml.on('get', data => {
			
			if ( ! (data.name === this._name && data.key === this._key) ) {
				return;
			}
			
			this._value = data.value;
			if (this._setJs) {
				this._setJs(this._value);
			}
			
		});
		
	}
	
	
	get qml() { return this._qml; }
	get name() { return this._name; }
	
	
	_destroy() {
		
		this._qml   = null;
		this._name  = null;
		this._key   = null;
		this._value = null;
		this._getJs = null;
		this._setJs = null;
		
		this._isReady = false;
		this._isValid = false;
		
	}
	
	
	_ready() {
		if (this._isValid) {
			
			this._isReady = true;
			
			if (this._value !== undefined) {
				this.send();
			} else {
				this._qml.get(this._name, this._key);
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
		// console.log('\n\n\n STD SEND', this._name, this._key);
		if (this.canSend()) {
			this._qml.set(this._name, this._key, this._value);
		}
	}
	
	
	update() {
		if (this._isReady && this._getJs) {
			// Use setter
			this.value = this._getJs();
		}
	}
	
};

module.exports = Interop;
