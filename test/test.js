'use strict';

const { expect } = require('chai');

const { View, Property, Method } = require('..');


View.init(__dirname, 0, 0);

const loop = () => {
	const timer = setInterval(View.update, 10);
	return () => clearInterval(timer);
};


describe('Qml', function () {
	
	this.timeout(4000);
	
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
		expect(Method).to.exist;
	});
	
	
	describe('View', () => {
		
		it('has all static methods', () => {
			['init', 'libs', 'plugins', 'style', 'update'].forEach(
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
				'mousemove', 'keydown', 'keyup',
			].forEach(
				name => expect(view).to.respondTo(name)
			);
		});
		
		
		it('has all properties', () => {
			const view = new View();
			[
				'width', 'height',
				'w', 'h',
				'wh',
				'size',
				'textureId',
				'isLoaded',
			].forEach(
				name => expect(view).to.have.property(name)
			);
		});
		
		
		it('eventually loads a QML file', async () => {
			const view = new View({ file: 'test.qml' });
			const loaded = await new Promise(
				res => view.on('load', () => res(true))
			);
			expect(loaded).to.be.equal(true);
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
		
		const view = new View({ file: 'test.qml', silent: true });
		const opts = { view, name: 'obj1', key: 'prop1' };
		view.on('error', () => {});
		
		it('can be created', () => {
			expect(new Property(opts)).to.be.an.instanceOf(Property);
		});
		
		
		it('has all properties', () => {
			const prop = new Property(opts);
			['opts', 'value'].forEach(
				name => expect(prop).to.have.property(name)
			);
		});
		
		
		it('reads a value from QML', () => {
			const prop = new Property(opts);
			expect(prop.value).to.be.equal('value1');
		});
		
		
		it('changes a QML value', async () => {
			const prop = new Property(opts);
			const changed = await new Promise(res => {
				view.on('p1c', () => res(true));
				prop.value = 11;
			});
			expect(changed).to.be.equal(true);
		});
		
		
		it('reads non-existent object\'s property as null', () => {
			const prop = new Property({ ...opts, name: 'awdaldaklwd23' });
			expect(prop.value).to.be.equal(null);
		});
		
		
		it('reads non-existent property as null', () => {
			const prop = new Property({ ...opts, key: 'awdaldaklwd23' });
			expect(prop.value).to.be.equal(null);
		});
		
	});
	
	
	describe('Method', () => {
		
		const view = new View({ file: 'test.qml', silent: true });
		const opts = { view, name: 'obj1', key: 'method1' };
		view.on('error', () => {});
		
		it('can be created', () => {
			expect(new Method(opts)).to.be.a('function');
		});
		
		it('has all properties', () => {
			const method = new Method(opts);
			['opts'].forEach(
				name => expect(method).to.have.property(name)
			);
		});
		
		
		it('calls QML method1', async () => {
			const method1 = new Method(opts);
			const called = await new Promise(res => {
				view.on('m1c', () => res(true));
				method1();
			});
			expect(called).to.be.equal(true);
		});
		
		
		it('calls QML method2', async () => {
			const method2 = new Method({ ...opts, key: 'method2' });
			const called = await new Promise(res => {
				view.on('m2c', () => res(true));
				method2(10);
			});
			expect(called).to.be.equal(true);
		});
		
		
		it('calls non-existent object\'s method, and gets null', () => {
			const method = new Method({ ...opts, name: 'awdaldaklwd23' });
			expect(method()).to.be.equal(null);
		});
		
		
		it('calls non-existent method, and gets null', () => {
			const method = new Method({ ...opts, key: 'awdaldaklwd23' });
			expect(method()).to.be.equal(null);
		});
		
	});
	
});
