'use strict';

// Add deps dll dirs
require('deps-qmlui-raub');

const depCore = require('node-deps-qt-core-raub');
const depGui  = require('node-deps-qt-gui-raub');
const depQml  = require('node-deps-qt-qml-raub');

const qml = require('./binary/qml');


qml.plugins(depCore.binPath + '/plugins');
qml.plugins(depGui.binPath  + '/plugins');
qml.plugins(depQml.binPath  + '/plugins');


module.exports = qml;
