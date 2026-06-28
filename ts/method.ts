import type { View } from './view.ts';

export type TOptsMethod = Readonly<{
	/** QML View instance. */
	view: View;
	/** Target object name. */
	name: string;
	/** Method key. */
	key: string;
}>;

export type TMethod = ((...args: unknown[]) => unknown) & {
	opts: TOptsMethod;
};

export type TNewableMethod = new(opts: TOptsMethod) => TMethod;

/**
 * QML method interoperation helper.
 *
 * Automates calling QML methods. A QML object should have `objectName` and the
 * target method. The arguments and return value must be serializable.
 */
const MethodConstructor = function MethodConstructor(opts: TOptsMethod): TMethod {
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
	
	const callee = ((...args: unknown[]) => {
		if (view.isLoaded) {
			return view.invoke(name, key, args);
		}
		
		view.once('load', () => view.invoke(name, key, args));
		return null;
	}) as TMethod;
	
	callee.opts = { view, name, key };
	
	return callee;
};

export const Method = MethodConstructor as unknown as TNewableMethod;
