'use strict';

// Add deps dll dirs
require('deps-qmlui-raub');

const depCore = require('deps-qt-core-raub');
const depGui  = require('deps-qt-gui-raub');
const depQml  = require('deps-qt-qml-raub');

const qml = require('./binary/qml');

qml.View.plugins(depCore.binPath + '/plugins');
qml.View.plugins(depGui.binPath  + '/plugins');
qml.View.plugins(depQml.binPath  + '/plugins');


module.exports = qml;
