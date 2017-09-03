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

module.exports = require('./' + addonPaths[process.platform] + '/qml');
