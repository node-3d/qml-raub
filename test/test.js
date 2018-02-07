'use strict';

const { expect } = require('chai');

const bullet = require('bullet-raub');


const classes = {
	
	Scene: {
		create() {
			return new bullet.Scene();
		},
		props: ['gravity'],
		methods: ['update', 'hit', 'trace', 'destroy'],
	},
	
	Body: {
		create() {
			const scene = new bullet.Scene();
			return new bullet.Body({ scene });
		},
		props: [
			'type', 'pos', 'rot', 'vell', 'vela', 'size', 'factl', 'facta',
			'map','mesh','mass','rest','dampl','dampa','frict','sleepy'
		],
		methods: ['destroy'],
	},
	
	Joint: {
		create() {
			return new bullet.Joint();
		},
		props: [
			'a','b','broken','maximp','posa','posb','rota','rotb','minl',
			'maxl','mina','maxa','dampl','dampa','stifl','stifa','springl',
			'springa','motorl','motora','motorlf','motoraf','motorlv','motorav',
		],
		methods: ['destroy'],
	},
	
	Trace: {
		create() {
			return new bullet.Trace();
		},
		props: ['hit', 'body', 'pos', 'norm'],
		methods: [],
	},
	
};


describe('Bullet', () => {
	
	it(`exports an object`, () => {
		expect(bullet).to.be.an('object');
	});
	
	
	Object.keys(classes).forEach(
		c => {
			it(`${c} is exported`, () => {
				expect(bullet).to.respondTo(c);
			});
		}
	);
	
	Object.keys(classes).forEach(c => describe(c, () => {
		
		const current = classes[c];
		
		it(`can be created`, () => {
			expect(current.create()).to.be.an('object');
		});
		
		
		current.props.forEach(prop => {
			it(`#${prop} property exposed`, () => {
				expect(current.create()).to.have.property(prop);
			});
		});
		
		current.methods.forEach(method => {
			it(`#${method}() method exposed`, () => {
				expect(current.create()).to.respondTo(method);
			});
		});
		
	}));
	
});
