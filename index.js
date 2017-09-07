'use strict';

const context = require('./qml');
const View = require('./view');


module.exports = {
	
	context,
	View,
	
	init(windowHandle, windowContext) { qml.init(windowHandle, windowContext); }
	
	libs(directory) { QmlWindow._addLibDir(directory); }
	
	plugins(directory) { qml.plugins(directory); }
	
};
