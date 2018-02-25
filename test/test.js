'use strict';

const { expect } = require('chai');

const qml  = require('qml-raub');


qml.View.init(__dirname, 0, 0);

const loop = () => {
	const timer = setInterval(qml.View.update, 10);
	return () => clearInterval(timer);
};


describe('Qml', function () {
	
	this.timeout(20000);
	
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
		
		
		it('eventually loads a QML file', () => {
			
			const view = new qml.View({ file: 'test.qml' });
			
			return new Promise(res => view.on('load', e => {
				expect(e.status).to.be.equal('success');
				res();
			}));
			
		});
		
		
		it('eventually creates a texture', () => {
			
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
		
		
		it('eventually reads value from QML', () => {
			
			return new Promise(res => {
				
				const toJs = val => {
					expect(val).to.be.equal('value1');
					res();
				};
				const prop = new qml.Property({ ...opts, toJs });
				
			});
			
		});
		
		
		it('eventually writes value to QML', () => {
			
			return new Promise(res => {
				
				view.on('p1c', res);
				
				const prop1 = new qml.Property({ ...opts, value: 11 });
				
			});
			
		});
		
	});
	
	
	describe('Method', () => {
		
		const view = new qml.View({ file: 'test.qml' });
		const opts = { view, name: 'obj1', key: 'method1' };
		
		it('can be created', () => {
			expect(new qml.Method(opts)).to.be.an('object');
		});
		
		
		it('has all dynamic methods', () => {
			const method = new qml.Method(opts);
			['call'].forEach(
				name => expect(method).to.respondTo(name)
			);
		});
		
		
		it('has all properties', () => {
			const method = new qml.Method(opts);
			['key', 'name'].forEach(
				name => expect(method).to.have.property(name)
			);
		});
		
		
		it.only('calls QML method(0)', () => {
			
			return new Promise(res => {
				
				view.on('m1c', res);
				
				const method1 = new qml.Method(opts);
				method1.call();
				
			});
			
		});
		
		
		it.only('calls QML method(1)', () => {
			
			return new Promise(res => {
				
				view.on('m2c', res);
				
				const method2 = new qml.Method({ ...opts, key: 'method2' });
				method2.call(10);
				
			});
			
		});
		
	});
	
});
