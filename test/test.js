'use strict';

const { expect } = require('chai');

const glfw = require('glfw-raub');
const qml  = require('qml-raub');


const wnd  = new glfw.Window();
const cc   = wnd.currentContext;
const hwnd = wnd.platformWindow;
const ctx  = wnd.platformContext;
console.log('test.js', hwnd, ctx);
console.log('test.js', 'INIT', __dirname);
qml.View.init(__dirname, hwnd, ctx);


describe('Qml', () => {
	
	it('exports an object', () => {
		expect(qml).to.be.an('object');
	});
	
	it('exports class View', () => {
		expect(qml).to.respondTo('View');
	});
	
	it('exports class Property', () => {
		expect(qml).to.respondTo('Property');
	});
	
	it('exports class Method', () => {
		expect(qml).to.respondTo('Property');
	});
	
	
	describe('View', () => {
		
		it('can be created', () => {
			expect(new qml.View()).to.be.an('object');
		});
		
		it('has all methods', () => {
			const view = new qml.View();
			expect(view).to.respondTo('load');
			expect(view).to.respondTo('destroy');
			expect(view).to.respondTo('toString');
			expect(view).to.respondTo('mousedown');
			expect(view).to.respondTo('mouseup');
			expect(view).to.respondTo('mousemove');
			expect(view).to.respondTo('keydown');
			expect(view).to.respondTo('keyup');
			expect(view).to.respondTo('update');
		});
		
		it('has all properties', () => {
			const view = new qml.View();
			expect(view).to.have.property('width');
			expect(view).to.have.property('height');
			expect(view).to.have.property('w');
			expect(view).to.have.property('h');
			expect(view).to.have.property('wh');
			expect(view).to.have.property('size');
			expect(view).to.have.property('textureId');
		});
		
		it.only('eventually loads a QML file', async function () {
			this.timeout(20000);
			
			await new Promise(res => setTimeout(res, 10000));
			
			const view = new qml.View({ file: 'test.qml' });
			return new Promise(res => view.on('load', e => {
				console.log('test.js', 'LLL', e);
				res();
			}));
		});
		
		
		
	});
	
	
});
