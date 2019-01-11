# Offscreen QML for Node.js

This is a part of [Node3D](https://github.com/node-3d) project.

[![NPM](https://nodei.co/npm/qml-raub.png?compact=true)](https://www.npmjs.com/package/qml-raub)

[![Build Status](https://api.travis-ci.com/node-3d/qml-raub.svg?branch=master)](https://travis-ci.com/node-3d/qml-raub)
[![CodeFactor](https://www.codefactor.io/repository/github/node-3d/qml-raub/badge)](https://www.codefactor.io/repository/github/node-3d/qml-raub)

> npm i -s qml-raub


## Synopsis

**QML** interoperation addon for **Node.js**. Offers high-order classes for building 2D UI's.
This library is not a direct mapping of QML API, rather it is more of a simplified
interpretation for generic purposes.

> Note: compilation tools must be in place on your system.
For Windows, use **ADMIN PRIVELEGED** command line:
\`npm i -g windows-build-tools\`.
Also **Windows** needs **vcredist 2013** to be installed.


## Usage


### class View

Loads and manages any given QML file.

When the file is loaded and whenever the QML scene is resized a new GL
Texture (id) is created and reported in an event. Then the texture can
be placed onto any drawable surface.

For example a screen-sized rectangle with this texture would look as if it is
the app's UI, which it already almost is. Also some in-scene quads, e.g. a PC
display in the distant corner of 3d room, can be textured this way.

What is really important, is the dynamic nature of this texture. We can
propagate mouse and keyboard events to the View, and it will react as any
normal QML scene. Also there is a loop-back to propagate back any unused
events. This means a lot for screen-space UI's: we still want the underlying
app to receive mouse and keyboard events as well.

Therefore, using loop-back implies a change from `source -> app` event
flow to `source -> ui -> app`. If mouse click hits a QML button, we don't
want it to also hit an object behind the button. And if some QML input is
focused, we should be able to type any text without hitting random
combinations of app's hotkeys.

```
const { View } = require('qml-raub');
View.init(HWND, CTX);

const view = new View({ width: 800, height: 600, file: 'ui.qml' });
```


Constructor: `View(?opts)`. Param opts (all optional):
* `number ?width 512` - QML view scene width.
* `number ?height 512` - QML view scene height.
* `boolean ?silent false` - ignore QML errors.
* `string ?file ''` - a QML file to be loaded.
* `string ?source ''` - a QML source text to be used instead of a file.

If both `file` and `source` are passed, the `file` is used. If none of them passed
through the opts, the method `load()` can be used later.


Properties:
* `get/set number width|w` - view width.
* `get/set number height|h` - view height.
* `get/set [width, height] wh` - view width and height.
* `get/set {width, height} size` - view width and height.
* `get number textureId` - current GL texture id.


Methods:
* load(opts) - load a new QML scene. The old one will be discarded, if any. A new
texture will be created upon `'load'` event. Param opts:
	* `string ?file` - a QML file to be loaded.
	* `string ?source` - a QML source text to be used instead of a file.

If both `file` and `source` are passed, the `file` is used. If none of them passed,
an error will be thrown.

* `mousedown(Event e)` - send mousedown event to the QML scene.
* `mouseup(Event e)` - send mouseup event to the QML scene.
* `mousemove(Event e)` - send mousemove event to the QML scene.
* `keydown(Event e)` - send keydown event to the QML scene.
* `keyup(Event e)` - send keyup event to the QML scene.



Events:
* `'destroy'` - emitted when the scene is destroyed.


---

### class Property

Access QML data. Both read and write to a QML object is possible. The object should
have it's `objectName` set, and have a property under a given key. This class can
be used to:
* Read some value on demand.
* Write some value on demand.
* Establish connection between a given JS value and a QML value.

In the latter case the value will automatically be read and written with each
`View.update()` call. Also note that both QML side and JS side can influence the
value. This is important for various control elements that can be altered by both
UI interactions and programmatic events.

JS:
```
const { View, Property } = require('qml-raub');
...
const view = new View({ width: 800, height: 600, file: 'ui.qml' });
const x1 = new Property({ view, name: 'obj1', key: 'x1' });

x1.value = 10;
```

> Note: The value is transmitted as JSON, so it can't be too special.

Constructor:

* `Property({ view, name, key, ?value, ?fromJs, ?toJs, ?auto, ?send })`
	* `View view` - a view, where the property resides.
	* `string name` - the name of an object within QML scene.
	* `string key` - property key.
	* `any ?value undefined` - initial value to be set.
	* `function ?fromJs` - the callback to retrieve JS values before sending them to QML.
	* `function ?toJs` - the callback to 
	* `bool ?auto true` - if this property should be updated automatically, it is default.
	* `function ?send undefined` - an optional callback to replace the default value sender.


Properties:

* `get string name` - the name of an object within QML scene.
* `get string key` - property key.
* `get/set any value undefined` - current property value.


Methods:
* void destroy() - prevents further updates, erases the value.
* void canSend() - if the value can be sent to QML right now.
* void update() - send the value to QML.


---

### class Method

Call QML method. The QML object should have it's `objectName` set,
and have a method (function) under a given key. This class can
be used to store the credentials of a QML method for multiple calls.

In the latter case the value will automatically be read and written with each
`View.update()` call. Also note that both QML side and JS side can influence the
value. This is important for various control elements that can be altered by both
UI interactions and programmatic events.

JS:
```
const { View, Method } = require('qml-raub');
...
const view = new View({ width: 800, height: 600, file: 'ui.qml' });
const f1 = new Method({ view, name: 'obj1', key: 'x1' });

f1();
```

Constructor:

* `Property({ view, name, key, ?value, ?fromJs, ?toJs, ?auto, ?send })`
	* `View view` - a view, where the property resides.
	* `string name` - the name of an object within QML scene.
	* `string key` - property key.
	* `any ?value undefined` - initial value to be set.
	* `function ?fromJs` - the callback to retrieve JS values before sending them to QML.
	* `function ?toJs` - the callback to 
	* `bool ?auto true` - if this property should be updated automatically, it is default.
	* `function ?send undefined` - an optional callback to replace the default value sender.


Properties:

* `get string name` - the name of an object within QML scene.
* `get string key` - property key.
* `get/set any value undefined` - current property value.


Methods:
* void destroy() - prevents further updates, erases the value.
* void canSend() - if the value can be sent to QML right now.
* void update() - send the value to QML.
