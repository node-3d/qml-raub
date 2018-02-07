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
module.exports = {
	View  : require('./js/View'),
	Variable  : require('./js/body'),
	Joint : require('./js/joint'),
	Trace : require('./js/trace'),
};
