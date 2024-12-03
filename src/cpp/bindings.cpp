#ifdef __linux__
	#include <dlfcn.h>
#endif

#include "view.hpp"


Napi::Object initModule(Napi::Env env, Napi::Object exports) {
	// Preload the libs with OUR @RPATH, not some junk builtin rpaths
	#ifdef __linux__
	dlopen("libQt6Core.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6DBus.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6Network.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libicudata.so.73", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libicui18n.so.73", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libicuio.so.73", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libicutest.so.73", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libicutu.so.73", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libicuuc.so.73", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6Gui.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6OpenGL.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6Svg.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6Widgets.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6XcbQpa.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6Qml.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6QmlMeta.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6Quick.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6QuickControls2.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6QuickTemplates2.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6QuickWidgets.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6QuickVectorImage.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6QmlCompiler.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6QmlCore.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6QuickControls2Basic.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6QuickControls2Impl.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6QuickDialogs2.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6QuickDialogs2QuickImpl.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6QuickDialogs2Utils.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6QuickEffects.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6QuickLayouts.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6QuickParticles.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6QuickShapes.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6QmlWorkerScript.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libQt6QmlModels.so.6", RTLD_NOW | RTLD_GLOBAL);
	dlopen("libqmlui.so", RTLD_NOW | RTLD_GLOBAL);
	#endif
	
	View::initClass(env, exports);
	return exports;
}


NODE_API_MODULE(qml, initModule)
