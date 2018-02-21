'use strict';

const { expect } = require('chai');

const qml  = require('qml-raub');


qml.View.init(__dirname, 0, 0);

const loop = () => {
	const timer = setInterval(qml.View.update, 10);
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
			['init', 'libs', 'plugins', 'update'].forEach(
				name => expect(qml.View).to.have.property(name)
			);
		});
		
		
		it('can be created', () => {
			expect(new qml.View()).to.be.an('object');
		});
		
		
		it('has all dynamic methods', () => {
			const view = new qml.View();
			[
				'load', 'destroy', 'toString', 'mousedown', 'mouseup',
				'mousemove', 'keydown', 'keyup', 'update',
			].forEach(
				name => expect(view).to.respondTo(name)
			);
		});
		
		
		it('has all properties', () => {
			const view = new qml.View();
			['width', 'height', 'w', 'h', 'wh', 'size', 'textureId'].forEach(
				name => expect(view).to.have.property(name)
			);
		});
		
		
		it('eventually loads a QML file', function () {
			
			this.timeout(20000);
			
			const view = new qml.View({ file: 'test.qml' });
			
			return new Promise(res => view.on('load', e => {
				expect(e.status).to.be.equal('success');
				res();
			}));
			
		});
		
		
		it('eventually creates a texture', function () {
			
			this.timeout(20000);
			
			const view = new qml.View({ file: 'test.qml' });
			
			return new Promise(res => view.on('reset', textureId => {
				expect(textureId).to.exist;
				res();
			}));
			
		});
		
	});
	
	
	describe('Property', () => {
		
		const view = new qml.View({ file: 'test.qml' });
		const opts = { view, name: 'obj1', key: 'prop1' };
		
		it('can be created', () => {
			expect(new qml.Property(opts)).to.be.an('object');
		});
		
		
		it('has all dynamic methods', () => {
			const prop = new qml.Property(opts);
			['canSend', 'update'].forEach(
				name => expect(prop).to.respondTo(name)
			);
		});
		
		
		it('has all properties', () => {
			const prop = new qml.Property(opts);
			['key', 'name', 'value'].forEach(
				name => expect(prop).to.have.property(name)
			);
		});
		
	});
	
	
	describe('Method', () => {
		
		const view = new qml.View({ file: 'test.qml' });
		const opts = { view, name: 'obj1', key: 'method1' };
		
		it('can be created', () => {
			expect(new qml.Method(opts)).to.be.an('object');
		});
		
		
		it('has all dynamic methods', () => {
			const prop = new qml.Method(opts);
			['canSend', 'update'].forEach(
				name => expect(prop).to.respondTo(name)
			);
		});
		
		
		it('has all properties', () => {
			const prop = new qml.Method(opts);
			['key', 'name', 'value'].forEach(
				name => expect(prop).to.have.property(name)
			);
		});
		
	});
	
});
