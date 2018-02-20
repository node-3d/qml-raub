'use strict';

const glfw = require('glfw-raub');
const qml  = require('qml-raub');


const wnd  = new glfw.Window();
const cc   = wnd.currentContext;
const hwnd = wnd.platformWindow;
const ctx  = wnd.platformContext;
console.log('test.js', hwnd, ctx);
console.log('test.js', 'INIT', __dirname);
qml.View.init(__dirname, hwnd, ctx);


const view = new qml.View({ file: 'test.qml' });

view.on('load', e => {
	console.log('test.js', 'LLL', e);
});



const draw = () => {
	
	wnd.makeCurrent();
	const wsize1 = wnd.framebufferSize;
	glfw.testScene(wsize1.width, wsize1.height);
	wnd.swapBuffers();
	
	glfw.pollEvents();
	
};


const animate = () => {
	
	if ( ! (wnd.shouldClose || wnd.getKey(glfw.KEY_ESCAPE)) ) {
		
		draw();
		setTimeout(animate, 16);
		
	} else {
		// Close OpenGL window and terminate GLFW
		wnd.destroy();
		
		glfw.terminate();
		
		process.exit(0);
	}
	
};


animate();
