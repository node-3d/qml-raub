'use strict';

const context = require('./qml');
const View = require('./view');


module.exports = {
	
	context,
	View,
	
	init    : qml.init,
	
	libs    : View._addLibDir,
	
	plugins : qml.plugins,
	
};
