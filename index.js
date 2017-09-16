'use strict';

const context = require('./qml');
const View = require('./view');


module.exports = {
	
	context,
	View,
	
	init    : context.init,
	
	libs    : View._addLibDir,
	
	plugins : context.plugins,
	
};
