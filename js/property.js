'use strict';


class Property {
	
	constructor(opts) {
		
		if ( ! opts.view ) {
			throw new Error('Property requires `opts.view`.');
		}
		
		if ( ! opts.name ) {
			throw new Error('Property requires `opts.name`.');
		}
		if ( ! opts.key ) {
			throw new Error('Property requires `opts.key`.');
		}
		
		const { view, name, key } = opts;
		this.opts = { view, name, key };
		
		if (opts.value) {
			if (view.isLoaded) {
				view.set(name, key, v);
			} else {
				view.once('load', () => view.set(name, key, v));
			}
		}
		
	}
	
	get value() {
		const { view, name, key } = this.opts;
		if (view.isLoaded) {
			return view.get(name, key) || null;
		}
		return null;
	}
	set value(v) {
		const { view, name, key } = this.opts;
		if (view.isLoaded) {
			view.set(name, key, v);
		}
	}
	
}

module.exports = Property;
