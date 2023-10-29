'use strict';

import Img from 'image-raub';
import gl from 'webgl-raub';
import { Document } from 'glfw-raub';
import { View } from 'qml-raub';


Document.setWebgl(gl);
const document = new Document({ vsync: true, autoEsc: true });

const icon = new Img(__dirname + '/qml.png');
icon.on('load', () => { document.icon = (icon as unknown as typeof document.icon); });
document.title = 'QML';

const release = () => document.makeCurrent();

View.init(process.cwd(), document.platformWindow, document.platformContext);
release();

document.show();

const ui = new View({
	width: document.w,
	height: document.h,
	file: `${__dirname}/qml/gui.qml`,
});

document.on('mousedown', ui.mousedown.bind(ui));
document.on('mouseup', ui.mouseup.bind(ui));
document.on('mousemove', ui.mousemove.bind(ui));
document.on('keydown', ui.keydown.bind(ui));
document.on('keyup', ui.keyup.bind(ui));
document.on('wheel', ui.wheel.bind(ui));

document.on('resize', ({width, height}) => ui.wh = [width, height]);

ui.on('mousedown', e => console.log('[>mousedown]', e));
ui.on('mouseup', e => console.log('[>mouseup]', e));
// ui.on('mousemove', e => console.log('[mousemove]', e));
ui.on('keydown', e => console.log('[>keydown]', e));
ui.on('keyup', e => console.log('[>keyup]', e));
ui.on('wheel', e => console.log('[>wheel]', e));

ui.on('ohai', data => {
	console.log('RECV', data);
	ui.set('myButton1', 'text', `${Date.now()}`);
	ui.invoke('myButton1', 'func', [{ uid: 'dwad2312414', value: 17 }]);
});

let texture = new gl.WebGLTexture(ui.textureId || 0);
ui.on('reset', (texId) => {
	release();
	texture = new gl.WebGLTexture(texId || 0);
});

const requestAnimFrame = document.requestAnimationFrame;

type TProgramInfo = {
	vertexPositionAttribute: number,
	texUniform: gl.WebGLUniformLocation,
	sizeUniform: gl.WebGLUniformLocation,
};

const programInfo: TProgramInfo = {
	vertexPositionAttribute: 0,
	texUniform: new gl.WebGLUniformLocation(0),
	sizeUniform: new gl.WebGLUniformLocation(0),
};

const cubeVertexPositionBuffer = gl.createBuffer();
const cubeVertexIndexBuffer = gl.createBuffer();
const shaderProgram = gl.createProgram();

const shaders = {
	'shader-vs' : `
		attribute vec3 pos;
		void main() {
			gl_Position = vec4(pos, 1.0);
		}
	`,
	'shader-fs' : `
		precision mediump float;
		uniform sampler2D tex;
		uniform vec2 size;
		void main() {
			vec2 uv = gl_FragCoord.xy / size.xy;
			gl_FragColor = texture2D(tex, uv);
		}
	`,
} as const;


const getShader = (id: keyof typeof shaders): gl.WebGLShader | null => {
	let shader;
	
	if (!shaders[id]) {
		return null;
	}
	let str = shaders[id];
	
	if (id.match(/-fs/)) {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (id.match(/-vs/)) {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}
	
	gl.shaderSource(shader, str);
	gl.compileShader(shader);
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.log(gl.getShaderInfoLog(shader));
		return null;
	}
	
	return shader;
};

const initShaders = () => {
	let fragmentShader = getShader('shader-fs');
	let vertexShader = getShader('shader-vs');
	
	if (!fragmentShader || !vertexShader) {
		return;
	}
	
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.log('Could not initialise shaders');
	}
	
	gl.useProgram(shaderProgram);
	
	programInfo.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'pos');
	gl.enableVertexAttribArray(programInfo.vertexPositionAttribute);
	
	programInfo.texUniform = gl.getUniformLocation(shaderProgram, 'tex');
	programInfo.sizeUniform = gl.getUniformLocation(shaderProgram, 'size');
};

const initBuffers = () => {
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	const vertices = [
		// Front face
		-1.0, -1.0, 0.5,
		1.0, -1.0, 0.5,
		1.0, 1.0, 0.5,
		-1.0, 1.0, 0.5,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	(cubeVertexPositionBuffer as unknown as { itemSize: number }).itemSize = 3;
	(cubeVertexPositionBuffer as unknown as { numItems: number }).numItems = 4;
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	let cubeVertexIndices = [
		0, 1, 2, 0, 2, 3, // Front face
	];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
	(cubeVertexIndexBuffer as unknown as { itemSize: number }).itemSize = 1;
	(cubeVertexIndexBuffer as unknown as { numItems: number }).numItems = 6;
};


const drawScene = () => {
	gl.viewport(0, 0, document.width, document.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	gl.vertexAttribPointer(
		programInfo.vertexPositionAttribute,
		(cubeVertexPositionBuffer as unknown as { itemSize: number }).itemSize,
		gl.FLOAT,
		false,
		0,
		0,
	);
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(programInfo.texUniform, 0);
	gl.uniform2fv(programInfo.sizeUniform, [document.width, document.height]);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	gl.drawElements(gl.TRIANGLES, (cubeVertexIndexBuffer as unknown as { numItems: number }).numItems, gl.UNSIGNED_SHORT, 0);
};


const tick = () => {
	View.update();
	release();
	drawScene();
	requestAnimFrame(tick);
};


const start = () => {
	initShaders();
	initBuffers();
	
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	
	tick();
};

start();
