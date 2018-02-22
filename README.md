# Offscreen QML for Node.js

QML interoperation addon for Node.js. Offers high-order classes for building 2D UI's.


## Install

```
npm i -s qml-raub
```

Note: as this is a compiled addon, compilation tools must be in place on your system.
Such as MSVS13 for Windows, where **ADMIN PRIVELEGED** `npm i -g windows-build-tools` most probably helps.


## Usage

This library is not a direct mapping of QML API, rather it is more of a simplified
interpretation for generic purposes.

---

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

* mousedown(Event e) - send mousedown event to the QML scene.
* mouseup(Event e) - send mouseup event to the QML scene.
* mousemove(Event e) - send mousemove event to the QML scene.
* keydown(Event e) - send keydown event to the QML scene.
* keyup(Event e) - send keyup event to the QML scene.



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


```
const { View, Property } = require('qml-raub');
...
const view = new View({ width: 800, height: 600, file: 'ui.qml' });
const x1 = new Property({ view, name: 'obj1', key: 'x1' });

x1.value = 10;
```


Constructor:
* `Property({ View view, string name, string key, value })`


Properties:
* `get/set string type 'box'` - defines body shape.  NOTE: set is expensive. One of:
	* `'box'` - `btBoxShape`
	* `'ball'` - `btSphereShape`
	* `'roll'` - `btCylinderShape`
	* `'caps'` - `btCapsuleShape`
	* `'plane'` - `btStaticPlaneShape`
	* WIP: `'map'` - `btHeightfieldTerrainShape`
	* WIP: `'mesh'` - `btBvhTriangleMeshShape`
* `get/set vec3 pos [0,0,0]` - body position. NOTE: set is expensive.
* `get/set vec3 rot [0,0,0]` - body rotation, Euler angles - DEGREES. NOTE: get/set is a bit expensive.
* `get/set vec3 vell [0,0,0]` - linear velosity.
* `get/set vec3 vela [0,0,0]` - angular velocity.
* `get/set vec3 size [1,1,1]` - size in three dimensions. NOTE: set is expensive.
* `get/set vec3 factl [1,1,1]` - linear movement axis-multipliers. May be you want a 2D
scene with a locked z-axis, then just set it [1,1,0].
* `get/set vec3 facta [1,1,1]` - angular movement axis-multipliers. May be you want to
create a controlled dynamic character capsule which does not tilt , then just set it [0,0,0].
* `get/set {} map null` - WIP
* `get/set {} mesh null` - WIP
* `get/set number mass 0.0` - body mass, if 0 - body is **static**. NOTE: set is expensive.
* `get/set number rest 0.0` - restitution, bounciness.
* `get/set number dampl 0.1` - something like air friction and how much it is applied to
the linear velocity.
* `get/set number dampa 0.1` - something like air friction and how much it is applied to
the angular velocity.
* `get/set number frict 0.5` - surface friction on contact points between two bodies.
* `get/set boolean sleepy true` - if this body tends to "fall asleep" when not moving for
a while. This is a good way to optimize calculation and throughput of the scene. Only
set it to `false` for specific body if its sleepiness causes issues.


Methods:
* void destroy() - destroys the body, `'destroy'` event is emitted.


Events:
* `'destroy'` - emitted when the body is destroyed.
* `'update' { vec3 pos, quat quat, vec3 vell, vec3 vela }` - emitted for every non-sleeping
Body per every `scene.update()` call. Instead of `rot` value it caries a raw quaternion.
However you can get the newest `body.rot` yourself. It is done to minimize calculation,
because rotation is internally quaternion and requires conversion to Euler-angles. Also
visualization frameworks tend to treat quaternions way better then angles, and the main
use case of this event is to update visualization.
```
body.on('update', ({ pos, quat }) => {
	mesh.position.set(pos.x, pos.y, pos.z);
	mesh.quaternion.set(quat.x, quat.y, quat.z, quat.w);
});
```
