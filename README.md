# Offscreen QML for Node.js

This is a part of [Node3D](https://github.com/node-3d) project.

[![NPM](https://badge.fury.io/js/qml-raub.svg)](https://badge.fury.io/js/qml-raub)
[![ESLint](https://github.com/node-3d/qml-raub/actions/workflows/eslint.yml/badge.svg)](https://github.com/node-3d/qml-raub/actions/workflows/eslint.yml)
[![Test](https://github.com/node-3d/qml-raub/actions/workflows/test.yml/badge.svg)](https://github.com/node-3d/qml-raub/actions/workflows/test.yml)
[![Cpplint](https://github.com/node-3d/qml-raub/actions/workflows/cpplint.yml/badge.svg)](https://github.com/node-3d/qml-raub/actions/workflows/cpplint.yml)

```console
npm i -s qml-raub
```

**QML** interoperation addon for **Node.js**.
**QML** is a declarative language that allows user interfaces to be described
in terms of their visual components and how they interact and relate with one another.
See [Qt Documentation](https://doc.qt.io/qt-5/qmlapplications.html)
for additional details on QML features and syntax.

![Example](examples/screenshot.png)

> Note: this **addon uses N-API**, and therefore is ABI-compatible across different
Node.js versions. Addon binaries are precompiled and **there is no compilation**
step during the `npm i` command.

```
const { View } = require('qml-raub');
View.init(process.cwd(), hwnd, ctx, device);

const ui = new View({ width, height, file: 'gui.qml' });
```

The QML engine must be initialized first. Then, new View instances can be created.
See [TypeScript declarations](/index.d.ts) for more details.

QML views can process input events. Mouse and keyboard events can be sent to a view.
Unhandled (unused) events are re-emitted by the view.

Changing the event flow from `window -> app` to `window -> ui -> app` allows blocking
the handled events. For example, when a QML button is pressed, a 3D scene
behind the button won't receive any mouse event. Or when a QML input is
focused, the app's hotkeys won't be triggered by typing text.


### class View

Loads and manages a QML file.

When the file is loaded and whenever the QML scene is resized a new GL
**Texture** (id) is created and reported in an event (type 'reset').
Then the texture can be placed onto any drawable surface.

For example a screen-sized rectangle with this texture would look as if it is
the app's UI, which it already almost is. Also some in-scene quads, e.g. a PC
display in the distant corner of 3d room, can be textured this way.

```
const ui = new View({ width, height, file: 'gui.qml' });
```

See [TypeScript declarations](/index.d.ts) for more details.

Events:
* `'destroy'` - emitted when the scene is destroyed.
* `'load'` - emitted when the scene is fully loaded.
* `'reset', textureId` - emitted when a new texture is generated.
* <ANY_EVENTS> - being an [EventEmitter](https://nodejs.org/api/events.html),
views can emit anything. On QML side, a special global
function `eventEmit(type, data)` is present. Using this function any event can
be generated from QML side.

---

### class Property

Helper to access QML data. Automates reading and writing QML objects. A QML object should
have `objectName` and the target property. The value must be serializable.

```
const x1 = new Property({ view, name: 'obj1', key: 'x1' });
x1.value = 10;
```

See [TypeScript declarations](/index.d.ts) for more details.

---

### class Method

Helper to call a QML method. A QML object should have `objectName`
and the target method.

```
const f1 = new Method({ view, name: 'obj1', key: 'f1' });
const y = f1(a, b, c);
```

Instances of this class are actually functions on their own. Up to 10 arguments
can be used for the call. Functions may immediately return a value.
