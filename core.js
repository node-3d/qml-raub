'use strict';

const { bin } = require('addon-tools-raub');

// Get deps dll dirs
const depUi = require('deps-qmlui-raub');

const core = require(`./${bin}/qml`);


core.View.plugins(`${depUi.core.bin}/plugins`);
core.View.plugins(`${depUi.gui.bin}/plugins`);
core.View.plugins(`${depUi.qml.bin}/plugins`);


module.exports = core;
