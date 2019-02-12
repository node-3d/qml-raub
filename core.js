'use strict';

const { binPath } = require('addon-tools-raub');

// Get deps dll dirs
const depUi = require('deps-qmlui-raub');

const core = require(`./${binPath}/qml`);


core.View.plugins(`${depUi.core.binPath}/plugins`);
core.View.plugins(`${depUi.gui.binPath}/plugins`);
core.View.plugins(`${depUi.qml.binPath}/plugins`);
console.log('core.js QML', `${depUi.qml.binPath}/plugins`);

module.exports = core;
