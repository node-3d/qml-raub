#ifdef __linux__
	#include <dlfcn.h>
#endif

#include "view.hpp"


Napi::Object initModule(Napi::Env env, Napi::Object exports) {
	// Preload the libs with OUR @RPATH, not some junk builtin rpaths
	#ifdef __linux__
	dlopen("libicui18n.so.56", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libicuuc.so.56", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libicudata.so.56", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libicuio.so.56", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libicule.so.56", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libicutu.so.56", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt5Core.so.5", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt5Network.so.5", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt5DBus.so.5", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt5Gui.so.5", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt5OpenGL.so.5", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt5Widgets.so.5", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt5XcbQpa.so.5", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt5Qml.so.5", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt5Quick.so.5", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt5QuickControls2.so.5", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt5QuickTemplates2.so.5", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt5QuickWidgets.so.5", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libqmlui.so", RTLD_NOW | RTLD_GLOBAL);
	#endif
	
	View::initClass(env, exports);
	return exports;
}


NODE_API_MODULE(qml, initModule)
