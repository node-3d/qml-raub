'use strict';

const { expect } = require('chai');

const glfw = require('glfw-raub');
const qml  = require('qml-raub');


const wnd  = new glfw.Window();

qml.View.init(__dirname, wnd.platformWindow, wnd.platformContext);

const loop = () => {
	const timer = setInterval(qml.View.update, 10);
	// const timer = setInterval(glfw.pollEvents, 10);
	return () => clearInterval(timer);
};


describe('Qml', () => {
	
	let l;
	before(() => { l = loop(); });
	after(() => { l(); l = null; });
	
	
	it('exports an object', () => {
		expect(qml).to.be.an('object');
	});
	
	it('contains class View', () => {
		expect(qml).to.respondTo('View');
	});
	
	it('contains class Property', () => {
		expect(qml).to.respondTo('Property');
	});
	
	it('contains class Method', () => {
		expect(qml).to.respondTo('Property');
	});
	
	
	describe('View', () => {
		
		it('has all static methods', () => {
			expect(qml.View).to.respondTo('init');
			expect(qml.View).to.respondTo('libs');
			expect(qml.View).to.respondTo('plugins');
		});
		
		
		it('can be created', () => {
			expect(new qml.View()).to.be.an('object');
		});
		
		
		it('has all dynamic methods', () => {
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
		
		
		it('eventually loads a QML file', function () {
			
			this.timeout(20000);
			
			const view = new qml.View({ file: 'test.qml' });
			
			return new Promise(res => view.on('load', e => {
				expect(e.status).to.be.equal('success');
				res();
			}));
			
		});
		
		it.only('eventually creates a texture', function () {
			
			this.timeout(20000);
			
			const view = new qml.View({ file: 'test.qml' });
			
			return new Promise(res => view.on('reset', textureId => {
				expect(textureId).to.exist;
				res();
			}));
			
		});
		
		
	});
	
	
});
