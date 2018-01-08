'use strict';

const path = require('path');

const depCore = require('node-deps-qt-core-raub');
const depGui  = require('node-deps-qt-gui-raub');
const depQml  = require('node-deps-qt-qml-raub');

require('node-deps-qmlui-raub');

const qml = require('./binary/qml');

qml.plugins(depCore.bin + '/plugins');
qml.plugins(depGui.bin  + '/plugins');
qml.plugins(depQml.bin  + '/plugins');


const _private = {
	
	isInited : false,
	
};


module.exports = {
	
	get isInited() {
		return _private.isInited;
	},
	
	init(windowHandle, windowContext) {
		
		if (_private.isInited) {
			throw new Error('Qml has already been inited.');
		}
		
		const error = qml.init(
			path.dirname(process.mainModule.filename),
			windowHandle,
			windowContext
		);
		
		if (error) {
			throw new Error(error);
		}
		
		_private.isInited = true;
		
	},
	
	
	plugins(directory) {
		const error = qml.plugins(directory);
		if (error) {
			throw new Error(error);
		}
	},
	
	
	view(width, height, cb) {
		
		if ( ! _private.isInited ) {
			throw new Error('Qml must be inited to create a View.');
		}
		
		const i = qml.view(width, height);
		
		if (typeof error === 'string') {
			throw new Error(error);
		} else if (i < 0) {
			throw new Error('Could not create a new (QML) View.');
		}
		
		_private.callbacks[i] = cb;
		
		return i;
		
	},
	
	
	close(i) {
		
		const error = qml.close(i);
		
		if (error) {
			throw new Error(error);
		}
		
		delete _private.callbacks[i];
		
	},
	
	
	invoke(i, name, key, value) {
		const error = qml.invoke(i, name, key, JSON.stringify(value));
		if (error) {
			throw new Error(error);
		}
	},
	
	
	get(i, key, name) {
		const error = qml.get(i, key, name);
		if (error) {
			throw new Error(error);
		}
	},
	
	
	set(i, name, key, value) {
		const error = qml.set(i, name, key, JSON.stringify(value));
		if (error) {
			throw new Error(error);
		}
	},
	
	
	load(i, isFile, source) {
		const error = qml.load(i, isFile, source);
		if (error) {
			throw new Error(error);
		}
	},
	
	
	libs(i, directory) {
		const error = qml.libs(i, directory);
		if (error) {
			throw new Error(error);
		}
	},
	
};
