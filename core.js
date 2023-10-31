'use strict';
process.env.QT_DEBUG_PLUGINS = '1';

require('segfault-raub');
const { getBin } = require('addon-tools-raub');
const depUi = require('deps-qmlui-raub');

const core = require(`./${getBin()}/qml`);

core.View._plugins(`${depUi.core.bin}/plugins`);
core.View._plugins(`${depUi.gui.bin}/plugins`);
core.View._plugins(`${depUi.qml.bin}/plugins`);

module.exports = core;
