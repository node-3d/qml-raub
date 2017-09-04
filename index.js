'use strict';

const EventEmitter = require('events');
const path = require('path');

const glfw = require('node-glfw-raub');

const qml = require('./qml');
const QmlWindow = require('./window');


module.exports = {
	
	context : qml,
	
	Window  : QmlWindow,
	
	_cc     : null,
	
	
	get isTracing() { return this._isTracing; }
	set isTracing(v) {
		if (v) {
			process.env.QML_IMPORT_TRACE = 'true';
		} else {
			delete process.env.QML_IMPORT_TRACE;
		}
	}
	
	
	init(opts) {
		
		this._cc  = glfw.GetCurrentContext();
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
		
		return Window._addLibDir(l);
		
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
