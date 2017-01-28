'use strict';


class Overlay {
	
	
	constructor(opts) {
		
		this._qml = opts.qml;
		
		this._three    = opts.three || global.THREE;
		this._document = opts.document || global.document;
		this._canvas   = opts.canvas || global.canvas;
		
		this._renderer = opts.renderer;
		this._scene    = opts.scene;
		this._gl       = opts.gl || this._renderer.context || global.gl;
		
		this._texture = this._genTexture();
		
		const geo = new this._three.PlaneBufferGeometry(2, 2);
		geo.computeBoundingSphere = (() => {
			geo.boundingSphere = new this._three.Sphere(undefined, Infinity);
		});
		geo.computeBoundingSphere();
		geo.computeBoundingBox = (() => {
			geo.boundingBox = new this._three.Box3();
		});
		geo.computeBoundingBox();
		
		
		this._overlay = new this._three.Mesh(
			geo,
			new this._three.ShaderMaterial({
				
				side: this._three.DoubleSide,
				
				uniforms: { t: { type: "t", value: this._texture } },
				
				vertexShader: `
					varying vec2 tc;
					void main() {
						tc = uv;
						gl_Position = vec4(position.xyz, 1.0);
					}
				`,
				
				fragmentShader: `
					varying vec2 tc;
					uniform sampler2D t;
					void main() {
						gl_FragColor = texture2D(t, tc);
					}
				`,
				
				blending   : ! this._renderer.properties ? this._three.AdditiveBlending : 'additive',
				depthTest  : false,
				transparent: true,
				
			})
		);
		
		this._scene.add(this._overlay);
		
	}
	
	
	_genTexture() {
		const rawTexture = this._gl.createTexture();
		rawTexture._ = this._qml.textureId;
		
		const texture = new this._three.Texture();
		
		let properties = null;
		if ( ! this._renderer.properties ) {
			properties = texture;
		} else {
			properties = this._renderer.properties.get(texture); // !!!!
		}
		
		properties.__webglTexture = rawTexture;
		properties.__webglInit    = true;
		
		return texture;
	}
	
	
	reset() {
		this._texture = this._genTexture();
		this._overlay.material.uniforms.t.value = this._texture;
	}
	
};

module.exports = Overlay;
