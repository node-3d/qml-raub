'use strict';

const depCore = require('node-deps-qt-core-raub');
const depGui  = require('node-deps-qt-gui-raub');
const depQml  = require('node-deps-qt-qml-raub');

require('node-deps-qmlui-raub');

const addonPaths = {
	win32 : 'bin_windows' ,
	linux : 'bin_linux' ,
	darwin: 'bin_darwin',
};

const binPath = __dirname + '/' + addonPaths[process.platform];

process.env.path += ';' + binPath;

const qml = require('./' + addonPaths[process.platform] + '/qml');



const EventEmitter = require('events');
const glfw = require('node-glfw-raub');

const path = require('path');

const Used = require('./used');
const Overlay = require('./overlay');


class Qml extends EventEmitter {
	
	
	constructor() {
		
		super();
		
		this.setMaxListeners(0);
		
		this._used  = null;
		this._isReady = false;
		
		this._overlay = null;
		this._libs = [];
		
		this.Used    = Used;
		this.Overlay = Overlay;
		
	}
	
	
	_resize() {
		qml.resize(this._canvas.width, this._canvas.height);
	}
	
	
	get ctx() { return qml; }
	
	
	used(opts) {
		
		opts.qml = this;
		
		if (this._used) {
			this._used._destroy();
		}
		
		this._used =  new Used(opts);
		
		if (this._isReady) {
			this._used._ready();
		}
		
		return this._used;
		
	}
	
	
	overlay(opts) {
		opts.qml = this;
		if (this._overlay) {
			return this._overlay;
		}
		this._overlay =  new Overlay(opts);
		return this._overlay;
	}
	
	
	get isTracing() { return this._isTracing; }
	set isTracing(v) {
		if (v) {
			process.env.QML_IMPORT_TRACE = 'true';
		} else {
			delete process.env.QML_IMPORT_TRACE;
		}
	}
	
	
	get textureId() {
		if (this._textureId === null) {
			console.log('Error: no qml textureId yet.', (new Error()).stack);
		}
		return this._textureId;
	}
	
	
	init(opts) {
		
		this._three     = opts.three    || global.THREE;
		this._document  = opts.document || global.document;
		this._canvas    = opts.canvas   || global.canvas;
		this._renderer  = opts.renderer || null;
		this._scene     = opts.scene    || null;
		this._gl        = opts.gl       || this._renderer && this._renderer.context || global.gl;
		this._silent    = !! opts.silent;
		
		if ( !! opts.overlay ) {
			this._overlayOpts = Object.assign({}, opts);
		}
		
		this._textureId = null;
		
		this._libs = this._libs.concat(opts.libs || []);
		
		// Expect FBO texture. Automatic Overlay created/updated as needed
		this.on('fbo', data => {
			this._textureId = data.texture;
			if (this._overlay) {
				this._overlay.reset();
			} else if (this._overlayOpts) {
				this._overlayOpts.textureId = this._textureId;
				this.overlay(this._overlayOpts);
			}
		});
		
		this.on('error', data => {
			if ( ! this._silent ) {
				console.error('Qml Error: (' + data.type + ')', data.message);
			}
		});
		
		this.on('ready', () => {
			
			this._isReady = true;
			
			this._libs.forEach(l => qml.libs(l));
			
			if (this._used) {
				this._used._ready();
			}
			
		});
		
		this._cc = glfw.GetCurrentContext();
		const wnd = glfw.Win32Window(this._cc);
		const ctx = glfw.Win32Context(this._cc);
		
		qml.plugins(depCore.bin + '/plugins');
		qml.plugins(depGui.bin  + '/plugins');
		qml.plugins(depQml.bin  + '/plugins');
		
		const error = qml.init(
			path.dirname(process.mainModule.filename),
			binPath,
			wnd, ctx,
			this._canvas.width, this._canvas.height,
			(data) => {
				let parsed = null;
				
				try {
					parsed = JSON.parse(data);
					try {
						this.emit(parsed.type, parsed.data);
					} catch (ex) {
						console.error(ex.stack);
					}
				} catch (ex) {
					console.error("Error: Qml event, bad JSON.", data);
				}
			}
		);
		
		this._document.on('resize', () => this._resize());
		
		this.mbuttons = 0;
		
		this._document.on( 'mousedown', e => {
			this.mbuttons |= (1 << e.button);
			qml.mouse(1, e.button, this.mbuttons, e.x, e.y);
		});
		this._document.on( 'mouseup', e => {
			this.mbuttons &= ~(1 << e.button);
			qml.mouse(2, e.button, this.mbuttons, e.x, e.y);
		});
		this._document.on( 'mousemove', e => {
			qml.mouse(0, 0, this.mbuttons, e.x, e.y);
		});
		
		this._document.on( 'keydown', e => qml.keyboard(1, e.which, e.keyCode > 0 && e.keyCode < 256 ? String.fromCharCode(e.keyCode).charCodeAt(0) || 0 : 0) );
		this._document.on( 'keyup',   e => qml.keyboard(0, e.which, e.keyCode > 0 && e.keyCode < 256 ? String.fromCharCode(e.keyCode).charCodeAt(0) || 0 : 0) );
		
		if (error) {
			console.error(error);
		}
		
	}
	
	
	use(a, b) {
		const error = qml.use(a, b);
		if (error) {
			console.error(error);
		}
	}
	
	
	libs(l) {
		
		this._libs.push(l);
		
		if ( ! this._isReady ) {
			return;
		}
		
		const error = qml.libs(l);
		if (error) {
			console.error(error);
		}
		
	}
	
	
	plugins(p) {
		
		const error = qml.plugins(p);
		if (error) {
			console.error(error);
		}
		
	}
	
	
	set(a, b, c) {
		const error = qml.set(a, b, JSON.stringify(c));
		if (error) {
			console.error(error);
		}
	}
	
	
	invoke(a, b, c) {
		const error = qml.invoke(a, b, JSON.stringify(c));
		if (error) {
			console.error(error);
		}
	}
	
	
	get(a, b) {
		const error = qml.get(a, b);
		if (error) {
			console.error(error);
		}
	}
	
	
	release() {
		glfw.MakeContextCurrent(this._cc);
	}
	
};

module.exports = new Qml();
