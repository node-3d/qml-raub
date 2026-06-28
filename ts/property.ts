import type { View } from './view.ts';

export type TOptsProperty<T> = Readonly<{
	/** QML View instance. */
	view: View;
	/** Target object name. */
	name: string;
	/** Property key. */
	key: string;
	/** Optional initial value, sent to the QML scene as soon as it loads. */
	value?: T;
}>;

/**
 * QML property interoperation helper.
 *
 * Automates reading and writing QML objects. A QML object should have
 * `objectName` and the target property. The value must be serializable.
 */
export class Property<T = unknown> {
	public constructor(opts: TOptsProperty<T>) {
		if (!opts.view) {
			throw new Error('Property requires `opts.view`.');
		}
		
		if (!opts.name) {
			throw new Error('Property requires `opts.name`.');
		}
		if (!opts.key) {
			throw new Error('Property requires `opts.key`.');
		}
		
		const { view, name, key, value } = opts;
		this.opts = { view, name, key };
		
		if (value !== undefined) {
			if (view.isLoaded) {
				view.set(name, key, value);
			} else {
				view.once('load', () => view.set(name, key, value));
			}
		}
	}
	
	public readonly opts: Omit<TOptsProperty<T>, 'value'>;
	
	public get value(): T | null {
		const { view, name, key } = this.opts;
		if (view.isLoaded) {
			return (view.get(name, key) as T | null) || null;
		}
		return null;
	}
	
	public set value(v: T | null) {
		const { view, name, key } = this.opts;
		if (view.isLoaded) {
			view.set(name, key, v);
		}
	}
}
