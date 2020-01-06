'use strict';
// process.env.QT_DEBUG_PLUGINS = '1';

require('segfault-raub');

const { bin } = require('addon-tools-raub');

// Get deps dll dirs
const depUi = require('deps-qmlui-raub');

const core = require(`./${bin}/qml`);


core.View.plugins(`${depUi.core.bin}/plugins`);
core.View.plugins(`${depUi.gui.bin}/plugins`);
core.View.plugins(`${depUi.qml.bin}/plugins`);
core.View.plugins(`${process.cwd()}/plugins`);


module.exports = core;
