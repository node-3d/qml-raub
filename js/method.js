'use strict';


class Method {
	constructor(opts) {
		if (!opts.view) {
			throw new Error('Method requires opts.view.');
		}
		
		if (!(opts.name && typeof opts.name === 'string')) {
			throw new Error('Method requires `string opts.name`.');
		}
		if (!(opts.key && typeof opts.key === 'string')) {
			throw new Error('Method requires `string opts.key`.');
		}
		
		const { view, name, key } = opts;
		
		const callee = (...args) => {
			if (view.isLoaded) {
				return view.invoke(name, key, args);
			} else {
				view.once('load', () => view.invoke(name, key, args));
				return null;
			}
		};
		
		callee.opts = { view, name, key };
		
		return callee;
	}
}

module.exports = Method;
