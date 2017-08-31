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

class Qml {
	
	constructor() {
		
		super();
		
		this.setMaxListeners(0);
		
		this._isReady = false;
		
		this._libs = [];
		
	}
	
	get context() { return qml; }
	
	
	get isTracing() { return this._isTracing; }
	set isTracing(v) {
		if (v) {
			process.env.QML_IMPORT_TRACE = 'true';
		} else {
			delete process.env.QML_IMPORT_TRACE;
		}
	}
	
	init(opts) {
		
		this._cc = glfw.GetCurrentContext();
		const wnd = glfw.Win32Window(this._cc);
		const ctx = glfw.Win32Context(this._cc);
		
		qml.plugins(depCore.bin + '/plugins');
		qml.plugins(depGui.bin  + '/plugins');
		qml.plugins(depQml.bin  + '/plugins');
		
		const error = qml.init(path.dirname(process.mainModule.filename), wnd, ctx);
		
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
	
	
	release() {
		glfw.MakeContextCurrent(this._cc);
	}
	
};

module.exports = new Qml();
