'use strict';

const { View } = require('./init');

const _view = new View({ file: 'test.qml' });

const donePromise = new Promise((res) => { setTimeout(() => res(false), 5000); });

(async () => {
	const interv = setInterval(View.update, 15);
	await donePromise;
	clearInterval(interv);
})();
