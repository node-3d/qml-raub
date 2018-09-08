'use strict';

// Add deps dll dirs
require('deps-qmlui-raub');

const depCore = require('deps-qt-core-raub');
const depGui  = require('deps-qt-gui-raub');
const depQml  = require('deps-qt-qml-raub');

const { binPath } = require('addon-tools-raub');

const core = require(`./${binPath}/qml`);

console.log('core.js', 'PLUGINS');
core.View.plugins(`${depCore.binPath}/plugins`);
core.View.plugins(`${depGui.binPath}/plugins`);
core.View.plugins(`${depQml.binPath}/plugins`);
console.log('core.js', `${depCore.binPath}/plugins`);
console.log('core.js', `${depGui.binPath}/plugins`);
console.log('core.js', `${depQml.binPath}/plugins`);

module.exports = core;
