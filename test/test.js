'use strict';

const { expect } = require('chai');

const { View, Property, Method } = require('..');


View.init(__dirname, 0, 0);

const loop = () => {
	const timer = setInterval(View.update, 10);
	return () => clearInterval(timer);
};


describe('Qml', function () {
	
	this.timeout(10000);
	
	let l;
	before(() => { l = loop(); });
	after(() => { l(); l = null; });
	
	
	it('contains class View', () => {
		expect(View).to.exist;
	});
	
	
	it('contains class Property', () => {
		expect(Property).to.exist;
	});
	
	
	it('contains class Method', () => {
		expect(Property).to.exist;
	});
	
	
	describe('View', () => {
		
		it('has all static methods', () => {
			['init', 'libs', 'plugins', 'update'].forEach(
				name => expect(View).to.have.property(name)
			);
		});
		
		
		it('can be created', () => {
			expect(new View()).to.be.an.instanceOf(View);
		});
		
		
		it('has all dynamic methods', () => {
			const view = new View();
			[
				'load', 'destroy', 'toString', 'mousedown', 'mouseup',
				'mousemove', 'keydown', 'keyup', 'update',
			].forEach(
				name => expect(view).to.respondTo(name)
			);
		});
		
		
		it('has all properties', () => {
			const view = new View();
			['width', 'height', 'w', 'h', 'wh', 'size', 'textureId'].forEach(
				name => expect(view).to.have.property(name)
			);
		});
		
		
		it('eventually loads a QML file', () => {
			
			const view = new View({ file: 'test.qml' });
			
			return new Promise(res => view.on('_qml_load', e => {
				expect(e.status).to.be.equal('success');
				res();
			}));
			
		});
		
		
		it('eventually creates a texture', () => {
			
			const view = new View({ file: 'test.qml' });
			
			return new Promise(res => view.on('reset', textureId => {
				expect(textureId).to.exist;
				res();
			}));
			
		});
		
	});
	
	
	describe('Property', () => {
		
		const view = new View({ file: 'test.qml' });
		const opts = { view, name: 'obj1', key: 'prop1' };
		
		it('can be created', () => {
			expect(new Property(opts)).to.be.an.instanceOf(Property);
		});
		
		
		it('has all dynamic methods', () => {
			const prop = new Property(opts);
			['canSend', 'update'].forEach(
				name => expect(prop).to.respondTo(name)
			);
		});
		
		
		it('has all properties', () => {
			const prop = new Property(opts);
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
				new Property({ ...opts, toJs });
				
			});
			
		});
		
		
		it('eventually writes value to QML', () => {
			
			return new Promise(res => {
				
				view.on('p1c', res);
				
				new Property({ ...opts, value: 11 });
				
			});
			
		});
		
	});
	
	
	describe('Method', () => {
		
		const view = new View({ file: 'test.qml' });
		const opts = { view, name: 'obj1', key: 'method1' };
		
		it('can be created', () => {
			expect(new Method(opts)).to.be.an.instanceOf(Method);
		});
		
		
		it('has all dynamic methods', () => {
			const method = new Method(opts);
			['call'].forEach(
				name => expect(method).to.respondTo(name)
			);
		});
		
		
		it('has all properties', () => {
			const method = new Method(opts);
			['key', 'name'].forEach(
				name => expect(method).to.have.property(name)
			);
		});
		
		
		it('calls QML method(0)', () => {
			
			return new Promise(res => {
				
				view.on('m1c', res);
				
				const method1 = new Method(opts);
				method1.call();
				
			});
			
		});
		
		
		it('calls QML method(1)', () => {
			
			return new Promise(res => {
				
				view.on('m2c', res);
				
				const method2 = new Method({ ...opts, key: 'method2' });
				method2.call(10);
				
			});
			
		});
		
	});
	
});
