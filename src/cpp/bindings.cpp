#ifdef __linux__
	#include <dlfcn.h>
#endif

#include "view.hpp"


Napi::Object initModule(Napi::Env env, Napi::Object exports) {
	// Preload the libs with OUR @RPATH, not some junk builtin rpaths
	#ifdef __linux__
	dlopen("libicui18n.so.73", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libicuuc.so.73", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libicudata.so.73", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libicuio.so.73", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libicule.so.73", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libicutu.so.73", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6Core.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6Network.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6DBus.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6Gui.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6OpenGL.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6Widgets.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6XcbQpa.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6Qml.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6Quick.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6QuickControls2.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6QuickTemplates2.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6QuickWidgets.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libqmlui.so", RTLD_NOW | RTLD_GLOBAL);
	#endif
	
	View::initClass(env, exports);
	return exports;
}


NODE_API_MODULE(qml, initModule)
