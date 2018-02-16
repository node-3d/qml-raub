'use strict';

const { expect } = require('chai');

const qml = require('qml-raub');
qml.View.init(0, 0);

describe('Qml', () => {
	
	it('exports an object', () => {
		expect(qml).to.be.an('object');
	});
	
	it('View is exported', () => {
		expect(qml).to.respondTo('View');
	});
	
	it('Variable is exported', () => {
		expect(qml).to.respondTo('Variable');
	});
	
});
