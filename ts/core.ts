import depsQmlui from '@node-3d/deps-qmlui';
import { native } from './native.ts';

native.View['_plugins'](`${depsQmlui.core.bin}/plugins`);
native.View['_plugins'](`${depsQmlui.gui.bin}/plugins`);
native.View['_plugins'](`${depsQmlui.qml.bin}/plugins`);

export const core = native;
